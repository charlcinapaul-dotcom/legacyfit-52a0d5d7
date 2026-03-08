import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Search,
  Footprints,
  LogOut,
  ClipboardList,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ── types ────────────────────────────────────────────────────────────────────

interface ValidationResult {
  pass: boolean;
  errors: string[];
  warnings: string[];
  summary: Record<string, boolean>;
  challenge?: Record<string, unknown>;
  milestones?: Record<string, unknown>[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

const GROUPS: { label: string; prefix: string; description: string }[] = [
  {
    label: "Challenge Fields",
    prefix: "challenge.",
    description: "Top-level challenge row validation",
  },
  {
    label: "Milestone Structure",
    prefix: "milestones.",
    description: "Count, order index, and mileage rules",
  },
  {
    label: "Milestone 1",
    prefix: "milestone_1.",
    description: "First milestone content & uniqueness",
  },
  {
    label: "Milestone 2",
    prefix: "milestone_2.",
    description: "Second milestone content & uniqueness",
  },
  {
    label: "Milestone 3",
    prefix: "milestone_3.",
    description: "Third milestone content & uniqueness",
  },
  {
    label: "Milestone 4",
    prefix: "milestone_4.",
    description: "Fourth milestone content & uniqueness",
  },
  {
    label: "Milestone 5",
    prefix: "milestone_5.",
    description: "Fifth milestone content & uniqueness",
  },
  {
    label: "Milestone 6",
    prefix: "milestone_6.",
    description: "Sixth milestone content & uniqueness",
  },
];

function friendlyKey(key: string): string {
  return key
    .replace(/^(challenge|milestones|milestone_\d+)\./, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupEntries(summary: Record<string, boolean>) {
  return GROUPS.map((g) => ({
    ...g,
    checks: Object.entries(summary).filter(([k]) => k.startsWith(g.prefix)),
  })).filter((g) => g.checks.length > 0);
}

// ── component ────────────────────────────────────────────────────────────────

interface ImageGenResult {
  slug: string;
  success: boolean;
  url?: string;
  error?: string;
}

export default function AdminValidate() {
  const navigate = useNavigate();
  const [challengeId, setChallengeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [challenges, setChallenges] = useState<
    { id: string; title: string; slug: string | null; is_active: boolean | null }[]
  >([]);
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [imageGenResults, setImageGenResults] = useState<ImageGenResult[] | null>(null);

  // ── auth gate ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!data) {
        toast.error("Admin access required.");
        navigate("/dashboard");
        return;
      }
      setIsAdmin(true);
      setAuthChecking(false);

      // Load all challenges for the picker
      const { data: ch } = await supabase
        .from("challenges")
        .select("id, title, slug, is_active")
        .order("created_at", { ascending: false });
      setChallenges((ch as typeof challenges) ?? []);
    });
  }, [navigate]);

  // ── run validation ─────────────────────────────────────────────────────────
  const runValidation = async () => {
    if (!challengeId.trim()) {
      toast.error("Please enter or select a challenge ID.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/validate-challenge`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ challengeId: challengeId.trim() }),
      });

      const json: ValidationResult = await res.json();
      setResult(json);
    } catch (e) {
      toast.error("Failed to reach validation function.");
    } finally {
      setLoading(false);
    }
  };

  // ── loading states ─────────────────────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const grouped = result ? groupEntries(result.summary) : [];
  const totalChecks = result ? Object.keys(result.summary).length : 0;
  const passCount = result
    ? Object.values(result.summary).filter(Boolean).length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                <Footprints className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient-gold">LegacyFit</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Admin · Challenge Validator
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Challenge Validator
            </h1>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Validate a challenge against all LegacyFit platform standards before
            setting <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-xs">is_active = true</code>.
            Checks milestones, first-mile gate, audio content, stamp uniqueness, and more.
          </p>
        </div>

        {/* Input card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Challenge ID
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Paste a UUID directly, or pick from the list below.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={challengeId}
              onChange={(e) => setChallengeId(e.target.value)}
              placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
              className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              onKeyDown={(e) => e.key === "Enter" && runValidation()}
            />
            <Button
              onClick={runValidation}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? "Validating…" : "Validate"}
            </Button>
          </div>

          {/* Challenge picker */}
          {challenges.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Quick-select
              </p>
              <div className="flex flex-col gap-1.5">
                {challenges.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setChallengeId(ch.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm transition-colors border ${
                      challengeId === ch.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-transparent hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-medium">{ch.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {ch.id.slice(0, 8)}…
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-semibold ${
                          ch.is_active
                            ? "bg-green-500/15 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {ch.is_active ? "Live" : "Draft"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Overall banner */}
            <div
              className={`rounded-lg border p-5 flex items-start gap-4 ${
                result.pass
                  ? "border-green-500/30 bg-green-500/[0.07]"
                  : "border-destructive/30 bg-destructive/[0.07]"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {result.pass ? (
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                ) : (
                  <XCircle className="w-7 h-7 text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-base mb-0.5">
                  {result.pass
                    ? "All checks passed — challenge is ready to go live."
                    : `Validation failed — ${result.errors.length} error${result.errors.length !== 1 ? "s" : ""} must be resolved.`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {passCount}/{totalChecks} checks passed
                  {result.challenge
                    ? ` · "${String(result.challenge.title ?? "Unknown")}"`
                    : ""}
                  {result.challenge?.slug
                    ? ` · slug: ${result.challenge.slug}`
                    : ""}
                </p>
              </div>
              {/* Progress bar */}
              <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {Math.round((passCount / Math.max(totalChecks, 1)) * 100)}%
                </span>
                <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      result.pass ? "bg-green-500" : "bg-destructive"
                    }`}
                    style={{
                      width: `${(passCount / Math.max(totalChecks, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="bg-card border border-destructive/25 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-destructive/10 border-b border-destructive/20 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">
                    Errors ({result.errors.length})
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {result.errors.map((e, i) => (
                    <li
                      key={i}
                      className="px-4 py-3 text-sm text-foreground leading-relaxed flex gap-2.5"
                    >
                      <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="bg-card border border-yellow-500/25 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-500">
                    Warnings ({result.warnings.length})
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {result.warnings.map((w, i) => (
                    <li
                      key={i}
                      className="px-4 py-3 text-sm text-muted-foreground leading-relaxed flex gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Check groups */}
            <div className="grid gap-3">
              {grouped.map((group) => {
                const groupPass = group.checks.every(([, v]) => v);
                const passInGroup = group.checks.filter(([, v]) => v).length;
                return (
                  <div
                    key={group.prefix}
                    className="bg-card border border-border rounded-lg overflow-hidden"
                  >
                    {/* Group header */}
                    <div className="px-4 py-3 bg-secondary/40 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {groupPass ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                        <span className="text-sm font-semibold text-foreground">
                          {group.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          — {group.description}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-sm ${
                          groupPass
                            ? "bg-green-500/15 text-green-500"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {passInGroup}/{group.checks.length}
                      </span>
                    </div>

                    {/* Individual checks */}
                    <ul className="divide-y divide-border">
                      {group.checks.map(([key, passed]) => (
                        <li
                          key={key}
                          className="px-4 py-2.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            {passed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                            )}
                            <span className="text-sm text-foreground">
                              {friendlyKey(key)}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-widest flex-shrink-0 ${
                              passed ? "text-green-500" : "text-destructive"
                            }`}
                          >
                            {passed ? "Pass" : "Fail"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
