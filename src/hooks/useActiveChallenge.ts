import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveChallenge {
  id: string;
  challengeId: string;
  milesLogged: number;
  slug: string | null;
  title: string;
  totalMiles: number;
  imageUrl: string | null;
}

export function useActiveChallenge() {
  return useQuery({
    queryKey: ["active-challenge"],
    queryFn: async (): Promise<ActiveChallenge | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_challenges")
        .select(`
          id,
          miles_logged,
          challenge_id,
          challenge:challenges (
            id,
            title,
            slug,
            total_miles,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching active challenge:", error);
        return null;
      }

      if (!data || !data.challenge) return null;

      const challenge = data.challenge as unknown as {
        id: string;
        title: string;
        slug: string | null;
        total_miles: number;
        image_url: string | null;
      };

      return {
        id: data.id,
        challengeId: data.challenge_id,
        milesLogged: data.miles_logged || 0,
        slug: challenge.slug,
        title: challenge.title,
        totalMiles: challenge.total_miles,
        imageUrl: challenge.image_url,
      };
    },
  });
}
