import { PageLayout } from "@/components/PageLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footprints, MapPin, Award, BookOpen, TrendingUp, Users, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: Footprints,
    title: "Join a Challenge",
    description: "Choose a themed virtual walking challenge that inspires you. Each journey follows the life of an extraordinary woman who changed the world.",
  },
  {
    icon: TrendingUp,
    title: "Log Your Miles",
    description: "Walk at your pace. Indoors or outdoors. Every mile counts. Log manually or sync with Apple Health and Google Fit.",
  },
  {
    icon: MapPin,
    title: "Unlock Milestones",
    description: "Reach milestones that reveal powerful women and meaningful moments in history. Watch them appear on your virtual map.",
  },
  {
    icon: BookOpen,
    title: "Earn Passport Stamps",
    description: "Collect beautiful digital stamps inside your Legacy Passport. Each stamp celebrates a historical achievement you've walked through.",
  },
  {
    icon: Award,
    title: "Build Lifetime Legacy Miles",
    description: "Your miles never reset. Each challenge builds on the last. Finish at 40 miles and start the next — your journey continues at 41.",
  },
  {
    icon: Users,
    title: "Show Up on the Leaderboard",
    description: "See your lifetime progress, earn consistency stars, and rise through tiers — all without competition. Progress over perfection.",
  },
];

const HowItWorks = () => (
  <PageLayout>
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          How <span className="text-gradient-gold">LegacyFit</span> Works
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Transform your daily walks into a journey through history. Here's how it works.
        </p>
      </div>

      <div className="container mx-auto max-w-3xl">
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="shrink-0 relative">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 w-px h-8 bg-border" />
                )}
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to="/challenges">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-gold text-lg px-8 py-6">
              Start Your Journey
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default HowItWorks;
