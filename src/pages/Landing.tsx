import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Award, Users, BookOpen, Footprints } from "lucide-react";
import legacyfitLogo from "@/assets/legacyfit-logo.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient-gold">LegacyFit Virtual Challenge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Sign In
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
        
        {/* Animated glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-muted-foreground">Women's History Edition Now Live</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Every Mile</span>
            <br />
            <span className="text-gradient-gold">Unlocks History</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Walk, run, or jog your way through historical milestones. Earn digital passport stamps, 
            unlock virtual map locations, and collect exclusive legacy coins.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-gold text-lg px-8 py-6">
                Start Your Journey
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary text-lg px-8 py-6">
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "10K+", label: "Miles Logged" },
              { value: "500+", label: "Active Walkers" },
              { value: "50+", label: "Milestones" },
              { value: "3", label: "Editions" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient-cyan">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Transform your daily walks into a journey through history
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Footprints,
                title: "Log Your Miles",
                description: "Track your walking, running, or jogging miles manually or sync with Apple Health and Google Fit.",
              },
              {
                icon: MapPin,
                title: "Unlock Milestones",
                description: "As you progress, unlock historical milestones and see them appear on your virtual map.",
              },
              {
                icon: Award,
                title: "Earn Your Legacy",
                description: "Collect digital passport stamps and earn exclusive legacy coins - both digital and physical.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Challenge */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-card to-secondary border border-border p-8 md:p-12">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <span className="text-xs font-medium text-primary">FEATURED CHALLENGE</span>
                </div>

                <img src={legacyfitLogo} alt="LegacyFit Virtual Challenge" className="w-full max-w-xl mb-6" />
                
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Women's History Edition
                </h2>

                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                  Walk in the footsteps of extraordinary women who changed the world. 
                  From Malala Yousafzai to Eleanor Roosevelt, unlock their stories one mile at a time.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  {["Malala Yousafzai", "Wilma Rudolph", "Eleanor Roosevelt", "+ More"].map((name, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-full bg-secondary border border-border text-sm text-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>

                <Link to="/auth?mode=signup">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Join This Challenge
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto text-center">
          <Users className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Join the Community
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Walk together with friends, join teams, and compete on the leaderboard. 
            Every step you take is part of something bigger.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 glow-cyan">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient-gold">LegacyFit Virtual Challenge</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 LegacyFit. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
