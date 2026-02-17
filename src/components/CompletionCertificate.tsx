import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Trophy } from "lucide-react";
import { toast } from "sonner";

interface CompletionCertificateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeName: string;
  totalMiles: number;
  certificateImageUrl?: string | null;
  isGenerating?: boolean;
}

export const CompletionCertificate = ({
  open,
  onOpenChange,
  challengeName,
  totalMiles,
  certificateImageUrl,
  isGenerating,
}: CompletionCertificateProps) => {

  const handleDownload = () => {
    if (!certificateImageUrl) return;
    const link = document.createElement("a");
    link.href = certificateImageUrl;
    link.download = `LegacyFit-Certificate-${challengeName.replace(/\s/g, "-")}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!certificateImageUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `I completed the ${challengeName} challenge!`,
          text: `I walked ${totalMiles} miles and completed the ${challengeName} LegacyFit challenge! 🏆`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          `I walked ${totalMiles} miles and completed the ${challengeName} LegacyFit challenge! 🏆`
        );
        toast.success("Copied to clipboard!");
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Trophy className="w-6 h-6" />
            Challenge Complete!
          </DialogTitle>
          <DialogDescription>
            Congratulations on completing the {challengeName} challenge!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isGenerating ? (
            <div className="aspect-[4/3] rounded-xl bg-secondary flex items-center justify-center border border-border">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Generating your certificate...</p>
              </div>
            </div>
          ) : certificateImageUrl ? (
            <div className="rounded-xl overflow-hidden border-2 border-primary shadow-lg">
              <img
                src={certificateImageUrl}
                alt={`${challengeName} Completion Certificate`}
                className="w-full h-auto"
              />
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border-2 border-primary flex items-center justify-center">
              <div className="text-center space-y-2 p-6">
                <Trophy className="w-16 h-16 text-primary mx-auto" />
                <h3 className="text-2xl font-bold text-foreground">{challengeName}</h3>
                <p className="text-primary font-semibold">{totalMiles} Miles Completed</p>
                <p className="text-sm text-muted-foreground">Certificate of Completion</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              disabled={!certificateImageUrl}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
