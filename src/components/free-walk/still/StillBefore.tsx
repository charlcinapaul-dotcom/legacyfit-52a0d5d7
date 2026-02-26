import React, { useState, useMemo } from "react";
import { Queen } from "@/data/queens";
import { AFFIRMATIONS_BEFORE, INTENTION_OPTIONS } from "@/data/still";
import { useBreath } from "@/hooks/useBreath";
import { cn } from "@/lib/utils";

interface Props {
  queen: Queen | null;
  onNext: () => void;
  onBack: () => void;
}

export function StillBefore({ queen, onNext, onBack }: Props) {
  const [intentionIdx, setIntentionIdx] = useState(0);
  const breath = useBreath();

  const affirmation = useMemo(() => {
    if (queen) {
      const found = AFFIRMATIONS_BEFORE.find((a) => a.queen === queen.name);
      return found ?? AFFIRMATIONS_BEFORE[0];
    }
    return AFFIRMATIONS_BEFORE[0];
  }, [queen]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex justify-between items-center px-6 md:px-14 pt-7 pb-0">
        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary">Still · Before</span>
        <button onClick={onBack} className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer bg-transparent border-none">← Back</button>
      </div>

      <div className="flex-1 grid md:grid-cols-2">
        <div className="relative bg-card border-b md:border-b-0 md:border-r border-border p-8 md:p-14 flex flex-col justify-between overflow-hidden">
          <div className="pointer-events-none absolute bottom-8 right-8 opacity-30">
            <div className="w-10 h-[60px] rounded-[50%_50%_30%_30%]" style={{background:"radial-gradient(ellipse 60% 80% at 50% 100%, hsl(var(--primary)) 0%, hsl(var(--primary)/0.4) 40%, transparent 80%)", animation:"flicker 2.5s ease-in-out infinite", transformOrigin:"bottom center"}}/>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary mb-4">Before the Walk — Arrive</div>
            <h2 className="font-sans font-black leading-[1.0] text-foreground mb-4" style={{fontSize:"clamp(26px,3.5vw,44px)"}}>You don't have to earn the right to begin.</h2>
            <p className="text-sm font-light text-muted-foreground leading-[1.85] max-w-[300px]">Set your intention. Breathe into your body. Let the woman you're walking beside today speak first.</p>
            <div className="mt-8 bg-primary/[0.08] border border-primary/20 p-6">
              <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-primary mb-3">Today's Affirmation</div>
              <blockquote className="italic font-normal text-foreground leading-[1.6]" style={{fontSize:"clamp(15px,1.8vw,20px)"}}>"{affirmation.text}"</blockquote>
              <cite className="block not-italic mt-3 font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">— {affirmation.queen} · Walk With Queens</cite>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-14 flex flex-col gap-10 justify-center">
          <div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary mb-5">Breathing Exercise</div>
            <div className="flex flex-col items-center gap-5">
              <button onClick={breath.toggle} className="relative w-40 h-40 rounded-full border border-white/[0.15] flex items-center justify-center cursor-pointer bg-transparent" style={{outline:"none"}}>
                <div className="absolute inset-[-1px] rounded-full" style={{background:"conic-gradient(hsl(var(--primary)) 0deg, hsl(var(--primary)/0.5) 90deg, transparent 90deg)", animation:"spinRing 8s linear infinite", borderRadius:"50%", WebkitMask:"radial-gradient(farthest-side,transparent calc(100% - 1px),white 0)", mask:"radial-gradient(farthest-side,transparent calc(100% - 1px),white 0)"}}/>
                <div className="w-[110px] h-[110px] rounded-full flex flex-col items-center justify-center gap-1" style={{background:"radial-gradient(ellipse, hsl(var(--primary)/0.15) 0%, transparent 70%)", animation:breath.running?"breatheRing 5s ease-in-out infinite":"none"}}>
                  <span className="italic text-[18px] text-foreground leading-none text-center px-2">{breath.word}</span>
                  {breath.running && <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{breath.count} / {breath.max}</span>}
                  {!breath.running && <span className="font-mono text-[9px] tracking-[0.15em] text-muted-foreground/40">tap to begin</span>}
                </div>
              </button>
              <p className="text-[12px] font-light text-muted-foreground text-center leading-[1.7]">4 counts in · 4 counts hold · 6 counts out<br/>Three rounds to arrive.</p>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary mb-3">Set Your Intention</div>
            <p className="text-sm font-light text-muted-foreground mb-4">What do you want this walk to give you today?</p>
            <div className="flex flex-col gap-2">
              {INTENTION_OPTIONS.map((opt, i) => (
                <button key={opt} onClick={() => setIntentionIdx(i)} className={cn("text-left px-[18px] py-3.5 border italic text-[14px] cursor-pointer transition-all duration-200 bg-transparent", intentionIdx === i ? "border-primary text-foreground bg-primary/[0.10]" : "border-white/[0.12] text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/[0.06]")}>{opt}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 items-center px-6 md:px-14 py-8 border-t border-border flex-wrap">
        <button onClick={onNext} className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-sans text-[13px] font-semibold tracking-[0.12em] uppercase px-9 py-[17px] border-none cursor-pointer transition-colors hover:bg-primary/90">Begin the Walk <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
        <button onClick={onBack} className="inline-flex items-center gap-2 bg-transparent text-muted-foreground font-sans text-[12px] tracking-[0.15em] uppercase px-7 py-[15px] border border-white/20 cursor-pointer transition-all hover:border-primary hover:text-primary">← Back</button>
      </div>

      <style>{`@keyframes flicker{0%,100%{transform:scaleX(1) scaleY(1) rotate(-1deg);}25%{transform:scaleX(0.9) scaleY(1.06) rotate(1deg);}50%{transform:scaleX(1.05) scaleY(0.95) rotate(-0.5deg);}75%{transform:scaleX(0.95) scaleY(1.03) rotate(1.5deg);}}@keyframes spinRing{to{transform:rotate(360deg);}}@keyframes breatheRing{0%,100%{transform:scale(0.88);}50%{transform:scale(1);}}`}</style>
    </div>
  );
}
