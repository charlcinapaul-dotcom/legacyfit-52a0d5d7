import { useHealthSync } from "@/hooks/useHealthSync";
import { Button } from "@/components/ui/button";
import { Activity, Loader2, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthSyncTrackerProps {
  challengeId: string;
  challengeSlug?: string;
  challengeName?: string;
  challengeEditionColor?: "gold" | "burgundy" | "pride";
}

export function HealthSyncTracker({ challengeId }: HealthSyncTrackerProps) {
  const {
    sync,
    isSyncing,
    lastSyncAt,
    milesSynced,
    isAvailable,
    error,
    healthSource,
  } = useHealthSync(challengeId);

  const sourceName =
    healthSource === "apple_health"
      ? "Apple Health"
      : healthSource === "google_fit"
        ? "Google Health Connect"
        : "your health app";

  return (
    <div className="space-y-5">
      {/* Sync Button */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Health Sync</h3>
            <p className="text-xs text-muted-foreground">
              Sync steps from {sourceName}
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              Only miles are stored — never your raw health data.
            </p>
          </div>
        </div>

        {!isAvailable ? (
          <div className="flex items-start gap-3 bg-secondary/50 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Not available on this device</p>
              <p>
                Health Sync requires the LegacyFit mobile app on an iPhone (Apple Health) or Android device (Google Health Connect).
              </p>
            </div>
          </div>
        ) : (
          <>
            <Button
              onClick={sync}
              disabled={isSyncing}
              className="w-full gap-2"
              size="lg"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing steps…
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Sync Health Data
                </>
              )}
            </Button>

            {/* Success state */}
            {milesSynced !== null && !isSyncing && !error && (
              <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">
                    {milesSynced > 0
                      ? `${milesSynced} mile${milesSynced !== 1 ? "s" : ""} synced!`
                      : "Already up to date — no new miles to sync."}
                  </p>
                  {lastSyncAt && (
                    <p className="text-muted-foreground text-xs mt-1">
                      Last synced: {new Date(lastSyncAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Last sync timestamp (no new sync yet) */}
            {milesSynced === null && lastSyncAt && !isSyncing && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Last synced: {new Date(lastSyncAt).toLocaleString()}
              </p>
            )}
          </>
        )}

        {/* Error state */}
        {error && !isSyncing && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">{error}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
