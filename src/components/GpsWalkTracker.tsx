import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Play, Pause, Square, CheckCircle, Trash2, AlertTriangle, Loader2, Navigation } from "lucide-react";
import { useGpsWalk } from "@/hooks/useGpsWalk";
import { useMileLogging } from "@/hooks/useMileLogging";
import type { UnlockedStamp } from "@/hooks/useMileLogging";
import { useEnrollmentStatus } from "@/hooks/useEnrollmentStatus";
import { useDailyMilesLogged } from "@/hooks/useDailyMilesLogged";
import { useRateLimitCountdown } from "@/hooks/useRateLimitCountdown";
import { StampUnlockModal } from "./StampUnlockModal";
import { FirstMileGateModal } from "./FirstMileGateModal";
import { MileLogConfirmDialog } from "./MileLogConfirmDialog";
import { RateLimitBanner } from "./RateLimitBanner";

const MIN_SAVE_MILES = 0.1;

interface GpsWalkTrackerProps {
  challengeId: string;
  challengeSlug?: string;
  challengeName?: string;
  challengeEditionColor?: "gold" | "burgundy" | "pride";
}

export function GpsWalkTracker({
  challengeId,
  challengeSlug,
  challengeName,
  challengeEditionColor = "gold",
}: GpsWalkTrackerProps) {
  const gps = useGpsWalk();

  const [pendingSave, setPendingSave] = useState(false);
  const [gateModal, setGateModal] = useState<{
    open: boolean;
    screen: "share" | "purchase";
    stamp: UnlockedStamp | null;
  }>({ open: false, screen: "purchase", stamp: null });

  const {
    logMiles,
    isLogging,
    newlyUnlockedStamps,
    clearUnlockedStamps,
  } = useMileLogging(challengeId);

  const { data: enrollment } = useEnrollmentStatus(challengeId);
  const { dailyRemaining, refetch: refetchDaily } = useDailyMilesLogged(challengeId);
  const { isRateLimited, formatCountdown, triggerRateLimit } = useRateLimitCountdown(challengeId);

  const handleSaveConfirm = () => {
    logMiles(
      {
        miles: gps.miles,
        challengeId,
        notes: `GPS Walk — ${gps.clock}`,
        source: "manual",
      },
      {
        onSuccess: () => {
          refetchDaily();
          gps.discardWalk(); // reset state after save
        },
        onSettled: () => {
          refetchDaily();
          setPendingSave(false);
        },
        onError: (error: any) => {
          setPendingSave(false);
          const msg = error?.message || "";
          if (msg.toLowerCase().includes("rate limit")) {
            triggerRateLimit();
          }
        },
      }
    );
  };

  // ─── IDLE ───────────────────────────────────────────────────────────────────
  if (gps.status === "idle") {
    return (
      <>
        <Card className="border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Navigation className="w-5 h-5 text-accent" />
              GPS Walk
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Track your walk with GPS — miles count toward your challenge.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRateLimited && <RateLimitBanner countdown={formatCountdown()} />}

            {gps.error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{gps.error}</span>
              </div>
            )}

            <Button
              className="w-full h-14 text-base font-bold gap-2"
              onClick={gps.startWalk}
              disabled={isRateLimited}
            >
              <Play className="w-5 h-5 fill-current" />
              Start Walk
            </Button>
          </CardContent>
        </Card>

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

  // ─── ACTIVE / PAUSED ────────────────────────────────────────────────────────
  if (gps.status === "active" || gps.status === "paused") {
    return (
      <Card className="border-accent/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className={`w-5 h-5 text-accent ${gps.status === "active" ? "animate-pulse" : ""}`} />
            {gps.status === "active" ? "Walking…" : "Walk Paused"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Live stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/40 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Distance</p>
              <p className="text-3xl font-bold text-foreground tabular-nums">{gps.miles.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">miles</p>
            </div>
            <div className="bg-secondary/40 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Time</p>
              <p className="text-3xl font-bold text-foreground tabular-nums">{gps.clock}</p>
              <p className="text-xs text-muted-foreground">elapsed</p>
            </div>
          </div>

          {/* GPS status indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`w-2 h-2 rounded-full ${gps.status === "active" ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
            {gps.status === "active" ? "GPS active — tracking movement" : "GPS paused"}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={gps.status === "active" ? gps.pauseWalk : gps.resumeWalk}
            >
              {gps.status === "active" ? (
                <><Pause className="w-4 h-4" /> Pause</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> Resume</>
              )}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={gps.endWalk}
            >
              <Square className="w-4 h-4 fill-current" />
              End Walk
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── COMPLETED ──────────────────────────────────────────────────────────────
  return (
    <>
      <Card className="border-accent/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Walk Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/40 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Distance</p>
              <p className="text-3xl font-bold text-foreground tabular-nums">{gps.miles.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">miles</p>
            </div>
            <div className="bg-secondary/40 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Time</p>
              <p className="text-3xl font-bold text-foreground tabular-nums">{gps.clock}</p>
              <p className="text-xs text-muted-foreground">elapsed</p>
            </div>
          </div>

          {/* Minimum distance warning */}
          {gps.miles < MIN_SAVE_MILES && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Minimum 0.1 miles required to save. Keep walking!</span>
            </div>
          )}

          {isRateLimited && <RateLimitBanner countdown={formatCountdown()} />}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2 text-destructive hover:text-destructive"
              onClick={gps.discardWalk}
              disabled={isLogging}
            >
              <Trash2 className="w-4 h-4" />
              Discard
            </Button>
            <Button
              className="flex-1 gap-2 font-bold"
              onClick={() => setPendingSave(true)}
              disabled={
                isLogging ||
                isRateLimited ||
                gps.miles < MIN_SAVE_MILES ||
                gps.miles > dailyRemaining
              }
            >
              {isLogging ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <><MapPin className="w-4 h-4" /> Save Walk</>
              )}
            </Button>
          </div>

          {gps.miles > dailyRemaining && gps.miles >= MIN_SAVE_MILES && (
            <p className="text-xs text-destructive text-center">
              Only {dailyRemaining} miles remaining today — daily limit reached.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <MileLogConfirmDialog
        open={pendingSave}
        onOpenChange={(open) => { if (!open) setPendingSave(false); }}
        onConfirm={handleSaveConfirm}
        miles={gps.miles}
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
