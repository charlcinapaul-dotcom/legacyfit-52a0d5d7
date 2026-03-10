import { useState, useRef, useEffect } from "react";
import { Lock, Crown, Timer, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Milestone {
  id: number;
  name: string;
  miles: number;
  location: string;
}

interface JourneyMapProps {
  milestones: Milestone[];
  milesLogged: number;
  totalMiles: number;
  colorClass?: string; // e.g. "text-primary" or "text-cyan"
}

const NODE_R = 22;        // node radius px
const NODE_SPACING = 88;  // px between nodes (horizontal)
const SVG_H = 130;        // total SVG height
const TRACK_Y = 64;       // vertical center of the track line
const LABEL_Y = TRACK_Y + NODE_R + 14; // mile label below node

export function JourneyMap({ milestones, milesLogged, totalMiles, colorClass = "text-primary" }: JourneyMapProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sorted = [...milestones].sort((a, b) => a.miles - b.miles);
  // First mile is always free — treat effective progress as at least 1
  const effectiveMiles = Math.max(milesLogged, 1);
  const firstLockedIdx = sorted.findIndex(m => effectiveMiles < m.miles);
  // "YOU" marker uses real milesLogged for position (shows 0 if never logged)
  const youX = totalMiles > 0
    ? (milesLogged / totalMiles) * ((sorted.length - 1) * NODE_SPACING + NODE_R * 2) + NODE_R
    : NODE_R;

  const svgWidth = sorted.length > 0
    ? (sorted.length - 1) * NODE_SPACING + NODE_R * 2 + 40
    : 300;

  // Node x positions
  const nodeX = (i: number) => NODE_R + 20 + i * NODE_SPACING;

  // Scroll to "YOU" marker on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    // Center the YOU position
    const targetScroll = youX - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, targetScroll);
  }, [youX]);

  const handleNodeTap = (i: number) => {
    setSelectedIdx(prev => prev === i ? null : i);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground tracking-wide">JOURNEY MAP</h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Lock className="w-3 h-3" /> TAP FOR DETAILS
        </span>
      </div>

      {/* Scrollable SVG map */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        <svg
          width={svgWidth}
          height={SVG_H}
          style={{ display: "block", minWidth: svgWidth }}
          aria-label="Journey map"
        >
          {/* ── Dashed upcoming route (full span) ── */}
          <line
            x1={nodeX(0)}
            y1={TRACK_Y}
            x2={nodeX(sorted.length - 1)}
            y2={TRACK_Y}
            stroke="hsl(var(--border))"
            strokeWidth="2.5"
            strokeDasharray="7 5"
          />

          {/* ── Solid completed route ── */}
          {firstLockedIdx !== 0 && (
            <line
              x1={nodeX(0)}
              y1={TRACK_Y}
              x2={firstLockedIdx === -1 ? nodeX(sorted.length - 1) : Math.min(nodeX(Math.max(firstLockedIdx - 1, 0)), nodeX(Math.max(firstLockedIdx - 1, 0)))}
              y2={TRACK_Y}
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* ── Milestone nodes ── */}
          {sorted.map((m, i) => {
            const isUnlocked = effectiveMiles >= m.miles;
            const isNext = i === firstLockedIdx;
            const x = nodeX(i);
            const isSelected = selectedIdx === i;
            const miRemaining = (m.miles - effectiveMiles).toFixed(1);

            return (
              <g key={m.id} onClick={() => handleNodeTap(i)} style={{ cursor: "pointer" }}>
                {/* Outer ring for "next" pulse */}
                {isNext && (
                  <circle
                    cx={x}
                    cy={TRACK_Y}
                    r={NODE_R + 5}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.5"
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={x}
                  cy={TRACK_Y}
                  r={NODE_R}
                  fill={
                    isUnlocked
                      ? "hsl(var(--primary))"
                      : isNext
                      ? "hsl(var(--secondary))"
                      : "hsl(var(--secondary))"
                  }
                  stroke={
                    isUnlocked
                      ? "hsl(var(--primary))"
                      : isNext
                      ? "hsl(var(--primary))"
                      : "hsl(var(--border))"
                  }
                  strokeWidth={isUnlocked ? "0" : isNext ? "2" : "1.5"}
                  strokeDasharray={!isUnlocked && !isNext ? "5 3" : undefined}
                  opacity={!isUnlocked && !isNext ? 0.5 : 1}
                />

                {/* Icon inside node — using foreignObject for emoji/lucide */}
                {isUnlocked ? (
                  <text
                    x={x}
                    y={TRACK_Y + 6}
                    textAnchor="middle"
                    fontSize="16"
                    fill="hsl(var(--primary-foreground))"
                    fontWeight="bold"
                  >
                    👑
                  </text>
                ) : isNext ? (
                  <text
                    x={x}
                    y={TRACK_Y + 6}
                    textAnchor="middle"
                    fontSize="16"
                    fill="hsl(var(--muted-foreground))"
                  >
                    ⏳
                  </text>
                ) : (
                  <g>
                    <text
                      x={x}
                      y={TRACK_Y - 2}
                      textAnchor="middle"
                      fontSize="11"
                      fill="hsl(var(--muted-foreground))"
                      opacity="0.7"
                    >
                      🔒
                    </text>
                    <text
                      x={x}
                      y={TRACK_Y + 11}
                      textAnchor="middle"
                      fontSize="7"
                      fill="hsl(var(--muted-foreground))"
                      opacity="0.85"
                      fontFamily="inherit"
                      fontWeight="600"
                    >
                      {miRemaining}mi
                    </text>
                  </g>
                )}

                {/* Mile label below node */}
                <text
                  x={x}
                  y={LABEL_Y}
                  textAnchor="middle"
                  fontSize="10"
                  fill="hsl(var(--muted-foreground))"
                  fontFamily="inherit"
                >
                  Mi {m.miles}
                </text>

                {/* Selection indicator arrow */}
                {isSelected && (
                  <polygon
                    points={`${x - 5},${TRACK_Y - NODE_R - 3} ${x + 5},${TRACK_Y - NODE_R - 3} ${x},${TRACK_Y - NODE_R + 4}`}
                    fill="hsl(var(--primary))"
                    opacity="0.9"
                  />
                )}
              </g>
            );
          })}

          {/* ── YOU marker ── */}
          {milesLogged > 0 && (
            <g>
              {/* Vertical tick */}
              <line
                x1={youX}
                y1={TRACK_Y - NODE_R - 6}
                x2={youX}
                y2={TRACK_Y + NODE_R + 6}
                stroke="hsl(var(--foreground))"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                opacity="0.6"
              />
              {/* Label pill */}
              <rect
                x={youX - 30}
                y={TRACK_Y - NODE_R - 22}
                width={60}
                height={16}
                rx="8"
                fill="hsl(var(--foreground))"
                opacity="0.95"
              />
              <text
                x={youX}
                y={TRACK_Y - NODE_R - 10}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="hsl(var(--background))"
                fontFamily="inherit"
              >
                YOU · {milesLogged.toFixed(1)}mi
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* ── Tooltip / Detail card ── */}
      {selectedIdx !== null && sorted[selectedIdx] && (() => {
        const m = sorted[selectedIdx];
        const isUnlocked = milesLogged >= m.miles;
        const remaining = (m.miles - milesLogged).toFixed(1);
        return (
          <div className="mt-3 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={cn("font-semibold", isUnlocked ? "text-primary" : "text-foreground")}>
                  {isUnlocked ? "👑 " : "🔒 "}
                  {m.name}
                </p>
                {isUnlocked ? (
                  <p className="text-muted-foreground text-xs mt-0.5">✓ Unlocked at {m.miles} mi</p>
                ) : (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    <span className="text-primary font-medium">{remaining} mi</span> remaining to unlock
                  </p>
                )}
                {m.location && (
                  <p className="text-muted-foreground text-xs mt-1">📍 {m.location}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedIdx(null)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Legend ── */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="text-base leading-none">👑</span> Unlocked
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          <span className="text-base leading-none">⏳</span> Next stop
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          <span className="text-base leading-none">🔒</span> Locked
        </span>
      </div>
    </div>
  );
}
