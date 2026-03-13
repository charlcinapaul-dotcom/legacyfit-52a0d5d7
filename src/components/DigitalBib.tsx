import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import legacyFitLogo from "@/assets/legacyfit-logo.png";

interface DigitalBibProps {
  displayName: string;
  bibNumber: string;
  challengeName?: string;
}

export const DigitalBib = ({ displayName, bibNumber, challengeName }: DigitalBibProps) => {
  const bibRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!bibRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(bibRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `LegacyFit-BIB-${bibNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback: just alert
      console.error("Could not generate BIB image");
    }
  };

  return (
    <div className="space-y-3">
      {/* BIB Card */}
      <div
        ref={bibRef}
        className="relative overflow-hidden rounded-2xl border-2 border-primary bg-gradient-to-br from-card via-secondary to-card p-6 md:p-8"
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary rounded-br-2xl" />

        <div className="flex flex-col items-center text-center space-y-3">
          {/* Logo */}
          <img src={legacyFitLogo} alt="LegacyFit" className="h-10 md:h-12 w-auto" />

          {/* Subtitle */}
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">
            Virtual Challenge Participant
          </p>

          {/* BIB Number */}
          <div className="py-2">
            <p className="text-5xl md:text-6xl font-black text-primary tracking-wider font-mono">
              {bibNumber}
            </p>
          </div>

          {/* Participant Name */}
          <div className="border-t border-border pt-3 w-full max-w-xs">
            <p className="text-lg md:text-xl font-semibold text-foreground">
              {displayName || ""}
            </p>
          </div>

          {/* Challenge badge if applicable */}
          {challengeName && (
            <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <p className="text-xs font-medium text-primary">{challengeName}</p>
            </div>
          )}

          {/* Footer mark */}
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-2">
            Every Mile Unlocks History
          </p>
        </div>
      </div>

      {/* Download button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="w-full"
      >
        <Download className="w-4 h-4 mr-2" />
        Download BIB
      </Button>
    </div>
  );
};
