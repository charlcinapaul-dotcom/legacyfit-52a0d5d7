import { Link } from "react-router-dom";
import { MapPin, ChevronRight, Footprints, Lock } from "lucide-react";
import { toast } from "sonner";
import { ChallengeWithMeta } from "@/hooks/useChallengesWithMeta";
import { ActiveChallenge } from "@/hooks/useActiveChallenge";
import { Badge } from "@/components/ui/badge";

interface ChallengeCardProps {
  c: ChallengeWithMeta;
  activeChallenge?: ActiveChallenge | null;
  showNewBadge?: boolean;
  /** accent color class for hover border/text */
  accentColor?: "purple" | "amber" | "pride" | "forest" | "default";
}

const ACCENT = {
  purple: {
    border: "hover:border-[#C084FC]",
    text: "group-hover:text-[#C084FC]",
    badge: "bg-[#C084FC]/10 text-[#C084FC] border-[#C084FC]/20",
    chevron: "group-hover:text-[#C084FC]",
    shadow: "0 0 20px rgba(192, 132, 252, 0.3)",
  },
  amber: {
    border: "hover:border-amber-500/60",
    text: "group-hover:text-amber-500",
    badge: "bg-amber-700/10 text-amber-600 border-amber-700/20",
    chevron: "group-hover:text-amber-500",
    shadow: "0 0 20px rgba(180, 83, 9, 0.25)",
  },
  pride: {
    border: "hover:border-purple-400/50",
    text: "group-hover:text-primary",
    badge: "bg-primary/10 text-primary border-primary/20",
    chevron: "group-hover:text-primary",
    shadow: "none",
  },
  forest: {
    border: "hover:border-[#2D7A4F]",
    text: "group-hover:text-[#2D7A4F]",
    badge: "bg-[#1A4A2E]/15 text-[#2D7A4F] border-[#2D7A4F]/30",
    chevron: "group-hover:text-[#2D7A4F]",
    shadow: "0 0 20px rgba(45, 122, 79, 0.3)",
  },
  default: {
    border: "hover:border-primary/50",
    text: "group-hover:text-primary",
    badge: "bg-primary/10 text-primary border-primary/20",
    chevron: "group-hover:text-primary",
    shadow: "none",
  },
} as const;

export function ChallengeCard({
  c,
  activeChallenge,
  showNewBadge = false,
  accentColor = "default",
}: ChallengeCardProps) {
  const isCurrentChallenge = activeChallenge?.challengeId === c.id;
  const isLocked =
    !!activeChallenge && !activeChallenge.isCompleted && !isCurrentChallenge;
  const a = ACCENT[accentColor];

  const handleLockedClick = () => {
    if (isLocked) {
      toast("Complete your active challenge to unlock this one.", {
        description: `Finish "${activeChallenge?.title}" first.`,
      });
    }
  };

  const cardBase =
    "group relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-200";

  const inner = (
    <>
      {/* Cover image */}
      {c.image_url && (
        <div className="relative w-full aspect-[16/7] overflow-hidden">
          <img
            src={c.image_url}
            alt={c.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          {/* New badge overlay */}
          {showNewBadge && (
            <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow">
              New
            </span>
          )}
          {/* Stamp preview overlay */}
          {c.first_stamp_image && (
            <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden shadow-lg bg-card/80">
              <img
                src={c.first_stamp_image}
                alt="First stamp preview"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}

      {/* Card body */}
      <div className="p-5">
        {/* Edition label */}
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">
          {c.edition}
        </p>

        {/* Title */}
        <h3
          className={`text-lg font-semibold text-foreground mb-1 pr-8 transition-colors ${a.text}`}
        >
          {c.title}
        </h3>

        {/* Description */}
        {c.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {c.description}
          </p>
        )}

        {/* Featured quote */}
        {c.featured_quote && (
          <blockquote className="border-l-2 border-primary/40 pl-3 mb-3 italic text-sm text-muted-foreground">
            "{c.featured_quote}"
            {c.featured_quote_attribution && (
              <span className="block text-xs not-italic mt-0.5 text-muted-foreground/70">
                — {c.featured_quote_attribution}
              </span>
            )}
          </blockquote>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {c.total_miles} miles
          </span>
          {(c.milestone_count ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5" />
              {c.milestone_count} milestones
            </span>
          )}
          {c.difficulty && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {c.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Status badge / chevron */}
      {isCurrentChallenge && (
        <span
          className={`absolute top-4 right-4 text-xs font-medium px-2 py-1 rounded-full border ${a.badge}`}
        >
          Active
        </span>
      )}
      {isLocked && (
        <span className="absolute top-4 right-4 flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
        </span>
      )}
      {!isLocked && !isCurrentChallenge && (
        <ChevronRight
          className={`absolute top-4 right-4 w-5 h-5 text-muted-foreground transition-colors ${a.chevron}`}
        />
      )}
    </>
  );

  if (isLocked) {
    return (
      <div
        className={`${cardBase} opacity-50 cursor-not-allowed`}
        onClick={handleLockedClick}
        title={`Finish "${activeChallenge?.title}" to unlock`}
      >
        {inner}
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-xs text-muted-foreground italic">
            Finish "{activeChallenge?.title}" to unlock
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/challenge/${c.slug}`}
      className={`${cardBase} ${a.border}`}
      style={{ boxShadow: "none" }}
      onMouseEnter={(e) => {
        if (a.shadow !== "none")
          (e.currentTarget as HTMLElement).style.boxShadow = a.shadow;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {inner}
    </Link>
  );
}
