import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Milestone {
  id: string;
  title: string;
  stamp_title: string | null;
  stamp_copy: string | null;
  stamp_mileage_display: string | null;
  stamp_image_url: string | null;
  miles_required: number;
  location_name: string | null;
  description: string | null;
  historical_event: string | null;
  order_index: number;
  challenge_id: string;
}

export interface UserStamp {
  id: string;
  milestone_id: string;
  unlocked_at: string;
  user_id: string;
}

export interface StampWithMilestone extends Milestone {
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export function usePassportStamps(challengeId?: string) {
  // Fetch all milestones for a challenge
  const milestonesQuery = useQuery({
    queryKey: ["milestones", challengeId],
    queryFn: async () => {
      let query = supabase
        .from("milestones")
        .select("*")
        .order("miles_required", { ascending: true });

      if (challengeId) {
        query = query.eq("challenge_id", challengeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Milestone[];
    },
    enabled: true,
  });

  // Fetch user's unlocked stamps
  const userStampsQuery = useQuery({
    queryKey: ["user-passport-stamps"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_passport_stamps")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as UserStamp[];
    },
    enabled: true,
  });

  // Combine milestones with unlock status
  const stampsWithStatus: StampWithMilestone[] = (milestonesQuery.data || []).map((milestone) => {
    const userStamp = userStampsQuery.data?.find((s) => s.milestone_id === milestone.id);
    return {
      ...milestone,
      isUnlocked: !!userStamp,
      unlockedAt: userStamp?.unlocked_at || null,
    };
  });

  const unlockedCount = stampsWithStatus.filter((s) => s.isUnlocked).length;
  const totalCount = stampsWithStatus.length;

  return {
    stamps: stampsWithStatus,
    unlockedCount,
    totalCount,
    isLoading: milestonesQuery.isLoading || userStampsQuery.isLoading,
    error: milestonesQuery.error || userStampsQuery.error,
    refetch: () => {
      milestonesQuery.refetch();
      userStampsQuery.refetch();
    },
  };
}

export function useChallenges() {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
