import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { STEPS_PER_MILE } from "@/lib/health-sync";
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

      const totalSteps = (result.samples || []).reduce(
        (sum: number, s: any) => sum + (Number(s.value) || 0),
        0
      );
      const totalMilesFromHealth = Math.round((totalSteps / STEPS_PER_MILE) * 100) / 100;

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be signed in to sync health data.");
      }
      const userId = session.user.id;

      // Check what was already synced today to avoid double-counting
      const today = new Date().toISOString().split("T")[0];
      const { data: existingToday } = await supabase
        .from("mile_entries")
        .select("miles")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .like("notes", "%Health Sync%")
        .gte("logged_at", `${today}T00:00:00`)
        .lt("logged_at", `${today}T23:59:59.999`);

      const alreadySyncedToday = (existingToday || []).reduce(
        (sum, e) => sum + Number(e.miles),
        0
      );

      const delta = Math.max(0, Math.round((totalMilesFromHealth - alreadySyncedToday) * 100) / 100);

      if (delta <= 0) {
        setMilesSynced(0);
        const timestamp = new Date().toISOString();
        setLastSyncAt(timestamp);
        localStorage.setItem(getLocalStorageKey(challengeId), timestamp);
        return;
      }

      // Log the delta miles
      const sourceName = healthSource === "apple_health" ? "Apple Health" : "Google Health Connect";
      const { error: insertError } = await supabase.from("mile_entries").insert({
        user_id: userId,
        challenge_id: challengeId,
        miles: delta,
        source: healthSource,
        notes: `Health Sync — ${sourceName} (${totalSteps.toLocaleString()} steps over 7 days)`,
      });

      if (insertError) throw insertError;

      // Update user_challenges miles_logged if enrolled
      const { data: enrollmentRow } = await supabase
        .from("user_challenges")
        .select("payment_status, miles_logged")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      if (enrollmentRow?.payment_status === "paid") {
        const newTotal = Number(enrollmentRow.miles_logged || 0) + delta;
        await supabase
          .from("user_challenges")
          .update({ miles_logged: newTotal })
          .eq("user_id", userId)
          .eq("challenge_id", challengeId);
      }

      setMilesSynced(delta);
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
