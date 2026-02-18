import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MAX_SINGLE_ENTRY = 7;
const MAX_DAILY_AGGREGATE = 10.5;

export function useDailyMilesLogged(challengeId?: string) {
  const query = useQuery({
    queryKey: ["daily-miles-logged", challengeId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !challengeId) return 0;

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("mile_entries")
        .select("miles")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .gte("logged_at", `${today}T00:00:00`)
        .lt("logged_at", `${today}T23:59:59.999`);

      if (error) throw error;
      return data.reduce((sum, e) => sum + Number(e.miles), 0);
    },
    enabled: !!challengeId,
  });

  const dailyLogged = query.data || 0;
  const dailyRemaining = Math.max(0, MAX_DAILY_AGGREGATE - dailyLogged);

  return {
    dailyLogged,
    dailyRemaining,
    maxSingleEntry: MAX_SINGLE_ENTRY,
    maxDailyAggregate: MAX_DAILY_AGGREGATE,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
