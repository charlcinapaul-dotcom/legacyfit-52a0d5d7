import { PageLayout } from "@/components/PageLayout";
import { Heart, Ribbon, Footprints, Users } from "lucide-react";

const About = () => (
  <PageLayout>
    {/* Hero */}
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Founder Photo */}
        <div className="flex flex-col items-center mb-12">
          <div
            className="rounded-2xl overflow-hidden border-2 border-primary shadow-gold"
            style={{ width: 260, height: 320 }}
          >
            <img
              src="https://mpnhugdjsechtkugnjqz.supabase.co/storage/v1/object/public/Images/MyFounderPic.png"
              alt="Charlcina Paul – Founder of LegacyFit"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-4 text-lg font-semibold text-gradient-gold tracking-wide">Charlcina Paul</p>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
          Why I Built <span className="text-gradient-gold">LegacyFit</span>
        </h1>

        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            There came a point in my life after the weight, after the loss, after the years of putting everyone else
            first when I had to decide whether my best was behind me or still ahead.
          </p>
          <p>I chose ahead. LegacyFit is what came from that choice.</p>
          <p>But this app was born from two truths, not one.</p>
          <p>
            The first is personal. Movement saved me. Walking simple, unglamorous, one foot in front of the other gave
            me back my body, my energy, and my belief in what was still possible. I built LegacyFit for every woman who
            has stood where I stood and wondered if her time had passed. It hasn't. It never does.
          </p>
          <p>The second truth is bigger than me.</p>
          <p>
            Our schools do not teach women's history. Not really. We get a paragraph, a footnote, a single name in a
            chapter built around someone else. Sojourner Truth walked out of slavery and sued for her son's freedom but
            most of us only know her name, not her story. Wilma Rudolph was told at four years old she would never walk
            and became the fastest woman on earth. Katherine Johnson computed the orbital trajectories that sent men to
            the moon by hand, with precision that made the astronauts refuse to launch without her confirmation. Her
            name stayed hidden for decades.
          </p>
          <p>These women deserved more than a footnote. They deserved to be walked with.</p>
          <p>
            So I built something that puts their stories in your ears while you put miles under your feet. Every
            milestone you reach unlocks a woman whose life proves what endurance, courage, and refusal look like in
            practice. Not as a history lesson. As a companion for the road you're already on.
          </p>
          <p>
            LegacyFit is what happens when movement meets meaning. When the miles you walk carry the weight of women who
            walked harder ones before you.
          </p>
          <blockquote className="border-l-4 border-primary pl-6 py-2 text-foreground italic text-xl">
            Seasoned. Strong. Still moving. And finally, learning who walked this earth before us.
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
          <p>To see that walking matters. That consistency matters. That showing up three days a week matters.</p>
          <p>You don't have to run marathons. You don't have to lift the heaviest weights.</p>
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
          <p>Movement is not just about miles. It's about honoring the body we've been given.</p>
          <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-6 mt-6">
            <Ribbon className="w-6 h-6 text-pink-400 shrink-0 mt-1" />
            <p className="text-muted-foreground">
              Part of this platform is built in recognition of breast cancer awareness because resilience deserves to be
              remembered. Every challenge carries meaning. Every mile carries purpose.
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
          <p>LegacyFit is about honoring your growth.</p>
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
        <p className="text-xl text-muted-foreground mb-4">If you've ever wondered whether it's too late…</p>
        <p className="text-3xl font-bold text-foreground mb-2">It's not.</p>
        <p className="text-lg text-muted-foreground">
          Your legacy doesn't start with perfection. It starts with one mile.
        </p>
      </div>
    </section>
  </PageLayout>
);

export default About;
