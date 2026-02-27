import React, { useState } from "react";
import { Mono, BtnFill, BtnOutline, ArrowRight } from "./ui-primitives";
import { FreeWalkHeader } from "./FreeWalkHeader";
import { cn } from "@/lib/utils";

interface Props {
  onNext: (name: string, fitnessLevel: string, goals: string[]) => void;
  onBack: () => void;
}

const FITNESS_LEVELS = [
  { icon: "🌱", label: "Just Starting", sub: "New to walking", value: "starting" },
  { icon: "🔥", label: "Getting There", sub: "1–3× a week", value: "getting-there" },
  { icon: "⚡", label: "I Move", sub: "Most days", value: "mover" },
];

const GOALS = [
  { label: "My health", value: "health" },
  { label: "My peace", value: "peace" },
  { label: "My strength", value: "strength" },
  { label: "My people", value: "people" },
];

export function OnboardScreen({ onNext, onBack }: Props) {
  const [name, setName] = useState("");
  const [fitnessValue, setFitnessValue] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (value: string) => {
    setSelectedGoals((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  };

  const bothFilled = fitnessValue !== null && selectedGoals.length > 0;

  // Progress: 10% on load, 50% when one section filled, 100% when both
  const fitnessFilled = fitnessValue !== null;
  const goalsFilled = selectedGoals.length > 0;
  const progress = fitnessFilled && goalsFilled ? 100 : fitnessFilled || goalsFilled ? 50 : 10;

  const handleNext = () => {
    if (!bothFilled) return;
    onNext(name.trim() || "Walker", fitnessValue!, selectedGoals);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FreeWalkHeader />

      {/* Progress bar */}
      <div className="h-0.5 bg-white/[0.08] relative">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hero section */}
      <div className="bg-card px-6 md:px-[clamp(24px,6vw,72px)] pt-8 pb-10 border-b border-border">
        <Mono className="text-primary mb-4">Before You Begin</Mono>
        <h2
          className="font-sans font-black leading-[1.05] text-foreground mb-5"
          style={{ fontSize: "clamp(28px,5vw,52px)" }}
        >
          Every woman who walks is already brave.
        </h2>
        <p className="text-[15px] font-light text-muted-foreground leading-[1.75] mb-7 max-w-[480px]">
          We just need to know a little about where you are right now. Not to
          judge you — to walk alongside you. Your pace is the right pace.
        </p>

        {/* Quote */}
        <div className="border-l-2 border-primary pl-5">
          <blockquote className="italic text-foreground leading-[1.6]" style={{ fontSize: "clamp(15px,2vw,20px)" }}>
            "You may not control all the events that happen to you, but you can
            decide not to be reduced by them."
          </blockquote>
          <cite className="block mt-3 not-italic">
            <Mono className="text-primary">— Maya Angelou · Walk With Queens</Mono>
          </cite>
        </div>
      </div>

      {/* Form section */}
      <div className="flex-1 px-6 md:px-[clamp(24px,6vw,72px)] py-10 flex flex-col gap-10">

        {/* Name */}
        <div>
          <Mono className="text-muted-foreground mb-4">Your Name</Mono>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
            className={cn(
              "w-full bg-transparent border-b border-white/20 pb-3",
              "font-sans text-[22px] font-light text-foreground",
              "placeholder:text-muted-foreground/40 outline-none",
              "focus:border-primary transition-colors duration-200"
            )}
          />
        </div>

        {/* Fitness level — single select */}
        <div>
          <Mono className="text-muted-foreground mb-4">Where Are You Right Now?</Mono>
          <div className="grid grid-cols-3 gap-3">
            {FITNESS_LEVELS.map((f) => {
              const isSelected = fitnessValue === f.value;
              return (
                <div
                  key={f.value}
                  onClick={() => setFitnessValue(f.value)}
                  className={cn(
                    "border p-4 cursor-pointer transition-all duration-200 flex flex-col gap-2 select-none",
                    isSelected
                      ? "border-primary bg-primary/[0.08]"
                      : "border-white/[0.12] bg-white/[0.02] hover:border-primary/40"
                  )}
                >
                  <span className="text-[22px] leading-none">{f.icon}</span>
                  <div className="text-[14px] font-bold text-foreground leading-tight">{f.label}</div>
                  <div className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{f.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals — multi-select */}
        <div>
          <Mono className="text-muted-foreground mb-1">What Are You Walking Toward?</Mono>
          <p className="text-[11px] text-muted-foreground/60 mb-4 font-light">Select all that apply</p>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((g) => {
              const isSelected = selectedGoals.includes(g.value);
              return (
                <div
                  key={g.value}
                  onClick={() => toggleGoal(g.value)}
                  className={cn(
                    "border p-5 cursor-pointer transition-all duration-200 relative select-none",
                    "text-[15px] font-bold text-foreground",
                    isSelected
                      ? "border-primary bg-primary/[0.08]"
                      : "border-white/[0.12] bg-white/[0.02] hover:border-primary/40"
                  )}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                  )}
                  {g.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 md:px-[clamp(24px,6vw,72px)] py-10 flex gap-3 flex-wrap items-center border-t border-border">
        <BtnFill
          onClick={handleNext}
          className={cn(
            "flex-1 justify-center transition-opacity duration-200",
            !bothFilled && "opacity-40 cursor-not-allowed"
          )}
        >
          <span>Meet Your Queens</span>
          <ArrowRight />
        </BtnFill>
        <BtnOutline onClick={onBack}>← Back</BtnOutline>
      </div>
    </div>
  );
}
