import { useState, useRef, useEffect } from "react";
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
  colorClass?: string;
}

// The SVG path spec (bottom-left → top-right diagonal curve)
const PATH_D = "M 30,180 C 80,160 110,130 160,110 S 240,85 300,70 S 380,52 440,38 S 490,24 530,15";

// Evaluate a cubic bezier / SVG path at a given t in [0,1] by using
// a hidden SVGPathElement to get point at length
function getPointAtFraction(svgEl: SVGPathElement, t: number) {
  const len = svgEl.getTotalLength();
  return svgEl.getPointAtLength(t * len);
}

// Evenly-spaced t values for N milestones along the path
function milestoneT(index: number, total: number): number {
  if (total <= 1) return 0;
  return index / (total - 1);
}

// Clamp a number between min and max
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const NODE_R = 20;
const NODE_R_SM = 17;

export function JourneyMap({ milestones, milesLogged, totalMiles, colorClass = "text-primary" }: JourneyMapProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [youPoint, setYouPoint] = useState<{ x: number; y: number } | null>(null);
  const [splitLen, setSplitLen] = useState<number>(0);

  const rN = typeof window !== "undefined" && window.innerWidth < 480 ? NODE_R_SM : NODE_R;
  const sorted = [...milestones].sort((a, b) => a.miles - b.miles);
  const effectiveMiles = Math.max(milesLogged, 1);
  const firstLockedIdx = sorted.findIndex((m) => effectiveMiles < m.miles);

  // Compute point positions once the SVG path is in DOM
  useEffect(() => {
    if (!pathRef.current) return;
    const p = pathRef.current;

    // Milestone node positions
    const pts = sorted.map((_, i) => {
      const t = milestoneT(i, sorted.length);
      const pt = getPointAtFraction(p, t);
      return { x: pt.x, y: pt.y };
    });
    setPoints(pts);

    // YOU marker position (proportional by miles)
    const youT = totalMiles > 0 ? clamp(milesLogged / totalMiles, 0, 1) : 0;
    const youPt = getPointAtFraction(p, youT);
    setYouPoint({ x: youPt.x, y: youPt.y });

    // Split length for dashed/solid stroke
    const totalLen = p.getTotalLength();
    const lastUnlockedIdx = firstLockedIdx === -1 ? sorted.length - 1 : Math.max(firstLockedIdx - 1, 0);
    const splitT = milestoneT(lastUnlockedIdx, sorted.length);
    setSplitLen(firstLockedIdx === 0 ? 0 : splitT * totalLen);
  }, [sorted.length, milesLogged, totalMiles, firstLockedIdx]);

  const handleNodeTap = (i: number) => {
    setSelectedIdx((prev) => (prev === i ? null : i));
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-foreground tracking-wide">JOURNEY MAP</h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">🔒 TAP FOR DETAILS</span>
      </div>

      {/* Map container — fixed 200px tall */}
      <div
        className="relative w-full overflow-x-auto"
        style={{ height: 200, WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <svg
          viewBox="0 0 620 196"
          width="100%"
          height="200"
          style={{ display: "block", minWidth: 500 }}
          aria-label="Journey map"
        >
          {/* ── Hidden path used for measurement (no stroke) ── */}
          <path ref={pathRef} d={PATH_D} fill="none" stroke="none" />

          {/* ── Dashed upcoming path (full) ── */}
          <path d={PATH_D} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeDasharray="7 5" />

          {/* ── Solid completed path segment ── */}
          {splitLen > 0 && pathRef.current && (
            <path
              d={PATH_D}
              fill="none"
              stroke="#FFD700"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${splitLen} 9999`}
              strokeDashoffset="0"
            />
          )}

          {/* ── Milestone nodes ── */}
          {points.map((pt, i) => {
            const m = sorted[i];
            if (!m) return null;
            const isUnlocked = effectiveMiles >= m.miles;
            const isNext = i === firstLockedIdx;
            const isSelected = selectedIdx === i;
            const miRemaining = (m.miles - effectiveMiles).toFixed(1);

            return (
              <g key={m.id} onClick={() => handleNodeTap(i)} style={{ cursor: "pointer" }}>
                {/* Pulse ring for next */}
                {isNext && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={rN + 5}
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.5"
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={rN}
                  fill={isUnlocked ? "#2d1060" : "hsl(var(--secondary))"}
                  stroke={isUnlocked ? "#FFD700" : isNext ? "#FFD700" : "hsl(var(--border))"}
                  strokeWidth={isUnlocked ? "2" : isNext ? "2" : "1.5"}
                  strokeDasharray={!isUnlocked && !isNext ? "5 3" : undefined}
                  opacity={!isUnlocked && !isNext ? 0.55 : 1}
                />

                {/* Icon / label inside node */}
                {isUnlocked ? (
                  <text
                    x={pt.x}
                    y={pt.y + 6}
                    textAnchor="middle"
                    fontSize="15"
                    fill="hsl(var(--primary-foreground))"
                    fontWeight="bold"
                  >
                    👑
                  </text>
                ) : isNext ? (
                  <text x={pt.x} y={pt.y + 6} textAnchor="middle" fontSize="15" fill="hsl(var(--muted-foreground))">
                    ⏳
                  </text>
                ) : (
                  <g>
                    <text
                      x={pt.x}
                      y={pt.y - 2}
                      textAnchor="middle"
                      fontSize="11"
                      fill="hsl(var(--muted-foreground))"
                      opacity="0.7"
                    >
                      🔒
                    </text>
                    <text
                      x={pt.x}
                      y={pt.y + 11}
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

                {/* Mile label — above or below depending on position */}
                <text
                  x={pt.x}
                  y={pt.y > 100 ? pt.y + rN + 13 : pt.y - rN - 5}
                  textAnchor="middle"
                  fontSize="9"
                  fill="hsl(var(--muted-foreground))"
                  fontFamily="inherit"
                >
                  Mi {m.miles}
                </text>

                {/* Selection caret */}
                {isSelected && (
                  <polygon
                    points={`${pt.x - 5},${pt.y - rN - 3} ${pt.x + 5},${pt.y - rN - 3} ${pt.x},${pt.y - rN + 4}`}
                    fill="hsl(var(--primary))"
                    opacity="0.9"
                  />
                )}
              </g>
            );
          })}

          {/* ── YOU pulsing dot ── */}
          {youPoint && milesLogged > 0 && (
            <g>
              <circle cx={youPoint.x} cy={youPoint.y} r={8} fill="#FFD700" opacity="0.25" />
              <circle cx={youPoint.x} cy={youPoint.y} r={6} fill="#FFD700" />
              {/* YOU label */}
              <rect
                x={youPoint.x - 28}
                y={youPoint.y - 22}
                width={56}
                height={14}
                rx="7"
                fill="hsl(var(--foreground))"
                opacity="0.9"
              />
              <text
                x={youPoint.x}
                y={youPoint.y - 12}
                textAnchor="middle"
                fontSize="8"
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
      {selectedIdx !== null &&
        sorted[selectedIdx] &&
        (() => {
          const m = sorted[selectedIdx];
          const isUnlocked = effectiveMiles >= m.miles;
          const remaining = (m.miles - effectiveMiles).toFixed(1);
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
                  {m.location && <p className="text-muted-foreground text-xs mt-1">📍 {m.location}</p>}
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
