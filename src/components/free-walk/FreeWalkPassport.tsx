import { X, Book, Lock, Check } from "lucide-react";
import { ROUTE_STOPS } from "@/data/queens";
import type { FreeWalkStampEntry } from "@/hooks/useFreeWalkStamps";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Mono } from "./ui-primitives";
import { useFreeWalkStampImages } from "@/hooks/useFreeWalkStampImages";

interface Props {
  unlockedMilestoneIds: Set<string>;
  onClose: () => void;
}

export function FreeWalkPassport({ unlockedMilestoneIds, onClose }: Props) {
  const { data: stampImages } = useFreeWalkStampImages();

  const stamps: FreeWalkStampEntry[] = ROUTE_STOPS.map((stop) => ({
    milestoneId: stop.dist,
    title: stop.title,
    stampTitle: stop.title,
    stampCopy: stop.desc,
    milesRequired: parseFloat(stop.dist),
    locationName: stop.queenLabel,
    stampImageUrl: stampImages?.get(stop.title) ?? null,
    audioUrl: null,
    isUnlocked: unlockedMilestoneIds.has(stop.dist),
  }));

  const unlockedCount = stamps.filter((s) => s.isUnlocked).length;
  const totalCount = stamps.length;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "#f0e6ce" }}>
      {/* Corner registration marks */}
      <span className="fixed top-3 left-3 text-amber-800/20 text-lg pointer-events-none select-none">○</span>
      <span className="fixed top-3 right-3 text-amber-800/20 text-lg pointer-events-none select-none">○</span>
      <span className="fixed bottom-3 left-3 text-amber-800/20 text-lg pointer-events-none select-none">○</span>
      <span className="fixed bottom-3 right-3 text-amber-800/20 text-lg pointer-events-none select-none">○</span>

      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b border-amber-900/30"
        style={{ backgroundColor: "#e8d9b8" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between relative overflow-hidden">
          {/* Postal cancellation SVG decoration */}
          <svg
            className="absolute right-12 top-0 h-full opacity-20 pointer-events-none"
            width="80"
            height="60"
            viewBox="0 0 80 60"
            fill="none"
          >
            {[0, 8, 16, 24, 32, 40].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="80"
                y2={y + 12}
                stroke="#7c3a00"
                strokeWidth="1.5"
              />
            ))}
          </svg>

          <div className="flex items-center gap-2.5 relative z-10">
            <Book className="w-5 h-5 text-amber-800" />
            <div>
              <div className="font-sans font-bold text-amber-950 text-base leading-tight">
                Walk With Queens
              </div>
              <Mono className="text-amber-700 text-[10px]">Queen Passport</Mono>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-amber-900 hover:text-amber-950 transition-colors relative z-10"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress card */}
        <div
          className="border border-amber-800/30 p-5 mb-6"
          style={{ backgroundColor: "rgba(224, 206, 170, 0.6)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <Mono className="text-amber-800">Stamps Collected</Mono>
            <span className="font-sans text-2xl font-bold text-amber-900">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-amber-800/20" />
          <p className="text-xs text-amber-800/70 mt-2">
            {unlockedCount === 0
              ? "Walk the route to earn your first Queen stamp"
              : unlockedCount === totalCount
              ? "🎉 All Queens honored — your walk is complete!"
              : `${totalCount - unlockedCount} Queens yet to honor`}
          </p>
        </div>

        {/* Stamp grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stamps.map((stamp) => {
            const hasImage = !!stamp.stampImageUrl;
            return (
              <div
                key={stamp.milestoneId}
                className={cn(
                  "relative aspect-square border-2 rounded-none overflow-hidden transition-all duration-300",
                  stamp.isUnlocked
                    ? "border-amber-700 shadow-sm shadow-amber-800/30"
                    : "border-dashed border-amber-800/40"
                )}
                style={{ backgroundColor: "#ede0c4" }}
              >
                {hasImage ? (
                  <>
                    <img
                      src={stamp.stampImageUrl!}
                      alt={stamp.stampTitle ?? stamp.title}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-500",
                        !stamp.isUnlocked && "blur-sm opacity-80"
                      )}
                    />
                    {/* Locked overlay */}
                    {!stamp.isUnlocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-amber-950/10">
                        <Lock className="w-7 h-7 text-amber-950/70 drop-shadow-lg" />
                        <span className="font-mono text-[9px] tracking-widest text-amber-950/60 uppercase">
                          {stamp.milesRequired} mi
                        </span>
                      </div>
                    )}
                    {/* Unlocked EARNED badge */}
                    {stamp.isUnlocked && (
                      <div className="absolute top-2 right-2 bg-amber-700 text-amber-50 text-[9px] font-bold px-1.5 py-0.5 flex items-center gap-0.5 shadow-md">
                        <Check className="w-2.5 h-2.5" />
                        EARNED
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    className={cn(
                      "w-full h-full flex flex-col items-center justify-center p-4 text-center",
                      stamp.isUnlocked
                        ? "bg-gradient-to-br from-amber-800/20 to-amber-700/10"
                        : "bg-amber-900/5"
                    )}
                  >
                    {stamp.isUnlocked ? (
                      <>
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-700 to-amber-600 flex items-center justify-center mb-2 shadow-lg">
                          <Check className="w-7 h-7 text-amber-50" />
                        </div>
                        <span className="font-sans font-bold text-[13px] text-amber-950 leading-tight line-clamp-2 mb-1">
                          {stamp.stampTitle}
                        </span>
                        <Mono className="text-amber-700 text-[9px]">{stamp.milesRequired} mi</Mono>
                        <div className="absolute -top-1.5 -right-1.5 bg-amber-700 text-amber-50 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                          ✓
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-amber-800/10 border border-amber-800/30 flex items-center justify-center mb-2">
                          <Lock className="w-6 h-6 text-amber-800/50" />
                        </div>
                        <Mono className="text-amber-800/60 text-[10px] mb-1">
                          {stamp.milesRequired} mi
                        </Mono>
                        <span className="text-amber-800/40 text-[11px] leading-tight line-clamp-2">
                          {stamp.stampTitle}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 border border-amber-800/40 text-amber-900 font-sans text-[12px] font-semibold tracking-[0.12em] uppercase px-6 py-3 hover:bg-amber-800/10 transition-colors"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
}
