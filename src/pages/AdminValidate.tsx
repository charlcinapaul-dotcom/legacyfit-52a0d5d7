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
  Award,
  LayoutDashboard,
  Volume2,
  FileText,
  Stamp,
  Radio,
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
  slug?: string;
  milestoneId?: string;
  title?: string;
  success: boolean;
  url?: string;
  error?: string;
}

interface ReadinessRow {
  id: string;
  title: string;
  slug: string | null;
  edition: string;
  is_active: boolean | null;
  stripe_price_id: string | null;
  milestone_count: number;
  has_historical_event_count: number;
  has_audio_count: number;
  has_stamp_image_count: number;
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
  const [stampGenLoading, setStampGenLoading] = useState(false);
  const [stampGenResults, setStampGenResults] = useState<ImageGenResult[] | null>(null);
  const [readiness, setReadiness] = useState<ReadinessRow[]>([]);
  const [readinessLoading, setReadinessLoading] = useState(false);

  // ── readiness loader ───────────────────────────────────────────────────────
  const loadReadiness = async () => {
    setReadinessLoading(true);
    const { data: chs } = await supabase
      .from("challenges")
      .select("id, title, slug, edition, is_active, stripe_price_id")
      .order("edition")
      .order("title");

    if (!chs) { setReadinessLoading(false); return; }

    const [{ data: milestones }, { data: stampImages }] = await Promise.all([
      supabase.from("milestones").select("id, challenge_id, historical_event, audio_url"),
      supabase.from("passport_stamp_images").select("id, milestone_id"),
    ]);

    const stampMilestoneIds = new Set((stampImages ?? []).map((s) => s.milestone_id));

    const rows: ReadinessRow[] = chs.map((c) => {
      const ms = (milestones ?? []).filter((m) => m.challenge_id === c.id);
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        edition: c.edition,
        is_active: c.is_active,
        stripe_price_id: c.stripe_price_id ?? null,
        milestone_count: ms.length,
        has_historical_event_count: ms.filter((m) => m.historical_event).length,
        has_audio_count: ms.filter((m) => m.audio_url).length,
        has_stamp_image_count: ms.filter((m) => stampMilestoneIds.has(m.id)).length,
      };
    });

