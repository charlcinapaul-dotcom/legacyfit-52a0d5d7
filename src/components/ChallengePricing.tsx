import { useState, useEffect } from "react";
import { Check, Loader2, Package, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RewardCodeRedemption } from "@/components/RewardCodeRedemption";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { isNativeIOS, purchaseMonthlyPass } from "@/lib/iap-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  "Every milestone. Their complete story.",
  "Yours to keep.",
];

const collectorFeatures = [
  "6 Physical Boarding Passes",
  "6 Digital Stamps",
  "Full Challenge Access",
  "The Collector's Edition — because some legacies deserve to be held.",
];

const getAccentClasses = (color: ChallengePricingProps["editionColor"]) => {
  switch (color) {
    case "burgundy":
      return {
        heading: "text-[#7A1E2C]",
        check: "text-[#7A1E2C]",
        primaryBtn: "bg-[#7A1E2C] hover:bg-[#9E2A3C] text-white",
        secondaryBtn: "border border-[#7A1E2C]/40 text-[#7A1E2C] hover:bg-[#7A1E2C]/5 bg-transparent",
        ring: "border-2 border-[#7A1E2C]/30",
        fanBadge: "bg-[#7A1E2C]/10 text-[#7A1E2C] border-[#7A1E2C]/25",
        price: "text-[#7A1E2C]",
        subscriberHint: "text-[#7A1E2C]/60",
        subscriberApplied: "text-[#7A1E2C]",
      };
    case "pride":
      return {
        heading:
          "bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent",
        check: "text-purple-400",
        primaryBtn: "bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-white hover:opacity-90",
        secondaryBtn: "border border-purple-500/40 text-purple-400 hover:bg-purple-500/5 bg-transparent",
        ring: "border-2 border-purple-500/30",
        fanBadge: "bg-purple-500/10 text-purple-400 border-purple-500/25",
        price: "text-purple-400",
        subscriberHint: "text-purple-400/60",
        subscriberApplied: "text-purple-400",
      };
    default: // gold
      return {
        heading: "text-primary",
        check: "text-primary",
        primaryBtn: "bg-primary hover:bg-primary/90 text-primary-foreground",
        secondaryBtn: "border border-primary/40 text-primary hover:bg-primary/5 bg-transparent",
        ring: "border-2 border-primary/30",
        fanBadge: "bg-primary/10 text-primary border-primary/25",
        price: "text-primary",
        subscriberHint: "text-primary/60",
        subscriberApplied: "text-primary",
      };
  }
};

/** Extract the woman's name from a challenge title like "Ruth Bader Ginsburg Equality Journey".
 *  Strips trailing descriptive words so only the proper name remains. */
function extractFigureName(challengeName: string): string {
  return challengeName
    .replace(
      /\s+(equality|freedom|courage|legacy|justice|peace|hope|pride|strength|trail|walk|run|journey|challenge|mile)s?(\s+.*)?$/i,
      "",
    )
    .trim()
    .split(' ')[0];
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
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Address form state
  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");

  const figureName = extractFigureName(challengeName);

  // Check if the current user has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      setIsSubscriber(!!data);
    };

    checkSubscription();
  }, []);

  /** Shared auth gate — returns the user or redirects to /auth */
  const requireAuth = async () => {
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
      return null;
    }
    return user;
  };

  const handleCheckout = async (
    tier: "digital" | "boarding_pass" | "boarding_pass_subscriber",
    shippingOrderId?: string,
  ) => {
    if (!challengeId) {
      toast({
        title: "Challenge not found",
        description: "Unable to start checkout — challenge ID is missing.",
        variant: "destructive",
      });
      return;
    }

    const user = await requireAuth();
    if (!user) return;

    setLoadingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { challengeId, tier, slug: challengeSlug, shippingOrderId },
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

  const handleCollectorClick = async () => {
    if (!challengeId) {
      toast({
        title: "Challenge not found",
        description: "Unable to start checkout — challenge ID is missing.",
        variant: "destructive",
      });
      return;
    }
    const user = await requireAuth();
    if (!user) return;
    setShowAddressModal(true);
  };

  const handleAddressSubmit = async () => {
    // Validate required fields
    if (!fullName.trim() || !addressLine1.trim() || !city.trim() || !addressState.trim() || !zipCode.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const user = await requireAuth();
    if (!user) return;

    setAddressSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("shipping_orders")
        .insert({
          user_id: user.id,
          full_name: fullName.trim(),
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim() || null,
          city: city.trim(),
          state: addressState.trim(),
          zip_code: zipCode.trim(),
          country: country.trim(),
        })
        .select("id")
        .single();

      if (error) throw error;

      setShowAddressModal(false);

      const tier = isSubscriber ? "boarding_pass_subscriber" : "boarding_pass";
      await handleCheckout(tier, data.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save address.";
      toast({ title: "Address error", description: msg, variant: "destructive" });
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleRestorePurchase = async () => {
    if (!challengeId) return;

    const user = await requireAuth();
    if (!user) return;

    setIsRestoring(true);
    try {
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

  const collectorLoadingKey = isSubscriber ? "boarding_pass_subscriber" : "boarding_pass";

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Headline */}
      <div className="text-center space-y-1.5">
        <h3 className={cn("text-2xl md:text-3xl font-bold", accent.heading)}>Walk the rest of {figureName}'s story.</h3>
        <p className="text-muted-foreground text-sm md:text-base">
          Unlock all 6 milestones and collect every stamp from their journey.
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
        <div className={cn("relative rounded-xl border bg-card p-5 sm:p-6 flex flex-col min-w-0", accent.ring)}>
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
            {isSubscriber ? (
              <>
                <span className={cn("text-4xl font-bold tracking-tight", accent.price)}>$19.00</span>
                <p className={cn("text-xs mt-1 font-medium", accent.subscriberApplied)}>
                  Subscriber price applied ✓
                </p>
              </>
            ) : (
              <>
                <span className={cn("text-4xl font-bold tracking-tight", accent.price)}>$29.00</span>
                <p className={cn("text-xs mt-1", accent.subscriberHint)}>
                  Subscribers pay $19
                </p>
              </>
            )}
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
            disabled={loadingTier === collectorLoadingKey}
            onClick={handleCollectorClick}
          >
            {loadingTier === collectorLoadingKey ? (
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
        <h5 className="text-xs font-semibold text-foreground tracking-wide uppercase">Donation Transparency</h5>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A portion of every registration supports breast cancer awareness initiatives. Our mission is movement with
          meaning — every challenge contributes to something bigger.
        </p>
      </div>

      {/* Shipping Address Modal */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shipping Address</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Where should we send your Collector's Edition boarding passes?
          </p>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input id="addressLine1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="123 Main St" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input id="addressLine2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apt 4B" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Atlanta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressState">State *</Label>
                <Input id="addressState" value={addressState} onChange={(e) => setAddressState(e.target.value)} placeholder="GA" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code *</Label>
                <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="30301" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddressModal(false)}
              disabled={addressSubmitting}
            >
              Cancel
            </Button>
            <Button
              className={cn("flex-1 font-semibold", accent.primaryBtn)}
              onClick={handleAddressSubmit}
              disabled={addressSubmitting}
            >
              {addressSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving…
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
