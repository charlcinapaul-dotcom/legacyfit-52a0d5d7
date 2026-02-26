import React from "react";
import legacyFitLogo from "@/assets/legacyfit-logo.png";
import { BtnFill, BtnOutline, ArrowRight } from "./ui-primitives";

interface Props {
  onStart: () => void;
  onPreview: () => void;
}

export function SplashScreen({ onStart, onPreview }: Props) {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Gold glow */}
      <div
        className="pointer-events-none absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[140%] h-[80%]"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, hsl(var(--primary)/0.18) 0%, hsl(var(--primary)/0.06) 40%, transparent 70%)",
        }}
      />

      {/* Notebook lines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 47px, hsl(var(--border)/0.15) 48px)",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-[clamp(24px,6vw,72px)] pb-14">
        {/* Top bar */}
        <div className="flex justify-between items-center pt-10">
          <img src={legacyFitLogo} alt="LegacyFit" className="h-10 w-auto" />
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-primary border border-primary/30 bg-primary/10 px-3.5 py-1.5">
            Free Track
          </span>
        </div>

        {/* Center */}
        <div className="flex-1 flex flex-col justify-center py-12 md:items-center md:text-center">
          <div className="md:text-center">
            <h1
              className="font-sans font-black leading-[0.88] tracking-[-0.02em] text-foreground"
              style={{ fontSize: "clamp(52px,10vw,108px)" }}
            >
              Walk With
              <em className="block not-italic font-light text-primary">
                Queens.
              </em>
            </h1>
            <p className="mt-5 text-[15px] font-light text-muted-foreground leading-[1.7] max-w-[440px]">
              5 miles. 11 women. Every step you take walks in the shadow of
              someone who walked harder — and refused to stop.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 items-center md:justify-center">
          <BtnFill onClick={onStart}>
            <span>Start Your Walk</span>
            <ArrowRight />
          </BtnFill>
          <BtnOutline onClick={onPreview}>Meet the Queens First</BtnOutline>
        </div>
      </div>
    </div>
  );
}
