import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Footprints, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { useMileLogging } from "@/hooks/useMileLogging";
import type { UnlockedStamp } from "@/hooks/useMileLogging";
import { useEnrollmentStatus } from "@/hooks/useEnrollmentStatus";
import { useDailyMilesLogged } from "@/hooks/useDailyMilesLogged";
import { useRateLimitCountdown } from "@/hooks/useRateLimitCountdown";
import { useHasClaimedFreePreview } from "@/hooks/useHasClaimedFreePreview";
import { StampUnlockModal } from "./StampUnlockModal";
import { FirstMileGateModal } from "./FirstMileGateModal";
import { MileLogConfirmDialog } from "./MileLogConfirmDialog";
import { RateLimitBanner } from "./RateLimitBanner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface MileLoggerProps {
  challengeId: string;
  challengeSlug?: string;
  challengeName?: string;
  totalMilestones?: number;
  challengeEditionColor?: "gold" | "burgundy" | "pride" | "forest";
  onChallengeCompleted?: (data: { name: string; miles: number; imageUrl: string | null }) => void;
  onMaybeLater?: () => void;
  onScrollToPricing?: () => void;
}

const QUICK_MILES = [1, 3, 5, 7];

export function MileLogger({ challengeId, challengeSlug, challengeName, totalMilestones = 6, challengeEditionColor = "gold", onChallengeCompleted, onMaybeLater, onScrollToPricing }: MileLoggerProps) {
  const [miles, setMiles] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pendingMiles, setPendingMiles] = useState<number | null>(null);
  const [pendingNotes, setPendingNotes] = useState<string>("");

  // Latch: once the user was in the free-mile window, stay showing the logger
  // until the stamp modal is dismissed (prevents flipping to "Enrollment Required")
  const wasInFreeWindowRef = useRef(false);
  const [stampModalDismissed, setStampModalDismissed] = useState(false);

  // First-mile gate modal state
  const [gateModal, setGateModal] = useState<{
    open: boolean;
    screen: "share" | "purchase";
    stamp: UnlockedStamp | null;
  }>({ open: false, screen: "purchase", stamp: null });

  const {
    totalMiles,
    logMiles,
    isLogging,
    newlyUnlockedStamps,
    clearUnlockedStamps,
    completionData,
    clearCompletionData,
  } = useMileLogging(challengeId);

  const { dailyLogged, dailyRemaining, maxSingleEntry, maxDailyAggregate, refetch: refetchDaily } = useDailyMilesLogged(challengeId);
  const { isRateLimited, formatCountdown, triggerRateLimit } = useRateLimitCountdown(challengeId);

  useEffect(() => {
    if (completionData?.challengeCompleted && onChallengeCompleted) {
      onChallengeCompleted({
        name: completionData.challengeName,
        miles: completionData.challengeTotalMiles,
        imageUrl: completionData.certificateImageUrl,
      });
      clearCompletionData();
    }
  }, [completionData, onChallengeCompleted, clearCompletionData]);

  const { data: enrollment, isLoading: enrollmentLoading } = useEnrollmentStatus(challengeId);
  const { hasClaimed: freePreviewClaimed, isLoading: freePreviewLoading } = useHasClaimedFreePreview();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleQuickLog = (quickMiles: number) => {
    setPendingMiles(quickMiles);
    setPendingNotes(notes);
  };

  const handleCustomLog = () => {
    setPendingMiles(miles);
    setPendingNotes(notes);
  };

  const handleConfirmLog = () => {
    if (pendingMiles === null) return;
    logMiles({
      miles: pendingMiles,
      challengeId,
      notes: pendingNotes || undefined,
    }, {
      onSettled: () => {
        // Clear only after the full operation completes — keeps dialog+spinner
        // visible the entire time, preventing double-taps
        refetchDaily();
        setPendingMiles(null);
        setPendingNotes("");
        setMiles(1);
        setNotes("");
        setShowCustom(false);
      },
      onError: (error: any) => {
        const msg = error?.message || "";
        if (msg.toLowerCase().includes("rate limit")) {
          triggerRateLimit();
        }
      },
    });
  };

  // Loading
  if (isAuthenticated === null || enrollmentLoading || freePreviewLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Not authenticated — show the same free-mile CTA as unenrolled users
  if (!isAuthenticated) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Footprints className="w-5 h-5 text-primary" />
            Log Miles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link to={`/auth?redirect=${encodeURIComponent(challengeSlug ? `/challenge/${challengeSlug}` : '/challenges')}`}>
            <Button className="w-full h-auto py-3 text-sm font-bold leading-tight whitespace-normal bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Start Your Free 1 Mile Legacy Passport
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Not enrolled (paid) — but allow free first-mile preview (totalMiles === 0 AND not yet claimed on any challenge)
  const hasPendingPayment = enrollment?.status === "pending";
  const isFirstMileFreeWindowNow = !enrollment?.isEnrolled && !hasPendingPayment && totalMiles === 0 && !freePreviewClaimed;

  // Latch: if we were in free-window when the user clicked log, stay in logger
  // view until the stamp modal is fully dismissed (prevents premature flip to "Enrollment Required")
  if (isFirstMileFreeWindowNow) {
    wasInFreeWindowRef.current = true;
  }
  const isFirstMileFreeWindow = isFirstMileFreeWindowNow || (wasInFreeWindowRef.current && !stampModalDismissed);

  if (!enrollment?.isEnrolled && !isFirstMileFreeWindow) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Footprints className="w-5 h-5 text-primary" />
            Log Miles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPendingPayment ? (
            <Alert className="border-amber-500/40 bg-amber-500/10">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertTitle>Payment pending</AlertTitle>
              <AlertDescription className="text-sm">
                Mile logging is paused until your payment clears. This usually takes a minute or two.
                If it's been longer than 10 minutes, refresh this page or check your email for a Stripe receipt.
                Once confirmed, your enrollment unlocks automatically.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <Alert className="border-primary/30 bg-primary/5">
                <Lock className="h-4 w-4 text-primary" />
                <AlertTitle className="flex items-center gap-2">
                  Enrollment required
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" aria-label="Why is logging blocked?">
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Miles are tied to a specific paid challenge so your progress, stamps, and
                        certificate stay accurate. You've used your free 1-mile preview, so the next
                        step is to enroll.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </AlertTitle>
                <AlertDescription className="text-sm">
                  You're not enrolled in this challenge yet, so miles can't be saved to your passport.
                  Enroll below to start logging miles, unlock milestones, and earn stamps.
                </AlertDescription>
              </Alert>
              <Button
                className="w-full h-auto py-3 text-sm font-bold leading-tight whitespace-normal bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={onScrollToPricing}
              >
                Enroll in This Challenge
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Footprints className="w-5 h-5 text-primary" />
            Log Miles
          </CardTitle>
          {!isFirstMileFreeWindow && (
            <>
              <p className="text-sm text-muted-foreground">
                Total logged: <span className="font-semibold text-primary">{totalMiles} miles</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Today: {dailyLogged} / {maxDailyAggregate} mi · <span className="font-medium">{dailyRemaining} mi remaining</span>
              </p>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isRateLimited && <RateLimitBanner countdown={formatCountdown()} />}
          {/* Quick buttons — in free preview window, only show +1 */}
          <div className={`grid gap-2 ${isFirstMileFreeWindow ? "grid-cols-1" : "grid-cols-4"}`}>
            {(isFirstMileFreeWindow ? [1] : QUICK_MILES).map((quickMiles) => (
              <Button
                key={quickMiles}
                variant={isFirstMileFreeWindow ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickLog(quickMiles)}
                disabled={isLogging || isRateLimited || quickMiles > dailyRemaining}
                className={isFirstMileFreeWindow ? "h-auto py-3 text-sm font-bold leading-tight whitespace-normal bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" : "h-12 text-lg font-bold hover:bg-primary hover:text-primary-foreground transition-colors"}
              >
                {isLogging ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  isFirstMileFreeWindow ? "Start Your Free 1 Mile Legacy Passport" : `+${quickMiles}`
                )}
              </Button>
            ))}
          </div>

          {/* Custom entry toggle + form — hidden in free preview window */}
          {!isFirstMileFreeWindow && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustom(!showCustom)}
                className="w-full text-muted-foreground"
              >
                {showCustom ? "Hide custom entry" : "Custom amount..."}
              </Button>

              {showCustom && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="miles" className="flex justify-between">
                      <span>Miles</span>
                      <span className="font-bold text-primary">{miles}</span>
                    </Label>
                    <Slider
                      id="miles-slider"
                      value={[miles]}
                      onValueChange={([v]) => setMiles(v)}
                      min={0.5}
                      max={Math.min(maxSingleEntry, dailyRemaining)}
                      step={0.5}
                      className="py-2"
                    />
                    <Input
                      id="miles"
                      type="number"
                      value={miles}
                      onChange={(e) => setMiles(Number(e.target.value))}
                      min={0.1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Morning run, evening walk..."
                      rows={2}
                    />
                  </div>

                  {miles > maxSingleEntry && (
                    <p className="text-xs text-destructive">Max {maxSingleEntry} miles per entry.</p>
                  )}
                  {miles > dailyRemaining && miles <= maxSingleEntry && (
                    <p className="text-xs text-destructive">Only {dailyRemaining} miles remaining today.</p>
                  )}
                  <Button
                    onClick={handleCustomLog}
                    disabled={isLogging || isRateLimited || miles <= 0 || miles > maxSingleEntry || miles > dailyRemaining}
                    className="w-full"
                  >
                    {isLogging ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging...
                      </>
                    ) : (
                      `Log ${miles} miles`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <MileLogConfirmDialog
        open={pendingMiles !== null}
        onOpenChange={(open) => { if (!open) setPendingMiles(null); }}
        onConfirm={handleConfirmLog}
        miles={pendingMiles || 0}
        challengeName={challengeName}
        isLogging={isLogging}
      />

      {/* Stamp unlock modal */}
      <StampUnlockModal
        stamps={newlyUnlockedStamps}
        onClose={() => {
          clearUnlockedStamps();
          setStampModalDismissed(true);
        }}
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
        onClose={() => {
          setGateModal((prev) => ({ ...prev, open: false }));
          onMaybeLater?.();
        }}
      />
    </>
  );
}
