import React, { useState, useEffect, useRef, useCallback } from "react";
import { Queen, QUEENS, ROUTE_STOPS } from "@/data/queens";
import { Mono } from "./ui-primitives";
import { FreeWalkHeader } from "./FreeWalkHeader";
import { useQueenNarration } from "@/hooks/useQueenNarration";
import { useFreeWalkStamps } from "@/hooks/useFreeWalkStamps";
import { useFreeWalkStampImages } from "@/hooks/useFreeWalkStampImages";
import { StampUnlockModal } from "@/components/StampUnlockModal";

const STEPS_PER_MILE = 2000;

interface Props {
  queen: Queen | null;
  walkerName?: string;
  voiceURI?: string;
  goalMiles: number;
  onFinish: (miles: number) => void;
  onStampsUnlocked?: (ids: Set<string>) => void;
}

export function ActiveWalkScreen({
  queen,
  walkerName = "Walker",
  voiceURI = "",
  goalMiles,
  onFinish,
  onStampsUnlocked,
}: Props) {
  const [totalMiles, setTotalMiles] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [activeTab, setActiveTab] = useState<"miles" | "steps">("miles");
  const [customMiles, setCustomMiles] = useState(1);
  const [customSteps, setCustomSteps] = useState(500);
  const [showCustom, setShowCustom] = useState(false);
  const unlockedIdsRef = useRef<Set<string>>(new Set());

  const pct = Math.min((totalMiles / goalMiles) * 100, 100);

  const currentStop =
    [...ROUTE_STOPS].reverse().find((s) => totalMiles >= parseFloat(s.dist)) ?? ROUTE_STOPS[0];
  const currentStopIndex = ROUTE_STOPS.indexOf(currentStop);
  const nextStop =
    ROUTE_STOPS.find((s) => parseFloat(s.dist) > totalMiles && parseFloat(s.dist) <= goalMiles) ?? null;

  const currentQueenFull = QUEENS.find((q) => q.name === currentStop.title) ?? null;

  // Milestone celebration overlay
  const [celebrationStop, setCelebrationStop] = useState<(typeof ROUTE_STOPS)[0] | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationFading, setCelebrationFading] = useState(false);
  const seenStopsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (seenStopsRef.current.has(currentStopIndex)) return;
    seenStopsRef.current.add(currentStopIndex);
    if (currentStopIndex === 0 && seenStopsRef.current.size === 1) return;

    const stop = ROUTE_STOPS[currentStopIndex];
    setCelebrationStop(stop);
    setCelebrationFading(false);
    setCelebrationVisible(true);

    if ("vibrate" in navigator) navigator.vibrate([80, 60, 180]);

    const fadeTimer = setTimeout(() => setCelebrationFading(true), 2500);
    const hideTimer = setTimeout(() => {
      setCelebrationVisible(false);
      setCelebrationStop(null);
      setCelebrationFading(false);
    }, 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [currentStopIndex]);

  const { isSpeaking, muted, toggleMute } = useQueenNarration({
    currentStopIndex,
    paused: false,
    active: true,
    voiceURI,
  });

  const { data: stampImages } = useFreeWalkStampImages();
  const { pendingStamps, clearPendingStamps, unlockedIds } = useFreeWalkStamps(totalMiles, stampImages);

  useEffect(() => {
    if (unlockedIds.size > 0) {
      unlockedIdsRef.current = unlockedIds;
      onStampsUnlocked?.(unlockedIds);
    }
  }, [unlockedIds, onStampsUnlocked]);

  const logMiles = useCallback(
    (m: number) => {
      setTotalMiles((prev) => {
        const next = Math.min(parseFloat((prev + m).toFixed(2)), 99);
        setTotalSteps((s) => s + Math.round(m * STEPS_PER_MILE));
        return next;
      });
    },
    []
  );

  const logSteps = useCallback((steps: number) => {
    const miles = parseFloat((steps / STEPS_PER_MILE).toFixed(2));
    setTotalSteps((prev) => prev + steps);
    setTotalMiles((prev) => Math.min(parseFloat((prev + miles).toFixed(2)), 99));
  }, []);

  const handleFinish = () => {
    window.speechSynthesis.cancel();
    onFinish(totalMiles);
  };

  const QUICK_MILES = [1, 2, 3, 5].filter((v) => v <= goalMiles);
  const QUICK_STEPS = [500, 1000, 2000, 5000];

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Stamp Unlock Modal */}
      {pendingStamps.length > 0 && (
        <StampUnlockModal stamps={pendingStamps} onClose={clearPendingStamps} />
      )}

      {/* Milestone Celebration Overlay */}
      {celebrationVisible && celebrationStop &&
        (() => {
          const q = QUEENS.find((q) => q.name === celebrationStop.title);
          return (
            <div
              className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
              style={{
                background:
                  "radial-gradient(ellipse at center, hsl(var(--primary)/0.18) 0%, hsl(var(--background)/0.97) 70%)",
                opacity: celebrationFading ? 0 : 1,
                transition: "opacity 0.7s ease-out",
              }}
            >
              <div
                className="absolute w-[340px] h-[340px] rounded-full border border-primary/20"
                style={{ animation: "milestoneRing 1.8s ease-out forwards" }}
              />
              <div
                className="absolute w-[240px] h-[240px] rounded-full border border-primary/30"
                style={{ animation: "milestoneRing 1.4s ease-out forwards" }}
              />
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
              {q?.quote && (
                <p
                  className="italic text-muted-foreground max-w-[420px] leading-[1.7]"
                  style={{ fontSize: "clamp(14px,2vw,18px)", animation: "fade-in 0.75s ease-out" }}
                >
                  {q.quote}
                </p>
              )}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary/30"
                style={{ animation: "milestoneBar 3.2s linear forwards" }}
              />
            </div>
          );
        })()}

      <FreeWalkHeader />

      {/* Status bar */}
      <div className="flex justify-between items-center px-5 md:px-12 pt-2 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-[7px] h-[7px] rounded-full bg-primary" />
          <Mono className="text-primary">Walk In Progress</Mono>
        </div>
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
            <Mono className="text-primary text-[9px]">Narrating</Mono>
          </div>
        )}
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

      {/* Progress */}
      <div className="px-5 md:px-12 pb-4">
        <div className="flex justify-between mb-2">
          <span className="font-sans text-[28px] font-black text-primary leading-none">
            {totalMiles.toFixed(1)}
          </span>
          <span className="font-sans text-[15px] text-muted-foreground self-end pb-1">
            / {goalMiles} mi goal
          </span>
        </div>
        <div className="relative h-[3px] bg-white/[0.07] mb-2">
          <div
            className="absolute left-0 top-0 bottom-0 transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, hsl(var(--primary)/0.7), hsl(var(--primary)))",
            }}
          >
            {pct > 0 && (
              <div
                className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-primary"
                style={{ boxShadow: "0 0 10px hsl(var(--primary))" }}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <Mono className="text-muted-foreground">0 mi</Mono>
          <Mono className="text-muted-foreground">
            {totalSteps.toLocaleString()} steps
          </Mono>
          <Mono className="text-primary">{goalMiles} mi</Mono>
        </div>
      </div>

      {/* Coming up next */}
      {nextStop && (
        <div className="mx-5 md:mx-12 mb-4 px-5 py-4 border border-white/10 bg-white/[0.015] flex items-center gap-3">
          <span className="text-[20px]">📍</span>
          <div>
            <Mono className="text-primary mb-0.5">Coming Up Next</Mono>
            <div className="text-foreground font-sans text-[15px]">
              {nextStop.title} — at {nextStop.dist} mi
            </div>
          </div>
        </div>
      )}

      {/* Logger card */}
      <div className="mx-5 md:mx-12 mb-6 bg-card border border-border p-5">
        {/* Tabs */}
        <div className="flex mb-5 border-b border-border">
          {(["miles", "steps"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowCustom(false); }}
              className={`flex-1 pb-3 font-sans text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-200 ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Log {tab}
            </button>
          ))}
        </div>

        {activeTab === "miles" && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {QUICK_MILES.map((m) => (
                <button
                  key={m}
                  onClick={() => logMiles(m)}
                  className="h-12 text-lg font-bold border border-primary/30 bg-primary/[0.08] text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  +{m}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCustom((v) => !v)}
              className="w-full text-[11px] tracking-[0.12em] uppercase text-muted-foreground hover:text-primary transition-colors py-1"
            >
              {showCustom ? "Hide custom" : "Custom amount..."}
            </button>
            {showCustom && (
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  value={customMiles}
                  onChange={(e) => setCustomMiles(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  min={0.1}
                  step={0.1}
                  className="flex-1 bg-transparent border border-border rounded px-3 py-2 text-foreground text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => { logMiles(customMiles); setShowCustom(false); }}
                  className="px-5 bg-primary text-primary-foreground font-sans text-[12px] font-semibold tracking-[0.1em] uppercase hover:bg-primary/90 transition-colors"
                >
                  Log
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "steps" && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {QUICK_STEPS.map((s) => (
                <button
                  key={s}
                  onClick={() => logSteps(s)}
                  className="h-12 text-sm font-bold border border-primary/30 bg-primary/[0.08] text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  +{s >= 1000 ? `${s / 1000}k` : s}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCustom((v) => !v)}
              className="w-full text-[11px] tracking-[0.12em] uppercase text-muted-foreground hover:text-primary transition-colors py-1"
            >
              {showCustom ? "Hide custom" : "Custom amount..."}
            </button>
            {showCustom && (
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  value={customSteps}
                  onChange={(e) => setCustomSteps(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  step={100}
                  className="flex-1 bg-transparent border border-border rounded px-3 py-2 text-foreground text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => { logSteps(customSteps); setShowCustom(false); }}
                  className="px-5 bg-primary text-primary-foreground font-sans text-[12px] font-semibold tracking-[0.1em] uppercase hover:bg-primary/90 transition-colors"
                >
                  Log
                </button>
              </div>
            )}
            <Mono className="text-muted-foreground text-[10px]">
              {STEPS_PER_MILE.toLocaleString()} steps ≈ 1 mile
            </Mono>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2.5 px-5 md:px-12 pb-10 mt-auto">
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
          className="flex-1 flex items-center justify-center bg-transparent border border-white/[0.08] text-muted-foreground font-sans text-[12px] font-normal tracking-[0.15em] uppercase px-6 py-[18px] cursor-pointer transition-all duration-200 hover:border-primary/50 hover:text-primary"
        >
          Finish Walk
        </button>
      </div>

      <style>{`
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
