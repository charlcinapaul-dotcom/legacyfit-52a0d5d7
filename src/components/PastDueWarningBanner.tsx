import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface PastDueWarningBannerProps {
  userId: string | null;
}

export function PastDueWarningBanner({ userId }: PastDueWarningBannerProps) {
  const [loading, setLoading] = useState(false);

  const { data: isPastDue } = useQuery({
    queryKey: ["subscription-past-due", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", userId)
        .eq("status", "past_due")
        .maybeSingle();
      return !!data;
    },
  });

  const handleUpdatePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw new Error(error.message || "Failed to open billing portal");
      if (!data?.url) throw new Error("No portal URL returned.");
      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isPastDue) return null;

  return (
    <div className="w-full bg-gold/15 border-b border-gold/40 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-gold shrink-0" />
        <p className="text-sm font-medium text-foreground">
          Your payment failed. Please update your payment method to keep your Legacy Pass active.
        </p>
      </div>
      <Button
        size="sm"
        onClick={handleUpdatePayment}
        disabled={loading}
        className="bg-gold text-background hover:bg-gold/90 font-semibold shrink-0"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            Opening…
          </>
        ) : (
          "Update Payment Method"
        )}
      </Button>
    </div>
  );
}
