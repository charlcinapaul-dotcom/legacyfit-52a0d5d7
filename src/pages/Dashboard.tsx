import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Footprints, 
  LogOut, 
  MapPin, 
  Award, 
  Users, 
  Plus, 
  TrendingUp,
  Target,
  Loader2,
  ChevronRight,
  Trophy,
  BookOpen,
} from "lucide-react";
import type { User, Session } from "@supabase/supabase-js";
import { useActiveChallenge } from "@/hooks/useActiveChallenge";
import { ReferralCard } from "@/components/ReferralCard";
import { DigitalBib } from "@/components/DigitalBib";
import { CompletionCertificate } from "@/components/CompletionCertificate";
import { StreakBadge } from "@/components/StreakBadge";
import { GroupChallenge } from "@/components/GroupChallenge";

interface Profile {
  id: string;
  display_name: string | null;
  bib_number: string | null;
  avatar_url: string | null;
  total_miles: number;
}

interface Milestone {
  miles_required: number;
  title: string;
}

interface UserChallenge {
  id: string;
  miles_logged: number | null;
  is_completed: boolean | null;
  challenge: {
    id: string;
    title: string;
    slug: string | null;
    total_miles: number;
    image_url: string | null;
    milestones?: Milestone[];
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [milestoneCount, setMilestoneCount] = useState(0);
  const [stampCount, setStampCount] = useState(0);
  const [certOpen, setCertOpen] = useState(false);
  const [certChallenge, setCertChallenge] = useState<{ name: string; miles: number; imageUrl: string | null } | null>(null);
  const [certGenerating, setCertGenerating] = useState(false);
  const { data: activeChallenge } = useActiveChallenge();


  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      }

