import { Lock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StampWithMilestone } from "@/hooks/usePassportStamps";

interface PassportStampProps {
  stamp: StampWithMilestone;
  onClick?: () => void;
}

export function PassportStamp({ stamp, onClick }: PassportStampProps) {
  const displayTitle = stamp.stamp_title || stamp.title;
  const displayMiles = stamp.stamp_mileage_display || `${stamp.miles_required} mi`;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group w-full aspect-square rounded-xl border-2 transition-all duration-300",
        "flex flex-col items-center justify-center p-4 text-center",
        stamp.isUnlocked
          ? "bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-500/50 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
          : "bg-muted/30 border-border/50 hover:border-border"
      )}
    >
      {stamp.isUnlocked ? (
        <>
          {/* Unlocked stamp */}
          {stamp.stamp_image_url ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={stamp.stamp_image_url}
                alt={displayTitle}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-amber-950" />
              </div>
              <span className="text-amber-400 font-semibold text-sm line-clamp-2">
                {displayTitle}
              </span>
              <span className="text-amber-500/70 text-xs">{displayMiles}</span>
            </div>
          )}

          {/* Earned badge */}
          <div className="absolute -top-2 -right-2 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
            ✓ EARNED
          </div>
        </>
      ) : (
        <>
          {/* Locked stamp - show grayed preview if image exists */}
          {stamp.stamp_image_url ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={stamp.stamp_image_url}
                alt={displayTitle}
                className="max-w-full max-h-full object-contain rounded-lg blur-sm opacity-80"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <Lock className="w-6 h-6 text-muted-foreground drop-shadow-md" />
                <span className="text-muted-foreground text-xs font-medium drop-shadow-md">
                  {displayMiles}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center border border-border/50">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium text-sm block">
                  {displayMiles}
                </span>
                <span className="text-muted-foreground/60 text-xs block">
                  to unlock
                </span>
              </div>
            </div>
          )}

          {/* Locked overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 rounded-xl" />
        </>
      )}

      {/* Location indicator for unlocked */}
      {stamp.isUnlocked && stamp.location_name && (
        <div className="absolute bottom-2 left-2 right-2 text-[10px] text-amber-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          📍 {stamp.location_name}
        </div>
      )}
    </button>
  );
}
