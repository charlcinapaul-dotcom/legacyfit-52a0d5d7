import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MileEntry {
  miles: number;
  challengeId: string;
  notes?: string;
  source?: "manual" | "apple_health" | "google_fit";
}

export interface UnlockedStamp {
  milestoneId: string;
  title: string;
  stampTitle: string;
  stampCopy: string;
  milesRequired: number;
  locationName: string;
  stampImageUrl: string | null;
  audioUrl: string | null;
}

export interface CompletionData {
  challengeCompleted: boolean;
  certificateImageUrl: string | null;
  challengeName: string;
  challengeTotalMiles: number;
}

export function useMileLogging(challengeId?: string) {
  const queryClient = useQueryClient();
  const [newlyUnlockedStamps, setNewlyUnlockedStamps] = useState<UnlockedStamp[]>([]);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);

  // Get user's total miles for a challenge
  const totalMilesQuery = useQuery({
    queryKey: ["total-miles", challengeId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !challengeId) return 0;

      const { data, error } = await supabase
        .from("mile_entries")
        .select("miles")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId);

      if (error) throw error;
      return data.reduce((sum, entry) => sum + Number(entry.miles), 0);
    },
    enabled: !!challengeId,
  });

  // Get user's challenge enrollment
  const userChallengeQuery = useQuery({
    queryKey: ["user-challenge", challengeId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !challengeId) return null;

      const { data, error } = await supabase
        .from("user_challenges")
        .select("*")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!challengeId,
  });

  // Log miles mutation
  const logMilesMutation = useMutation({
    mutationFn: async ({ miles, challengeId, notes, source = "manual" }: MileEntry) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch profile id (user_activity.user_id references profiles.id, not auth.uid())
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      // Check if user is enrolled (paid) BEFORE inserting — so we know which path to use
      const { data: enrollmentRow } = await supabase
        .from("user_challenges")
        .select("payment_status")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      const isEnrolledPaid = enrollmentRow?.payment_status === "paid";

      // Check if this is truly the user's first mile (free preview window)
      const { data: existingEntries } = await supabase
        .from("mile_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .limit(1);
      const isFirstMile = !isEnrolledPaid && (!existingEntries || existingEntries.length === 0);

      // Insert mile entry (existing table — not changing yet)
      const { error: insertError } = await supabase.from("mile_entries").insert({
        user_id: user.id,
        challenge_id: challengeId,
        miles,
        notes,
        source,
      });

      if (insertError) throw insertError;

      // Also write to user_activity (new tracking table)
      if (profileRow?.id) {
        // Derive activity_type from source/notes heuristic; default to "manual"
        const activityType: "walk" | "run" | "bike" | "manual" =
          source === "apple_health" || source === "google_fit" ? "walk" : "manual";
        const activitySource: "manual" | "apple_health" | "health_connect" | "wearable" =
          source === "apple_health" ? "apple_health"
          : source === "google_fit" ? "health_connect"
          : "manual";

        await supabase.from("user_activity").insert({
          user_id: profileRow.id,
          distance_miles: miles,
          activity_type: activityType,
          source: activitySource,
        });
        // Silently ignore user_activity insert errors so they never block mile logging
      }

      // Calculate new total
      const { data: allEntries, error: fetchError } = await supabase
        .from("mile_entries")
        .select("miles")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId);

      if (fetchError) throw fetchError;

      const newTotal = allEntries.reduce((sum, entry) => sum + Number(entry.miles), 0);

      // Only update user_challenges miles_logged for enrolled users (row exists)
      if (isEnrolledPaid) {
        await supabase
          .from("user_challenges")
          .update({ miles_logged: newTotal })
          .eq("user_id", user.id)
          .eq("challenge_id", challengeId);
      }

      let unlockedStampsResult: UnlockedStamp[] = [];

      if (isFirstMile) {
        // FREE FIRST MILE PATH: fetch the 1-mile milestone directly and unlock it client-side
        const { data: firstMilestone } = await supabase
          .from("milestones")
          .select("id, title, stamp_title, stamp_copy, miles_required, location_name, stamp_image_url, audio_url")
          .eq("challenge_id", challengeId)
          .eq("miles_required", 1)
          .maybeSingle();

        if (firstMilestone) {
          // Insert passport stamp (RLS allows this)
          await supabase.from("user_passport_stamps").insert({
            user_id: user.id,
            milestone_id: firstMilestone.id,
          }).select();

          unlockedStampsResult = [{
            milestoneId: firstMilestone.id,
            title: firstMilestone.title,
            stampTitle: firstMilestone.stamp_title || firstMilestone.title,
            stampCopy: firstMilestone.stamp_copy || "",
            milesRequired: Number(firstMilestone.miles_required),
            locationName: firstMilestone.location_name || "",
            stampImageUrl: firstMilestone.stamp_image_url,
            audioUrl: firstMilestone.audio_url || null,
          }];
        }
      } else if (isEnrolledPaid) {
        // ENROLLED PATH: use the edge function for full milestone unlock logic
        const { data: unlockResult, error: unlockError } = await supabase.functions.invoke(
          "check-milestone-unlocks",
          {
            body: {
              userId: user.id,
              challengeId,
              totalMiles: newTotal,
            },
          }
        );

        if (unlockError) {
          console.error("Error checking unlocks:", unlockError);
        }
        unlockedStampsResult = unlockResult?.unlockedStamps || [];
      }

      // Check for challenge completion (enrolled users only)
      let certificateImageUrl: string | null = null;
      const { data: challengeData } = await supabase
        .from("challenges")
        .select("total_miles, title")
        .eq("id", challengeId)
        .single();

      const { data: userChallengeData } = await supabase
        .from("user_challenges")
        .select("is_completed")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .single();

      if (
        isEnrolledPaid &&
        challengeData &&
        userChallengeData &&
        !userChallengeData.is_completed &&
        newTotal >= Number(challengeData.total_miles)
      ) {
        // Mark challenge as completed
        await supabase
          .from("user_challenges")
          .update({ is_completed: true, completed_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("challenge_id", challengeId);

        // Get profile for display name
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        const displayName = profileData?.display_name || "Explorer";

        // Generate certificate
        try {
          const { data: certResult } = await supabase.functions.invoke("generate-certificate", {
            body: {
              challengeId,
              challengeName: challengeData.title,
              displayName,
              totalMiles: Number(challengeData.total_miles),
            },
          });
          certificateImageUrl = certResult?.imageUrl || null;

          // Send certificate email
          await supabase.functions.invoke("send-certificate-email", {
            body: {
              displayName,
              challengeName: challengeData.title,
              totalMiles: Number(challengeData.total_miles),
              certificateImageUrl,
            },
          });
        } catch (certErr) {
          console.error("Error generating certificate:", certErr);
        }
      }

      return {
        newTotal,
        isFirstMile,
        unlockedStamps: unlockedStampsResult,
        challengeCompleted: certificateImageUrl !== null || (
          isEnrolledPaid && challengeData && !userChallengeData?.is_completed && newTotal >= Number(challengeData.total_miles)
        ),
        certificateImageUrl,
        challengeName: challengeData?.title,
        challengeTotalMiles: challengeData ? Number(challengeData.total_miles) : 0,
      };
    },
    onSuccess: (result) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["total-miles"] });
      queryClient.invalidateQueries({ queryKey: ["user-passport-stamps"] });
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
      queryClient.invalidateQueries({ queryKey: ["user-challenge"] });

      toast.success(`Miles logged! Total: ${result.newTotal} miles`);

      // Set newly unlocked stamps for modal display
      if (result.unlockedStamps.length > 0) {
        setNewlyUnlockedStamps(result.unlockedStamps);
      }

      // Handle challenge completion
      if (result.challengeCompleted) {
        setCompletionData({
          challengeCompleted: true,
          certificateImageUrl: result.certificateImageUrl,
          challengeName: result.challengeName || "",
          challengeTotalMiles: result.challengeTotalMiles,
        });
        toast.success("🏆 Challenge complete! Your certificate is being generated!");
      }
    },
    onError: (error) => {
      console.error("Error logging miles:", error);
      toast.error("Failed to log miles. Please try again.");
    },
  });

  const clearUnlockedStamps = () => {
    setNewlyUnlockedStamps([]);
  };

  const clearCompletionData = () => {
    setCompletionData(null);
  };

  return {
    totalMiles: totalMilesQuery.data || 0,
    userChallenge: userChallengeQuery.data,
    isLoading: totalMilesQuery.isLoading || userChallengeQuery.isLoading,
    logMiles: logMilesMutation.mutate,
    isLogging: logMilesMutation.isPending,
    newlyUnlockedStamps,
    clearUnlockedStamps,
    completionData,
    clearCompletionData,
  };
}
