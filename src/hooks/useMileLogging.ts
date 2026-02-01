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
}

export function useMileLogging(challengeId?: string) {
  const queryClient = useQueryClient();
  const [newlyUnlockedStamps, setNewlyUnlockedStamps] = useState<UnlockedStamp[]>([]);

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

      // Insert mile entry
      const { error: insertError } = await supabase.from("mile_entries").insert({
        user_id: user.id,
        challenge_id: challengeId,
        miles,
        notes,
        source,
      });

      if (insertError) throw insertError;

      // Calculate new total
      const { data: allEntries, error: fetchError } = await supabase
        .from("mile_entries")
        .select("miles")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId);

      if (fetchError) throw fetchError;

      const newTotal = allEntries.reduce((sum, entry) => sum + Number(entry.miles), 0);

      // Update user_challenges miles_logged
      await supabase
        .from("user_challenges")
        .update({ miles_logged: newTotal })
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId);

      // Check for milestone unlocks
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

      return {
        newTotal,
        unlockedStamps: unlockResult?.unlockedStamps || [],
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
    },
    onError: (error) => {
      console.error("Error logging miles:", error);
      toast.error("Failed to log miles. Please try again.");
    },
  });

  const clearUnlockedStamps = () => {
    setNewlyUnlockedStamps([]);
  };

  return {
    totalMiles: totalMilesQuery.data || 0,
    userChallenge: userChallengeQuery.data,
    isLoading: totalMilesQuery.isLoading || userChallengeQuery.isLoading,
    logMiles: logMilesMutation.mutate,
    isLogging: logMilesMutation.isPending,
    newlyUnlockedStamps,
    clearUnlockedStamps,
  };
}
