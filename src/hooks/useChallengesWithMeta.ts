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
      const { data: challenges, error } = await supabase
        .from("challenges")
        .select(
          "id, title, slug, description, total_miles, edition, is_active, image_url, featured, category, difficulty, release_date, featured_quote, featured_quote_attribution"
        )
        .order("release_date", { ascending: false });

      if (error) throw error;
      if (!challenges || challenges.length === 0) return [];

      const challengeIds = challenges.map((c) => c.id);

      // Fetch milestone counts and first stamp image in one query
      const { data: milestones } = await supabase
        .from("milestones")
        .select("challenge_id, order_index, stamp_image_url")
        .in("challenge_id", challengeIds)
        .order("order_index", { ascending: true });

      // Build lookup maps
      const countMap: Record<string, number> = {};
      const stampMap: Record<string, string | null> = {};

      if (milestones) {
        for (const m of milestones) {
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
    staleTime: 60_000,
  });
}
