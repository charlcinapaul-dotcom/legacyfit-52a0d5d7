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
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Book className="w-5 h-5 text-primary" />
            <div>
              <div className="font-sans font-bold text-foreground text-base leading-tight">
                Walk With Queens
              </div>
              <Mono className="text-muted-foreground text-[10px]">Queen Passport</Mono>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress card */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <Mono className="text-primary">Stamps Collected</Mono>
            <span className="font-sans text-2xl font-bold text-primary">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-primary/10" />
          <p className="text-xs text-muted-foreground mt-2">
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
                    ? "border-primary/60 shadow-sm shadow-primary/20"
                    : "border-border/40"
                )}
              >
                {hasImage ? (
                  <>
                    {/* Real stamp image */}
                    <img
                      src={stamp.stampImageUrl!}
                      alt={stamp.stampTitle ?? stamp.title}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-500",
                        !stamp.isUnlocked && "grayscale opacity-40"
                      )}
                    />
                    {/* Locked overlay */}
                    {!stamp.isUnlocked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/10">
                        <Lock className="w-7 h-7 text-white/70 drop-shadow-lg" />
                        <span className="font-mono text-[9px] tracking-widest text-white/60 uppercase">
                          {stamp.milesRequired} mi
                        </span>
                      </div>
                    )}
                    {/* Unlocked EARNED badge */}
                    {stamp.isUnlocked && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 flex items-center gap-0.5 shadow-md">
                        <Check className="w-2.5 h-2.5" />
                        EARNED
                      </div>
                    )}
                  </>
                ) : (
                  /* Fallback: no image yet */
                  <div
                    className={cn(
                      "w-full h-full flex flex-col items-center justify-center p-4 text-center",
                      stamp.isUnlocked
                        ? "bg-gradient-to-br from-primary/20 to-primary/10"
                        : "bg-muted/20"
                    )}
                  >
                    {stamp.isUnlocked ? (
                      <>
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-2 shadow-lg">
                          <Check className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <span className="font-sans font-bold text-[13px] text-foreground leading-tight line-clamp-2 mb-1">
                          {stamp.stampTitle}
                        </span>
                        <Mono className="text-primary/70 text-[9px]">{stamp.milesRequired} mi</Mono>
                        <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                          ✓
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mb-2">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <Mono className="text-muted-foreground/70 text-[10px] mb-1">
                          {stamp.milesRequired} mi
                        </Mono>
                        <span className="text-muted-foreground/50 text-[11px] leading-tight line-clamp-2">
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
            className="inline-flex items-center gap-2 border border-primary/40 text-primary font-sans text-[12px] font-semibold tracking-[0.12em] uppercase px-6 py-3 hover:bg-primary/10 transition-colors"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
}
