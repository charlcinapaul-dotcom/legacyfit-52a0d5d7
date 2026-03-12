import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { JourneyMap } from "@/components/JourneyMap";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, MapPin, Clock, Target, Trophy, Lock, CheckCircle2, Calendar, Volume2, VolumeX, RotateCcw, Wand2, Loader2, Sparkles, X, Footprints, Navigation } from "lucide-react";

import { useMilestoneAudio } from "@/hooks/useMilestoneAudio";
import { cn } from "@/lib/utils";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { LegacyGuide } from "@/components/LegacyGuide";
import { MileLogger } from "@/components/MileLogger";
import { StepLogger } from "@/components/StepLogger";
import { EnrollmentBadge } from "@/components/EnrollmentBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengePricing } from "@/components/ChallengePricing";

import { GpsWalkTracker } from "@/components/GpsWalkTracker";
import { useChallengeBySlug } from "@/hooks/useChallengeBySlug";
import { useEnrollmentStatus } from "@/hooks/useEnrollmentStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Color styling helper for challenge themes
const getColorStyles = (color: string) => {
  switch (color) {
    case "cyan":
      return {
        badge: "bg-cyan/10 border-cyan/20 text-cyan",
        text: "text-cyan",
        bgLight: "bg-cyan/5 border-cyan/20",
        bgSolid: "bg-cyan border-cyan text-background",
        bgHighlight: "bg-cyan/10 text-cyan",
        routeLine: "bg-cyan",
        button: "bg-cyan text-background hover:bg-cyan/90 glow-cyan",
        iconColor: "text-cyan",
      };
    case "pride":
      return {
        badge: "bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 border-purple-500/20 text-purple-400",
        text: "bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent",
        bgLight: "bg-purple-500/5 border-purple-500/20",
        bgSolid: "bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 border-purple-500 text-white",
        bgHighlight: "bg-purple-500/10 text-purple-400",
        routeLine: "bg-gradient-to-b from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
        button: "bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-white hover:opacity-90",
        iconColor: "text-purple-400",
      };
    case "pioneers":
      return {
        badge: "bg-amber-700/10 border-amber-700/20 text-amber-600",
        text: "text-amber-600",
        bgLight: "bg-amber-700/5 border-amber-700/20",
        bgSolid: "bg-amber-700 border-amber-700 text-white",
        bgHighlight: "bg-amber-700/10 text-amber-600",
        routeLine: "bg-amber-700",
        button: "bg-amber-700 text-white hover:bg-amber-700/90",
        iconColor: "text-amber-600",
      };
    default: // gold
      return {
        badge: "bg-primary/10 border-primary/20 text-primary",
        text: "text-primary",
        bgLight: "bg-primary/5 border-primary/20",
        bgSolid: "bg-primary border-primary text-primary-foreground",
        bgHighlight: "bg-primary/10 text-primary",
        routeLine: "bg-primary",
        button: "bg-primary text-primary-foreground hover:bg-primary/90 glow-gold",
        iconColor: "text-primary",
      };
  }
};

// Map edition to color theme
const getEditionColor = (edition: string): string => {
  if (edition.toLowerCase().includes("pride")) return "pride";
  if (edition.toLowerCase().includes("first steps: black pioneers")) return "pioneers";
  return "gold";
};

// Map edition to pricing accent
const getPricingEditionColor = (edition: string): "gold" | "burgundy" | "pride" => {
  if (edition.toLowerCase().includes("pride")) return "pride";
  return "gold";
};

// Default days based on total miles
const getDefaultDays = (totalMiles: number): number => {
  return Math.ceil(totalMiles * 1.1); // Roughly 1 mile per day + 10%
};

