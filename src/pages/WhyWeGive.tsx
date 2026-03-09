import { PageLayout } from "@/components/PageLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Ribbon, Users, Footprints } from "lucide-react";

const WhyWeGive = () => (
  <PageLayout>
    {/* Hero */}
    <section className="py-24 px-4 text-center">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Movement With <span className="text-gradient-gold">Meaning</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          LegacyFit was built from personal loss, purpose, and a belief that every step can make an impact.
        </p>
        <Link to="/challenges">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
            Start Your Legacy Journey
          </Button>
        </Link>
      </div>
    </section>

    {/* Section 1 — The Personal Story */}
    <section className="py-16 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why We Give</h2>
        </div>
        <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p>LegacyFit was never created to be just another fitness challenge.</p>
          <p>It was built from personal loss, perseverance, and purpose.</p>
          <p>
            After losing my father to cancer, I understood something deeply — movement is a gift.
            Time is a gift. Health is a gift. And not everyone gets the same chances.
          </p>
          <p className="text-foreground font-medium">LegacyFit exists to honor that truth.</p>
          <p>
            Every challenge is a reminder that we can move with intention. That we can build strength
            at any age. That women 45+ are not slowing down — we are stepping fully into our legacy.
          </p>
          <p>
            Breast cancer has touched too many families, too many mothers, too many daughters,
            too many friends.
          </p>
          <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-6 my-6">
            <Ribbon className="w-6 h-6 text-pink-400 shrink-0 mt-1" />
            <p className="text-foreground font-medium">
              A portion of every registration is reserved for breast cancer support initiatives.
            </p>
          </div>
          <p>Because this is bigger than miles logged.</p>
          <p>Bigger than digital stamps.</p>
          <p>Bigger than a challenge.</p>
          <p className="text-foreground font-medium">It's about walking for something.</p>
          <p>It's about honoring those we've lost.</p>
          <p>It's about supporting those still fighting.</p>
          <p className="text-foreground font-medium text-xl mt-4">LegacyFit is movement with meaning.</p>
          <p>And every step makes an impact.</p>
          <p className="text-foreground italic mt-6">— Charlie</p>
        </div>
      </div>
    </section>

    {/* Section 2 — The Commitment */}
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <div className="bg-card border border-border rounded-2xl p-10">
          <Ribbon className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Commitment</h2>
          <p className="text-xl text-foreground font-medium mb-4">
            A portion of every registration is reserved for breast cancer support initiatives.
          </p>
          <p className="text-muted-foreground">
            No vague language. No hidden math. Transparent giving, every time.
          </p>
        </div>
      </div>
    </section>

    {/* Section 3 — The Impact Vision */}
    <section className="py-16 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">The Impact Vision</h2>
        </div>
        <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p>We believe in supporting women — at every age and every stage.</p>
          <p>We believe in supporting families touched by breast cancer.</p>
          <p>We believe in walking with purpose, not just for fitness, but for meaning.</p>
          <p>We believe in honoring strength at every age.</p>
        </div>
        <div className="mt-10 pt-8 border-t border-border space-y-3 text-center">
          <p className="text-foreground font-medium text-lg">Every challenge carries meaning.</p>
          <p className="text-foreground font-medium text-lg">Every registration contributes.</p>
          <p className="text-foreground font-bold text-xl">Every step matters.</p>
        </div>
      </div>
    </section>

    {/* Bottom CTA */}
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <Footprints className="w-10 h-10 text-primary mx-auto mb-6" />
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Ready to Walk With Purpose?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join a challenge and make every mile count — for yourself and for others.
        </p>
        <Link to="/challenges">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6">
            Explore Challenges
          </Button>
        </Link>
      </div>
    </section>
  </PageLayout>
);

export default WhyWeGive;
