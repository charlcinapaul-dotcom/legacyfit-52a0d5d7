import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, MapPin, Clock, Target, Trophy, Lock, CheckCircle2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

// Challenge data for each historical figure
const challengeData: Record<string, {
  name: string;
  title: string;
  totalMiles: number;
  daysToComplete: number;
  description: string;
  image: string;
  color: string;
  milestones: Array<{
    id: number;
    name: string;
    miles: number;
    location: string;
    description: string;
  }>;
}> = {
  malala: {
    name: "Malala Yousafzai",
    title: "Voice of Education",
    totalMiles: 26.2,
    daysToComplete: 30,
    description: "Walk in the footsteps of the youngest Nobel Prize laureate. Each mile represents her journey from the Swat Valley to global advocacy.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop",
    color: "cyan",
    milestones: [
      { id: 1, name: "Mingora", miles: 0, location: "Starting Point", description: "Where Malala's journey began" },
      { id: 2, name: "First School", miles: 5, location: "Swat Valley", description: "Her first steps into education" },
      { id: 3, name: "Blog Begins", miles: 10, location: "Pakistan", description: "When she started writing for BBC Urdu" },
      { id: 4, name: "Recovery", miles: 15, location: "Birmingham, UK", description: "Her recovery and renewed strength" },
      { id: 5, name: "United Nations", miles: 20, location: "New York", description: "Addressed the UN on her 16th birthday" },
      { id: 6, name: "Nobel Peace Prize", miles: 26.2, location: "Oslo, Norway", description: "Youngest Nobel laureate in history" },
    ],
  },
  wilma: {
    name: "Wilma Rudolph",
    title: "The Tornado",
    totalMiles: 42,
    daysToComplete: 45,
    description: "Follow the trail of the fastest woman in the world. From overcoming childhood illness to Olympic gold.",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop",
    color: "gold",
    milestones: [
      { id: 1, name: "Clarksville", miles: 0, location: "Tennessee", description: "Born June 23, 1940" },
      { id: 2, name: "First Steps", miles: 8, location: "Home", description: "Walked without braces at age 12" },
      { id: 3, name: "Basketball Star", miles: 16, location: "High School", description: "Discovered her athletic talent" },
      { id: 4, name: "Melbourne Olympics", miles: 24, location: "Australia", description: "Bronze medal at age 16" },
      { id: 5, name: "Tennessee State", miles: 32, location: "Nashville", description: "Training with the Tigerbelles" },
      { id: 6, name: "Rome Olympics", miles: 42, location: "Italy", description: "Three gold medals, worldwide fame" },
    ],
  },
  eleanor: {
    name: "Eleanor Roosevelt",
    title: "First Lady of the World",
    totalMiles: 50,
    daysToComplete: 60,
    description: "Trace the path of America's most influential First Lady. From New York to the United Nations.",
    image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=400&h=300&fit=crop",
    color: "cyan",
    milestones: [
      { id: 1, name: "New York City", miles: 0, location: "Manhattan", description: "Born October 11, 1884" },
      { id: 2, name: "Allenswood Academy", miles: 10, location: "London", description: "Education that shaped her worldview" },
      { id: 3, name: "Settlement House", miles: 20, location: "Lower East Side", description: "First steps in social work" },
      { id: 4, name: "The White House", miles: 30, location: "Washington D.C.", description: "Redefining the role of First Lady" },
      { id: 5, name: "Val-Kill", miles: 40, location: "Hyde Park", description: "Her own home and retreat" },
      { id: 6, name: "United Nations", miles: 50, location: "New York", description: "Drafting the Universal Declaration of Human Rights" },
    ],
  },
  sojourner: {
    name: "Sojourner Truth",
    title: "Ain't I a Woman",
    totalMiles: 35,
    daysToComplete: 40,
    description: "Follow the path of the abolitionist and women's rights activist who walked from slavery to freedom.",
    image: "https://images.unsplash.com/photo-1508515053963-70c7cc24c94e?w=400&h=300&fit=crop",
    color: "gold",
    milestones: [
      { id: 1, name: "Swartekill", miles: 0, location: "Ulster County, NY", description: "Born into slavery around 1797" },
      { id: 2, name: "Freedom Walk", miles: 7, location: "New Paltz, NY", description: "Escaped to freedom in 1826" },
      { id: 3, name: "New Name", miles: 14, location: "New York City", description: "Became Sojourner Truth in 1843" },
      { id: 4, name: "Northampton", miles: 21, location: "Massachusetts", description: "Joined the abolitionist movement" },
      { id: 5, name: "Ain't I a Woman", miles: 28, location: "Akron, Ohio", description: "Delivered her famous speech in 1851" },
      { id: 6, name: "Battle Creek", miles: 35, location: "Michigan", description: "Continued activism until her death" },
    ],
  },
  ida: {
    name: "Ida B. Wells",
    title: "Crusader for Justice",
    totalMiles: 40,
    daysToComplete: 45,
    description: "Walk the path of the investigative journalist who fearlessly exposed injustice across America.",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop",
    color: "cyan",
    milestones: [
      { id: 1, name: "Holly Springs", miles: 0, location: "Mississippi", description: "Born July 16, 1862" },
      { id: 2, name: "Rust College", miles: 8, location: "Mississippi", description: "Education and early teaching" },
      { id: 3, name: "Memphis", miles: 16, location: "Tennessee", description: "Began journalism career" },
      { id: 4, name: "Free Speech", miles: 24, location: "Memphis", description: "Co-owned and wrote for the newspaper" },
      { id: 5, name: "Crusade Begins", miles: 32, location: "New York/Chicago", description: "Anti-lynching campaign launched" },
      { id: 6, name: "NAACP Founding", miles: 40, location: "New York", description: "Co-founded the NAACP in 1909" },
    ],
  },
  maya: {
    name: "Maya Angelou",
    title: "Phenomenal Woman",
    totalMiles: 45,
    daysToComplete: 50,
    description: "Journey through the extraordinary life of the poet, author, and civil rights activist.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
    color: "gold",
    milestones: [
      { id: 1, name: "St. Louis", miles: 0, location: "Missouri", description: "Born April 4, 1928" },
      { id: 2, name: "Stamps", miles: 9, location: "Arkansas", description: "Childhood with grandmother" },
      { id: 3, name: "San Francisco", miles: 18, location: "California", description: "First Black streetcar conductor" },
      { id: 4, name: "Harlem", miles: 27, location: "New York", description: "Joined the Harlem Writers Guild" },
      { id: 5, name: "I Know Why", miles: 36, location: "Worldwide", description: "Published her landmark autobiography" },
      { id: 6, name: "Inauguration", miles: 45, location: "Washington D.C.", description: "Read 'On the Pulse of Morning' in 1993" },
    ],
  },
  fannie: {
    name: "Fannie Lou Hamer",
    title: "Sick and Tired",
    totalMiles: 32,
    daysToComplete: 35,
    description: "Follow the footsteps of the voting rights activist who refused to be silenced.",
    image: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?w=400&h=300&fit=crop",
    color: "cyan",
    milestones: [
      { id: 1, name: "Montgomery County", miles: 0, location: "Mississippi", description: "Born October 6, 1917" },
      { id: 2, name: "Ruleville", miles: 6, location: "Mississippi", description: "Sharecropping life" },
      { id: 3, name: "The Attempt", miles: 12, location: "Indianola", description: "First attempt to register to vote" },
      { id: 4, name: "SNCC", miles: 18, location: "Mississippi", description: "Joined Student Nonviolent Coordinating Committee" },
      { id: 5, name: "Freedom Summer", miles: 26, location: "Mississippi", description: "Led voter registration drives" },
      { id: 6, name: "DNC Speech", miles: 32, location: "Atlantic City", description: "Testified at 1964 Democratic Convention" },
    ],
  },
  katherine: {
    name: "Katherine Johnson",
    title: "Hidden Figure",
    totalMiles: 38,
    daysToComplete: 42,
    description: "Trace the trajectory of the mathematician whose calculations sent astronauts to space.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
    color: "gold",
    milestones: [
      { id: 1, name: "White Sulphur Springs", miles: 0, location: "West Virginia", description: "Born August 26, 1918" },
      { id: 2, name: "West Virginia State", miles: 8, location: "Institute, WV", description: "Graduated summa cum laude at 18" },
      { id: 3, name: "NACA/NASA", miles: 15, location: "Hampton, Virginia", description: "Joined as a 'computer'" },
      { id: 4, name: "Mercury Calculations", miles: 22, location: "Langley", description: "Verified John Glenn's orbital equations" },
      { id: 5, name: "Apollo 11", miles: 30, location: "Mission Control", description: "Calculated trajectory to the Moon" },
      { id: 6, name: "Presidential Medal", miles: 38, location: "White House", description: "Awarded Medal of Freedom in 2015" },
    ],
  },
  toni: {
    name: "Toni Morrison",
    title: "Song of America",
    totalMiles: 44,
    daysToComplete: 48,
    description: "Walk through the literary landscape of the Nobel Prize-winning author who transformed American literature.",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    color: "cyan",
    milestones: [
      { id: 1, name: "Lorain", miles: 0, location: "Ohio", description: "Born February 18, 1931" },
      { id: 2, name: "Howard University", miles: 9, location: "Washington D.C.", description: "Studied English and Classics" },
      { id: 3, name: "Random House", miles: 18, location: "New York", description: "Became first Black female editor" },
      { id: 4, name: "The Bluest Eye", miles: 27, location: "Published", description: "First novel released in 1970" },
      { id: 5, name: "Beloved", miles: 36, location: "Pulitzer Prize", description: "Won Pulitzer Prize in 1988" },
      { id: 6, name: "Nobel Prize", miles: 44, location: "Stockholm", description: "Awarded Nobel Prize in Literature 1993" },
    ],
  },
};

