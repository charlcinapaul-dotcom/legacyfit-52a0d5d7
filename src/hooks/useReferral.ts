import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReferralData {
  code: string;
  referralCount: number;
  rewardCodes: { code: string; isRedeemed: boolean; createdAt: string }[];
}

export function useReferral() {
  return useQuery({
    queryKey: ["referral-data"],
    queryFn: async (): Promise<ReferralData | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get or create referral code
      let { data: refCode } = await supabase
        .from("referral_codes")
        .select("id, code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!refCode) {
        // Generate one if trigger didn't fire (e.g. existing user)
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { data: newCode } = await supabase
          .from("referral_codes")
          .insert({ user_id: user.id, code })
          .select("id, code")
          .single();
        refCode = newCode;
      }

      if (!refCode) return null;

      // Count redemptions
      const { count } = await supabase
        .from("referral_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("referral_code_id", refCode.id);

      // Get reward codes
      const { data: rewards } = await supabase
        .from("reward_codes")
        .select("code, is_redeemed, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      return {
        code: refCode.code,
        referralCount: count || 0,
        rewardCodes: (rewards || []).map(r => ({
          code: r.code,
          isRedeemed: r.is_redeemed,
          createdAt: r.created_at,
        })),
      };
    },
  });
}
