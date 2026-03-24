import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns whether the current authenticated user has already claimed
 * their one-time account-wide free 1-mile preview on any challenge.
 *
 * Source of truth: profiles.free_preview_claimed_at (non-null = claimed).
 */
export function useHasClaimedFreePreview() {
  const { data, isLoading } = useQuery({
    queryKey: ["free-preview-claimed"],
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("free_preview_claimed_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return profile?.free_preview_claimed_at != null;
    },
  });

  return {
    hasClaimed: data ?? false,
    isLoading,
  };
}
