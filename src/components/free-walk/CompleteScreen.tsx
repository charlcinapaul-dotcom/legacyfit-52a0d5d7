import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Queen } from "@/data/queens";
import { Mono, BtnFill, BtnOutline, ArrowRight } from "./ui-primitives";
import { FreeWalkHeader } from "./FreeWalkHeader";
import { FreeWalkPassport } from "./FreeWalkPassport";
import { supabase } from "@/integrations/supabase/client";

const FREE_WALK_PENDING_KEY = "legacyfit_pending_free_walk";
const FREE_WALK_HISTORY_KEY = "legacyfit_free_walk_history";

interface Props {
  queen: Queen | null;
  walkerName?: string;
  miles: number;
  unlockedStampIds?: Set<string>;
  onRestart: () => void;
  onWalkAnother: () => void;
  onEnterStill: () => void;
}

export function CompleteScreen({
  queen,
  walkerName = "Walker",
  miles,
  unlockedStampIds = new Set(),
  onRestart,
  onWalkAnother,
  onEnterStill,
}: Props) {
  const q = queen ?? { name: "Sojourner Truth", domain: "Resistance", quote: "", truth: "" };
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [showPassport, setShowPassport] = useState(false);
  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderState, setReminderState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderEmail.trim()) return;
    setReminderState("submitting");
    const { error } = await supabase.from("walk_reminders" as any).insert({
      email: reminderEmail.trim(),
      miles,
      completed_at: new Date().toISOString(),
    });
    setReminderState(error ? "error" : "done");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
      if (session) {
        const hist = JSON.parse(localStorage.getItem(FREE_WALK_HISTORY_KEY) || "[]");
        const entry = { miles, completedAt: new Date().toISOString() };
        localStorage.setItem(FREE_WALK_HISTORY_KEY, JSON.stringify([entry, ...hist].slice(0, 10)));
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, [miles]);

  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-hidden">
      <FreeWalkHeader />
      {/* Gold glow */}
      <div
        className="pointer-events-none absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[160%] h-[80%]"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, hsl(var(--primary)/0.16) 0%, hsl(var(--primary)/0.06) 35%, transparent 65%)",
        }}
      />
      <div className="pointer-events-none absolute rounded-full border border-primary/[0.06] w-[500px] h-[500px] bottom-[-200px] left-1/2 -translate-x-1/2" />
      <div className="pointer-events-none absolute rounded-full border border-primary/[0.08] w-[340px] h-[340px] bottom-[-100px] left-1/2 -translate-x-1/2" />

      <div className="relative z-10 px-8 md:px-[clamp(32px,6vw,72px)] py-8 text-center max-w-[560px] w-full mx-auto flex-1 flex flex-col justify-center">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <div className="w-5 h-px bg-primary" />
          <Mono className="text-primary">Walk Complete</Mono>
          <div className="w-5 h-px bg-primary" />
        </div>

        {/* Headline */}
        <h1
          className="font-sans font-black leading-[0.88] text-foreground mb-2"
          style={{ fontSize: "clamp(50px,10vw,88px)" }}
        >
          {walkerName},
          <em className="block not-italic font-light text-primary">You're a Queen.</em>
        </h1>

        <p className="text-sm font-light text-muted-foreground leading-[1.8] mt-6 mb-9">
          Every step was yours. The women you walked beside today did harder things with less — and so did you.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-0.5 mb-9 bg-white/[0.04]">
          {[
            { val: miles.toFixed(1), key: "Miles Logged" },
            { val: String(Math.round(miles * STEPS_PER_MILE).toLocaleString()), key: "Est. Steps" },
          ].map((s) => (
            <div key={s.key} className="bg-card py-5 px-3">
              <span className="font-sans text-[34px] font-bold text-primary block">{s.val}</span>
              <Mono className="text-muted-foreground block mt-1.5">{s.key}</Mono>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="border border-primary/[0.35] bg-primary/[0.07] p-[18px] px-6 mb-7 flex items-center gap-3.5 text-left w-full">
          <span className="text-[32px] flex-shrink-0">🔥</span>
          <div>
            <span className="font-sans text-[16px] font-bold text-foreground block">
              First Walk Badge — Walk With Queens
            </span>
            <Mono className="text-muted-foreground block mt-1">Earned · LegacyFit · 2026</Mono>
          </div>
        </div>

        {/* Dedication */}
        <p className="text-sm italic text-muted-foreground mb-8 leading-[1.7]">
          This walk was dedicated to{" "}
          <strong className="text-primary not-italic font-bold">{q.name}</strong> — who walked so
          you could too.
        </p>

        {/* Walk Reminder */}
        <div className="border border-white/[0.08] bg-white/[0.03] p-6 mb-7 text-left">
          {reminderState === "done" ? (
            <p className="text-sm text-primary font-sans font-medium leading-[1.7]">
              You're on the list. See you on the road.
            </p>
          ) : (
            <form onSubmit={handleReminderSubmit}>
              <label
                htmlFor="reminder-email"
                className="block font-sans text-[13px] font-medium text-foreground mb-3"
              >
                Walk again tomorrow — we'll remind you
              </label>
              <div className="flex gap-2">
                <input
                  ref={emailInputRef}
                  id="reminder-email"
                  type="email"
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-background border border-white/[0.12] text-foreground text-[13px] px-4 py-2.5 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={reminderState === "submitting"}
                  className="bg-primary text-primary-foreground font-sans text-[11px] font-semibold tracking-[0.12em] uppercase px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {reminderState === "submitting" ? "Saving…" : "Send my reminder"}
                </button>
              </div>
              {reminderState === "error" && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  Couldn't save — but you're all set to keep walking.
                </p>
              )}
            </form>
          )}
        </div>

        {/* Auth upsell */}
        {isAuthed === false && (
          <div className="border border-primary bg-primary/[0.08] p-6 mb-7 text-left relative overflow-hidden">
            <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏅</span>
                <Mono className="text-primary">Save Your Walk</Mono>
              </div>
              <p className="text-foreground font-sans text-[15px] font-semibold mb-1">
                You just earned a badge.
              </p>
              <p className="text-muted-foreground text-[13px] leading-[1.6] mb-5">
                Create a free account to save this walk, earn your{" "}
                <strong className="text-primary">First Walk Badge</strong>, and track your legacy on the
                leaderboard.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  to="/auth?mode=signup"
                  onClick={() =>
                    localStorage.setItem(FREE_WALK_PENDING_KEY, JSON.stringify({ miles }))
                  }
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-sans text-[12px] font-semibold tracking-[0.12em] uppercase px-6 py-3 hover:bg-primary/90 transition-colors"
                >
                  Create Free Account <ArrowRight size={12} />
                </Link>
                <Link
                  to="/auth"
                  onClick={() =>
                    localStorage.setItem(FREE_WALK_PENDING_KEY, JSON.stringify({ miles }))
                  }
                  className="inline-flex items-center gap-2 border border-primary/40 text-primary font-sans text-[12px] font-normal tracking-[0.12em] uppercase px-5 py-3 hover:bg-primary/10 transition-colors"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Upsell CTA */}
        <div className="border border-primary/40 bg-primary/[0.06] p-6 mb-7 text-left">
          <Mono className="text-primary mb-2 block">Ready to Go Further?</Mono>
          <p className="text-foreground font-sans text-[15px] font-medium mb-3">
            Join the full 30-Day LegacyFit Challenge
          </p>
          <p className="text-muted-foreground text-[13px] leading-[1.6] mb-4">
            Earn passport stamps, track real miles, unlock historical milestones, and build a legacy that lasts.
          </p>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-sans text-[13px] font-semibold tracking-[0.12em] uppercase px-6 py-3 hover:bg-primary/90 transition-colors"
          >
            View Challenges <ArrowRight size={12} />
          </Link>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => setShowPassport(true)}
            className="w-full flex items-center justify-between px-6 py-5 border border-primary bg-primary/[0.10] hover:bg-primary/[0.18] transition-colors duration-200 group"
          >
            <div className="text-left">
              <div className="font-sans text-[15px] font-bold text-foreground mb-0.5">
                View Passport
              </div>
              <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground">
                Your Queen Stamps
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
              <span className="text-xl">📜</span>
              <ArrowRight size={14} />
            </div>
          </button>

          {/* Still CTA — hidden until feature is re-enabled (STILL_FEATURE_ENABLED: false) */}

          <BtnOutline onClick={onWalkAnother} className="w-full justify-center">
            Walk Another Queen →
          </BtnOutline>
          <BtnOutline onClick={onRestart} className="w-full justify-center">
            Start Over
          </BtnOutline>
        </div>
      </div>

      {/* Queen Passport overlay */}
      {showPassport && (
        <FreeWalkPassport
          unlockedMilestoneIds={unlockedStampIds}
          onClose={() => setShowPassport(false)}
        />
      )}
    </div>
  );
}

const STEPS_PER_MILE = 2000;
