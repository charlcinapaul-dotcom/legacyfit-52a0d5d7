import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footprints, Loader2, ArrowRight, Lock, Clock, HelpCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { stepsToMiles, STEPS_PER_MILE } from "@/lib/health-sync";
import { useMileLogging } from "@/hooks/useMileLogging";
import type { UnlockedStamp } from "@/hooks/useMileLogging";
import { useEnrollmentStatus } from "@/hooks/useEnrollmentStatus";
import { useDailyMilesLogged } from "@/hooks/useDailyMilesLogged";
import { useRateLimitCountdown } from "@/hooks/useRateLimitCountdown";
import { useHasClaimedFreePreview } from "@/hooks/useHasClaimedFreePreview";
import { supabase } from "@/integrations/supabase/client";
import { StampUnlockModal } from "./StampUnlockModal";
import { FirstMileGateModal } from "./FirstMileGateModal";
import { MileLogConfirmDialog } from "./MileLogConfirmDialog";
import { RateLimitBanner } from "./RateLimitBanner";

interface StepLoggerProps {
  challengeId: string;
  challengeSlug?: string;
  challengeName?: string;
  challengeEditionColor?: "gold" | "burgundy" | "pride" | "forest";
  onScrollToPricing?: () => void;
}

const QUICK_STEPS = [1000, 2000, 5000, 10000];
const FREE_QUICK_STEPS = [2000];

export function StepLogger({
  challengeId,
  challengeSlug,
  challengeName,
  challengeEditionColor = "gold",
  onScrollToPricing,
}: StepLoggerProps) {
  const [steps, setSteps] = useState<string>("");
  const [pendingSteps, setPendingSteps] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // First-mile gate modal state
  const [gateModal, setGateModal] = useState<{
    open: boolean;
    screen: "share" | "purchase";
    stamp: UnlockedStamp | null;
  }>({ open: false, screen: "purchase", stamp: null });

  const { totalMiles, logMiles, isLogging, newlyUnlockedStamps, clearUnlockedStamps } = useMileLogging(challengeId);

  const { data: enrollment, isLoading: enrollmentLoading } = useEnrollmentStatus(challengeId);
  const { hasClaimed: freePreviewClaimed, isLoading: freePreviewLoading } = useHasClaimedFreePreview();
  const { dailyRemaining, maxSingleEntry, refetch: refetchDaily } = useDailyMilesLogged(challengeId);
  const { isRateLimited, formatCountdown, triggerRateLimit } = useRateLimitCountdown(challengeId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsAuthenticated(!!user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setIsAuthenticated(!!s?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

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
    logMiles(
      {
        miles,
        challengeId,
        notes: `${pendingSteps.toLocaleString()} steps synced manually`,
        source: "manual",
      },
      {
        onSettled: () => {
          refetchDaily();
        },
        onError: (error: any) => {
          const msg = error?.message || "";
          if (msg.toLowerCase().includes("rate limit")) {
            triggerRateLimit();
          }
        },
      },
    );
    setPendingSteps(null);
    setSteps("");
  };

  // Loading
  if (isAuthenticated === null || enrollmentLoading || freePreviewLoading) {
    return (
      <Card className="border-accent/20">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Footprints className="w-5 h-5 text-accent" />
            Log Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            to={`/auth?redirect=${encodeURIComponent(challengeSlug ? `/challenge/${challengeSlug}` : "/challenges")}`}
          >
            <Button className="w-full h-auto py-3 text-sm font-bold leading-tight whitespace-normal bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Sign In to Log Steps
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const hasPendingPayment = enrollment?.status === "pending";
  const isFirstMileFreeWindow =
    !enrollment?.isEnrolled && !hasPendingPayment && totalMiles === 0 && !freePreviewClaimed;

  // Not enrolled, no free preview window — show enroll CTA
  if (!enrollment?.isEnrolled && !isFirstMileFreeWindow) {
    return (
      <Card className="border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Footprints className="w-5 h-5 text-accent" />
            Log Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPendingPayment ? (
            <Alert className="border-amber-500/40 bg-amber-500/10">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertTitle>Payment pending</AlertTitle>
              <AlertDescription className="text-sm">
                Step logging is paused until your payment clears. This usually takes a minute or two. If it's been
                longer than 10 minutes, refresh this page or check your email for a Stripe receipt. Once confirmed, your
                enrollment unlocks automatically and you can log steps right away.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert className="border-primary/30 bg-primary/5">
                <Lock className="h-4 w-4 text-primary" />
                <AlertTitle className="flex items-center gap-2">
                  Payment required
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" aria-label="Why is logging blocked?">
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Steps and miles are tied to a specific paid challenge so your progress, stamps, and certificate
                        stay accurate. You used your free 1-mile preview, so next step complete payment.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </AlertTitle>
                <AlertDescription className="text-sm">
                  You're not enrolled in this challenge yet, so steps can't be saved to your passport. Enroll below to
                  start logging steps, unlock milestones, and earn stamps.
                </AlertDescription>
              </Alert>
              <Button
                className="w-full h-auto py-3 text-sm font-bold leading-tight whitespace-normal bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={onScrollToPricing}
              >
                View Payment Options
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Footprints className="w-5 h-5 text-accent" />
            Log Steps
          </CardTitle>
          <p className="text-xs text-muted-foreground">{STEPS_PER_MILE.toLocaleString()} steps = 1 mile</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRateLimited && <RateLimitBanner countdown={formatCountdown()} />}
          {/* Quick step buttons */}
          <div className="grid grid-cols-4 gap-2">
            {(isFirstMileFreeWindow ? FREE_QUICK_STEPS : QUICK_STEPS).map((qs) => (
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
            <Label htmlFor="steps-input" className="text-sm">
              Custom steps
            </Label>
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
                disabled={
                  isLogging ||
                  isRateLimited ||
                  !steps ||
                  Number(steps) <= 0 ||
                  convertedMiles > maxSingleEntry ||
                  convertedMiles > dailyRemaining
                }
                size="default"
              >
                {isLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
            {convertedMiles > 0 && (
              <p className="text-xs text-muted-foreground">
                = <span className="font-semibold text-primary">{convertedMiles} miles</span>
                {isFirstMileFreeWindow && Number(steps) > 2000 && (
                  <span className="text-destructive ml-1">(free preview is limited to 2,000 steps / 1 mile)</span>
                )}
                {!isFirstMileFreeWindow && convertedMiles > maxSingleEntry && (
                  <span className="text-destructive ml-1">(exceeds {maxSingleEntry}mi limit)</span>
                )}
                {!isFirstMileFreeWindow && convertedMiles <= maxSingleEntry && convertedMiles > dailyRemaining && (
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
        onOpenChange={(open) => {
          if (!open) setPendingSteps(null);
        }}
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
        isEnrolled={enrollment?.isEnrolled ?? true}
        onContinueToPurchase={(stamp) => {
          clearUnlockedStamps();
          setGateModal({ open: true, screen: "purchase", stamp });
        }}
        onShareAchievement={(stamp) => {
          clearUnlockedStamps();
          setGateModal({ open: true, screen: "share", stamp });
        }}
      />

      {/* First-mile gate modal (Share → Purchase flow) */}
      <FirstMileGateModal
        open={gateModal.open}
        initialScreen={gateModal.screen}
        challengeName={challengeName || ""}
        challengeId={challengeId}
        challengeSlug={challengeSlug}
        editionColor={challengeEditionColor}
        stampTitle={gateModal.stamp?.stampTitle}
        milesRequired={gateModal.stamp?.milesRequired}
        onClose={() => setGateModal((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
