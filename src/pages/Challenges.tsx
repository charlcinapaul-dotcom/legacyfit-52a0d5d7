import { useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ArrowRight } from "lucide-react";
import { useChallengesWithMeta, ChallengeWithMeta } from "@/hooks/useChallengesWithMeta";
import { useActiveChallenge } from "@/hooks/useActiveChallenge";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { useHasClaimedFreePreview } from "@/hooks/useHasClaimedFreePreview";

// ── helpers ──────────────────────────────────────────────────────────────────

const isNewRelease = (releaseDate: string | null): boolean => {
  if (!releaseDate) return false;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return new Date(releaseDate).getTime() > thirtyDaysAgo;
};

const getEditionKey = (edition: string): "purple" | "amber" | "pride" | "default" => {
  const lower = edition.toLowerCase();
  if (lower.includes("women")) return "purple";
  if (lower.includes("pioneer") || lower.includes("black")) return "amber";
  if (lower.includes("pride")) return "pride";
  return "default";
};

// ── Section header ────────────────────────────────────────────────────────────

function EditionHeader({ edition }: { edition: string }) {
  const lower = edition.toLowerCase();

  if (lower.includes("women")) {
    return (
      <h2 className="text-2xl font-bold mb-6" style={{ color: "#C084FC" }}>
        {edition}
      </h2>
    );
  }
  if (lower.includes("pioneer") || lower.includes("black")) {
    return (
      <h2
        className="text-2xl font-bold mb-6"
        style={{
          background: "linear-gradient(90deg, #b45309, #d97706, #92400e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {edition}
      </h2>
    );
  }
  if (lower.includes("pride")) {
    return (
      <h2
        className="text-2xl font-bold mb-6"
        style={{
          background:
            "linear-gradient(90deg, #C94F7C, #E07A5F, #D4A373, #6C9A8B, #4A90A4, #6D597A)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {edition}
      </h2>
    );
  }
  return <h2 className="text-2xl font-bold text-foreground mb-6">{edition}</h2>;
}

// ── Continue Your Journey card ────────────────────────────────────────────────

function ContinueJourneyCard() {
  const { data: activeChallenge } = useActiveChallenge();

  if (!activeChallenge || activeChallenge.isCompleted) return null;

  const pct = Math.min(
    100,
    Math.round((activeChallenge.milesLogged / activeChallenge.totalMiles) * 100)
  );

  return (
    <section className="pb-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-xl font-bold text-foreground mb-4">Continue Your Journey</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {activeChallenge.imageUrl && (
              <div className="md:w-48 w-full h-36 md:h-auto flex-shrink-0 overflow-hidden">
                <img
                  src={activeChallenge.imageUrl}
                  alt={activeChallenge.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col justify-between p-5 flex-1 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Active Challenge
                </p>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {activeChallenge.title}
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{activeChallenge.milesLogged} miles logged</span>
                    <span>{activeChallenge.totalMiles} total</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{pct}% complete</span>
                <Link to={`/challenge/${activeChallenge.slug}`}>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-semibold hover:opacity-90 gap-1"
                  >
                    Continue Walking <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const Challenges = () => {
  const { data: challenges = [], isLoading, isError, refetch } = useChallengesWithMeta();
  const { data: activeChallenge } = useActiveChallenge();
  const { hasClaimed: freePreviewClaimed } = useHasClaimedFreePreview();

  const active = challenges.filter((c) => c.is_active);
  const past = challenges.filter((c) => !c.is_active);

  // Section 2: Featured
  const featured = active.filter((c) => c.featured);

  // Section 3: New (by release_date, limit 4)
  const newChallenges = active
    .slice()
    .sort((a, b) => {
      const da = a.release_date ? new Date(a.release_date).getTime() : 0;
      const db = b.release_date ? new Date(b.release_date).getTime() : 0;
      return db - da;
    })
    .slice(0, 4);

  // Section 4: Browse by category, then by edition fallback
  const byEdition: Record<string, ChallengeWithMeta[]> = {};
  for (const c of active) {
    const key = c.category ?? c.edition ?? "All Challenges";
    if (!byEdition[key]) byEdition[key] = [];
    byEdition[key].push(c);
  }

  // Preferred edition display order
  const editionOrder = [
    "Women's History",
    "First Steps: Black Pioneers",
    "Pride",
  ];
  const sortedEditionKeys = Object.keys(byEdition).sort((a, b) => {
    const ai = editionOrder.findIndex((e) =>
      a.toLowerCase().includes(e.toLowerCase().split(" ")[0])
    );
    const bi = editionOrder.findIndex((e) =>
      b.toLowerCase().includes(e.toLowerCase().split(" ")[0])
    );
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your <span className="text-gradient-gold">Journey</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Each challenge follows the life of an inspiring figure. Log your miles to unlock
            historical milestones and earn exclusive passport stamps.
          </p>
        </div>
      </section>

      {/* Free Mile Strip */}
      <div className="w-full bg-primary py-5 px-4 text-center">
        <p className="text-lg font-bold text-primary-foreground">
          {freePreviewClaimed
            ? "Start your journey from $12.99"
            : "Your first mile is always free — no credit card needed."}
        </p>
      </div>

      {/* Coming Soon Banner */}
      <section className="pb-6 px-4 pt-6">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground text-center">
            Explorer and Legacy passes coming soon — unlock multiple challenges at one price.
            New editions added monthly.
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-5xl text-muted-foreground">
            Loading challenges...
          </div>
        </section>
      ) : isError ? (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-5xl text-center py-12">
            <p className="text-muted-foreground mb-4">
              Unable to load challenges. Please try again.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </section>
      ) : (
        <>
          {/* Section 1 — Continue Your Journey */}
          <ContinueJourneyCard />

          {/* Section 2 — Featured Challenges */}
          {featured.length > 0 && (
            <section className="pb-12 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  ✦ Featured Challenges
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featured.map((c) => (
                    <ChallengeCard
                      key={c.id}
                      c={c}
                      activeChallenge={activeChallenge}
                      showNewBadge={isNewRelease(c.release_date)}
                      accentColor={getEditionKey(c.edition)}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Section 3 — New Challenges */}
          {newChallenges.length > 0 && (
            <section className="pb-12 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-2xl font-bold text-foreground mb-6">New Challenges</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {newChallenges.map((c) => (
                    <ChallengeCard
                      key={c.id}
                      c={c}
                      activeChallenge={activeChallenge}
                      showNewBadge={isNewRelease(c.release_date)}
                      accentColor={getEditionKey(c.edition)}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Section 4 — Browse by Category / Edition */}
          <section className="pb-12 px-4">
            <div className="container mx-auto max-w-5xl">
              <h2 className="text-2xl font-bold text-foreground mb-8">Browse by Category</h2>
              <div className="space-y-12">
                {sortedEditionKeys.map((key) => {
                  const group = byEdition[key];
                  if (!group || group.length === 0) return null;
                  return (
                    <div key={key}>
                      <EditionHeader edition={key} />
                      <div className="grid md:grid-cols-2 gap-6">
                        {group.map((c) => (
                          <ChallengeCard
                            key={c.id}
                            c={c}
                            activeChallenge={activeChallenge}
                            showNewBadge={isNewRelease(c.release_date)}
                            accentColor={getEditionKey(c.edition)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Past Editions */}
          {past.length > 0 && (
            <section className="pb-20 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-2xl font-bold text-foreground mb-6">Past Editions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {past.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl bg-card border border-border p-6 opacity-70"
                    >
                      {c.image_url && (
                        <div className="w-full aspect-[16/7] overflow-hidden rounded-lg mb-4">
                          <img
                            src={c.image_url}
                            alt={c.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {c.edition}
                      </p>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{c.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {c.description}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {c.total_miles} miles
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Challenges;
