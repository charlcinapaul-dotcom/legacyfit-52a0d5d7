import { MapPin, Check, Lock } from "lucide-react";

// Stylized SVG map preview for the landing page
export function MapPreview() {
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gradient-to-br from-secondary via-card to-secondary border border-border">
      {/* Stylized map background */}
      <svg
        viewBox="0 0 400 200"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background pattern - stylized continents */}
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" />
            <stop offset="100%" stopColor="hsl(var(--card))" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stylized land masses */}
        <ellipse cx="100" cy="80" rx="60" ry="40" fill="hsl(var(--muted))" opacity="0.3" />
        <ellipse cx="280" cy="100" rx="80" ry="50" fill="hsl(var(--muted))" opacity="0.3" />
        <ellipse cx="200" cy="150" rx="50" ry="30" fill="hsl(var(--muted))" opacity="0.2" />

        {/* Route line - dashed for upcoming */}
        <path
          d="M 60 90 Q 120 60 180 80 Q 240 100 300 70 Q 340 50 370 80"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeDasharray="6,4"
          opacity="0.4"
        />

        {/* Route line - solid for completed */}
        <path
          d="M 60 90 Q 120 60 180 80"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          filter="url(#glow)"
        />
      </svg>

      {/* Animated pins */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Completed pin 1 */}
        <div className="absolute left-[15%] top-[40%] animate-pin-drop" style={{ animationDelay: "0.2s" }}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg border-2 border-amber-300">
            <Check className="w-4 h-4 text-amber-950" />
          </div>
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-500 mx-auto -mt-0.5" />
        </div>

        {/* Completed pin 2 */}
        <div className="absolute left-[45%] top-[35%] animate-pin-drop" style={{ animationDelay: "0.4s" }}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg border-2 border-amber-300">
            <Check className="w-4 h-4 text-amber-950" />
          </div>
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-500 mx-auto -mt-0.5" />
        </div>

        {/* Locked pin 3 */}
        <div className="absolute left-[70%] top-[30%] animate-pin-drop opacity-60" style={{ animationDelay: "0.6s" }}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-md border-2 border-gray-400">
            <Lock className="w-3.5 h-3.5 text-gray-300" />
          </div>
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-600 mx-auto -mt-0.5" />
        </div>

        {/* Locked pin 4 */}
        <div className="absolute left-[88%] top-[38%] animate-pin-drop opacity-50" style={{ animationDelay: "0.8s" }}>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-md border-2 border-gray-400">
            <Lock className="w-3 h-3 text-gray-300" />
          </div>
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-gray-600 mx-auto -mt-0.5" />
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-400 font-medium">2 of 4 unlocked</span>
          <span className="text-muted-foreground">12.5 miles to next</span>
        </div>
        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}
