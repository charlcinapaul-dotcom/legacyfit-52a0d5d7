import { useState, useRef, useCallback, useEffect } from "react";
import { Geolocation, type Position } from "@capacitor/geolocation";

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

export function useGpsWalk() {
  const [status, setStatus] = useState<WalkStatus>("idle");
  const [miles, setMiles] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Capacitor watchPosition returns a string ID (not a number)
  const watchIdRef = useRef<string | null>(null);
  const lastCoordRef = useRef<Coordinate | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumulatedMilesRef = useRef(0);
  const isPausedRef = useRef(false);

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

  const processPosition = useCallback((pos: Position) => {
    if (isPausedRef.current) return;

    const newCoord: Coordinate = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      timestamp: pos.timestamp,
    };

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

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch({ id: watchIdRef.current });
      watchIdRef.current = null;
    }
  }, []);

  const startWatch = useCallback(async () => {
    try {
      const id = await Geolocation.watchPosition(
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
        (position, err) => {
          if (err) {
            // code 1 = PERMISSION_DENIED in both browser and Capacitor
            if ((err as any).code === 1) {
              setPermissionDenied(true);
              setError("Location permission is required to track your walk.");
              setStatus("idle");
            } else {
              setError("GPS signal lost. Please try again.");
            }
            stopTracking();
            return;
          }
          if (position) processPosition(position);
        }
      );
      watchIdRef.current = id;
    } catch (e: any) {
      setError("Unable to start GPS. Please check location permissions.");
      setStatus("idle");
    }
  }, [processPosition, stopTracking]);

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

  const endWalk = useCallback(() => {
    stopTracking();
    setStatus("completed");
  }, [stopTracking]);

  const discardWalk = useCallback(() => {
    stopTracking();
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
