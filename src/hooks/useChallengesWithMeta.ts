import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChallengeWithMeta {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  total_miles: number;
  edition: string;
  is_active: boolean | null;
  image_url: string | null;
  featured: boolean | null;
  category: string | null;
  difficulty: string | null;
  release_date: string | null;
  featured_quote: string | null;
  featured_quote_attribution: string | null;
  // enriched after fetch
  milestone_count?: number;
  first_stamp_image?: string | null;
}

export function useChallengesWithMeta() {
  return useQuery({
    queryKey: ["challenges-with-meta"],
    queryFn: async (): Promise<ChallengeWithMeta[]> => {
      // Fire both queries in parallel to eliminate the sequential waterfall
      const [challengesResult, milestonesResult] = await Promise.all([
        supabase
          .from("challenges")
          .select(
            "id, title, slug, description, total_miles, edition, is_active, image_url, featured, category, difficulty, release_date, featured_quote, featured_quote_attribution"
          )
          .order("release_date", { ascending: false }),
        supabase
          .from("milestones")
          .select("challenge_id, order_index, stamp_image_url")
          .order("order_index", { ascending: true }),
      ]);

      if (challengesResult.error) throw challengesResult.error;
      const challenges = challengesResult.data;
      if (!challenges || challenges.length === 0) return [];

      const milestones = milestonesResult.data;

      // Build lookup maps
      const countMap: Record<string, number> = {};
      const stampMap: Record<string, string | null> = {};

      if (milestones) {
        const challengeIdSet = new Set(challenges.map((c) => c.id));
        for (const m of milestones) {
          if (!challengeIdSet.has(m.challenge_id)) continue;
          countMap[m.challenge_id] = (countMap[m.challenge_id] ?? 0) + 1;
          if (!(m.challenge_id in stampMap)) {
            stampMap[m.challenge_id] = m.stamp_image_url ?? null;
          }
        }
      }

      return challenges.map((c) => ({
        ...c,
        featured: c.featured ?? false,
        milestone_count: countMap[c.id] ?? 0,
        first_stamp_image: stampMap[c.id] ?? null,
      }));
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
