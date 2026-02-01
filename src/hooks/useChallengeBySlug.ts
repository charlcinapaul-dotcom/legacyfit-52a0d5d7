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

export function useChallengeBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["challenge", slug],
    queryFn: async (): Promise<ChallengeWithMilestones | null> => {
      if (!slug) return null;

      // Fetch challenge by slug
      const { data: challenge, error: challengeError } = await supabase
        .from("challenges")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (challengeError) {
        console.error("Error fetching challenge:", challengeError);
        throw challengeError;
      }

      if (!challenge) {
        return null;
      }

      // Fetch milestones for this challenge
      const { data: milestones, error: milestonesError } = await supabase
        .from("milestones")
        .select("*")
        .eq("challenge_id", challenge.id)
        .order("order_index", { ascending: true });

      if (milestonesError) {
        console.error("Error fetching milestones:", milestonesError);
        throw milestonesError;
      }

      return {
        challenge,
        milestones: milestones || [],
      };
    },
    enabled: !!slug,
  });
}