const ChallengeRoute = () => {
  const { slug } = useParams<{ slug: string }>();
  const challenge = slug ? challengeData[slug] : null;
  
  // Custom days state - initialize with default challenge days
  const defaultDays = challenge?.daysToComplete ?? 30;
  const minDays = Math.ceil(defaultDays * 0.5); // 50% of default
  const maxDays = Math.ceil(defaultDays * 2); // 200% of default
  const [customDays, setCustomDays] = useState<number>(defaultDays);

  // Mock user progress - in real app this would come from database
  const userProgress = {
    milesLogged: 12.5,
    daysRemaining: Math.max(0, customDays - 12), // Adjust based on custom days
    startedAt: "2025-01-10",
  };

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Challenge Not Found</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = (userProgress.milesLogged / challenge.totalMiles) * 100;
  const unlockedMilestones = challenge.milestones.filter(m => userProgress.milesLogged >= m.miles);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">{challenge.name}</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-card to-secondary border border-border mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent z-10" />
            <img 
              src={challenge.image} 
              alt={challenge.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            
            <div className="relative z-20 p-6 md:p-10">
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4",
                challenge.color === "cyan" ? "bg-cyan/10 border-cyan/20 text-cyan" : "bg-primary/10 border-primary/20 text-primary"
              )}>
                <span className="text-xs font-medium uppercase tracking-wide">{challenge.title}</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {challenge.name}
              </h2>
              <p className="text-muted-foreground max-w-xl mb-8">
                {challenge.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">Total Miles</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{challenge.totalMiles}</div>
                </div>

                <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">Days</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{customDays}</div>
                </div>

                <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">Milestones</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{challenge.milestones.length}</div>
                </div>

                <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">Unlocked</span>
                  </div>
                  <div className={cn(
                    "text-2xl font-bold",
                    challenge.color === "cyan" ? "text-cyan" : "text-primary"
                  )}>{unlockedMilestones.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Days Adjustment Section */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className={cn(
                "w-5 h-5",
                challenge.color === "cyan" ? "text-cyan" : "text-primary"
              )} />
              <h3 className="text-lg font-semibold text-foreground">Customize Your Challenge</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Adjust the number of days to complete this challenge based on your fitness level and schedule.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Challenge Duration</span>
                <span className={cn(
                  "text-lg font-bold",
                  challenge.color === "cyan" ? "text-cyan" : "text-primary"
                )}>
                  {customDays} days
                </span>
              </div>
              
              <Slider
                value={[customDays]}
                onValueChange={(value) => setCustomDays(value[0])}
                min={minDays}
                max={maxDays}
                step={1}
                className="py-2"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Intense ({minDays} days)</span>
                <span>Default ({defaultDays} days)</span>
                <span>Relaxed ({maxDays} days)</span>
              </div>

              <div className={cn(
                "mt-4 p-3 rounded-lg border",
                challenge.color === "cyan" ? "bg-cyan/5 border-cyan/20" : "bg-primary/5 border-primary/20"
              )}>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Daily goal: </span>
                  {(challenge.totalMiles / customDays).toFixed(2)} miles/day
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Your Progress</h3>
              <span className={cn(
                "text-sm font-medium",
                challenge.color === "cyan" ? "text-cyan" : "text-primary"
              )}>
                {userProgress.milesLogged} / {challenge.totalMiles} miles
              </span>
            </div>
            
            <Progress 
              value={progressPercent} 
              className="h-3 mb-4"
            />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{userProgress.daysRemaining} days remaining</span>
              <span>{Math.round(progressPercent)}% complete</span>
            </div>
          </div>

          {/* Virtual Route Visualization */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Virtual Route</h3>
            
            <div className="relative">
              {/* Route Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
              
              {/* Progress Fill */}
              <div 
                className={cn(
                  "absolute left-6 top-0 w-0.5 transition-all duration-1000",
                  challenge.color === "cyan" ? "bg-cyan" : "bg-primary"
                )}
                style={{ height: `${progressPercent}%` }}
              />

              {/* Milestones */}
              <div className="space-y-8">
                {challenge.milestones.map((milestone, index) => {
                  const isUnlocked = userProgress.milesLogged >= milestone.miles;
                  const isNext = !isUnlocked && (index === 0 || userProgress.milesLogged >= challenge.milestones[index - 1].miles);
                  
                  return (
                    <div key={milestone.id} className="relative flex items-start gap-6">
                      {/* Milestone Marker */}
                      <div className={cn(
                        "relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                        isUnlocked 
                          ? challenge.color === "cyan"
                            ? "bg-cyan border-cyan text-background"
                            : "bg-primary border-primary text-primary-foreground"
                          : isNext
                            ? "bg-secondary border-border text-muted-foreground animate-pulse"
                            : "bg-secondary border-border text-muted-foreground"
                      )}>
                        {isUnlocked ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>

                      {/* Milestone Content */}
                      <div className={cn(
                        "flex-1 pb-2",
                        !isUnlocked && "opacity-50"
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{milestone.name}</h4>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            isUnlocked
                              ? challenge.color === "cyan"
                                ? "bg-cyan/10 text-cyan"
                                : "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                          )}>
                            {milestone.miles} mi
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {milestone.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Educational Disclaimer */}
          <div className="mt-8">
            <DisclaimerBanner 
              variant="compact" 
              showLivingPersonNote={slug === "malala"}
            />
          </div>

          {/* Action Button */}
          <div className="mt-8 text-center">
            <Link to="/auth?mode=signup">
              <Button 
                size="lg" 
                className={cn(
                  "text-lg px-8 py-6",
                  challenge.color === "cyan"
                    ? "bg-cyan text-background hover:bg-cyan/90 glow-cyan"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 glow-gold"
                )}
              >
                Start This Challenge
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChallengeRoute;