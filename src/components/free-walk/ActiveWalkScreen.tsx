import React from "react";
import { Queen, QUEENS, ROUTE_STOPS } from "@/data/queens";
import { Mono } from "./ui-primitives";

interface WalkStats {
  clock: string;
  miles: string;
  pct: number;
  steps: string;
  calories: number;
  pace: string;
  paused: boolean;
}

interface Props {
  queen: Queen | null;
  walkerName?: string;
  stats: WalkStats;
  onTogglePause: () => void;
  onFinish: () => void;
}

export function ActiveWalkScreen({
  queen,
  walkerName = "Walker",
  stats,
  onTogglePause,
  onFinish,
}: Props) {
  const { clock, miles, pct, steps, calories, pace, paused } = stats;
  const currentMiles = parseFloat(miles);

  const currentStop = ROUTE_STOPS.find((s) => currentMiles <= parseFloat(s.dist)) ?? ROUTE_STOPS[0];
  const currentStopIndex = ROUTE_STOPS.indexOf(currentStop);
  const nextStop = ROUTE_STOPS[currentStopIndex + 1] ?? null;

  const currentQueenData = queen ?? {
    name: currentStop.title,
    domain: "",
    quote: "",
    truth: "",
  };

  const currentQueenFull = QUEENS.find((q) => q.name === currentStop.title) ?? currentQueenData;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar — padded to clear the fixed floating back button */}
      <div className="flex justify-between items-center px-5 md:px-12 pt-16 pb-5">
        <div className="flex items-center gap-2">
          <div
            className="w-[7px] h-[7px] rounded-full bg-primary"
            style={{ animation: "blink 1.6s ease-in-out infinite" }}
          />
          <Mono className="text-primary">Walk In Progress</Mono>
        </div>
        <Mono className="text-muted-foreground">LegacyFit</Mono>
      </div>

      {/* Queen banner */}
      <div className="mx-5 md:mx-12 mb-5 bg-card border-l-[3px] border-primary px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Mono className="text-primary mb-1">Walking With</Mono>
            <div className="font-sans text-[22px] font-bold text-foreground leading-tight mb-2">
              {currentStop.title}
            </div>
            {currentQueenFull.quote && (
              <p className="italic text-muted-foreground text-[14px] leading-[1.5]">
                {currentQueenFull.quote}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div
              className="font-sans font-black text-primary leading-none"
              style={{ fontSize: "clamp(32px,8vw,52px)" }}
            >
              {currentStop.dist}
            </div>
            <Mono className="text-muted-foreground text-[10px]">Mile Mark</Mono>
          </div>
        </div>
      </div>

      {/* Clock */}
      <div className="text-center px-5 md:px-12 py-2">
        <div
          className="font-sans font-black text-foreground leading-none tracking-[-0.03em]"
          style={{ fontSize: "clamp(64px,16vw,120px)" }}
        >
          {clock}
        </div>
        <Mono className="text-muted-foreground mt-1">Elapsed Time</Mono>
      </div>

      {/* Progress bar */}
      <div className="px-5 md:px-12 pb-2">
        <div className="relative h-[3px] bg-white/[0.07] mb-2.5">
          <div
            className="absolute left-0 top-0 bottom-0 transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, hsl(var(--primary)/0.7), hsl(var(--primary)))",
            }}
          >
            <div
              className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-primary"
              style={{ boxShadow: "0 0 10px hsl(var(--primary))" }}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Mono className="text-muted-foreground">0 mi</Mono>
          <Mono className="text-muted-foreground">{miles} / 5.0 miles</Mono>
          <Mono className="text-primary">5 mi</Mono>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-0.5 mx-5 md:mx-12 my-5 bg-white/[0.04]">
        {[
          { val: pace, key: "Pace / mi" },
          { val: steps, key: "Steps" },
          { val: String(calories), key: "Calories" },
        ].map((s) => (
          <div key={s.key} className="bg-card py-[18px] px-3.5 text-center">
            <span className="font-sans text-[28px] font-bold text-primary block leading-none">
              {s.val}
            </span>
            <Mono className="text-muted-foreground block mt-1.5">{s.key}</Mono>
          </div>
        ))}
      </div>

      {/* Coming up next */}
      {nextStop && (
        <div className="mx-5 md:mx-12 mb-4 px-5 py-4 border border-white/10 bg-white/[0.015] flex items-center gap-3">
          <span className="text-[20px]">📍</span>
          <div>
            <Mono className="text-primary mb-0.5">Coming Up Next</Mono>
            <div className="text-foreground font-sans text-[15px]">
              {nextStop.title} — {nextStop.dist} mi ahead
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2.5 px-5 md:px-12 pb-10 mt-auto">
        <button
          onClick={onTogglePause}
          className="flex-1 flex items-center justify-center gap-2.5 bg-primary/[0.12] border border-primary/30 text-primary font-sans text-[12px] font-semibold tracking-[0.15em] uppercase py-[18px] cursor-pointer transition-all duration-200 hover:bg-primary/20"
        >
          {paused ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 2l8 5-8 5V2z" fill="currentColor" />
              </svg>
              Resume
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="3" y="2" width="3" height="10" fill="currentColor" />
                <rect x="8" y="2" width="3" height="10" fill="currentColor" />
              </svg>
              Pause
            </>
          )}
        </button>
        <button
          onClick={onFinish}
          className="flex items-center justify-center bg-transparent border border-white/[0.08] text-muted-foreground font-sans text-[12px] font-normal tracking-[0.15em] uppercase px-6 py-[18px] cursor-pointer transition-all duration-200 hover:border-primary/50 hover:text-primary"
        >
          Finish Walk
        </button>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
