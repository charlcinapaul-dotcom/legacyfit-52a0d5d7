import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import legacyfitLogo from "@/assets/legacyfit-logo.png";

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

  useEffect(() => {
    supabase
      .from("challenges")
      .select("id, title, slug, description, total_miles, edition, is_active, image_url")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setChallenges(data ?? []);
        setLoading(false);
      });
  }, []);

  const active = challenges.filter((c) => c.is_active);
  const past = challenges.filter((c) => !c.is_active);

  // Group active challenges by visual heading
  const womensHistory = active.filter((c) => c.slug !== "pride");
  const pride = active.filter((c) => c.slug === "pride");

  const ChallengeCard = ({ c }: { c: Challenge }) => (
    <Link
      key={c.id}
      to={`/challenge/${c.slug}`}
      className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-colors p-6"
    >
      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {c.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{c.total_miles} miles</span>
      </div>
      <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );

  const WomensHistoryCard = ({ c }: { c: Challenge }) => (
    <Link
      key={c.id}
      to={`/challenge/${c.slug}`}
      className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-[#C084FC] transition-colors p-6"
      style={{ boxShadow: 'none' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(192, 132, 252, 0.3)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-[#C084FC] transition-colors">
        {c.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{c.total_miles} miles</span>
      </div>
      <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-muted-foreground group-hover:text-[#C084FC] transition-colors" />
    </Link>
  );

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

      {loading ? (
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-5xl text-muted-foreground">Loading challenges...</div>
        </section>
      ) : (
        <>
          {/* Women's History Edition */}
          {womensHistory.length > 0 && (
            <section className="pb-16 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-2xl font-bold mb-6">
                  <span style={{ color: '#C084FC' }}>Women's History Edition</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {womensHistory.map((c) => (
                    <WomensHistoryCard key={c.id} c={c} />
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
                    background: 'linear-gradient(90deg, #C94F7C, #E07A5F, #D4A373, #6C9A8B, #4A90A4, #6D597A)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>Pride Edition</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {pride.map((c) => (
                    <ChallengeCard key={c.id} c={c} />
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
