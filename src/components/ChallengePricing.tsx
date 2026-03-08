import { useState } from "react";
import { Check, Loader2, Package, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RewardCodeRedemption } from "@/components/RewardCodeRedemption";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChallengePricingProps {
  challengeName: string;
  challengeId?: string;
  challengeSlug?: string;
  editionColor?: "gold" | "burgundy" | "pride";
  /** Called when the user taps "Maybe Later" */
  onMaybeLater?: () => void;
}

const digitalFeatures = [
  "6 Digital Stamps",
  "Full Challenge Access",
  "Every milestone. Her complete story.",
  "Yours to keep.",
];

const collectorFeatures = [
  "6 Physical Boarding Passes",
  "6 Digital Stamps",
  "Full Challenge Access",
  "Printed. Mailed to you. Built to last.",
];

const getAccentClasses = (color: ChallengePricingProps["editionColor"]) => {
  switch (color) {
    case "burgundy":
      return {
        heading: "text-[#7A1E2C]",
        check: "text-[#7A1E2C]",
        primaryBtn: "bg-[#7A1E2C] hover:bg-[#9E2A3C] text-white",
        secondaryBtn:
          "border border-[#7A1E2C]/40 text-[#7A1E2C] hover:bg-[#7A1E2C]/5 bg-transparent",
        ring: "ring-2 ring-[#7A1E2C]/30 border-[#7A1E2C]/30",
        fanBadge: "bg-[#7A1E2C]/10 text-[#7A1E2C] border-[#7A1E2C]/25",
        price: "text-[#7A1E2C]",
      };
    case "pride":
      return {
        heading:
          "bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent",
        check: "text-purple-400",
        primaryBtn:
          "bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-white hover:opacity-90",
        secondaryBtn:
          "border border-purple-500/40 text-purple-400 hover:bg-purple-500/5 bg-transparent",
        ring: "ring-2 ring-purple-500/30 border-purple-500/30",
        fanBadge: "bg-purple-500/10 text-purple-400 border-purple-500/25",
        price: "text-purple-400",
      };
    default: // gold
      return {
        heading: "text-primary",
        check: "text-primary",
        primaryBtn: "bg-primary hover:bg-primary/90 text-primary-foreground",
        secondaryBtn:
          "border border-primary/40 text-primary hover:bg-primary/5 bg-transparent",
        ring: "ring-2 ring-primary/30 border-primary/30",
        fanBadge: "bg-primary/10 text-primary border-primary/25",
        price: "text-primary",
      };
  }
};

/** Extract just the woman's first name or full name from the challenge title */
function extractWomanName(challengeName: string): string {
  // Challenge titles are like "Ruth Bader Ginsburg Equality Journey"
  // We want "Ruth Bader Ginsburg" — drop trailing "Journey" / "Walk" / "Challenge" etc.
  return challengeName
    .replace(/\s+(journey|walk|challenge|legacy|trail|mile|run)s?$/i, "")
    .trim();
}

