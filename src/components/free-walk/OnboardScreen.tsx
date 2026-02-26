import React, { useState } from "react";
import { Mono, BtnFill, BtnOutline, ArrowRight } from "./ui-primitives";
import { cn } from "@/lib/utils";

interface Props {
  onNext: (name: string) => void;
  onBack: () => void;
}

const FITNESS_LEVELS = [
  { icon: "🌱", label: "Just Starting", sub: "New to walking" },
  { icon: "🔥", label: "Getting There", sub: "1–3× a week" },
  { icon: "⚡", label: "I Move", sub: "Most days" },
];

const GOALS = ["My health", "My peace", "My strength", "My people"];

export function OnboardScreen({ onNext, onBack }: Props) {
  const [name, setName] = useState("");
  const [fitnessIdx, setFitnessIdx] = useState(0);
  const [goal, setGoal] = useState("My health");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="bg-card px-6 md:px-[clamp(24px,6vw,72px)] pt-12 pb-10 border-b border-border">
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

        {/* Fitness level */}
        <div>
          <Mono className="text-muted-foreground mb-4">Where Are You Right Now?</Mono>
          <div className="grid grid-cols-3 gap-3">
            {FITNESS_LEVELS.map((f, i) => (
              <div
                key={f.label}
                onClick={() => setFitnessIdx(i)}
                className={cn(
                  "border p-4 cursor-pointer transition-all duration-200 flex flex-col gap-2",
                  fitnessIdx === i
                    ? "border-primary bg-primary/[0.08]"
                    : "border-white/[0.12] bg-white/[0.02] hover:border-primary/40"
                )}
              >
                <span className="text-[22px] leading-none">{f.icon}</span>
                <div className="text-[14px] font-bold text-foreground leading-tight">{f.label}</div>
                <div className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{f.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <Mono className="text-muted-foreground mb-4">What Are You Walking Toward?</Mono>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((g) => (
              <div
                key={g}
                onClick={() => setGoal(g)}
                className={cn(
                  "border p-5 cursor-pointer transition-all duration-200",
                  "text-[15px] font-bold text-foreground",
                  goal === g
                    ? "border-primary bg-primary/[0.08]"
                    : "border-white/[0.12] bg-white/[0.02] hover:border-primary/40"
                )}
              >
                {g}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 md:px-[clamp(24px,6vw,72px)] py-10 flex gap-3 flex-wrap items-center border-t border-border">
        <BtnFill onClick={() => onNext(name.trim() || "Walker")} className="flex-1 justify-center">
          <span>Meet Your Queens</span>
          <ArrowRight />
        </BtnFill>
        <BtnOutline onClick={onBack}>← Back</BtnOutline>
      </div>
    </div>
  );
}
