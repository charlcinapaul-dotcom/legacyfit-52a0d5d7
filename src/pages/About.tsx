import { PageLayout } from "@/components/PageLayout";
import { Heart, Ribbon, Footprints, Users } from "lucide-react";

const About = () => (
  <PageLayout>
    {/* Hero */}
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
          Why I Built <span className="text-gradient-gold">LegacyFit</span>
        </h1>

        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>I'm 53 years old.</p>
          <p>
            I've maintained my weight loss. I've rebuilt my strength.
            And I know what it feels like to believe it might be too late.
          </p>
          <p>LegacyFit was born from a simple truth:</p>
          <blockquote className="border-l-4 border-primary pl-6 py-2 text-foreground italic text-xl">
            Seasoned. Strong. Still moving. And just getting started.
          </blockquote>
        </div>
      </div>
    </section>

    {/* Turning Point */}
    <section className="py-16 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Footprints className="w-8 h-8 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">The Turning Point</h2>
        </div>
        <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p>I didn't create LegacyFit to compete with fitness apps.</p>
          <p>I created it because I wanted women 45 and older to see what's possible.</p>
          <p>
            To see that walking matters. That consistency matters. That showing up three days a week matters.
          </p>
          <p>
            You don't have to run marathons. You don't have to lift the heaviest weights.
          </p>
          <p className="text-foreground font-medium">You just have to move.</p>
        </div>
      </div>
    </section>

    {/* Honoring My Why */}
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-8 h-8 text-destructive" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Honoring My Why</h2>
        </div>
        <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p>LegacyFit is also personal.</p>
          <p>My father passed away from cancer.</p>
          <p>That loss changed how I look at time, health, and legacy.</p>
          <p>
            Movement is not just about miles. It's about honoring the body we've been given.
          </p>
          <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-6 mt-6">
            <Ribbon className="w-6 h-6 text-pink-400 shrink-0 mt-1" />
            <p className="text-muted-foreground">
              Part of this platform is built in recognition of breast cancer awareness — because resilience
              deserves to be remembered. Every challenge carries meaning. Every mile carries purpose.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Why Women 45+ */}
    <section className="py-16 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-accent" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why Women 45+</h2>
        </div>
        <div className="space-y-5 text-lg text-muted-foreground leading-relaxed">
          <p className="text-foreground font-medium text-xl">Because we are not done.</p>
          <p>We are rebuilding. We are rediscovering. We are redefining strength.</p>
          <p>LegacyFit is not about shrinking yourself.</p>
          <p className="text-foreground font-medium">It's about expanding your story.</p>
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">The Mission</h2>
        <p className="text-lg text-muted-foreground mb-6">LegacyFit exists to help women:</p>
        <ul className="space-y-3 text-lg text-muted-foreground">
          {[
            "Move consistently",
            "Build confidence",
            "Learn through history",
            "Walk with purpose",
            "Create lifetime legacy miles",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-lg text-muted-foreground mt-6">
          Not for competition. Not for comparison. But for community and commitment.
        </p>
      </div>
    </section>

    {/* Closing */}
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-3xl text-center">
        <p className="text-xl text-muted-foreground mb-4">
          If you've ever wondered whether it's too late…
        </p>
        <p className="text-3xl font-bold text-foreground mb-2">It's not.</p>
        <p className="text-lg text-muted-foreground">
          Your legacy doesn't start with perfection. It starts with one mile.
        </p>
      </div>
    </section>
  </PageLayout>
);

export default About;
