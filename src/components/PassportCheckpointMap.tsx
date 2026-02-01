import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import { MilestoneMarker } from "./MilestoneMarker";
import type { StampWithMilestone } from "@/hooks/usePassportStamps";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface PassportCheckpointMapProps {
  stamps: StampWithMilestone[];
  onMilestoneClick?: (stamp: StampWithMilestone) => void;
}

// Component to auto-fit bounds to all markers
function MapBoundsHandler({ stamps }: { stamps: StampWithMilestone[] }) {
  const map = useMap();

  useEffect(() => {
    const validStamps = stamps.filter(
      (s) => s.latitude !== null && s.longitude !== null
    );

    if (validStamps.length > 0) {
      const bounds = validStamps.map((s) => [s.latitude!, s.longitude!] as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [stamps, map]);

  return null;
}

export function PassportCheckpointMap({ stamps, onMilestoneClick }: PassportCheckpointMapProps) {
  // Filter stamps with valid coordinates
  const validStamps = useMemo(
    () => stamps.filter((s) => s.latitude !== null && s.longitude !== null),
    [stamps]
  );

  // Sort stamps by miles_required for route line
  const sortedStamps = useMemo(
    () => [...validStamps].sort((a, b) => a.miles_required - b.miles_required),
    [validStamps]
  );

  // Create route lines
  const unlockedRoute = useMemo(() => {
    const unlocked = sortedStamps.filter((s) => s.isUnlocked);
    return unlocked.map((s) => [s.latitude!, s.longitude!] as [number, number]);
  }, [sortedStamps]);

  const upcomingRoute = useMemo(() => {
    // Include the last unlocked point and all locked points for continuity
    const lastUnlocked = sortedStamps.filter((s) => s.isUnlocked).slice(-1);
    const locked = sortedStamps.filter((s) => !s.isUnlocked);
    return [...lastUnlocked, ...locked].map((s) => [s.latitude!, s.longitude!] as [number, number]);
  }, [sortedStamps]);

  // Calculate center from all valid stamps
  const center = useMemo(() => {
    if (validStamps.length === 0) return [40.7128, -74.006] as [number, number]; // Default to NYC
    const avgLat = validStamps.reduce((sum, s) => sum + s.latitude!, 0) / validStamps.length;
    const avgLng = validStamps.reduce((sum, s) => sum + s.longitude!, 0) / validStamps.length;
    return [avgLat, avgLng] as [number, number];
  }, [validStamps]);

  if (validStamps.length === 0) {
    return (
      <div className="h-[400px] rounded-xl bg-card border border-border flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Map locations are being prepared...</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={4}
        className="h-full w-full"
        style={{ background: "hsl(var(--card))" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapBoundsHandler stamps={validStamps} />

        {/* Upcoming route (dashed gray) */}
        {upcomingRoute.length > 1 && (
          <Polyline
            positions={upcomingRoute}
            pathOptions={{
              color: "#6b7280",
              weight: 3,
              dashArray: "8, 8",
              opacity: 0.5,
            }}
          />
        )}

        {/* Completed route (solid amber) */}
        {unlockedRoute.length > 1 && (
          <Polyline
            positions={unlockedRoute}
            pathOptions={{
              color: "#d97706",
              weight: 4,
              opacity: 0.9,
            }}
          />
        )}

        {/* Milestone markers */}
        {validStamps.map((stamp) => (
          <MilestoneMarker
            key={stamp.id}
            milestone={stamp as StampWithMilestone & { latitude: number; longitude: number }}
            onClick={() => onMilestoneClick?.(stamp)}
          />
        ))}
      </MapContainer>
    </div>
  );
}
