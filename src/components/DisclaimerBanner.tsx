import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclaimerBannerProps {
  variant?: "full" | "compact" | "inline";
  showLivingPersonNote?: boolean;
  className?: string;
}

const fullDisclaimer = `LegacyFit is an educational fitness platform designed to inspire movement through history, culture, and storytelling. All historical figures, events, names, and references featured within the app are included solely for educational and informational purposes.

LegacyFit is not affiliated with, endorsed by, sponsored by, or associated with any individual, organization, estate, or rights holder referenced unless explicitly stated.

Names, likenesses, and historical narratives are used in a factual, respectful manner to promote learning, motivation, and personal growth. Any quotes or historical references are presented with attribution where applicable.

All content is intended to honor legacy—not imply endorsement.`;

const compactDisclaimer = "LegacyFit is an educational platform. All historical figures and references are included for educational purposes only. We are not affiliated with any individual or estate referenced.";

const livingPersonNote = "This content is educational and does not imply personal endorsement.";

export const DisclaimerBanner = ({ 
  variant = "full", 
  showLivingPersonNote = false,
  className 
}: DisclaimerBannerProps) => {
  if (variant === "inline") {
    return (
      <div className={cn("text-xs text-muted-foreground text-center", className)}>
        <p>Educational content only. Not affiliated with or endorsed by any individual referenced.</p>
        {showLivingPersonNote && (
          <p className="mt-1 italic">{livingPersonNote}</p>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn(
        "p-4 rounded-lg bg-secondary/50 border border-border",
        className
      )}>
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p>{compactDisclaimer}</p>
            {showLivingPersonNote && (
              <p className="mt-2 font-medium text-foreground/80">{livingPersonNote}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-6 rounded-xl bg-secondary/30 border border-border",
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Educational & Historical Disclaimer</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            {fullDisclaimer.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {showLivingPersonNote && (
            <p className="text-sm font-medium text-primary border-l-2 border-primary pl-3 mt-4">
              {livingPersonNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
