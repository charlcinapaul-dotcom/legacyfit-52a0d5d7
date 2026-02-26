import React, { useState, useMemo } from "react";
import { Queen } from "@/data/queens";
import { REFLECTION_PROMPTS, AFFIRMATIONS_CLOSE } from "@/data/still";
import { cn } from "@/lib/utils";

interface Props {
  queen: Queen | null;
  walkTime?: string;
  onComplete: () => void;
  onBack: () => void;
}

export function StillAfter({ queen, walkTime, onComplete, onBack }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);

  const closing = useMemo(() => {
    if (queen) {
      const found = AFFIRMATIONS_CLOSE.find((a) => a.queen === queen.name);
      return found ?? AFFIRMATIONS_CLOSE[0];
    }
    return AFFIRMATIONS_CLOSE[0];
  }, [queen]);

  const handleAnswer = (i: number, val: string) => {
    setAnswers((prev) => { const n = [...prev]; n[i] = val; return n; });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex justify-between items-center px-6 md:px-14 pt-7 pb-0">
        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary">Still · After</span>
        <button onClick={onBack} className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50 hover:text-primary transition-colors cursor-pointer bg-transparent border-none">← During</button>
      </div>

      <div className="flex-1 flex flex-col px-6 md:px-14 py-8">
        <div className="grid grid-cols-2 gap-0.5 mb-8 bg-white/[0.04]">
          {[{val:"5.0",key:"Miles Walked"},{val:"3",key:"Still Moments"}].map((s) => (
            <div key={s.key} className="bg-card px-6 py-5">
              <span className="font-sans text-[32px] font-bold text-primary block leading-none">{s.val}</span>
              <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground block mt-1.5">{s.key}</span>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary mb-5">Reflection — Let It Land</div>
          <div className="flex flex-col gap-3">
            {REFLECTION_PROMPTS.map((p, i) => (
              <div key={i} className={cn("border-l-2 border-primary px-6 py-5 cursor-pointer transition-all duration-200", openIdx === i ? "bg-primary/[0.07]" : "bg-primary/[0.04] hover:bg-primary/[0.09]")} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <div className="italic text-foreground leading-[1.5]" style={{fontSize:"clamp(14px,1.8vw,19px)"}}>"{p.question}"</div>
                {openIdx === i && (
                  <textarea value={answers[i]} onChange={(e) => handleAnswer(i, e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Write here, or just sit with it..." rows={3} className="mt-4 w-full bg-transparent text-foreground font-sans text-[14px] font-light italic placeholder-white/20 outline-none resize-none transition-colors" style={{border:"none",borderBottom:"1px solid hsl(var(--border))"}}/>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-white/[0.12] px-8 py-7 mb-8 text-center bg-white/[0.01]">
          <div className="font-mono text-[9px] tracking-[0.28em] uppercase text-primary mb-4">You Walked. You Carried. You Arrived.</div>
          <div className="font-sans font-bold text-foreground leading-[1.4]" style={{fontSize:"clamp(16px,2.5vw,26px)"}}>"{closing.text}"</div>
          <cite className="block not-italic mt-3 font-mono text-[9px] tracking-[0.18em] uppercase text-muted-foreground">— {closing.queen} · Walk With Queens</cite>
        </div>

        {queen && (
          <p className="italic text-sm text-muted-foreground mb-8 leading-[1.7] text-center">
            This session was held with <strong className="text-primary not-italic font-bold">{queen.name}</strong> — who was still in the storm so you could learn to be too.
          </p>
        )}

        <div className="flex gap-3 flex-wrap">
          <button onClick={onComplete} className="flex-1 inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground font-sans text-[13px] font-semibold tracking-[0.12em] uppercase px-9 py-[17px] border-none cursor-pointer transition-colors hover:bg-primary/90">Complete Still Session <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
          <button onClick={onBack} className="inline-flex items-center gap-2 bg-transparent text-muted-foreground font-sans text-[12px] tracking-[0.15em] uppercase px-7 py-[15px] border border-white/20 cursor-pointer transition-all hover:border-primary hover:text-primary">← During</button>
        </div>
      </div>
    </div>
  );
}