      // Defer profile fetch to avoid deadlock
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchUserChallenges(session.user.id);
          fetchCounts(session.user.id);
        }, 0);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
        fetchUserChallenges(session.user.id);
        fetchCounts(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChallenges = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_challenges")
        .select(`
          id,
          miles_logged,
          is_completed,
          challenge:challenges (
            id,
            title,
            slug,
            total_miles,
            image_url,
            milestones (
              miles_required,
              title
            )
          )
        `)
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching user challenges:", error);
      } else if (data) {
        setUserChallenges(data as unknown as UserChallenge[]);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const fetchCounts = async (userId: string) => {
    const [{ count: mCount }, { count: sCount }] = await Promise.all([
      supabase.from("user_milestones").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("user_passport_stamps").select("*", { count: "exact", head: true }).eq("user_id", userId),
    ]);
    setMilestoneCount(mCount ?? 0);
    setStampCount(sCount ?? 0);
  };

  // Check for newly completed challenges and show certificate modal
  useEffect(() => {
    if (!user) return;
    const checkCompletions = async () => {
      const { data } = await supabase
        .from("user_challenges")
        .select("id, miles_logged, is_completed, challenge:challenges(id, title, total_miles)")
        .eq("user_id", user.id)
        .eq("is_completed", true);

      if (!data || data.length === 0) return;

      // Check if there's a completed challenge without a viewed certificate
      const viewedKey = "legacyfit_cert_viewed";
      const viewed = JSON.parse(localStorage.getItem(viewedKey) || "[]") as string[];
      const unseen = data.find((uc) => !viewed.includes(uc.id));
      if (!unseen || !unseen.challenge) return;

      const ch = unseen.challenge as unknown as { id: string; title: string; total_miles: number };

      // Check for existing certificate image
      const { data: cert } = await supabase
        .from("certificates")
        .select("image_url")
        .eq("user_id", user.id)
        .eq("challenge_id", ch.id)
        .maybeSingle();

      setCertChallenge({ name: ch.title, miles: ch.total_miles, imageUrl: cert?.image_url || null });
      setCertOpen(true);

      // Mark as viewed
      localStorage.setItem(viewedKey, JSON.stringify([...viewed, unseen.id]));
    };
    checkCompletions();
  }, [user, userChallenges]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                <Footprints className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient-gold">LegacyFit</span>
            </Link>
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:text-primary/80 hover:bg-secondary/50 transition-colors">
              Home
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {profile?.bib_number && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border">
                <span className="text-xs text-muted-foreground">BIB</span>
                <span className="text-sm font-mono text-primary">{profile.bib_number}</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section — matches challenge page hero layout */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-card to-secondary border border-border mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent z-10" />
          {activeChallenge?.imageUrl && (
            <img
              src={activeChallenge.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}

          <div className="relative z-20 p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back, {profile?.display_name || "Explorer"}!
            </h1>
            <p className="text-muted-foreground max-w-xl mb-8">
              Ready to unlock more history today?
            </p>

            {/* Stats Grid — inside hero with backdrop tiles, matching challenge page */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Total Miles</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{profile?.total_miles || 0}</div>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Milestones</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{milestoneCount}</div>
              </div>

              <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Stamps</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{stampCount}</div>
              </div>

              <StreakBadge />
            </div>
          </div>
        </div>

        {/* Log Miles - inline if active challenge exists */}
        {activeChallenge ? (
          <div className="mb-8">
            <Tabs defaultValue="miles" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="miles">Log Miles</TabsTrigger>
                <TabsTrigger value="steps">Log Steps</TabsTrigger>
              </TabsList>
              <TabsContent value="miles">
                <MileLogger 
                  challengeId={activeChallenge.challengeId} 
                  challengeSlug={activeChallenge.slug || undefined}
                  challengeName={activeChallenge.title}
                  onChallengeCompleted={(data) => {
                    setCertChallenge(data);
                    setCertOpen(true);
                  }}
                />
              </TabsContent>
              <TabsContent value="steps">
                <StepLogger
                  challengeId={activeChallenge.challengeId}
                  challengeSlug={activeChallenge.slug || undefined}
                  challengeName={activeChallenge.title}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border-border mb-8">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-semibold text-foreground mb-1">Log Your Miles</h3>
                <p className="text-muted-foreground">Join a challenge to start tracking your progress</p>
              </div>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-gold"
                onClick={() => navigate("/challenges")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Explore Challenges
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Challenges */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Your Challenges</h2>
            <Button variant="ghost" className="text-primary" onClick={() => navigate("/challenges")}>
              Browse All
            </Button>
          </div>

          {userChallenges.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {userChallenges.map((uc) => {
                const isCompleted = uc.is_completed === true;
                return (
                <Card 
                  key={uc.id} 
                  className={`bg-card border-border hover:border-primary/50 transition-colors cursor-pointer ${isCompleted ? "border-primary/30" : ""}`}
                  onClick={() => navigate(`/challenge/${uc.challenge?.slug}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                        {uc.challenge?.image_url ? (
                          <img 
                            src={uc.challenge.image_url} 
                            alt={uc.challenge.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{uc.challenge?.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {uc.miles_logged || 0} / {uc.challenge?.total_miles} miles
                        </p>
                        <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(100, ((uc.miles_logged || 0) / (uc.challenge?.total_miles || 1)) * 100)}%` 
                            }}
                          />
                        </div>
                        {(() => {
                          if (isCompleted) return null;
                          const milestones = (uc.challenge as any)?.milestones as Milestone[] | undefined;
                          if (!milestones?.length) return null;
                          const milesLogged = uc.miles_logged || 0;
                          const next = milestones
                            .filter((m) => m.miles_required > milesLogged)
                            .sort((a, b) => a.miles_required - b.miles_required)[0];
                          if (!next) return null;
                          const remaining = (next.miles_required - milesLogged).toFixed(1);
                          return (
                            <p className="mt-1.5 text-xs text-muted-foreground leading-tight">
                              Next:{" "}
                              <span style={{ color: "#FFD700" }} className="font-medium">
                                {next.title}
                              </span>
                              {" "}— {remaining} mi away
                            </p>
                          );
                        })()}
                        {isCompleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-7 px-2 text-xs text-primary hover:text-primary"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { data: cert } = await supabase
                                .from("certificates")
                                .select("image_url")
                                .eq("user_id", user!.id)
                                .eq("challenge_id", uc.challenge.id)
                                .maybeSingle();
                              setCertChallenge({
                                name: uc.challenge.title,
                                miles: uc.challenge.total_miles,
                                imageUrl: cert?.image_url || null,
                              });
                              setCertOpen(true);
                            }}
                          >
                            <Trophy className="w-3 h-3 mr-1" />
                            View Certificate
                          </Button>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-card border-border border-dashed">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No Active Challenges</h3>
                <p className="text-muted-foreground mb-4">
                  Join a challenge to start your journey through history
                </p>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigate("/challenges")}
                >
                  Explore Challenges
                </Button>
              </CardContent>
            </Card>
          )}
        </div>


        {/* Digital BIB */}
        {profile?.bib_number && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Your Digital BIB</h2>
            <div className="max-w-sm mx-auto">
              <DigitalBib
                displayName={profile.display_name || "Explorer"}
                bibNumber={profile.bib_number}
              />
            </div>
          </div>
        )}

        {/* Referral Invite */}
        <div className="mb-8">
          <ReferralCard />
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card 
            className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => navigate("/passport")}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Passport</h3>
                <p className="text-sm text-muted-foreground">View your stamps</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer" onClick={() => navigate("/leaderboard")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Leaderboard</h3>
                <p className="text-sm text-muted-foreground">See rankings</p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Completion Certificate Modal */}
        {certChallenge && (
          <CompletionCertificate
            open={certOpen}
            onOpenChange={setCertOpen}
            challengeName={certChallenge.name}
            totalMiles={certChallenge.miles}
            certificateImageUrl={certChallenge.imageUrl}
            isGenerating={certGenerating}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
