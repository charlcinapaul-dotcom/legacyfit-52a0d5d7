import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { StampWithMilestone } from "@/hooks/usePassportStamps";

interface MilestoneMarkerProps {
  milestone: StampWithMilestone & { latitude: number; longitude: number };
  onClick?: () => void;
}

// Create custom icon for unlocked milestone
const createUnlockedIcon = () => {
  return L.divIcon({
    html: `<div style="display: flex; flex-direction: column; align-items: center;">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #fbbf24, #d97706); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4); border: 2px solid #fcd34d;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#451a03" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #d97706; margin-top: -2px;"></div>
    </div>`,
    className: "custom-marker-unlocked",
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
};

// Create custom icon for locked milestone
const createLockedIcon = () => {
  return L.divIcon({
    html: `<div style="display: flex; flex-direction: column; align-items: center; opacity: 0.7;">
      <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #4b5563, #374151); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid #6b7280;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </div>
      <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #4b5563; margin-top: -2px;"></div>
    </div>`,
    className: "custom-marker-locked",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

export function MilestoneMarker({ milestone, onClick }: MilestoneMarkerProps) {
  const icon = milestone.isUnlocked ? createUnlockedIcon() : createLockedIcon();

  return (
    <Marker
      position={[milestone.latitude, milestone.longitude]}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup className="milestone-popup">
        <div className="p-2 min-w-[200px]">
          <h4 className="font-bold text-sm mb-1">
            {milestone.stamp_title || milestone.title}
          </h4>
          {milestone.location_name && (
            <p className="text-xs text-gray-500 mb-2">📍 {milestone.location_name}</p>
          )}
          <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            milestone.isUnlocked
              ? "bg-amber-100 text-amber-800"
              : "bg-gray-100 text-gray-600"
          }`}>
            {milestone.isUnlocked ? "✓ Unlocked" : `${milestone.miles_required} mi to unlock`}
          </div>
          {milestone.isUnlocked && milestone.stamp_copy && (
            <p className="text-xs italic mt-2 text-gray-600">"{milestone.stamp_copy}"</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
