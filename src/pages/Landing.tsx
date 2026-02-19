import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin, Award, Users, Footprints, TrendingUp, BookOpen, Heart } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import StampGridBackground from "@/components/StampGridBackground";

const Landing = () => {
  const navigate = useNavigate();

  const handleLogMiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth?mode=signup");
      return;
    }
    const { data } = await supabase
      .from("user_challenges")
      .select("challenge:challenges(slug)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const challenge = data?.challenge as unknown as { slug: string | null } | null;
    if (challenge?.slug) {
      navigate(`/challenge/${challenge.slug}`);
    } else {
      navigate("/challenges");
    }
  };

  return (
    <PageLayout>
      {/* ───── 1. Hero ───── */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden w-full max-w-full">
        <StampGridBackground />

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-muted-foreground">Women's History Edition Now Live</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Every Mile</span><br />
            <span className="text-gradient-gold">Unlocks History</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Walk your way through powerful milestones, earn digital passport stamps, and build lifetime legacy miles.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/challenges">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-gold text-lg px-8 py-6">
                Start Your Journey <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary text-lg px-8 py-6">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───── 2. The Problem We're Solving ───── */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Seasoned. Strong. Still Moving.
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
            <p>Too many women believe it's too late to start.</p>
            <p>Too many feel intimidated by competitive fitness culture.</p>
            <p>Too many forget that walking alone can change everything.</p>
            <p className="text-foreground font-medium pt-2">
              LegacyFit was built for women who want movement with meaning.
            </p>
          </div>
        </div>
      </section>

      {/* ───── 3. How It Works ───── */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Transform your daily walks into a journey through history</p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Footprints, title: "Join a Challenge", desc: "Choose a themed virtual walking challenge.", to: "/challenges" },
              { icon: TrendingUp, title: "Log Your Miles", desc: "Walk at your pace. Every mile counts.", action: "log" },
              { icon: MapPin, title: "Unlock Milestones", desc: "Reveal powerful women and moments.", action: "log" },
              { icon: BookOpen, title: "Earn Stamps", desc: "Collect digital passport stamps.", to: "/passport" },
              { icon: Award, title: "Build Legacy Miles", desc: "Your miles never reset.", to: "/leaderboard" },
            ].map((step, i) => {
              const Wrapper = ({ children }: { children: React.ReactNode }) =>
                step.action === "log" ? (
                  <button key={i} onClick={handleLogMiles} className="relative text-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer w-full">
                    {children}
                  </button>
                ) : (
                  <Link key={i} to={step.to!} className="relative text-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
                    {children}
                  </Link>
                );
              return (
                <Wrapper key={i}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </Wrapper>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link to="/how-it-works">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                See Full Breakdown <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───── 4. Lifetime Legacy ───── */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            This Isn't a 30-Day Reset.<br />
            <span className="text-gradient-gold">It's a Lifetime Legacy.</span>
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>Your miles follow you.</p>
            <p>Finish one challenge at 40 miles and start the next — your journey continues at 41.</p>
            <p className="text-foreground font-medium">This is not about starting over. This is about building something that lasts.</p>
          </div>
        </div>
      </section>

      {/* ───── 5. Community / Leaderboard Teaser ───── */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Users className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Walk Together. Progress Together.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            See your lifetime miles. Celebrate consistency. Move without competition.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { emoji: "🌅", name: "First Steps", range: "1–24 mi" },
              { emoji: "🔁", name: "Steady Stride", range: "25–74 mi" },
              { emoji: "🔥", name: "Trailblazer", range: "75+ mi" },
            ].map((tier) => (
              <div key={tier.name} className="px-5 py-3 rounded-xl bg-card border border-border text-center">
                <div className="text-2xl mb-1">{tier.emoji}</div>
                <div className="text-sm font-medium text-foreground">{tier.name}</div>
                <div className="text-xs text-muted-foreground">{tier.range}</div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground italic mb-6">Walk at your pace. Every mile matters.</p>

          <Link to="/leaderboard">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
              View Leaderboard
            </Button>
          </Link>
        </div>
      </section>

      {/* ───── 6. Founder Tease ───── */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl text-center">
          <Heart className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built From Experience. Built With Purpose.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            At 53, after losing my father to cancer and maintaining my own weight loss journey, I created LegacyFit to prove that it's never too late to move with meaning.
          </p>
          <Link to="/about">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
              Read the Founder's Story
            </Button>
          </Link>
        </div>
      </section>

      {/* ───── 7. Final CTA ───── */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Your Legacy Starts With <span className="text-gradient-gold">One Mile</span>.
          </h2>
          <Link to="/challenges">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-gold text-lg px-8 py-6">
              Start Your Journey <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default Landing;
