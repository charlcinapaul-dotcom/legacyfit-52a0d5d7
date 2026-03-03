import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
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
}

const digitalFeatures = [
  "30-Day Challenge Access",
  "6 Milestone Digital Stamps",
  "Digital Passport Storage",
  "Progress Tracking",
  "Completion Recognition",
  "$3 Donated to Breast Cancer Support",
];

const boardingPassExtras = [
  "6 Collectible Digital Boarding Passes",
  "Milestone Travel-Themed Design",
  "Enhanced Unlock Experience",
  "Digital Boarding Pass Archive",
];

const getAccentClasses = (color: ChallengePricingProps["editionColor"]) => {
  switch (color) {
    case "burgundy":
      return {
        heading: "text-[#7A1E2C]",
        badge: "bg-[#7A1E2C]/10 text-[#7A1E2C] border-[#7A1E2C]/20",
        check: "text-[#7A1E2C]",
        primaryBtn: "bg-[#7A1E2C] hover:bg-[#9E2A3C] text-white",
        secondaryBtn: "border-[#7A1E2C] text-[#7A1E2C] hover:bg-[#7A1E2C]/5",
        ring: "ring-[#7A1E2C]/30",
        popular: "bg-[#7A1E2C]",
      };
    case "pride":
      return {
        heading:
          "bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent",
        badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        check: "text-purple-400",
        primaryBtn: "bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-white hover:opacity-90",
        secondaryBtn: "border-purple-500 text-purple-400 hover:bg-purple-500/5",
        ring: "ring-purple-500/30",
        popular: "bg-gradient-to-r from-red-500 via-purple-500 to-blue-500",
      };
    default: // gold
      return {
        heading: "text-primary",
        badge: "bg-primary/10 text-primary border-primary/20",
        check: "text-primary",
        primaryBtn: "bg-primary hover:bg-primary/90 text-primary-foreground",
        secondaryBtn: "border-primary text-primary hover:bg-primary/5",
        ring: "ring-primary/30",
        popular: "bg-primary",
      };
  }
};

export const ChallengePricing = ({
  challengeName,
  challengeId,
  challengeSlug,
  editionColor = "gold",
}: ChallengePricingProps) => {
  const accent = getAccentClasses(editionColor);
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = async (tier: "digital" | "boarding_pass") => {
    if (!challengeId) return;

    // Check if user is logged in
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

      if (error || !data?.url) {
        throw new Error(error?.message || "Failed to create checkout session");
      }

      window.open(data.url, "_blank");
    } catch (err: any) {
      toast({
        title: "Checkout error",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-full overflow-hidden">
      {/* Section Header */}
      <div className="text-center">
        <h3 className={cn("text-2xl md:text-3xl font-bold mb-3", accent.heading)}>Choose Your Legacy Journey</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
          Every 30-Day LegacyFit Challenge includes guided milestones, digital collectibles, and a contribution toward
          breast cancer support.
        </p>
      </div>

      {/* Pricing Tiers */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full pt-3">
        {/* Tier 1 — Digital Journey */}
        <div className="relative rounded-xl border border-border bg-card p-4 sm:p-6 flex flex-col min-w-0">
          <h4 className="text-lg font-semibold text-foreground mb-1">Digital Journey</h4>
          <div className="flex items-baseline gap-1 mb-4">
            <span className={cn("text-3xl font-bold", accent.heading)}>$12.99</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
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
            className={cn("w-full text-base", accent.secondaryBtn)}
            disabled={loadingTier === "digital"}
            onClick={() => handleCheckout("digital")}
          >
            {loadingTier === "digital" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...
              </>
            ) : (
              "Start Digital Journey"
            )}
          </Button>
        </div>

        {/* Tier 2 — Boarding Pass */}
        <div
          className={cn("relative rounded-xl border-2 bg-card p-4 sm:p-6 flex flex-col min-w-0", accent.ring, "ring-2")}
        >
          <span
            className={cn(
              "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold text-white",
              accent.popular,
            )}
          >
            Most Popular
          </span>

          <h4 className="text-lg font-semibold text-foreground mb-1 mt-1">Legacy Boarding Pass Experience</h4>
          <div className="flex items-baseline gap-1 mb-4">
            <span className={cn("text-3xl font-bold", accent.heading)}>$39</span>
          </div>

          <p className="text-xs text-muted-foreground mb-4">Everything in Digital Journey, plus:</p>

          <ul className="space-y-3 mb-8 flex-1">
            {boardingPassExtras.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className={cn("w-4 h-4 mt-0.5 shrink-0", accent.check)} />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            className={cn("w-full text-base whitespace-normal h-auto py-3", accent.primaryBtn)}
            disabled={loadingTier === "boarding_pass"}
            onClick={() => handleCheckout("boarding_pass")}
          >
            {loadingTier === "boarding_pass" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...
              </>
            ) : (
              "Upgrade to Boarding Pass Experience"
            )}
          </Button>
        </div>
      </div>

      {/* Reward Code Redemption */}
      {challengeId && (
        <div className="max-w-md mx-auto">
          <RewardCodeRedemption challengeId={challengeId} editionColor={editionColor} />
        </div>
      )}

      {/* Donation Transparency */}
      <div className="max-w-2xl mx-auto text-center space-y-2 pt-4 border-t border-border">
        <h5 className="text-sm font-semibold text-foreground tracking-wide uppercase">Donation Transparency</h5>
        <p className="text-xs text-muted-foreground leading-relaxed">
          LegacyFit is committed to supporting breast cancer awareness and support initiatives. For every registration,{" "}
          <span className="font-medium text-foreground">$3 is reserved for breast cancer support initiatives</span>.
          Donations are distributed periodically based on total participation and impact initiatives selected by
          LegacyFit.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Our mission is movement with meaning — and every challenge contributes to something bigger.
        </p>
      </div>
    </div>
  );
};
