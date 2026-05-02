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
  edition_name: string | null;
  edition_color: string | null;
  // enriched after fetch
  milestone_count?: number;
  first_stamp_image?: string | null;
}

export async function fetchChallengesWithMeta(): Promise<ChallengeWithMeta[]> {
  // Lazy loading: only fetch the challenge list. Milestones are fetched
  // on-demand when a user opens a specific challenge (see useChallengeBySlug).
  const { data: challenges, error } = await supabase
    .from("challenges")
    .select(
      "id, title, slug, description, total_miles, edition, is_active, image_url, featured, category, difficulty, release_date, featured_quote, featured_quote_attribution, edition_name, edition_color"
    )
    .eq("is_active", true)
    .eq("archived", false)
    .order("release_date", { ascending: false });

  if (error) throw error;
  if (!challenges || challenges.length === 0) return [];

  return challenges.map((c) => ({
    ...c,
    featured: c.featured ?? false,
    milestone_count: undefined,
    first_stamp_image: null,
  }));
}

export function useChallengesWithMeta() {
  return useQuery({
    queryKey: ["challenges-with-meta"],
    queryFn: fetchChallengesWithMeta,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}
