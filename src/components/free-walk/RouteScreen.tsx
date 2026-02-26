import React from "react";
import { ROUTE_STOPS } from "@/data/queens";
import { Mono, BtnFill, BtnOutline, ArrowRight } from "./ui-primitives";

interface Props {
  onBegin: () => void;
  onBack: () => void;
}

export function RouteScreen({ onBegin, onBack }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero band */}
      <div className="relative bg-card border-b border-border px-6 md:px-[clamp(24px,6vw,72px)] pt-12 pb-10 overflow-hidden">
        <div className="pointer-events-none absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full border border-primary/[0.07]" />

        <h1
          className="font-sans font-black leading-[0.88] tracking-[-0.02em] text-foreground mt-4"
          style={{ fontSize: "clamp(42px,8vw,90px)" }}
        >
          Walk With
          <em className="block not-italic font-light text-primary">
            Queens.
          </em>
        </h1>

        <div className="flex flex-wrap gap-4 mt-6">
          {[
            ["11", "WOMEN"],
            ["5", "MILES"],
            ["~90", "MINUTES"],
          ].map(([val, key]) => (
            <div
              key={key}
              className="border border-white/[0.12] px-5 py-3 flex flex-col items-center min-w-[80px]"
            >
              <span className="font-sans text-[28px] font-bold text-primary leading-none">
                {val}
              </span>
              <Mono className="text-muted-foreground mt-1">{key}</Mono>
            </div>
          ))}
        </div>
      </div>

      {/* Queen stops — timeline */}
      <div className="px-6 md:px-[clamp(24px,6vw,72px)] flex-1 relative">
        {ROUTE_STOPS.map((stop, i) => (
          <div
            key={stop.num}
            className="grid grid-cols-[64px_20px_1fr] gap-x-4 items-start py-8 border-b border-white/[0.04] last:border-b-0"
          >
            {/* Mile marker */}
            <div className="text-right pt-1">
              <span className="font-sans text-[22px] font-bold text-primary leading-none block">
                {stop.dist}
              </span>
              <Mono className="text-muted-foreground text-[9px]">{stop.distLabel}</Mono>
            </div>

            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-2">
              <div
                className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                style={{
                  borderColor: i === ROUTE_STOPS.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.7)",
                }}
              />
            </div>

            {/* Content */}
            <div>
              <div className="font-sans text-[20px] font-bold text-foreground leading-tight mb-0.5">
                {stop.title}
              </div>
              <Mono className="text-primary mb-3">{stop.queenLabel}</Mono>
              <p className="text-[13px] font-light text-muted-foreground leading-[1.75]">
                {stop.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 md:px-[clamp(24px,6vw,72px)] py-10 flex gap-3.5 flex-wrap items-center">
        <BtnFill onClick={onBegin}>
          <span>Begin Walking</span>
          <ArrowRight />
        </BtnFill>
        <BtnOutline onClick={onBack}>← Back</BtnOutline>
      </div>
    </div>
  );
}
