import React from "react";
import { Mono, BtnFill, BtnOutline, ArrowRight } from "./ui-primitives";
import { FreeWalkHeader } from "./FreeWalkHeader";

const FITNESS_LABELS: Record<string, { icon: string; label: string }> = {
  starting: { icon: "🌱", label: "Just Starting" },
  "getting-there": { icon: "🔥", label: "Getting There" },
  mover: { icon: "⚡", label: "I Move" },
};

const GOAL_LABELS: Record<string, string> = {
  health: "My health",
  peace: "My peace",
  strength: "My strength",
  people: "My people",
};

interface Props {
  walkerName: string;
  fitnessLevel: string;
  goals: string[];
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmScreen({ walkerName, fitnessLevel, goals, onConfirm, onBack }: Props) {
  const fitness = FITNESS_LABELS[fitnessLevel];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FreeWalkHeader />

      {/* Progress bar — full */}
      <div className="h-0.5 bg-primary" />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-[clamp(24px,6vw,72px)] py-16 text-center">
        <div className="text-[52px] mb-6">👑</div>

        <h2
          className="font-sans font-black leading-[1.05] text-foreground mb-4"
          style={{ fontSize: "clamp(28px,5vw,48px)" }}
        >
          You're ready, Queen.
        </h2>

        <p className="text-[15px] font-light text-muted-foreground leading-[1.75] mb-10 max-w-[400px]">
          Here's your profile based on where you are and what you're walking toward.
        </p>

        {/* Gold pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {/* Fitness pill */}
          <span className="inline-flex items-center gap-2 border border-primary bg-primary/[0.1] px-4 py-2 font-sans text-[13px] font-semibold text-foreground">
            <span>{fitness?.icon}</span>
            <span>{fitness?.label}</span>
          </span>

          {/* Goal pills */}
          {goals.map((g) => (
            <span
              key={g}
              className="inline-flex items-center border border-primary bg-primary/[0.1] px-4 py-2 font-sans text-[13px] font-semibold text-foreground"
            >
              {GOAL_LABELS[g]}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-[360px]">
          <BtnFill onClick={onConfirm} className="w-full justify-center">
            <span>Meet Your Queens</span>
            <ArrowRight />
          </BtnFill>
          <BtnOutline onClick={onBack} className="w-full justify-center">← Edit Selections</BtnOutline>
        </div>
      </div>
    </div>
  );
}