    setReadiness(rows);
    setReadinessLoading(false);
  };

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

      // Load all challenges for the picker + readiness data in parallel
      const [{ data: ch }] = await Promise.all([
        supabase.from("challenges").select("id, title, slug, is_active").order("created_at", { ascending: false }),
        loadReadiness(),
      ]);
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

  // ── generate challenge images ───────────────────────────────────────────────
  const generateImages = async () => {
    setImageGenLoading(true);
    setImageGenResults(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/generate-challenge-images`;

      toast.info("Image generation started — this may take several minutes…");

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Image generation failed.");
        return;
      }
      setImageGenResults(json.results ?? []);
      const successCount = (json.results ?? []).filter((r: ImageGenResult) => r.success).length;
      toast.success(`Done! ${successCount} image(s) generated or already present.`);
    } catch (e) {
      toast.error("Failed to reach image generation function.");
    } finally {
      setImageGenLoading(false);
    }
  };

  // ── generate passport stamps ───────────────────────────────────────────────
  const generateStamps = async () => {
    setStampGenLoading(true);
    setStampGenResults(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/generate-all-stamps`;

      toast.info("Stamp generation started — this may take several minutes…");

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ limit: 10 }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Stamp generation failed.");
        return;
      }
      setStampGenResults(json.results ?? []);
      const successCount = (json.results ?? []).filter((r: ImageGenResult) => r.success).length;
      toast.success(`Done! ${successCount} stamp(s) generated.`);
    } catch {
      toast.error("Failed to reach stamp generation function.");
    } finally {
      setStampGenLoading(false);
    }
  };

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

      <main className="container mx-auto px-4 py-10 max-w-4xl">

        {/* ── Readiness Dashboard ─────────────────────────────────────────── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Challenge Readiness</h1>
            </div>
            <button
              onClick={loadReadiness}
              disabled={readinessLoading}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              {readinessLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
              {readinessLoading ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {readinessLoading && readiness.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-6">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading readiness data…
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-3 px-4 py-2.5 bg-secondary/40 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <span>Challenge</span>
                <span className="text-center w-16">Narration</span>
                <span className="text-center w-14">Audio</span>
                <span className="text-center w-14">Stamps</span>
                <span className="text-center w-16">Milestones</span>
                <span className="text-center w-14">Status</span>
              </div>

              {/* Group by edition */}
              {(["Women's History", "First Steps: Black Pioneers", "Pride"] as string[]).map((edition) => {
                const rows = readiness.filter((r) => r.edition === edition);
                if (rows.length === 0) return null;

                const editionColor =
                  edition === "Women's History"
                    ? "text-[#C084FC]"
                    : edition === "First Steps: Black Pioneers"
                    ? "text-amber-600"
                    : "text-pink-400";

                return (
                  <div key={edition}>
                    <div className={`px-4 py-2 border-b border-border bg-secondary/20 text-xs font-bold uppercase tracking-widest ${editionColor}`}>
                      {edition}
                    </div>
                    {rows.map((row, i) => {
                      const allNarration = row.has_historical_event_count === row.milestone_count && row.milestone_count > 0;
                      const allAudio = row.has_audio_count === row.milestone_count && row.milestone_count > 0;
                      const allStamps = row.has_stamp_image_count === row.milestone_count && row.milestone_count > 0;
                      const correctCount = row.milestone_count === 6;

                      const Dot = ({ ok, partial }: { ok: boolean; partial?: boolean }) =>
                        ok ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : partial ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        );

                      return (
                        <div
                          key={row.id}
                          className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-3 px-4 py-3 text-sm ${
                            i < rows.length - 1 ? "border-b border-border" : ""
                          }`}
                        >
                          {/* Title + slug */}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{row.title}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{row.slug}</p>
                          </div>

                          {/* Narration */}
                          <div className="w-16 flex flex-col items-center gap-0.5">
                            <Dot ok={allNarration} />
                            <span className="text-[10px] text-muted-foreground">
                              {row.has_historical_event_count}/{row.milestone_count}
                            </span>
                          </div>

                          {/* Audio */}
                          <div className="w-14 flex flex-col items-center gap-0.5">
                            <Dot
                              ok={allAudio}
                              partial={row.has_audio_count > 0 && !allAudio}
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {row.has_audio_count}/{row.milestone_count}
                            </span>
                          </div>

                          {/* Stamps */}
                          <div className="w-14 flex flex-col items-center gap-0.5">
                            <Dot
                              ok={allStamps}
                              partial={row.has_stamp_image_count > 0 && !allStamps}
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {row.has_stamp_image_count}/{row.milestone_count}
                            </span>
                          </div>

                          {/* Milestone count */}
                          <div className="w-16 flex flex-col items-center gap-0.5">
                            <Dot ok={correctCount} />
                            <span className="text-[10px] text-muted-foreground">{row.milestone_count}/6</span>
                          </div>

                          {/* Active status */}
                          <div className="w-14 flex justify-center">
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold ${
                              row.is_active
                                ? "bg-green-500/15 text-green-500"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {row.is_active ? "Live" : "Draft"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Summary footer */}
              {readiness.length > 0 && (
                <div className="px-4 py-3 bg-secondary/20 border-t border-border flex items-center gap-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Narration: {readiness.filter(r => r.has_historical_event_count === r.milestone_count && r.milestone_count > 0).length}/{readiness.length} complete
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    Audio: {readiness.filter(r => r.has_audio_count === r.milestone_count && r.milestone_count > 0).length}/{readiness.length} complete
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Stamp className="w-3.5 h-3.5" />
                    Stamps: {readiness.filter(r => r.has_stamp_image_count === r.milestone_count && r.milestone_count > 0).length}/{readiness.length} complete
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Validator ────────────────────────────────────────────────────── */}
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

        {/* ── Generate Challenge Images ──────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <ImagePlus className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Generate Challenge Images</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            Generates AI hero backdrop images for all challenges that are currently missing one.
            Challenges that already have an <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-xs">image_url</code> are skipped.
            This may take several minutes.
          </p>

          <Button
            onClick={generateImages}
            disabled={imageGenLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            {imageGenLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4" />
            )}
            {imageGenLoading ? "Generating images…" : "Generate Missing Images"}
          </Button>

          {imageGenResults && (
            <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-secondary/40 border-b border-border flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Results — {imageGenResults.filter(r => r.success).length}/{imageGenResults.length} successful
                </span>
              </div>
              <ul className="divide-y divide-border">
                {imageGenResults.map((r) => (
                  <li key={r.slug} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      {r.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                      )}
                      <span className="font-mono text-foreground">{r.slug}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.success && r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline underline-offset-2 truncate max-w-[180px]"
                        >
                          View image
                        </a>
                      ) : r.error ? (
                        <span className="text-xs text-destructive truncate max-w-[220px]">{r.error}</span>
                      ) : null}
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-semibold ${
                        r.success ? "bg-green-500/15 text-green-500" : "bg-destructive/15 text-destructive"
                      }`}>
                        {r.success ? "OK" : "FAIL"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Generate Passport Stamps ──────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Generate Passport Stamps</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-1">
            Generates AI vintage circular passport stamps for all 13 Black Pioneers challenge milestones
            that are currently missing one. Each stamp features a double outer ring, wheat/laurel wreath,
            bold name, location subtitle, mileage banner, and worn vintage ink look.
          </p>
          <p className="text-muted-foreground text-xs mb-5">
            Runs in batches of 10 — click multiple times to complete all 78 milestones.
            Already-stamped milestones are skipped automatically.
          </p>

          <Button
            onClick={generateStamps}
            disabled={stampGenLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            {stampGenLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Award className="w-4 h-4" />
            )}
            {stampGenLoading ? "Generating stamps…" : "Generate Missing Stamps (batch of 10)"}
          </Button>

          {stampGenResults && (
            <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-secondary/40 border-b border-border flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Results — {stampGenResults.filter((r) => r.success).length}/{stampGenResults.length} successful
                </span>
              </div>
              <ul className="divide-y divide-border">
                {stampGenResults.map((r) => (
                  <li key={r.slug ?? r.milestoneId} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2.5">
                      {r.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-foreground">{r.title ?? r.slug}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.success && r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline underline-offset-2 truncate max-w-[180px]"
                        >
                          View stamp
                        </a>
                      ) : r.error ? (
                        <span className="text-xs text-destructive truncate max-w-[220px]">{r.error}</span>
                      ) : null}
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-semibold ${
                        r.success ? "bg-green-500/15 text-green-500" : "bg-destructive/15 text-destructive"
                      }`}>
                        {r.success ? "OK" : "FAIL"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
