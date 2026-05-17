import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EnrollmentStatus = "paid" | "pending" | "not_enrolled";

export interface EnrollmentInfo {
  status: EnrollmentStatus;
  milesLogged: number;
  isEnrolled: boolean;
}

export function useEnrollmentStatus(challengeId: string | undefined) {
  return useQuery({
    queryKey: ["enrollment-status", challengeId],
    queryFn: async (): Promise<EnrollmentInfo> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !challengeId) {
        return { status: "not_enrolled", milesLogged: 0, isEnrolled: false };
      }

      const { data, error } = await supabase
        .from("user_challenges")
        .select("payment_status, miles_logged")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      if (error) {
        console.error("Error checking enrollment:", error);
        return { status: "not_enrolled", milesLogged: 0, isEnrolled: false };
      }

      if (!data) {
        return { status: "not_enrolled", milesLogged: 0, isEnrolled: false };
      }

      const status: EnrollmentStatus = data.payment_status === "paid" ? "paid" : "pending";
      return {
        status,
        milesLogged: data.miles_logged || 0,
        isEnrolled: status === "paid",
      };
    },
    enabled: !!challengeId,
  });
}
