import { useState, useRef, useCallback, useEffect } from "react";
import { BackgroundGeolocationPlugin } from "@capgo/background-geolocation";
import { registerPlugin, Capacitor } from "@capacitor/core";
import { Geolocation, type Position } from "@capacitor/geolocation";

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

type WalkStatus = "idle" | "active" | "paused" | "completed";

interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

// Haversine formula — returns distance in miles between two lat/lng points
function haversineDistance(a: Coordinate, b: Coordinate): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const aVal =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

// Distance in meters between two points (for validation)
function distanceMeters(a: Coordinate, b: Coordinate): number {
  return haversineDistance(a, b) * 1609.344;
}

const MIN_DISTANCE_METERS = 10;   // ignore GPS drift < 10m
const MAX_SPEED_MPH = 12;         // ignore unrealistic speed > 12 mph
const MAX_JUMP_METERS = 100;      // ignore GPS jumps > 100m

const isNative = Capacitor.isNativePlatform();

export function useGpsWalk() {
  const [status, setStatus] = useState<WalkStatus>("idle");
  const [miles, setMiles] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Web fallback: Capacitor watchPosition returns a string ID
  const watchIdRef = useRef<string | null>(null);
  const lastCoordRef = useRef<Coordinate | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumulatedMilesRef = useRef(0);
  const isPausedRef = useRef(false);
  const watcherIdRef = useRef<string | null>(null);

  // Timer tick
  useEffect(() => {
    if (status === "active") {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const processCoord = useCallback((lat: number, lng: number, timestamp: number) => {
    if (isPausedRef.current) return;

    const newCoord: Coordinate = { lat, lng, timestamp };

    const prev = lastCoordRef.current;
    if (!prev) {
      lastCoordRef.current = newCoord;
      return;
    }

    const distM = distanceMeters(prev, newCoord);
    const timeDeltaHours = (newCoord.timestamp - prev.timestamp) / 3_600_000;

    // Validation rules
    if (distM < MIN_DISTANCE_METERS) return;        // GPS drift
    if (distM > MAX_JUMP_METERS) {                  // GPS jump
      lastCoordRef.current = newCoord;
      return;
    }
    if (timeDeltaHours > 0) {
      const speedMph = (distM / 1609.344) / timeDeltaHours;
      if (speedMph > MAX_SPEED_MPH) {               // unrealistic speed
        lastCoordRef.current = newCoord;
        return;
      }
    }

    const addedMiles = distM / 1609.344;
    accumulatedMilesRef.current += addedMiles;
    setMiles(Math.round(accumulatedMilesRef.current * 100) / 100);
    lastCoordRef.current = newCoord;
  }, []);

  // ─── Native background geolocation (iOS/Android) ─────────────────────────
  const startNativeWatch = useCallback(async () => {
    try {
      const id = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: "LegacyFit is tracking your walk",
          backgroundTitle: "Walk in Progress",
          requestPermissions: true,
          stale: false,
          distanceFilter: 10,
        },
        (location, error) => {
          if (error) {
            if (error.code === "NOT_AUTHORIZED") {
              setPermissionDenied(true);
              setError("Location permission is required to track your walk.");
              setStatus("idle");
            }
            return;
          }
          if (location) {
            processCoord(location.latitude, location.longitude, location.time ?? Date.now());
          }
        }
      );
      watcherIdRef.current = id;
    } catch (e: any) {
      console.error("Background geolocation start failed:", e);
      setError("Unable to start GPS. Please check location permissions.");
      setStatus("idle");
    }
  }, [processCoord]);

  const stopNativeWatch = useCallback(async () => {
    if (watcherIdRef.current !== null) {
      try {
        await BackgroundGeolocation.removeWatcher({ id: watcherIdRef.current });
      } catch (e) {
        console.warn("Error stopping background geolocation:", e);
      }
      watcherIdRef.current = null;
    }
  }, []);

  // ─── Web fallback (browser / dev) ────────────────────────────────────────
  const startWebWatch = useCallback(async () => {
    try {
      const id = await Geolocation.watchPosition(
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
        (position, err) => {
          if (err) {
            if ((err as any).code === 1) {
              setPermissionDenied(true);
              setError("Location permission is required to track your walk.");
              setStatus("idle");
            } else {
              setError("GPS signal lost. Please try again.");
            }
            stopWebWatch();
            return;
          }
          if (position) {
            processCoord(position.coords.latitude, position.coords.longitude, position.timestamp);
          }
        }
      );
      watchIdRef.current = id;
    } catch (e: any) {
      setError("Unable to start GPS. Please check location permissions.");
      setStatus("idle");
    }
  }, [processCoord]);

  const stopWebWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch({ id: watchIdRef.current });
      watchIdRef.current = null;
    }
  }, []);

  // ─── Unified controls ───────────────────────────────────────────────────
  const stopTracking = useCallback(async () => {
    if (isNative) {
      await stopNativeWatch();
    } else {
      stopWebWatch();
    }
  }, [stopNativeWatch, stopWebWatch]);

  const startWatch = useCallback(async () => {
    if (isNative) {
      await startNativeWatch();
    } else {
      await startWebWatch();
    }
  }, [startNativeWatch, startWebWatch]);

  const startWalk = useCallback(() => {
    setPermissionDenied(false);
    setError(null);
    setMiles(0);
    setSeconds(0);
    accumulatedMilesRef.current = 0;
    lastCoordRef.current = null;
    isPausedRef.current = false;
    setStatus("active");
    startWatch();
  }, [startWatch]);

  const pauseWalk = useCallback(() => {
    isPausedRef.current = true;
    setStatus("paused");
  }, []);

  const resumeWalk = useCallback(() => {
    isPausedRef.current = false;
    lastCoordRef.current = null; // reset last coord to avoid jump on resume
    setStatus("active");
  }, []);

  const endWalk = useCallback(async () => {
    await stopTracking();
    setStatus("completed");
  }, [stopTracking]);

  const discardWalk = useCallback(async () => {
    await stopTracking();
    accumulatedMilesRef.current = 0;
    setMiles(0);
    setSeconds(0);
    lastCoordRef.current = null;
    isPausedRef.current = false;
    setStatus("idle");
    setError(null);
    setPermissionDenied(false);
  }, [stopTracking]);

  // Format MM:SS
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return {
    status,
    miles,
    clock,
    seconds,
    permissionDenied,
    error,
    startWalk,
    pauseWalk,
    resumeWalk,
    endWalk,
    discardWalk,
  };
}
