import { useState } from "react";
import { Check, Gift, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface RewardCodeRedemptionProps {
  challengeId: string;
  editionColor?: "gold" | "burgundy" | "pride";
  onRedeemed?: () => void;
}

const getAccentClasses = (color: RewardCodeRedemptionProps["editionColor"]) => {
  switch (color) {
    case "burgundy":
      return {
        text: "text-[#7A1E2C]",
        btn: "bg-[#7A1E2C] hover:bg-[#9E2A3C] text-white",
        border: "border-[#7A1E2C]/20 focus-visible:ring-[#7A1E2C]/30",
        bg: "bg-[#7A1E2C]/5",
      };
    case "pride":
      return {
        text: "text-purple-400",
        btn: "bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-white hover:opacity-90",
        border: "border-purple-500/20 focus-visible:ring-purple-500/30",
        bg: "bg-purple-500/5",
      };
    default:
      return {
        text: "text-primary",
        btn: "bg-primary hover:bg-primary/90 text-primary-foreground",
        border: "border-primary/20 focus-visible:ring-primary/30",
        bg: "bg-primary/5",
      };
  }
};

export function RewardCodeRedemption({ challengeId, editionColor = "gold", onRedeemed }: RewardCodeRedemptionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const queryClient = useQueryClient();
  const accent = getAccentClasses(editionColor);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error("Please enter a reward code.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-reward-code", {
        body: { code: code.trim(), challengeId },
      });

      if (error) {
        toast.error("Failed to redeem code. Please try again.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success(data?.message || "Reward code redeemed! You're enrolled.");
      setRedeemed(true);
      queryClient.invalidateQueries({ queryKey: ["enrollment-status", challengeId] });
      queryClient.invalidateQueries({ queryKey: ["referral-data"] });
      onRedeemed?.();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (redeemed) {
    return (
      <div className={cn("flex items-center justify-center gap-2 py-3 px-4 rounded-lg", accent.bg)}>
        <Check className={cn("w-5 h-5", accent.text)} />
        <span className={cn("text-sm font-medium", accent.text)}>
          Reward code applied — you're enrolled!
        </span>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center justify-center gap-2 text-sm hover:underline transition-colors w-full py-2",
          accent.text
        )}
      >
        <Gift className="w-4 h-4" />
        Have a reward code?
      </button>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4 space-y-3", accent.bg, accent.border)}>
      <div className="flex items-center gap-2">
        <Tag className={cn("w-4 h-4", accent.text)} />
        <span className="text-sm font-medium text-foreground">Enter your reward code</span>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="e.g. a1b2c3d4e5f6g7h8"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
          className={cn("font-mono text-sm", accent.border)}
          onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
        />
        <Button
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
          className={cn("shrink-0", accent.btn)}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
        </Button>
      </div>
      <button
        onClick={() => { setIsOpen(false); setCode(""); }}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Cancel
      </button>
    </div>
  );
}
