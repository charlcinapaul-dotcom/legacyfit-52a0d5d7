import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { capDailyRemainingMiles } from "@/lib/health-cap";
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

      // Query past 7 days of step data
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const result = await Health.queryAggregated({
        dataType: "steps",
        startDate: sevenDaysAgo.toISOString(),
        endDate: now.toISOString(),
        bucket: "day",
      });

      const samples = result.samples || [];
      const totalSteps = samples.reduce(
        (sum: number, s: any) => sum + (Number(s.value) || 0),
        0
      );

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be signed in to sync health data.");
      }
      const userId = session.user.id;

      // Idempotent per-day upsert: each Health Sync row is keyed by
      // (user_id, challenge_id, logged_at) where logged_at is normalized to the
      // start of the sample's UTC day. Re-syncing the same window will UPDATE
      // the existing row in place rather than creating duplicates.
      const sourceName = healthSource === "apple_health" ? "Apple Health" : "Google Health Connect";

      // Bucket samples by normalized day (handles plugins that return multiple
      // sub-day buckets) and pick a stable per-day timestamp.
      const stepsByDay = new Map<string, number>();
      for (const sample of samples) {
        const steps = Number(sample.value) || 0;
        if (steps <= 0) continue;
        const dayKey = new Date(sample.startDate).toISOString().split("T")[0];
        stepsByDay.set(dayKey, (stepsByDay.get(dayKey) || 0) + steps);
      }

      // Read prior Health Sync rows for the window so we can compute the net
      // delta to apply to user_challenges.miles_logged.
      const windowStart = sevenDaysAgo.toISOString();
      const windowEnd = now.toISOString();
      const { data: existingSynced } = await supabase
        .from("mile_entries")
        .select("miles, logged_at")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .like("notes", "Health Sync%")
        .gte("logged_at", windowStart)
        .lt("logged_at", windowEnd);

      const priorByDay = new Map<string, number>();
      for (const row of existingSynced || []) {
        const day = new Date(row.logged_at as string).toISOString().split("T")[0];
        priorByDay.set(day, (priorByDay.get(day) || 0) + Number(row.miles));
      }

      const rowsToUpsert: Array<{
        user_id: string;
        challenge_id: string;
        miles: number;
        source: HealthSource;
        notes: string;
        logged_at: string;
      }> = [];

      let netDelta = 0;
      let totalNewMiles = 0;

      for (const [dayKey, steps] of stepsByDay) {
        // Full-day miles, capped at the 7-mile single-entry limit.
        // Pass 0 for "already synced" because upsert replaces the row.
        const milesForDay = capDailyRemainingMiles(steps, 0);
        if (milesForDay <= 0) continue;

        // Stable, deterministic timestamp = midnight UTC of that day.
        const loggedAt = `${dayKey}T00:00:00.000Z`;
        const prior = priorByDay.get(dayKey) || 0;

        rowsToUpsert.push({
          user_id: userId,
          challenge_id: challengeId,
          miles: milesForDay,
          source: healthSource,
          notes: `Health Sync — ${sourceName} (${steps.toLocaleString()} steps on ${dayKey})`,
          logged_at: loggedAt,
        });

        netDelta = Math.round((netDelta + (milesForDay - prior)) * 100) / 100;
        totalNewMiles = Math.round((totalNewMiles + milesForDay) * 100) / 100;
      }

      if (rowsToUpsert.length === 0) {
        setMilesSynced(0);
        const timestamp = new Date().toISOString();
        setLastSyncAt(timestamp);
        localStorage.setItem(getLocalStorageKey(challengeId), timestamp);
        return;
      }

      const { error: upsertError } = await supabase
        .from("mile_entries")
        .upsert(rowsToUpsert, {
          onConflict: "user_id,challenge_id,logged_at",
          ignoreDuplicates: false,
        });
      if (upsertError) throw upsertError;

      // Update user_challenges miles_logged if enrolled
      const { data: enrollmentRow } = await supabase
        .from("user_challenges")
        .select("payment_status, miles_logged")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      if (enrollmentRow?.payment_status === "paid") {
        const newTotal = Math.max(
          0,
          Math.round((Number(enrollmentRow.miles_logged || 0) + netDelta) * 100) / 100,
        );
        await supabase
          .from("user_challenges")
          .update({ miles_logged: newTotal })
          .eq("user_id", userId)
          .eq("challenge_id", challengeId);
      }

      setMilesSynced(netDelta > 0 ? netDelta : 0);
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
