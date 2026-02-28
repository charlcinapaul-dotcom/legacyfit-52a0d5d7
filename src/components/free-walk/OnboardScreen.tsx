import React, { useState, useEffect } from "react";
import { Mono, BtnFill, BtnOutline, ArrowRight } from "./ui-primitives";
import { FreeWalkHeader } from "./FreeWalkHeader";
import { cn } from "@/lib/utils";

interface Props {
  onNext: (name: string, fitnessLevel: string, goals: string[], voiceURI: string) => void;
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

// Curated voice slots — priority-ordered name fragments to match against available voices
const VOICE_SLOTS = [
  { gender: "female" as const, label: "Natasha",  hint: "Australian",  fragments: ["natasha"] },
  { gender: "female" as const, label: "Zira",     hint: "American",    fragments: ["zira", "samantha", "ava", "allison", "hazel", "victoria", "karen"] },
  { gender: "male"   as const, label: "William",  hint: "Australian",  fragments: ["william"] },
  { gender: "male"   as const, label: "Guy",      hint: "American",    fragments: ["guy", "daniel", "alex", "fred", "david", "mark", "james", "oliver"] },
];

interface CuratedVoice {
  voice: SpeechSynthesisVoice;
  label: string;
  hint: string;
  gender: "female" | "male";
}

function buildCuratedList(all: SpeechSynthesisVoice[]): CuratedVoice[] {
  const english = all.filter((v) => v.lang.toLowerCase().startsWith("en"));
  return VOICE_SLOTS.map((slot) => {
    const match = slot.fragments.reduce<SpeechSynthesisVoice | null>((found, frag) => {
      if (found) return found;
      return english.find((v) => v.name.toLowerCase().includes(frag)) ?? null;
    }, null);
    return match ? { voice: match, label: slot.label, hint: slot.hint, gender: slot.gender } : null;
  }).filter(Boolean) as CuratedVoice[];
}

export function OnboardScreen({ onNext, onBack }: Props) {
  const [name, setName] = useState("");
  const [fitnessValue, setFitnessValue] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [curatedVoices, setCuratedVoices] = useState<CuratedVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");

  // Load voices (some browsers load them async)
  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const curated = buildCuratedList(all);
      setCuratedVoices(curated);
      if (curated.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(curated[0].voice.voiceURI);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const previewVoice = (uri: string) => {
    window.speechSynthesis.cancel();
    const cv = curatedVoices.find((cv) => cv.voice.voiceURI === uri);
    if (!cv) return;
    const u = new SpeechSynthesisUtterance("She walked out of bondage and never stopped moving.");
    u.voice = cv.voice;
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  };

  const handleNext = () => {
    if (!bothFilled) return;
    window.speechSynthesis.cancel();
    onNext(name.trim() || "Walker", fitnessValue!, selectedGoals, selectedVoiceURI);
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

        {/* Voice picker */}
        {curatedVoices.length > 0 && (
          <div>
            <Mono className="text-muted-foreground mb-1">Narration Voice</Mono>
            <p className="text-[11px] text-muted-foreground/60 mb-4 font-light">
              Each queen's story will be read aloud as you walk
            </p>
            <div className="flex flex-col gap-2">
              {curatedVoices.map((cv) => {
                const genderIcon = cv.gender === "female" ? "♀" : "♂";
                const isSelected = selectedVoiceURI === cv.voice.voiceURI;
                return (
                  <div
                    key={cv.voice.voiceURI}
                    onClick={() => {
                      setSelectedVoiceURI(cv.voice.voiceURI);
                      previewVoice(cv.voice.voiceURI);
                    }}
                    className={cn(
                      "flex items-center justify-between border px-4 py-3 cursor-pointer transition-all duration-200 select-none",
                      isSelected
                        ? "border-primary bg-primary/[0.08]"
                        : "border-white/[0.12] bg-white/[0.02] hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-mono text-[13px]">{genderIcon}</span>
                      <div>
                        <div className="text-[14px] font-semibold text-foreground leading-tight">{cv.label}</div>
                        <div className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{cv.hint} · {cv.voice.lang}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                      <button
                        onClick={(e) => { e.stopPropagation(); previewVoice(cv.voice.voiceURI); }}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="Preview voice"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                          <path d="M15.54 8.46a5 5 0 010 7.07"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
