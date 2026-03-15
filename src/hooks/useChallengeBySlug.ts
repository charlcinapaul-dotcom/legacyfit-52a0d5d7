import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChallengeData {
  id: string;
  title: string;
  edition: string;
  description: string | null;
  total_miles: number;
  slug: string | null;
  image_url: string | null;
  is_active: boolean | null;
}

export interface MilestoneData {
  id: string;
  title: string;
  stamp_title: string | null;
  stamp_copy: string | null;
  stamp_mileage_display: string | null;
  stamp_image_url: string | null;
  audio_url: string | null;
  miles_required: number;
  location_name: string | null;
  description: string | null;
  historical_event: string | null;
  order_index: number;
  latitude: number | null;
  longitude: number | null;
}

export interface ChallengeWithMilestones {
  challenge: ChallengeData;
  milestones: MilestoneData[];
}

/**
 * Fetches the challenge metadata first, then milestones lazily once the
 * challenge id is known. This lets the hero section render immediately while
 * the milestone list loads in a second query.
 *
 * The returned shape is identical to the original single-query version so
 * all downstream consumers (JourneyMap, StampUnlockModal, etc.) are unchanged.
 */
export function useChallengeBySlug(slug: string | undefined) {
  // ── Query 1: challenge metadata ─────────────────────────────────────────
  const challengeQuery = useQuery({
    queryKey: ["challenge-meta", slug],
    queryFn: async (): Promise<ChallengeData | null> => {
      if (!slug) return null;

      const { data: challenge, error } = await supabase
        .from("challenges")
        .select("id, title, edition, description, total_miles, slug, image_url, is_active")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error fetching challenge:", error);
        throw error;
      }

      return challenge ?? null;
    },
    enabled: !!slug,
  });

  const challengeId = challengeQuery.data?.id;

  // ── Query 2: milestones — only runs after challenge id is available ──────
  const milestonesQuery = useQuery({
    queryKey: ["challenge-milestones", challengeId],
    queryFn: async (): Promise<MilestoneData[]> => {
      const { data: milestones, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("challenge_id", challengeId!)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching milestones:", error);
        throw error;
      }

      return milestones || [];
    },
    enabled: !!challengeId,
  });

  // ── Derived combined state (identical shape to original) ─────────────────
  const combinedData: ChallengeWithMilestones | null =
    challengeQuery.data
      ? {
          challenge: challengeQuery.data,
          milestones: milestonesQuery.data ?? [],
        }
      : null;

  return {
    // Mirrors the original { data, isLoading, error } API so nothing breaks
    data: combinedData,
    isLoading: challengeQuery.isLoading,
    error: challengeQuery.error ?? milestonesQuery.error,

    // Extra granular flags for the two-phase loading pattern
    isChallengeLoading: challengeQuery.isLoading,
    isMilestonesLoading: milestonesQuery.isLoading || milestonesQuery.isFetching,
    isMilestonesReady: milestonesQuery.isSuccess,
  };
}
