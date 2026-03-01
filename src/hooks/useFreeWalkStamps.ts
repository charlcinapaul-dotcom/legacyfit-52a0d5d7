import { useState, useRef, useEffect } from "react";
import { ROUTE_STOPS } from "@/data/queens";
import type { UnlockedStamp } from "@/hooks/useMileLogging";


export interface FreeWalkStampEntry extends UnlockedStamp {
  isUnlocked: boolean;
}

/**
 * Tracks mile-marker crossings during a Free Walk and produces
 * UnlockedStamp objects that can be fed directly into StampUnlockModal.
 *
 * Uses the same UnlockedStamp shape as the paid-challenge stamp system —
 * no new types needed.
 */
export function useFreeWalkStamps(
  currentMiles: number,
  stampImages?: Map<string, string>
) {
  const [pendingStamps, setPendingStamps] = useState<UnlockedStamp[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newStamps: UnlockedStamp[] = [];

    for (const stop of ROUTE_STOPS) {
      const distNum = parseFloat(stop.dist);
      if (currentMiles >= distNum && !seenRef.current.has(stop.dist)) {
        seenRef.current.add(stop.dist);
        const imageUrl = stampImages?.get(stop.title) ?? null;
        newStamps.push({
          milestoneId: stop.dist,
          title: stop.title,
          stampTitle: stop.title,
          stampCopy: stop.desc,
          milesRequired: distNum,
          locationName: stop.queenLabel,
          stampImageUrl: imageUrl,
          audioUrl: null,
        });
      }
    }

    if (newStamps.length > 0) {
      setPendingStamps((prev) => [...prev, ...newStamps]);
      setUnlockedIds(new Set(seenRef.current));
    }
  }, [currentMiles]);

  const clearPendingStamps = () => setPendingStamps([]);

  return { pendingStamps, clearPendingStamps, unlockedIds };
}
