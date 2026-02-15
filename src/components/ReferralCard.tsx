import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReferral } from "@/hooks/useReferral";
import { Copy, Check, Gift, Users, Share2 } from "lucide-react";
import { toast } from "sonner";

const REFERRALS_NEEDED = 3;

export function ReferralCard() {
  const { data, isLoading } = useReferral();
  const [copied, setCopied] = useState(false);

  if (isLoading || !data) return null;

  const shareUrl = `${window.location.origin}/auth?mode=signup&ref=${data.code}`;
  const progress = Math.min(data.referralCount, REFERRALS_NEEDED);
  const progressPercent = (progress / REFERRALS_NEEDED) * 100;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on LegacyFit!",
          text: "Walk through history with me. Use my referral link to sign up!",
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-accent/5 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Invite Friends, Earn Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Refer {REFERRALS_NEEDED} friends and get a <span className="text-primary font-semibold">free challenge code</span> as a thank you!
        </p>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {data.referralCount} of {REFERRALS_NEEDED} referrals
            </span>
            {progress >= REFERRALS_NEEDED && (
              <span className="text-xs font-medium text-primary">🎉 Reward earned!</span>
            )}
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Referral Code + Actions */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 font-mono text-sm text-foreground tracking-wider text-center">
            {data.code}
          </div>
          <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare} className="shrink-0">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Reward Codes */}
        {data.rewardCodes.length > 0 && (
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-sm font-medium text-foreground">Your Reward Codes</p>
            {data.rewardCodes.map((reward) => (
              <div
                key={reward.code}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  reward.isRedeemed
                    ? "bg-muted text-muted-foreground line-through"
                    : "bg-primary/10 text-primary font-mono font-semibold"
                }`}
              >
                <span>{reward.code.toUpperCase()}</span>
                <span className="text-xs">
                  {reward.isRedeemed ? "Used" : "Free Challenge"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
