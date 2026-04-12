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
  isCompleted: boolean;
}

export function useActiveChallenge() {
  return useQuery({
    queryKey: ["active-challenge"],
    staleTime: 30_000,
    queryFn: async (): Promise<ActiveChallenge | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const user = session.user;

      const { data, error } = await supabase
        .from("user_challenges")
        .select(`
          id,
          miles_logged,
          challenge_id,
          is_completed,
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
        isCompleted: data.is_completed ?? false,
        slug: challenge.slug,
        title: challenge.title,
        totalMiles: challenge.total_miles,
        imageUrl: challenge.image_url,
      };
    },
  });
}
