import React, { useState } from "react";
import { SPOKEN_WORDS } from "@/data/still";
import { FreeWalkHeader } from "@/components/free-walk/FreeWalkHeader";
import { useSilenceTimer } from "@/hooks/useSilenceTimer";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StillDuring({ onNext, onBack }: Props) {
  const [wordIdx, setWordIdx] = useState(0);
  const silence = useSilenceTimer(60);
  const current = SPOKEN_WORDS[wordIdx];
  const silenceLabel = silence.done ? "✓" : String(silence.remaining);

  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[120%] h-[70%]" style={{background:"radial-gradient(ellipse at center bottom, hsl(var(--primary)/0.14) 0%, hsl(var(--primary)/0.05) 45%, transparent 70%)", animation:"orbPulse 8s ease-in-out infinite"}}/>

      <div className="relative z-10">
        <FreeWalkHeader />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 md:px-14 pb-12">
        <div className="flex-1 flex flex-col justify-center items-center text-center py-10">
          <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary mb-6 flex items-center gap-2.5">
            <div className="w-5 h-px bg-primary"/>
            {current.queen} · {current.domain}
            <div className="w-5 h-px bg-primary"/>
          </div>
          <blockquote className="italic font-bold text-foreground leading-[1.2] max-w-[700px]" style={{fontSize:"clamp(20px,4.5vw,52px)", animation:"wordReveal 0.7s ease both"}} key={wordIdx}>"{current.word}"</blockquote>
          <cite className="block not-italic mt-5 font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">{current.mileLabel}</cite>
          <div className="flex gap-2 mt-9">
            {SPOKEN_WORDS.map((_, i) => (
              <button key={i} onClick={() => setWordIdx(i)} className={cn("w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 border-none", wordIdx === i ? "bg-primary scale-[1.4]" : "bg-white/20 hover:bg-white/40")}/>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary">One Minute of Silence</div>
          <button onClick={silence.toggle} className="relative w-[120px] h-[120px] rounded-full border border-white/10 flex items-center justify-center cursor-pointer bg-transparent">
            <div className="absolute inset-0 rounded-full" style={{background:`conic-gradient(hsl(var(--primary)) ${silence.deg}deg, transparent ${silence.deg}deg)`, WebkitMask:"radial-gradient(farthest-side,transparent calc(100% - 3px),white 0)", mask:"radial-gradient(farthest-side,transparent calc(100% - 3px),white 0)"}}/>
            <div className="relative z-10 w-[88px] h-[88px] rounded-full bg-card flex flex-col items-center justify-center gap-0.5">
              <span className="font-sans text-[28px] font-bold text-foreground leading-none">{silenceLabel}</span>
              {!silence.done && <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">{silence.running ? "running" : "tap"}</span>}
            </div>
          </button>
          <p className="text-[13px] font-light text-muted-foreground text-center leading-[1.7] max-w-[340px]">
            No input. No output. Just your feet, the ground, and whatever rises.
            {!silence.running && !silence.done && " Tap to begin."}
            {silence.done && <span className="text-primary"> Beautifully done.</span>}
          </p>
          {silence.done && <button onClick={silence.reset} className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer bg-transparent border-none">Reset</button>}
        </div>

        <div className="flex gap-2.5 flex-wrap justify-center">
          <button onClick={onNext} className="flex-1 max-w-xs inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground font-sans text-[13px] font-semibold tracking-[0.12em] uppercase px-8 py-[17px] border-none cursor-pointer transition-colors hover:bg-primary/90">Walk Complete — Integrate</button>
          <button onClick={onBack} className="inline-flex items-center gap-2 bg-transparent text-muted-foreground font-sans text-[12px] tracking-[0.15em] uppercase px-7 py-[15px] border border-white/20 cursor-pointer transition-all hover:border-primary hover:text-primary">← Before</button>
        </div>
      </div>

      <style>{`@keyframes orbPulse{0%,100%{opacity:0.8;}50%{opacity:1;}}@keyframes wordReveal{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}`}</style>
    </div>
  );
}
