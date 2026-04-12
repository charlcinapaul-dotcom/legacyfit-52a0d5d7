import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShareMenu } from "@/components/ShareMenu";
import { SiteNavigation } from "@/components/SiteNavigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
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
  CreditCard,
  Sparkles,
  Flame,
} from "lucide-react";
import type { User, Session } from "@supabase/supabase-js";
import { useActiveChallenge } from "@/hooks/useActiveChallenge";
import { ReferralCard } from "@/components/ReferralCard";
import { DigitalBib } from "@/components/DigitalBib";
import { CompletionCertificate } from "@/components/CompletionCertificate";
import { StreakBadge } from "@/components/StreakBadge";
import { GroupChallenge } from "@/components/GroupChallenge";
import { PastDueWarningBanner } from "@/components/PastDueWarningBanner";
import { useQuery } from "@tanstack/react-query";

interface ManageSubscriptionSectionProps {
  userId: string | null;
}

function ManageSubscriptionSection({ userId }: ManageSubscriptionSectionProps) {
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: subData, isLoading } = useQuery({
    queryKey: ["dashboard-subscription-status", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return { hasActive: false, renewalDate: null };
      const { data } = await supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      return { hasActive: !!data, renewalDate: data?.current_period_end ?? null };
    },
  });

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw new Error(error.message || "Failed to open billing portal");
      if (!data?.url) throw new Error("No portal URL returned.");
      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) return null;

  const renewalDateFormatted = subData?.renewalDate
    ? new Date(subData.renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  // Active subscriber view
  if (subData?.hasActive) {
    return (
      <Card className="bg-card border-primary/30 h-full">
        <CardContent className="p-5 flex flex-col gap-3 h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Legacy Pass — Active</p>
              <p className="text-xs text-muted-foreground">Manage billing, cancel, or update payment method</p>
              {renewalDateFormatted && (
                <p className="text-xs text-muted-foreground">Renews on {renewalDateFormatted}</p>
              )}
            </div>
          </div>
          <Button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            variant="outline"
            size="sm"
            className="border-primary/40 text-primary hover:bg-primary/10 font-semibold mt-auto w-full"
          >
            {portalLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Opening…
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Subscription
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Non-subscriber view
  return (
    <Card className="bg-card border-border h-full">
      <CardContent className="p-5 flex flex-col gap-3 h-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">LegacyFit Membership</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Continue your fitness journey with new challenges, progress tracking, and community support.
            </p>
          </div>
        </div>
        <p className="text-lg font-bold text-primary">
          $9.99 <span className="text-xs font-normal text-muted-foreground">per month</span>
        </p>
        <Button
          onClick={() => navigate("/challenges")}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-auto w-full"
        >
          Join Membership
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          Available after completing your first challenge.
        </p>
      </CardContent>
    </Card>
  );
}

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
  location_name: string | null;
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
  const [certChallenge, setCertChallenge] = useState<{ name: string; miles: number; imageUrl: string | null } | null>(
    null,
  );
  const [certGenerating, setCertGenerating] = useState(false);
  const { data: activeChallenge } = useActiveChallenge();

  // Streak data — fetched at page level so we can conditionally swap banner vs. grid slot
  const { data: streakData } = useQuery({
    queryKey: ["user-streak", user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data ?? { current_streak: 0, longest_streak: 0 };
    },
  });
  const hasStreak = (streakData?.current_streak ?? 0) > 0;

  useEffect(() => {
    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
        return;
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
      let { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
        return;
      }

      // Profile row missing — create one
      if (!data) {
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({ user_id: userId }, { onConflict: "user_id" });

        if (upsertError) {
          console.error("Error creating profile:", upsertError);
          setLoading(false);
          return;
        }

        // Re-fetch after upsert
        const { data: newData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        data = newData;
      }

      setProfile(data);
      if (!data?.display_name) {
        navigate("/onboarding");
        return;
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
        .select(
          `
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
              title,
              location_name
            )
          )
        `,
        )
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

  // Check for newly completed challenges and show certificate modal.
  // Uses certificates.viewed_at (DB-persisted) so state survives reinstalls/device switches.
  useEffect(() => {
    if (!user) return;
    const checkCompletions = async () => {
      const { data } = await supabase
        .from("user_challenges")
        .select("id, miles_logged, is_completed, challenge:challenges(id, title, total_miles)")
        .eq("user_id", user.id)
        .eq("is_completed", true);

      if (!data || data.length === 0) return;

      // Find a completed challenge whose certificate has not yet been viewed
      for (const uc of data) {
        if (!uc.challenge) continue;
        const ch = uc.challenge as unknown as { id: string; title: string; total_miles: number };

        const { data: cert } = await supabase
          .from("certificates")
          .select("id, image_url, viewed_at")
          .eq("user_id", user.id)
          .eq("challenge_id", ch.id)
          .maybeSingle();

        // Only pop the modal for this certificate if it has never been viewed
        if (cert && cert.viewed_at === null) {
          setCertChallenge({ name: ch.title, miles: ch.total_miles, imageUrl: cert.image_url || null });
          setCertOpen(true);

          // Stamp viewed_at immediately so a reinstall/new device won't re-show it
          await supabase.from("certificates").update({ viewed_at: new Date().toISOString() }).eq("id", cert.id);

          break; // show one modal at a time
        }
      }
    };
    checkCompletions();
  }, [user, userChallenges]);

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
      <SiteNavigation variant="dashboard" bibNumber={profile?.bib_number} />

      {/* Past-due payment warning */}
      <PastDueWarningBanner userId={user?.id ?? null} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section — matches challenge page hero layout */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-card to-secondary border border-border mb-8">
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              backgroundImage: activeChallenge?.imageUrl ? `url('${activeChallenge.imageUrl}')` : "url('/map-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 z-10" style={{ background: "rgba(0,0,0,0.8)" }} />
            <div className="relative z-20 p-6 md:p-10">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Welcome back, {profile?.display_name}!
              </h1>
              <p className="text-muted-foreground max-w-xl mb-8">Ready to unlock more history today?</p>

              {/* Streak Banner + Share — only when user has an active streak */}
              {hasStreak && (
                <div className="flex gap-3 mb-4">
                  <div
                    className="flex-1 border border-primary/20 rounded-lg p-3 flex items-center gap-4"
                    style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))" }}
                  >
                    <span className="text-3xl leading-none">🔥</span>
                    <div>
                      <p className="text-lg font-bold text-primary leading-tight">
                        {streakData!.current_streak}-Week Streak
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Keep it going — log miles today to protect your streak
                      </p>
                    </div>
                  </div>
                  <div className="border border-primary/20 rounded-lg p-3 flex items-center">
                    <ShareMenu
                      stampName={activeChallenge?.slug || "LegacyFit"}
                      shareUrl="https://legacyfitvirtual.com"
                    />
                  </div>
                </div>
              )}

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

                {/* 4th slot: Longest Streak when banner is active, otherwise full StreakBadge */}
                {hasStreak ? (
                  <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Flame className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wide">Best Streak</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {streakData?.longest_streak ?? 0}
                      <span className="text-xs font-normal text-muted-foreground ml-1">wks</span>
                    </div>
                  </div>
                ) : (
                  <StreakBadge />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Currently Walking pinned card */}
        {activeChallenge &&
          !activeChallenge.isCompleted &&
          userChallenges.length > 0 &&
          (() => {
            const activeChallengeData = userChallenges.find((uc) => uc.challenge?.id === activeChallenge.challengeId);
            const milesLogged = activeChallenge.milesLogged ?? 0;
            const totalMiles = activeChallenge.totalMiles ?? 1;
            const progressPercent = Math.min(100, Math.round((milesLogged / totalMiles) * 100));
            const milestones: { miles_required: number; title: string }[] =
              (activeChallengeData?.challenge as any)?.milestones ?? [];
            const nextMilestone = milestones
              .filter((m) => m.miles_required > milesLogged)
              .sort((a, b) => a.miles_required - b.miles_required)[0];
            return (
              <div className="bg-card border border-primary/30 rounded-2xl p-5 mb-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Currently Walking</p>
                <h3 className="text-xl font-bold text-foreground mb-3">{activeChallenge.title}</h3>

                {/* Progress bar */}
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{progressPercent}% complete</span>
                  <span className="text-primary font-medium">
                    {milesLogged} / {totalMiles} miles
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary mb-3">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
                </div>

                {/* Next milestone */}
                {nextMilestone && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Next stop: <span className="text-foreground font-medium">{nextMilestone.title}</span> —{" "}
                    {Math.max(0, nextMilestone.miles_required - milesLogged).toFixed(1)} mi away
                  </p>
                )}

                <Button className="w-full" onClick={() => navigate(`/challenge/${activeChallenge.slug}`)}>
                  Continue Walking →
                </Button>
              </div>
            );
          })()}

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
                          {(() => {
                            const milesLogged = uc.miles_logged || 0;
                            const milestones = (uc.challenge as any)?.milestones as Milestone[] | undefined;
                            // Find nearest milestone (the one with miles_required closest to milesLogged)
                            const nearest = milestones?.length
                              ? milestones.reduce((prev, curr) =>
                                  Math.abs(curr.miles_required - milesLogged) <
                                  Math.abs(prev.miles_required - milesLogged)
                                    ? curr
                                    : prev,
                                )
                              : null;
                            const locationName = nearest?.location_name?.trim() || null;
                            return (
                              <p className="text-sm text-muted-foreground">
                                {locationName
                                  ? `Walking through ${locationName}`
                                  : `${milesLogged.toFixed(1)} miles walked`}
                              </p>
                            );
                          })()}
                          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, ((uc.miles_logged || 0) / (uc.challenge?.total_miles || 1)) * 100)}%`,
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
                                </span>{" "}
                                — {remaining} mi away
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
                <p className="text-muted-foreground mb-4">Join a challenge to start your journey through history</p>
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
              <DigitalBib displayName={profile.display_name || "Explorer"} bibNumber={profile.bib_number} />
            </div>
          </div>
        )}

        {/* Group Challenge */}
        {activeChallenge && (
          <div className="mb-8">
            <GroupChallenge
              challengeId={activeChallenge.challengeId}
              totalMiles={activeChallenge.totalMiles}
              isEnrolled={true}
            />
          </div>
        )}

        {/* Referral + Membership — side by side on md+ */}
        <div className="mb-8 grid md:grid-cols-2 gap-4">
          <ReferralCard />
          <ManageSubscriptionSection userId={user?.id ?? null} />
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card
            className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => navigate("/passport")}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Passport Stamp Vault</h3>
                <p className="text-sm text-muted-foreground">All your earned stamps</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer"
            onClick={() => navigate("/leaderboard")}
          >
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
