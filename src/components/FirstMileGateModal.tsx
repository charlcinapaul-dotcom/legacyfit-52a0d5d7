import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, ArrowRight } from "lucide-react";
import { ChallengePricing } from "@/components/ChallengePricing";

type GateScreen = "share" | "purchase";

interface FirstMileGateModalProps {
  open: boolean;
  initialScreen: GateScreen;
  challengeName: string;
  challengeId?: string;
  challengeSlug?: string;
  editionColor?: "gold" | "burgundy" | "pride";
  stampTitle?: string;
  milesRequired?: number;
  onClose: () => void;
}

export function FirstMileGateModal({
  open,
  initialScreen,
  challengeName,
  challengeId,
  challengeSlug,
  editionColor = "gold",
  stampTitle,
  milesRequired,
  onClose,
}: FirstMileGateModalProps) {
  const [screen, setScreen] = useState<GateScreen>(initialScreen);
  const [hasShared, setHasShared] = useState(false);

  // Keep screen in sync when the modal re-opens
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "I earned a LegacyFit Passport Stamp!",
        text: `Just unlocked "${stampTitle}" at ${milesRequired} mile${milesRequired === 1 ? "" : "s"}! 🏅`,
        url: window.location.origin + (challengeSlug ? `/challenge/${challengeSlug}` : "/challenges"),
      });
    } catch {
      // User cancelled or share not supported — still mark as shared for UX
    }
    setHasShared(true);
  };

  const handleContinue = () => {
    setScreen("purchase");
    setHasShared(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
        {screen === "share" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-foreground">
                Share Your Achievement
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Share2 className="w-9 h-9 text-primary" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-foreground font-semibold">
                  You unlocked{stampTitle ? ` "${stampTitle}"` : " your first stamp"}!
                </p>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Inspire others by sharing your milestone — every walk is a legacy in the making.
                </p>
              </div>

              {!hasShared ? (
                <Button
                  size="lg"
                  className="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Achievement
                </Button>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm text-primary font-medium">✓ Shared!</p>
                </div>
              )}

              <Button
                size="lg"
                variant="outline"
                className="w-full max-w-xs"
                onClick={handleContinue}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue Challenge
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-foreground">
                Unlock the Full Challenge
              </DialogTitle>
              <p className="text-center text-sm text-muted-foreground pt-1">
                You've taken your first step. Keep the momentum going.
              </p>
            </DialogHeader>

            <div className="py-4">
              <ChallengePricing
                challengeName={challengeName}
                challengeId={challengeId}
                challengeSlug={challengeSlug}
                editionColor={editionColor}
              />
            </div>

            <div className="pb-2 text-center">
              <button
                onClick={onClose}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
