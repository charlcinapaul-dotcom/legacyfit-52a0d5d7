import { useState } from "react";
import { Loader2, Sparkles, CreditCard, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, addMonths } from "date-fns";
import {
  isNativeIOS,
  purchaseMonthlyPass,
  restorePurchases as restoreIAPPurchases,
  hasActiveSubscription as hasActiveIAP,
} from "@/lib/iap-service";

interface SubscriptionUpsellCardProps {
  className?: string;
}

export function SubscriptionUpsellCard({ className }: SubscriptionUpsellCardProps) {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const isiOS = isNativeIOS();

  const { data: subscriptionStatus, isLoading: checkingSubscription, refetch } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { hasActive: false, blockReason: null };

      // On iOS, also check RevenueCat entitlement
      if (isiOS) {
        try {
          const iapActive = await hasActiveIAP();
          if (iapActive) return { hasActive: true, blockReason: null };
        } catch { /* fall through to DB check */ }
      }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (sub) return { hasActive: true, blockReason: null };

      const { data: activeChallenges } = await supabase
        .from("user_challenges")
        .select("id, is_completed")
        .eq("user_id", user.id)
        .eq("payment_status", "paid")
        .eq("is_completed", false);

      if (activeChallenges && activeChallenges.length > 0) {
        return { hasActive: false, blockReason: "active_challenge" as const };
      }

      const monthStart = startOfMonth(new Date()).toISOString();
      const { data: thisMonthChallenges } = await supabase
        .from("user_challenges")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("payment_status", "paid")
        .gte("created_at", monthStart);

      if (thisMonthChallenges && thisMonthChallenges.length > 0) {
        const nextMonth = format(startOfMonth(addMonths(new Date(), 1)), "MMMM d");
        return { hasActive: false, blockReason: "month_limit" as const, nextUnlockDate: nextMonth };
      }

      return { hasActive: false, blockReason: null };
    },
  });

  const handleSubscribe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to start your monthly journey pass.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (isiOS) {
        // Apple IAP flow
        const result = await purchaseMonthlyPass();
        if (result.success) {
          // Sync to backend
          await supabase.functions.invoke("sync-iap-subscription", {
            body: { isActive: true, expiresDate: null, productIdentifier: "legacyfit.monthlypass" },
          });
          toast({ title: "You're subscribed! 🎉", description: "Your Legacy Pass is now active." });
          refetch();
        } else if (result.error && result.error !== "Purchase cancelled.") {
          toast({ title: "Purchase failed", description: result.error, variant: "destructive" });
        }
      } else {
        // Stripe web flow
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: { tier: "subscription" },
        });
        if (error) throw new Error(error.message || "Failed to create checkout session");
        if (!data?.url) throw new Error("No checkout URL returned. Please try again.");
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast({ title: "Checkout error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (isiOS) {
      // On iOS, direct to Apple subscription management
      window.open("https://apps.apple.com/account/subscriptions", "_blank");
      return;
    }
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw new Error(error.message || "Failed to open billing portal");
      if (!data?.url) throw new Error("No portal URL returned. Please try again.");
      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast({ title: "Portal error", description: msg, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restoreIAPPurchases();
      if (result.success) {
        await supabase.functions.invoke("sync-iap-subscription", {
          body: { isActive: true, expiresDate: null, productIdentifier: "legacyfit.monthlypass" },
        });
        toast({ title: "Purchase restored!", description: "Your Legacy Pass is now active." });
        refetch();
      } else {
        toast({ title: "No purchases found", description: "We couldn't find any previous subscriptions.", variant: "destructive" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Restore failed.";
      toast({ title: "Restore error", description: msg, variant: "destructive" });
    } finally {
      setRestoring(false);
    }
  };

  if (checkingSubscription) return null;

  // Active subscriber
  if (subscriptionStatus?.hasActive) {
    return (
      <div className={`mt-10 border border-primary/30 bg-primary/[0.05] rounded-xl p-6 md:p-8 flex items-center justify-between gap-4 flex-wrap ${className ?? ""}`}>
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm font-medium text-foreground">You have an active Legacy Pass.</p>
        </div>
        <Button
          onClick={handleManageSubscription}
          disabled={portalLoading}
          variant="outline"
          className="border-primary/40 text-primary hover:bg-primary/10 font-semibold"
        >
          {portalLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Opening…</>
          ) : (
            <><CreditCard className="w-4 h-4 mr-2" />Manage Subscription</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`mt-10 border border-primary/30 bg-primary/[0.05] rounded-xl p-6 md:p-8 space-y-4 ${className ?? ""}`}>
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="text-xl font-bold text-foreground leading-tight">One new legend, every month.</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Your passport keeps growing. Add the monthly journey pass and your next journey is already waiting.
          </p>
          {!isiOS && (
            <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
              Subscribers also save{" "}
              <span className="text-primary font-medium">$10 on every physical keepsake</span> — $19 instead of $29.
            </p>
          )}
        </div>
      </div>

      {subscriptionStatus?.blockReason === "active_challenge" && (
        <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          You already have a journey in progress. Complete your current journey before unlocking your next legend.
        </div>
      )}

      {subscriptionStatus?.blockReason === "month_limit" && (
        <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          You've already unlocked your journey for this month. Your next unlock is available on{" "}
          <span className="text-foreground font-medium">{subscriptionStatus.nextUnlockDate}</span>.
        </div>
      )}

      {!subscriptionStatus?.blockReason && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing…</>
            ) : (
              "Start Monthly Journey — $9.99/mo"
            )}
          </Button>

          {isiOS && (
            <Button
              onClick={handleRestore}
              disabled={restoring}
              variant="outline"
              className="w-full sm:w-auto border-primary/40 text-primary"
            >
              {restoring ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Restoring…</>
              ) : (
                <><RotateCcw className="w-4 h-4 mr-2" />Restore Purchases</>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
