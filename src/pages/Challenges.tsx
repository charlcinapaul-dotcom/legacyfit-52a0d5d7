import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveChallenge } from "@/hooks/useActiveChallenge";

interface Challenge {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  total_miles: number;
  edition: string;
  is_active: boolean | null;
  image_url: string | null;
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { data: activeChallenge } = useActiveChallenge();

  const fetchChallenges = () => {
    setLoading(true);
    setError(false);

    const timeout = setTimeout(() => {
      setLoading(false);
      setError(true);
    }, 12000);

    supabase
      .from("challenges")
      .select("id, title, slug, description, total_miles, edition, is_active, image_url")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        clearTimeout(timeout);
        if (fetchError) {
          console.error("Error fetching challenges:", fetchError);
          setError(true);
        } else {
          setChallenges(data ?? []);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const active = challenges.filter((c) => c.is_active);
  const past = challenges.filter((c) => !c.is_active);

  // Section groupings
  const womensHistory = active.filter(
    (c) => c.slug !== "pride" && !c.edition.toLowerCase().includes("first steps: black pioneers")
  );
  const pride = active.filter((c) => c.slug === "pride");
  const pioneers = active.filter((c) => c.edition.toLowerCase().includes("first steps: black pioneers"));

  // ── Card components ──────────────────────────────────────────────

  const WomensHistoryCard = ({ c }: { c: Challenge }) => {
    const isCurrentChallenge = activeChallenge?.challengeId === c.id;
    const isLocked = !!activeChallenge && !activeChallenge.isCompleted && !isCurrentChallenge;

    const Wrapper = isLocked ? "div" : Link;
    const wrapperProps = isLocked
      ? { className: "group relative overflow-hidden rounded-xl bg-card border border-border p-6 opacity-50 cursor-not-allowed" }
      : {
          to: `/challenge/${c.slug}`,
          className: "group relative overflow-hidden rounded-xl bg-card border border-border hover:border-[#C084FC] transition-colors p-6",
          style: { boxShadow: "none" } as React.CSSProperties,
          onMouseEnter: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(192, 132, 252, 0.3)"; },
          onMouseLeave: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; },
        };

    return (
      <Wrapper key={c.id} {...(wrapperProps as any)}>
        <h3 className="text-xl font-semibold text-foreground mb-2 pr-20 group-hover:text-[#C084FC] transition-colors">
          {c.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{c.total_miles} miles</span>
        </div>
        {isCurrentChallenge && (
          <span className="absolute top-6 right-6 text-xs font-medium px-2 py-1 rounded-full bg-[#C084FC]/10 text-[#C084FC] border border-[#C084FC]/20">
            Active
          </span>
        )}
        {isLocked && (
          <span className="absolute top-6 right-6 text-xs text-muted-foreground">Locked</span>
        )}
        {!isLocked && !isCurrentChallenge && (
          <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-muted-foreground group-hover:text-[#C084FC] transition-colors" />
        )}
      </Wrapper>
    );
  };

  const PrideCard = ({ c }: { c: Challenge }) => {
    const isCurrentChallenge = activeChallenge?.challengeId === c.id;
    const isLocked = !!activeChallenge && !activeChallenge.isCompleted && !isCurrentChallenge;

    const Wrapper = isLocked ? "div" : Link;
    const wrapperProps = isLocked
      ? { className: "group relative overflow-hidden rounded-xl bg-card border border-border p-6 opacity-50 cursor-not-allowed" }
      : { to: `/challenge/${c.slug}`, className: "group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-colors p-6" };

    return (
      <Wrapper key={c.id} {...(wrapperProps as any)}>
        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {c.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{c.total_miles} miles</span>
        </div>
        {isCurrentChallenge && (
          <span className="absolute top-6 right-6 text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Active
          </span>
        )}
        {isLocked && (
          <span className="absolute top-6 right-6 text-xs text-muted-foreground">Locked</span>
        )}
        {!isLocked && !isCurrentChallenge && (
          <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </Wrapper>
    );
  };

  const PioneersCard = ({ c }: { c: Challenge }) => {
    const isCurrentChallenge = activeChallenge?.challengeId === c.id;
    const isLocked = !!activeChallenge && !activeChallenge.isCompleted && !isCurrentChallenge;

    const Wrapper = isLocked ? "div" : Link;
    const wrapperProps = isLocked
      ? { className: "group relative overflow-hidden rounded-xl bg-card border border-border p-6 opacity-50 cursor-not-allowed" }
      : {
          to: `/challenge/${c.slug}`,
          className: "group relative overflow-hidden rounded-xl bg-card border border-border hover:border-amber-700/50 transition-colors p-6",
          style: { boxShadow: "none" } as React.CSSProperties,
          onMouseEnter: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(180, 83, 9, 0.25)"; },
          onMouseLeave: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; },
        };

    return (
      <Wrapper key={c.id} {...(wrapperProps as any)}>
        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-amber-600 transition-colors">
          {c.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{c.total_miles} miles</span>
        </div>
        {isCurrentChallenge && (
          <span className="absolute top-6 right-6 text-xs font-medium px-2 py-1 rounded-full bg-amber-700/10 text-amber-600 border border-amber-700/20">
            Active
          </span>
        )}
        {isLocked && (
          <span className="absolute top-6 right-6 text-xs text-muted-foreground">Locked</span>
        )}
        {!isLocked && !isCurrentChallenge && (
          <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-muted-foreground group-hover:text-amber-600 transition-colors" />
        )}
      </Wrapper>
    );
  };

  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your <span className="text-gradient-gold">Journey</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Each challenge follows the life of an inspiring figure. Log your miles to unlock historical milestones and earn exclusive passport stamps.
          </p>
        </div>
      </section>

      {/* Free Mile Strip */}
      <div className="w-full bg-primary py-5 px-4 text-center">
        <p className="text-lg font-bold text-primary-foreground">Your first mile is always free — no credit card needed.</p>
      </div>

      {/* Coming Soon Banner */}
      <section className="pb-6 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground text-center">
            Explorer and Legacy passes coming soon — unlock multiple challenges at one price. New editions added monthly.
          </div>
        </div>
      </section>

      {loading ? (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-5xl text-muted-foreground">Loading challenges...</div>
        </section>
      ) : error ? (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-5xl text-center py-12">
            <p className="text-muted-foreground mb-4">Unable to load challenges. Please try again.</p>
            <Button variant="outline" onClick={fetchChallenges}>Retry</Button>
          </div>
        </section>
      ) : (
        <>
          {/* Women's History Edition */}
          {womensHistory.length > 0 && (
            <section className="pb-16 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-2xl font-bold mb-6">
                  <span style={{ color: "#C084FC" }}>Women's History Edition</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {womensHistory.map((c) => (
                    <WomensHistoryCard key={c.id} c={c} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* First Black Pioneers Edition */}
          {pioneers.length > 0 && (
            <section className="pb-16 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-2xl font-bold mb-6">
                  <span style={{
                    background: "linear-gradient(90deg, #b45309, #d97706, #92400e)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>First Steps: Black Pioneers Edition</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {pioneers.map((c) => (
                    <PioneersCard key={c.id} c={c} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Pride Edition */}
          {pride.length > 0 && (
            <section className="pb-16 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-2xl font-bold mb-6">
                  <span style={{
                    background: "linear-gradient(90deg, #C94F7C, #E07A5F, #D4A373, #6C9A8B, #4A90A4, #6D597A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>Pride Edition</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {pride.map((c) => (
                    <PrideCard key={c.id} c={c} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Past Editions */}
          {past.length > 0 && (
            <section className="pb-20 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-2xl font-bold text-foreground mb-6">Past Editions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {past.map((c) => (
                    <div key={c.id} className="rounded-xl bg-card border border-border p-6 opacity-70">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{c.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{c.total_miles} miles</span>
                      </div>
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
