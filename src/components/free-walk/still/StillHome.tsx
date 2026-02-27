import React, { useState } from "react";
import { Mono, BtnFill, ArrowRight } from "@/components/free-walk/ui-primitives";
import { FreeWalkHeader } from "@/components/free-walk/FreeWalkHeader";
import { StillMoment } from "@/data/still";
import { cn } from "@/lib/utils";

const MOMENTS: { id: StillMoment; label: string; desc: string; icon: string }[] = [
  {
    id: "before",
    label: "Before — Arrive",
    desc: "Set your intention. Breathe into your body. Let the woman you're walking beside speak first.",
    icon: "🌅",
  },
  {
    id: "during",
    label: "During — Walk Still",
    desc: "Spoken word moments from the queens. One minute of intentional silence. Words at every mile.",
    icon: "👣",
  },
  {
    id: "after",
    label: "After — Integrate",
    desc: "Three reflection prompts. A closing affirmation. Let what you carried finally land.",
    icon: "🌙",
  },
];

interface Props {
  selectedMoment: StillMoment;
  onSelectMoment: (m: StillMoment) => void;
  onEnter: () => void;
  onBack: () => void;
}

export function StillHome({ selectedMoment, onSelectMoment, onEnter, onBack }: Props) {
  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Breathing orb */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, hsl(var(--primary)/0.12) 0%, hsl(var(--primary)/0.04) 40%, transparent 70%)",
          animation: "orbPulse 6s ease-in-out infinite",
        }}
      />

      <div className="relative z-10">
        <FreeWalkHeader />
      </div>

      {/* Center */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 py-12">
        <h1
          className="font-sans font-black italic leading-[0.85] tracking-[-0.04em] text-foreground"
          style={{
            fontSize: "clamp(80px,18vw,160px)",
            textShadow: "0 0 80px hsl(var(--primary)/0.3)",
            animation: "orbPulse 6s ease-in-out infinite",
          }}
        >
          Still.
        </h1>

        <p className="mt-5 text-[13px] font-light text-muted-foreground tracking-[0.08em] leading-[1.8] max-w-[360px]">
          Before the walk. During the walk. After the walk.
          <br />
          Affirmations, spoken word, and intentional silence — in the voice of
          women who knew how to be still in the storm.
        </p>

        {/* Moment selector */}
        <div className="flex flex-col sm:flex-row gap-3 mt-12 w-full max-w-[520px]">
          {MOMENTS.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMoment(m.id)}
              className={cn(
                "flex-1 text-left p-5 border transition-all duration-250 bg-transparent cursor-pointer",
                selectedMoment === m.id
                  ? "border-primary bg-primary/[0.12]"
                  : "border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/[0.05]"
              )}
            >
              <span className="text-xl block mb-2">{m.icon}</span>
              <Mono
                className={cn(
                  "block mb-1 transition-colors",
                  selectedMoment === m.id ? "text-primary" : "text-muted-foreground/50"
                )}
              >
                {m.label}
              </Mono>
              <p className="text-[11px] font-light text-muted-foreground leading-[1.6]">
                {m.desc}
              </p>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="flex gap-3 mt-8 flex-wrap justify-center">
          <BtnFill onClick={onEnter}>
            <span>Enter Still</span>
            <ArrowRight />
          </BtnFill>
        </div>
      </div>

      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50%       { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
