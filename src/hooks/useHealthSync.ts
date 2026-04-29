import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { MAX_SINGLE_ENTRY_MILES, roundMiles } from "@/lib/health-cap";
import { stepsToMiles } from "@/lib/health-sync";
import {
  ensureHealthReadAuthorization,
  HEALTH_PERMISSION_DENIED_MESSAGE,
} from "@/lib/capacitor-health";

export type HealthSource = "apple_health" | "google_fit";

interface HealthSyncResult {
  sync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncAt: string | null;
  milesSynced: number | null;
  isAvailable: boolean;
  error: string | null;
  healthSource: HealthSource | null;
}

function getHealthSource(): HealthSource | null {
  const platform = Capacitor.getPlatform();
  if (platform === "ios") return "apple_health";
  if (platform === "android") return "google_fit";
  return null;
}

function getLocalStorageKey(challengeId: string) {
  return `health-sync-last-${challengeId}`;
}

export function useHealthSync(challengeId?: string): HealthSyncResult {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(() => {
    if (!challengeId) return null;
    return localStorage.getItem(getLocalStorageKey(challengeId));
  });
  const [milesSynced, setMilesSynced] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const healthSource = getHealthSource();
  const isAvailable = healthSource !== null;

  const sync = useCallback(async () => {
    if (!challengeId || !healthSource) {
      setError("Health sync is only available on iOS or Android devices.");
      return;
    }

    setIsSyncing(true);
    setError(null);
    setMilesSynced(null);

    // Request wake lock to keep screen on during sync
    try {
      (window as any)._wakeLock = await (navigator as any).wakeLock?.request("screen");
    } catch (e) {
      console.warn("Wake lock unavailable", e);
    }

    try {
      const { Health, granted } = await ensureHealthReadAuthorization(true);

      if (!granted) {
        throw new Error(HEALTH_PERMISSION_DENIED_MESSAGE);
      }

      // Query a wide window to get the user's *cumulative* Apple Health /
      // Google Health steps. We intentionally pull a long history so that the
      // raw total reflects everything the device has recorded — we'll diff it
      // against `profiles.last_health_total` to get the new miles to credit.
      const now = new Date();
      const windowStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      const result = await Health.queryAggregated({
        dataType: "steps",
        startDate: windowStart.toISOString(),
        endDate: now.toISOString(),
        bucket: "day",
      });

      const samples = result.samples || [];
      const totalSteps = samples.reduce(
        (sum: number, s: any) => sum + (Number(s.value) || 0),
        0,
      );

      // Current cumulative miles as reported by the health app.
      const currentHealthTotal = roundMiles(stepsToMiles(totalSteps));

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be signed in to sync health data.");
      }
      const userId = session.user.id;

      // Read the previously-synced cumulative total from profiles.
      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("last_health_total")
        .eq("user_id", userId)
        .maybeSingle();
      if (profileError) throw profileError;

      const lastHealthTotal = roundMiles(
        Number((profileRow as any)?.last_health_total ?? 0),
      );

      // Compute delta = current - last, then cap at MAX_SINGLE_ENTRY_MILES (7).
      // Negative or zero deltas (e.g. health app reset, or no new activity) are
      // treated as 0 — we never subtract miles from the user's total.
      const rawDelta = roundMiles(currentHealthTotal - lastHealthTotal);
      const cappedDelta = rawDelta <= 0
        ? 0
        : Math.min(rawDelta, MAX_SINGLE_ENTRY_MILES);

      // Always update last_health_total to the current raw reading so the
      // next sync diffs from here, even if cappedDelta is 0.
      await supabase
        .from("profiles")
        .update({ last_health_total: currentHealthTotal })
        .eq("user_id", userId);

      if (cappedDelta <= 0) {
        setMilesSynced(0);
        const timestamp = new Date().toISOString();
        setLastSyncAt(timestamp);
        localStorage.setItem(getLocalStorageKey(challengeId), timestamp);
        return;
      }

      // Insert a NEW mile_entries row for the capped delta. We never replace
      // the user's running total — only add to it.
      const sourceName =
        healthSource === "apple_health" ? "Apple Health" : "Google Health Connect";

      const { error: insertError } = await supabase
        .from("mile_entries")
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          miles: cappedDelta,
          source: healthSource,
          notes: `Health Sync — ${sourceName}`,
        });
      if (insertError) throw insertError;

      // Recompute the user's new cumulative LegacyFit total for this challenge
      // and (if enrolled) sync user_challenges.miles_logged.
      const { data: allEntries, error: fetchError } = await supabase
        .from("mile_entries")
        .select("miles")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId);
      if (fetchError) throw fetchError;

      const newTotal = roundMiles(
        (allEntries || []).reduce((sum, e) => sum + Number(e.miles), 0),
      );

      const { data: enrollmentRow } = await supabase
        .from("user_challenges")
        .select("payment_status")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      const isEnrolledPaid = enrollmentRow?.payment_status === "paid";

      if (isEnrolledPaid) {
        await supabase
          .from("user_challenges")
          .update({ miles_logged: newTotal })
          .eq("user_id", userId)
          .eq("challenge_id", challengeId);
      }

      // After miles are committed, run the same milestone unlock pipeline that
      // manual logging uses. Service-role edge function inserts user_milestones,
      // user_passport_stamps, and triggers stamp/notification generation.
      if (isEnrolledPaid) {
        const { error: unlockError } = await supabase.functions.invoke(
          "check-milestone-unlocks",
          {
            body: {
              userId,
              challengeId,
              totalMiles: newTotal,
              isFirstMile: false,
            },
          },
        );
        if (unlockError) {
          console.error("Health Sync: milestone unlock check failed", unlockError);
        }
      }

      setMilesSynced(cappedDelta);
      const timestamp = new Date().toISOString();
      setLastSyncAt(timestamp);
      localStorage.setItem(getLocalStorageKey(challengeId), timestamp);
    } catch (err: any) {
      console.error("Health sync error:", err);
      setError(err?.message || "Failed to sync health data.");
    } finally {
      // Release wake lock
      try {
        await (window as any)._wakeLock?.release();
        (window as any)._wakeLock = null;
      } catch (e) {}
      setIsSyncing(false);
    }
  }, [challengeId, healthSource]);

  return {
    sync,
    isSyncing,
    lastSyncAt,
    milesSynced,
    isAvailable,
    error,
    healthSource,
  };
}
