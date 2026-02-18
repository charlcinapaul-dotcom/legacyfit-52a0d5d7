import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footprints, Loader2, ArrowRight } from "lucide-react";
import { stepsToMiles, STEPS_PER_MILE } from "@/lib/health-sync";
import { useMileLogging } from "@/hooks/useMileLogging";
import { useDailyMilesLogged } from "@/hooks/useDailyMilesLogged";
import { useRateLimitCountdown } from "@/hooks/useRateLimitCountdown";
import { StampUnlockModal } from "./StampUnlockModal";
import { MileLogConfirmDialog } from "./MileLogConfirmDialog";
import { RateLimitBanner } from "./RateLimitBanner";

interface StepLoggerProps {
  challengeId: string;
  challengeSlug?: string;
  challengeName?: string;
}

const QUICK_STEPS = [1000, 2000, 5000, 10000];

export function StepLogger({ challengeId, challengeSlug, challengeName }: StepLoggerProps) {
  const [steps, setSteps] = useState<string>("");
  const [pendingSteps, setPendingSteps] = useState<number | null>(null);

  const {
    logMiles,
    isLogging,
    newlyUnlockedStamps,
    clearUnlockedStamps,
  } = useMileLogging(challengeId);

  const { dailyRemaining, maxSingleEntry, refetch: refetchDaily } = useDailyMilesLogged(challengeId);
  const { isRateLimited, formatCountdown, triggerRateLimit } = useRateLimitCountdown(challengeId);

  const convertedMiles = steps ? stepsToMiles(Number(steps)) : 0;
  const pendingMiles = pendingSteps ? stepsToMiles(pendingSteps) : 0;

  const handleQuickLog = (quickSteps: number) => {
    setPendingSteps(quickSteps);
  };

  const handleCustomLog = () => {
    const numSteps = Number(steps);
    if (numSteps > 0) {
      setPendingSteps(numSteps);
    }
  };

  const handleConfirmLog = () => {
    if (pendingSteps === null) return;
    const miles = stepsToMiles(pendingSteps);
    logMiles({
      miles,
      challengeId,
      notes: `${pendingSteps.toLocaleString()} steps synced manually`,
      source: "manual",
    }, {
      onSettled: () => {
        refetchDaily();
      },
      onError: (error: any) => {
        const msg = error?.message || "";
        if (msg.toLowerCase().includes("rate limit")) {
          triggerRateLimit();
        }
      },
    });
    setPendingSteps(null);
    setSteps("");
  };

  return (
    <>
      <Card className="border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Footprints className="w-5 h-5 text-accent" />
            Log Steps
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {STEPS_PER_MILE.toLocaleString()} steps = 1 mile
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRateLimited && <RateLimitBanner countdown={formatCountdown()} />}
          {/* Quick step buttons */}
          <div className="grid grid-cols-4 gap-2">
            {QUICK_STEPS.map((qs) => (
              <Button
                key={qs}
                variant="outline"
                size="sm"
                onClick={() => handleQuickLog(qs)}
                disabled={isLogging || isRateLimited || stepsToMiles(qs) > dailyRemaining}
                className="h-14 flex flex-col gap-0.5 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {isLogging ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span className="text-sm font-bold">{(qs / 1000).toFixed(qs % 1000 === 0 ? 0 : 1)}k</span>
                    <span className="text-[10px] text-muted-foreground">{stepsToMiles(qs)} mi</span>
                  </>
                )}
              </Button>
            ))}
          </div>

          {/* Custom step input */}
          <div className="space-y-2">
            <Label htmlFor="steps-input" className="text-sm">Custom steps</Label>
            <div className="flex gap-2">
              <Input
                id="steps-input"
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="Enter steps..."
                min={0}
                className="flex-1"
              />
              <Button
                onClick={handleCustomLog}
                disabled={isLogging || isRateLimited || !steps || Number(steps) <= 0 || convertedMiles > maxSingleEntry || convertedMiles > dailyRemaining}
                size="default"
              >
                {isLogging ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>
            {convertedMiles > 0 && (
              <p className="text-xs text-muted-foreground">
                = <span className="font-semibold text-primary">{convertedMiles} miles</span>
                {convertedMiles > maxSingleEntry && (
                  <span className="text-destructive ml-1">(exceeds {maxSingleEntry}mi limit)</span>
                )}
                {convertedMiles <= maxSingleEntry && convertedMiles > dailyRemaining && (
                  <span className="text-destructive ml-1">(only {dailyRemaining}mi remaining today)</span>
                )}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <MileLogConfirmDialog
        open={pendingSteps !== null}
        onOpenChange={(open) => { if (!open) setPendingSteps(null); }}
        onConfirm={handleConfirmLog}
        miles={pendingMiles}
        challengeName={challengeName}
        isLogging={isLogging}
      />

      {/* Stamp unlock modal */}
      <StampUnlockModal
        stamps={newlyUnlockedStamps}
        onClose={clearUnlockedStamps}
        challengeSlug={challengeSlug}
      />
    </>
  );
}
