import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, addMonths } from "date-fns";

const SUBSCRIPTION_PRICE_ID = "price_1TDYDK3JzkAB6gcF7h5ponZf";

interface SubscriptionUpsellCardProps {
  /** Shown only when the challenge is complete (progress === 100%) */
  className?: string;
}

export function SubscriptionUpsellCard({ className }: SubscriptionUpsellCardProps) {
  const [loading, setLoading] = useState(false);

  // Check if user already has an active subscription
  const { data: subscriptionStatus, isLoading: checkingSubscription } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { hasActive: false, blockReason: null };

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (sub) return { hasActive: true, blockReason: null };

      // RULE 2 — active challenge check
      const { data: activeChallenges } = await supabase
        .from("user_challenges")
        .select("id, is_completed")
        .eq("user_id", user.id)
        .eq("payment_status", "paid")
        .eq("is_completed", false);

      if (activeChallenges && activeChallenges.length > 0) {
        return {
          hasActive: false,
          blockReason: "active_challenge" as const,
        };
      }

      // RULE 1 — one unlock per calendar month check
      const monthStart = startOfMonth(new Date()).toISOString();
      const { data: thisMonthChallenges } = await supabase
        .from("user_challenges")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("payment_status", "paid")
        .gte("created_at", monthStart);

      if (thisMonthChallenges && thisMonthChallenges.length > 0) {
        const nextMonth = format(startOfMonth(addMonths(new Date(), 1)), "MMMM d");
        return {
          hasActive: false,
          blockReason: "month_limit" as const,
          nextUnlockDate: nextMonth,
        };
      }

      return { hasActive: false, blockReason: null };
    },
  });

  // Hide card if user is already subscribed
  if (checkingSubscription || subscriptionStatus?.hasActive) return null;

  const handleSubscribe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to start your monthly journey pass.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier: "subscription" },
      });

      if (error) throw new Error(error.message || "Failed to create checkout session");
      if (!data?.url) throw new Error("No checkout URL returned. Please try again.");

      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast({ title: "Checkout error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`mt-10 border border-primary/30 bg-primary/[0.05] rounded-xl p-6 md:p-8 space-y-4 ${className ?? ""}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="text-xl font-bold text-foreground leading-tight">
            One new legend, every month.
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Your passport keeps growing. Add the monthly journey pass and your next journey is already waiting.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
            Subscribers also save{" "}
            <span className="text-primary font-medium">$10 on every physical keepsake</span>{" "}
            — $19 instead of $29.
          </p>
        </div>
      </div>

      {/* Block message — Rule 2 takes priority */}
      {subscriptionStatus?.blockReason === "active_challenge" && (
        <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          You already have a journey in progress. Complete your current journey before unlocking your next legend.
        </div>
      )}

      {subscriptionStatus?.blockReason === "month_limit" && (
        <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          You've already unlocked your journey for this month. Your next unlock is available on{" "}
          <span className="text-foreground font-medium">
            {subscriptionStatus.nextUnlockDate}
          </span>
          .
        </div>
      )}

      {/* CTA */}
      {!subscriptionStatus?.blockReason && (
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing…
            </>
          ) : (
            "Start Monthly Journey — $9.99/mo"
          )}
        </Button>
      )}
    </div>
  );
}