const ChallengeRoute = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useChallengeBySlug(slug);
  const challengeId = data?.challenge?.id;
  const { data: enrollment } = useEnrollmentStatus(challengeId);
  const { toast } = useToast();
  const [showReEngagementBanner, setShowReEngagementBanner] = useState(false);
  const logMilesSectionRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss banner the moment enrollment is confirmed
  useEffect(() => {
    if (enrollment?.isEnrolled) {
      setShowReEngagementBanner(false);
    }
  }, [enrollment?.isEnrolled]);

  // Audio hook for milestone narration
  const { playMilestoneAudio, toggleMute, replay, muted, isPlaying, currentAudioUrl } = useMilestoneAudio();

  // Admin: pre-generate audio state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioGenProgress, setAudioGenProgress] = useState<{ generated: number; remaining: number } | null>(null);

  // Check if current user is admin
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle()
        .then(({ data }) => setIsAdmin(!!data));
    });
  }, []);

  // Pre-generate audio for all milestones missing audio_url (batch loop)
  const handlePreGenerateAudio = useCallback(async () => {
    setIsGeneratingAudio(true);
    setAudioGenProgress(null);
    let totalGenerated = 0;

    try {
      // Loop in batches of 5 until remaining === 0
      while (true) {
        const { data: result, error } = await supabase.functions.invoke(
          "generate-all-milestone-audio",
          { body: { limit: 5 } }
        );

        if (error) throw error;

        const generated: number = result?.generated ?? 0;
        const remaining: number = result?.remaining ?? 0;
        totalGenerated += generated;
        setAudioGenProgress({ generated: totalGenerated, remaining });

        if (remaining <= 0 || generated === 0) break;

        // Small pause between batches to avoid hammering the API
        await new Promise((r) => setTimeout(r, 500));
      }

      toast({
        title: "Audio pre-generation complete",
        description: `Generated ${totalGenerated} audio file${totalGenerated !== 1 ? "s" : ""}. All milestones are ready.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Audio generation failed", description: msg, variant: "destructive" });
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [toast]);

  // Transform database data to component format
  const challenge = useMemo(() => {
    if (!data) return null;
    
    const { challenge: dbChallenge, milestones: dbMilestones } = data;
    
    return {
      id: dbChallenge.id,
      name: dbChallenge.title,
      title: dbChallenge.edition,
      totalMiles: Number(dbChallenge.total_miles),
      daysToComplete: getDefaultDays(Number(dbChallenge.total_miles)),
      description: dbChallenge.description || "",
      image: dbChallenge.image_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop",
      color: getEditionColor(dbChallenge.edition),
      milestones: dbMilestones.map((m, index) => ({
        id: index + 1,
        dbId: m.id,           // real UUID for audio generation
        audioUrl: m.audio_url ?? null,
        name: m.stamp_title || m.title,
        miles: Number(m.miles_required),
        location: m.location_name || "",
        description: m.stamp_copy || m.description || "",
        stampImageUrl: m.stamp_image_url,
        latitude: m.latitude,
        longitude: m.longitude,
      })),
    };
  }, [data]);

  // Custom days state
  const defaultDays = challenge?.daysToComplete ?? 30;
  const minDays = Math.ceil(defaultDays * 0.5);
  const maxDays = Math.ceil(defaultDays * 2);
  const [customDays, setCustomDays] = useState<number>(defaultDays);

  // Update customDays when challenge loads
  useMemo(() => {
    if (challenge) {
      setCustomDays(challenge.daysToComplete);
    }
  }, [challenge?.daysToComplete]);

  // Real user progress from enrollment data
  const userProgress = {
    milesLogged: enrollment?.milesLogged ?? 0,
    daysRemaining: customDays,
    startedAt: "",
  };

  // Track the most recently unlocked milestone index to auto-play its audio once
  const prevUnlockedCountRef = useRef<number>(0);
  const unlockedMilestonesCount = challenge
    ? challenge.milestones.filter(m => userProgress.milesLogged >= m.miles).length
    : 0;

  useEffect(() => {
    if (!challenge) return;
    const prev = prevUnlockedCountRef.current;
    if (unlockedMilestonesCount > prev) {
      // The newly unlocked milestone is at index (unlockedMilestonesCount - 1)
      const newlyUnlocked = challenge.milestones[unlockedMilestonesCount - 1];
      if (newlyUnlocked) {
        playMilestoneAudio(newlyUnlocked.dbId, newlyUnlocked.audioUrl);
      }
    }
    prevUnlockedCountRef.current = unlockedMilestonesCount;
  }, [unlockedMilestonesCount, challenge, playMilestoneAudio]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:text-primary/80 hover:bg-secondary/50 transition-colors">
                Home
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            </div>
            <Skeleton className="h-6 w-32" />
            <div className="w-20" />
          </div>
        </header>
        <main className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <Skeleton className="h-64 rounded-2xl mb-8" />
            <Skeleton className="h-48 rounded-xl mb-8" />
            <Skeleton className="h-32 rounded-xl mb-8" />
            <div className="space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-6">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error or not found state
  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Challenge Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error ? "There was an error loading this challenge." : "This challenge doesn't exist yet."}
          </p>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = (userProgress.milesLogged / challenge.totalMiles) * 100;
  const unlockedMilestones = challenge.milestones.filter(m => userProgress.milesLogged >= m.miles);
  const colors = getColorStyles(challenge.color);

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:text-primary/80 hover:bg-secondary/50 transition-colors">
            Home
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
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
              {challenge.color === "pride" && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />
              )}
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4",
                colors.badge
              )}>
                <span className={cn("text-xs font-medium uppercase tracking-wide", challenge.color === "pride" && colors.text)}>{challenge.title}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap mb-3">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {challenge.name}
                </h2>
                {enrollment && <EnrollmentBadge status={enrollment.status} />}
              </div>
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
                  <div className={cn("text-2xl font-bold", colors.text)}>{unlockedMilestones.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Log Miles / Steps / GPS Section */}
          <div className="mt-8" ref={logMilesSectionRef}>
            <Tabs defaultValue="miles" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="miles">Log Miles</TabsTrigger>
                <TabsTrigger value="steps">Log Steps</TabsTrigger>
                <TabsTrigger value="gps" className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" />
                  GPS Walk
                </TabsTrigger>
              </TabsList>
              <TabsContent value="miles">
                <MileLogger 
                  challengeId={challenge.id} 
                  challengeSlug={slug}
                  challengeName={challenge.name}
                  challengeEditionColor={getPricingEditionColor(data?.challenge?.edition || "")}
                  onMaybeLater={() => setShowReEngagementBanner(true)}
                />
              </TabsContent>
              <TabsContent value="steps">
                <StepLogger
                  challengeId={challenge.id}
                  challengeSlug={slug}
                  challengeName={challenge.name}
                  challengeEditionColor={getPricingEditionColor(data?.challenge?.edition || "")}
                />
              </TabsContent>
              <TabsContent value="gps">
                <GpsWalkTracker
                  challengeId={challenge.id}
                  challengeSlug={slug}
                  challengeName={challenge.name}
                  challengeEditionColor={getPricingEditionColor(data?.challenge?.edition || "")}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Re-engagement banner — shown after user taps "Maybe Later" on purchase screen */}
          {showReEngagementBanner && !enrollment?.isEnrolled && (
            <div className="relative flex items-start gap-3 bg-primary/10 border border-primary/25 rounded-xl px-4 py-3 mb-8 text-sm">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-foreground">Your first mile is saved.</span>
                <span className="text-muted-foreground ml-1">
                  Unlock the full journey to keep earning stamps and complete{" "}
                  {challenge.name
                    .replace(/\s+(equality|freedom|courage|legacy|justice|peace|hope|pride|strength|trail|walk|run|journey|challenge|mile)s?(\s+.*)?$/i, "")
                    .trim()}'s challenge.
                </span>
              </div>
              <button
                onClick={() => setShowReEngagementBanner(false)}
                className="text-muted-foreground hover:text-foreground transition-colors ml-2 mt-0.5 shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Days Adjustment Section */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className={cn("w-5 h-5", colors.iconColor)} />
              <h3 className="text-lg font-semibold text-foreground">Customize Your Challenge</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Adjust the number of days to complete this challenge based on your fitness level and schedule.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Challenge Duration</span>
                <span className={cn("text-lg font-bold", colors.text)}>
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

              <div className={cn("mt-4 p-3 rounded-lg border", colors.bgLight)}>
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
              <span className={cn("text-sm font-medium", colors.text)}>
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

          {/* Next Milestone Banner */}
          {(() => {
            const effectiveMiles = Math.max(userProgress.milesLogged, 1);
            const nextMilestone = challenge.milestones
              .slice()
              .sort((a, b) => a.miles - b.miles)
              .find(m => effectiveMiles < m.miles);
            if (!nextMilestone) return null;
            const miAway = Math.max(0, nextMilestone.miles - effectiveMiles).toFixed(1);
            return (
              <div
                className="mb-4 flex items-center gap-2 rounded-[10px] px-[14px] py-[10px] text-sm"
                style={{
                  background: "rgba(192,132,252,0.1)",
                  border: "1px solid rgba(192,132,252,0.3)",
                }}
              >
                <span className="text-base shrink-0">🥾</span>
                <span className="text-muted-foreground shrink-0">Next:</span>
                <span className="font-serif text-foreground font-semibold">{nextMilestone.name}</span>
                <span className="text-muted-foreground mx-0.5">—</span>
                <span className="font-mono text-sm shrink-0" style={{ color: "#FFD700" }}>{miAway} mi away</span>
              </div>
            );
          })()}

          {/* Journey Map */}
          <JourneyMap
            milestones={challenge.milestones}
            milesLogged={userProgress.milesLogged}
            totalMiles={challenge.totalMiles}
            colorClass={colors.text}
          />

          {/* Pricing Section — only shown to unenrolled users */}
          {!enrollment?.isEnrolled && (
            <div className="bg-card rounded-xl border border-border p-6 md:p-8 mb-8">
              <ChallengePricing
                challengeName={challenge.name}
                challengeId={challenge.id}
                challengeSlug={slug}
                editionColor={getPricingEditionColor(data?.challenge?.edition || "")}
                onMaybeLater={() => setShowReEngagementBanner(true)}
              />
            </div>
          )}

          {/* Virtual Route Visualization */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h3 className="text-lg font-semibold text-foreground">Virtual Route</h3>
              <div className="flex items-center gap-2">
                {/* Admin: pre-generate audio for all milestones */}
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreGenerateAudio}
                    disabled={isGeneratingAudio}
                    className="gap-1.5 text-xs"
                    title="Pre-generate ElevenLabs audio for all milestones without audio"
                  >
                    {isGeneratingAudio ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    {isGeneratingAudio
                      ? audioGenProgress
                        ? `Generated ${audioGenProgress.generated}, ${audioGenProgress.remaining} left…`
                        : "Starting…"
                      : "Pre-generate Audio"}
                  </Button>
                )}
                {/* Global mute toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  title={muted ? "Unmute narration" : "Mute narration"}
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  {muted ? "Muted" : "Audio on"}
                </Button>
              </div>
            </div>
            
            <div className="relative">
              {/* Track line scoped strictly to the milestone list */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
              <div 
                className={cn("absolute left-6 top-0 w-0.5 transition-all duration-1000", colors.routeLine)}
                style={{ height: `${progressPercent}%` }}
              />
              <div className="space-y-8">
                {challenge.milestones.map((milestone, index) => {
                  const isUnlocked = userProgress.milesLogged >= milestone.miles;
                  const isNext = !isUnlocked && (index === 0 || userProgress.milesLogged >= challenge.milestones[index - 1].miles);
                  const isLastUnlocked = isUnlocked && index === unlockedMilestonesCount - 1;
                  
                  return (
                    <div key={milestone.id} className="relative flex items-start gap-6">
                      <div className={cn(
                        "relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                        isUnlocked 
                          ? colors.bgSolid
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

                      <div className={cn(
                        "flex-1 pb-2",
                        !isUnlocked && "opacity-50"
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{milestone.name}</h4>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            isUnlocked ? colors.bgHighlight : "bg-secondary text-muted-foreground"
                          )}>
                            {milestone.miles} mi
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {milestone.location}
                        </p>
                        {isUnlocked && milestone.description && (
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                        )}
                        {/* Audio controls — only shown on the most recently unlocked milestone */}
                        {isLastUnlocked && (milestone.audioUrl || milestone.description) && (
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => replay()}
                              disabled={!currentAudioUrl}
                              className={cn("gap-1.5 text-xs", colors.text)}
                              title="Replay narration"
                            >
                              <RotateCcw className="w-3 h-3" />
                              {isPlaying ? "Playing…" : "Replay"}
                            </Button>
                          </div>
                        )}
                        {isUnlocked && (milestone.latitude || milestone.location) && (
                          <a
                            href={
                              milestone.latitude && milestone.longitude
                                ? `https://www.google.com/maps/search/?api=1&query=${milestone.latitude},${milestone.longitude}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(milestone.location)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn("gap-1.5 text-xs", colors.text)}
                            >
                              <MapPin className="w-3 h-3" />
                              View on Map
                            </Button>
                          </a>
                        )}
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

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={`/challenge/${slug}/passport`}>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
              >
                View Passport
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Legacy Guide AI Companion */}
      <LegacyGuide
        challengeContext={{
          name: challenge.name,
          title: challenge.title,
          totalMiles: challenge.totalMiles,
          milestones: challenge.milestones.map((m) => ({ name: m.name, miles: m.miles })),
          userMiles: userProgress.milesLogged,
          days: customDays,
        }}
      />

      {/* Mobile sticky Log Miles FAB */}
      <button
        onClick={() => logMilesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden",
          "flex items-center gap-2 px-6 py-3 rounded-full shadow-lg",
          "text-sm font-semibold text-primary-foreground",
          colors.button
        )}
        aria-label="Log miles"
      >
        <Footprints className="w-4 h-4" />
        Log Miles
      </button>
    </div>
  );
};

export default ChallengeRoute;