export const ChallengePricing = ({
  challengeName,
  challengeId,
  challengeSlug,
  editionColor = "gold",
  onMaybeLater,
}: ChallengePricingProps) => {
  const accent = getAccentClasses(editionColor);
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const womanName = extractWomanName(challengeName);

  const handleCheckout = async (tier: "digital" | "boarding_pass") => {
    if (!challengeId) {
      toast({
        title: "Challenge not found",
        description: "Unable to start checkout — challenge ID is missing.",
        variant: "destructive",
      });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in or create an account to enroll in a challenge.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoadingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { challengeId, tier, slug: challengeSlug },
      });

      if (error) throw new Error(error.message || "Failed to create checkout session");
      if (!data?.url) throw new Error("No checkout URL returned. Please try again.");

      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast({ title: "Checkout error", description: msg, variant: "destructive" });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleRestorePurchase = async () => {
    if (!challengeId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to restore your purchase.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsRestoring(true);
    try {
      // Check if a paid enrollment already exists
      const { data, error } = await supabase
        .from("user_challenges")
        .select("payment_status")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .maybeSingle();

      if (error) throw error;

      if (data?.payment_status === "paid") {
        toast({
          title: "Purchase restored!",
          description: "Your enrollment has been found and restored. The page will refresh.",
        });
        // Force re-query by reloading
        window.location.reload();
      } else {
        toast({
          title: "No purchase found",
          description:
            "We couldn't find a completed purchase for this challenge. If you believe this is an error, please contact support.",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to check purchase status.";
      toast({ title: "Restore failed", description: msg, variant: "destructive" });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Headline */}
      <div className="text-center space-y-1.5">
        <h3 className={cn("text-2xl md:text-3xl font-bold", accent.heading)}>
          Keep walking with {womanName}.
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          Unlock all 6 milestones and collect every stamp from her journey.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto w-full pt-2">
        {/* Option 1 — Digital Collection */}
        <div className="relative rounded-xl border border-border bg-card p-5 sm:p-6 flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className={cn("w-4 h-4", accent.check)} />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Digital Collection
            </span>
          </div>

          <div className="mb-5">
            <span className={cn("text-4xl font-bold tracking-tight", accent.price)}>$12.99</span>
          </div>

          <ul className="space-y-2.5 mb-8 flex-1">
            {digitalFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className={cn("w-4 h-4 mt-0.5 shrink-0", accent.check)} />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            variant="outline"
            className={cn("w-full text-sm font-semibold", accent.secondaryBtn)}
            disabled={loadingTier === "digital"}
            onClick={() => handleCheckout("digital")}
          >
            {loadingTier === "digital" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing…
              </>
            ) : (
              "Unlock Digital Collection"
            )}
          </Button>
        </div>

        {/* Option 2 — Collector's Edition */}
        <div
          className={cn(
            "relative rounded-xl bg-card p-5 sm:p-6 flex flex-col min-w-0",
            accent.ring,
          )}
        >
          {/* Fan Favorite label */}
          <span
            className={cn(
              "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold border",
              accent.fanBadge,
            )}
          >
            Fan Favorite
          </span>

          <div className="flex items-center gap-2 mb-3 mt-1">
            <Package className={cn("w-4 h-4", accent.check)} />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Collector's Edition
            </span>
          </div>

          <div className="mb-5">
            <span className={cn("text-4xl font-bold tracking-tight", accent.price)}>$29.00</span>
          </div>

          <ul className="space-y-2.5 mb-8 flex-1">
            {collectorFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className={cn("w-4 h-4 mt-0.5 shrink-0", accent.check)} />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            className={cn("w-full text-sm font-semibold whitespace-normal h-auto py-3", accent.primaryBtn)}
            disabled={loadingTier === "boarding_pass"}
            onClick={() => handleCheckout("boarding_pass")}
          >
            {loadingTier === "boarding_pass" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing…
              </>
            ) : (
              "Unlock Collector's Edition"
            )}
          </Button>
        </div>
      </div>

      {/* Reward Code */}
      {challengeId && (
        <div className="max-w-md mx-auto">
          <RewardCodeRedemption challengeId={challengeId} editionColor={editionColor} />
        </div>
      )}

      {/* Footer links — Maybe Later + Restore Purchase */}
      <div className="flex flex-col items-center gap-2 pt-2">
        {onMaybeLater && (
          <button
            onClick={onMaybeLater}
            className="text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors underline underline-offset-4"
          >
            Maybe Later
          </button>
        )}
        <button
          onClick={handleRestorePurchase}
          disabled={isRestoring}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors underline underline-offset-4 disabled:opacity-40"
        >
          {isRestoring ? "Checking…" : "Restore Purchase"}
        </button>
      </div>

      {/* Donation Transparency */}
      <div className="max-w-2xl mx-auto text-center space-y-1.5 pt-4 border-t border-border">
        <h5 className="text-xs font-semibold text-foreground tracking-wide uppercase">
          Donation Transparency
        </h5>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A portion of every registration supports breast cancer awareness initiatives. Our mission
          is movement with meaning — every challenge contributes to something bigger.
        </p>
      </div>
    </div>
  );
};
