import { Clock } from "lucide-react";

interface RateLimitBannerProps {
  countdown: string;
}

export function RateLimitBanner({ countdown }: RateLimitBannerProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
      <Clock className="w-4 h-4 text-destructive shrink-0" />
      <div>
        <span className="font-medium text-destructive">Rate limit reached.</span>{" "}
        <span className="text-muted-foreground">
          You can log again in <span className="font-mono font-semibold text-foreground">{countdown}</span>
        </span>
      </div>
    </div>
  );
}
