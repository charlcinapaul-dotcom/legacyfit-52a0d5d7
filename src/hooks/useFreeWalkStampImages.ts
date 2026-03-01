import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const QUEEN_SLUGS = [
  "sojourner",
  "ida",
  "eleanor",
  "wilma",
  "fannie",
  "maya",
  "katherine",
  "ruth-bader-ginsburg",
  "malala",
  "toni",
  "jane-goodall",
];

// Maps ROUTE_STOP title → challenge slug
export const TITLE_TO_SLUG: Record<string, string> = {
  "Sojourner Truth": "sojourner",
  "Ida B. Wells": "ida",
  "Eleanor Roosevelt": "eleanor",
  "Wilma Rudolph": "wilma",
  "Fannie Lou Hamer": "fannie",
  "Maya Angelou": "maya",
  "Katherine Johnson": "katherine",
  "Ruth Bader Ginsburg": "ruth-bader-ginsburg",
  "Malala Yousafzai": "malala",
  "Toni Morrison": "toni",
  "Jane Goodall": "jane-goodall",
};

/**
 * Fetches the first milestone stamp image for each Queen challenge.
 * Returns a Map<title, stamp_image_url> for easy lookup by ROUTE_STOP title.
 */
export function useFreeWalkStampImages() {
  return useQuery({
    queryKey: ["free-walk-stamp-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("stamp_image_url, challenge_id, challenges!inner(slug)")
        .in("challenges.slug", QUEEN_SLUGS)
        .eq("order_index", 1);

      if (error) throw error;

      // Build a slug → image URL map first
      const slugToImage = new Map<string, string>();
      for (const row of data ?? []) {
        const slug = (row.challenges as { slug: string } | null)?.slug;
        if (slug && row.stamp_image_url) {
          slugToImage.set(slug, row.stamp_image_url);
        }
      }

      // Then build title → image URL map
      const titleToImage = new Map<string, string>();
      for (const [title, slug] of Object.entries(TITLE_TO_SLUG)) {
        const img = slugToImage.get(slug);
        if (img) titleToImage.set(title, img);
      }

      return titleToImage;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
