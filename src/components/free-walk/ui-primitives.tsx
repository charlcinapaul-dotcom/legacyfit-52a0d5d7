import React from "react";
import { cn } from "@/lib/utils";

/* ── Mono label ── */
export function Mono({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-mono text-[10px] tracking-[0.28em] uppercase", className)}>
      {children}
    </span>
  );
}

/* ── Step track ── */
export function StepTrack({ step }: { step: number }) {
  return (
    <div className="flex gap-1 mb-10">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "h-0.5 flex-1 transition-all duration-500",
            i < step
              ? "bg-primary"
              : i === step
              ? "bg-primary/70"
              : "bg-white/10"
          )}
        />
      ))}
    </div>
  );
}

/* ── Primary button ── */
export function BtnFill({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-3 bg-primary text-primary-foreground",
        "font-sans text-[13px] font-semibold tracking-[0.12em] uppercase",
        "px-9 py-[17px] border-none cursor-pointer transition-colors duration-200",
        "hover:bg-primary/90",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ── Ghost button ── */
export function BtnOutline({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2.5 bg-transparent text-muted-foreground",
        "font-sans text-[12px] font-normal tracking-[0.15em] uppercase",
        "px-7 py-[15px] border border-white/20 cursor-pointer transition-all duration-200",
        "hover:border-primary hover:text-primary",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ── Arrow icon ── */
export function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Check icon ── */
export function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M2 5l2.5 2.5L8 3"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
