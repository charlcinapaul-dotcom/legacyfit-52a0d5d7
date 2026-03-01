import React, { useState, useEffect, useRef } from "react";
import { Queen, QUEENS, ROUTE_STOPS } from "@/data/queens";
import { Mono } from "./ui-primitives";
import { FreeWalkHeader } from "./FreeWalkHeader";
import { useQueenNarration } from "@/hooks/useQueenNarration";
import { useFreeWalkStamps } from "@/hooks/useFreeWalkStamps";
import { StampUnlockModal } from "@/components/StampUnlockModal";

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
  voiceURI?: string;
  onTogglePause: () => void;
  onFinish: () => void;
  onStampsUnlocked?: (ids: Set<string>) => void;
}

export function ActiveWalkScreen({
  queen,
  walkerName = "Walker",
  stats,
  voiceURI = "",
  onTogglePause,
  onFinish,
  onStampsUnlocked,
}: Props) {
  const { clock, miles, pct, steps, calories, pace, paused } = stats;
  const currentMiles = parseFloat(miles);

  const currentStop = [...ROUTE_STOPS].reverse().find((s) => currentMiles >= parseFloat(s.dist)) ?? ROUTE_STOPS[0];
  const currentStopIndex = ROUTE_STOPS.indexOf(currentStop);
  const nextStop = ROUTE_STOPS[currentStopIndex + 1] ?? null;

  const currentQueenFull = QUEENS.find((q) => q.name === currentStop.title) ?? null;

  // Milestone celebration overlay
  const [celebrationStop, setCelebrationStop] = useState<typeof ROUTE_STOPS[0] | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationFading, setCelebrationFading] = useState(false);
  const seenStopsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (seenStopsRef.current.has(currentStopIndex)) return;
    seenStopsRef.current.add(currentStopIndex);
    // Don't show overlay for the very first stop on walk start (index 0) — only on crossings
    if (currentStopIndex === 0 && seenStopsRef.current.size === 1) return;

    const stop = ROUTE_STOPS[currentStopIndex];
    setCelebrationStop(stop);
    setCelebrationFading(false);
    setCelebrationVisible(true);

    // Haptic feedback: short-long-short pattern
    if ("vibrate" in navigator) {
      navigator.vibrate([80, 60, 180]);
    }

    const fadeTimer = setTimeout(() => setCelebrationFading(true), 2500);
    const hideTimer = setTimeout(() => {
      setCelebrationVisible(false);
      setCelebrationStop(null);
      setCelebrationFading(false);
    }, 3200);

    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, [currentStopIndex]);

  const { isSpeaking, muted, toggleMute } = useQueenNarration({
    currentStopIndex,
    paused,
    active: true,
    voiceURI,
  });

  const { pendingStamps, clearPendingStamps, unlockedIds } = useFreeWalkStamps(currentMiles);

  // Bubble unlocked IDs up so CompleteScreen can show the passport
  useEffect(() => {
    if (unlockedIds.size > 0) onStampsUnlocked?.(unlockedIds);
  }, [unlockedIds, onStampsUnlocked]);

  const handleFinish = () => {
    window.speechSynthesis.cancel();
    onFinish();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">

      {/* ── Stamp Unlock Modal (reuses existing stamp system) ── */}
      {pendingStamps.length > 0 && (
        <StampUnlockModal
          stamps={pendingStamps}
          onClose={clearPendingStamps}
        />
      )}

      {/* ── Milestone Celebration Overlay ── */}
      {celebrationVisible && celebrationStop && (() => {
        const queen = QUEENS.find((q) => q.name === celebrationStop.title);
        return (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
            style={{
              background: "radial-gradient(ellipse at center, hsl(var(--primary)/0.18) 0%, hsl(var(--background)/0.97) 70%)",
              opacity: celebrationFading ? 0 : 1,
              transition: "opacity 0.7s ease-out",
            }}
          >
            {/* Ambient ring */}
            <div
              className="absolute w-[340px] h-[340px] rounded-full border border-primary/20"
              style={{ animation: "milestoneRing 1.8s ease-out forwards" }}
            />
            <div
              className="absolute w-[240px] h-[240px] rounded-full border border-primary/30"
              style={{ animation: "milestoneRing 1.4s ease-out forwards" }}
            />

            {/* Mile number */}
            <div
              className="font-sans font-black text-primary leading-none mb-2"
              style={{
                fontSize: "clamp(72px,18vw,120px)",
                animation: "fade-in 0.4s ease-out",
                textShadow: "0 0 60px hsl(var(--primary)/0.4)",
              }}
            >
              {celebrationStop.dist}
            </div>
            <span
              className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary mb-6 block"
              style={{ animation: "fade-in 0.5s ease-out" }}
            >
              Mile Mark Reached
            </span>

            {/* Queen name + domain */}
            <div
              className="mb-1 font-sans font-black text-foreground leading-tight"
              style={{ fontSize: "clamp(24px,6vw,42px)", animation: "fade-in 0.6s ease-out" }}
            >
              {celebrationStop.title}
            </div>
            <span
              className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary/70 mb-8 block"
              style={{ animation: "fade-in 0.65s ease-out" }}
            >
              {celebrationStop.queenLabel}
            </span>

            {/* Quote */}
            {queen?.quote && (
              <p
                className="italic text-muted-foreground max-w-[420px] leading-[1.7]"
                style={{ fontSize: "clamp(14px,2vw,18px)", animation: "fade-in 0.75s ease-out" }}
              >
                {queen.quote}
              </p>
            )}

            {/* Bottom bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary/30"
              style={{ animation: "milestoneBar 3.2s linear forwards" }}
            />
          </div>
        );
      })()}

      <FreeWalkHeader />
      {/* Top bar */}
      <div className="flex justify-between items-center px-5 md:px-12 pt-2 pb-5">
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
            <div className="flex items-center gap-3 mb-1">
              <Mono className="text-primary">Walking With</Mono>
              {isSpeaking && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-end gap-[2px] h-[12px]">
                    {[1, 2, 3, 2, 1].map((h, i) => (
                      <div
                        key={i}
                        className="w-[3px] bg-primary rounded-full"
                        style={{
                          height: `${h * 4}px`,
                          animation: `soundBar 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
                        }}
                      />
                    ))}
                  </div>
                  <Mono className="text-primary text-[9px]">Now Narrating</Mono>
                </div>
              )}
            </div>
            <div className="font-sans text-[22px] font-bold text-foreground leading-tight mb-2">
              {currentStop.title}
            </div>
            {currentQueenFull?.quote && (
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

        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          title={muted ? "Unmute narration" : "Mute narration"}
          className="flex items-center justify-center bg-transparent border border-white/[0.08] text-muted-foreground px-4 py-[18px] cursor-pointer transition-all duration-200 hover:border-primary/50 hover:text-primary"
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <path d="M15.54 8.46a5 5 0 010 7.07"/>
              <path d="M19.07 4.93a10 10 0 010 14.14"/>
            </svg>
          )}
        </button>

        <button
          onClick={handleFinish}
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
        @keyframes soundBar {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1.4); }
        }
        @keyframes milestoneRing {
          0%   { transform: scale(0.6); opacity: 0.8; }
          60%  { transform: scale(1.15); opacity: 0.4; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes milestoneBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
