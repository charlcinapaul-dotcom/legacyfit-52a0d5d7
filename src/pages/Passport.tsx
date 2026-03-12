import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, MapPin, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PassportStamp } from "@/components/PassportStamp";
import { usePassportStamps, useChallenges, type StampWithMilestone } from "@/hooks/usePassportStamps";
import { Skeleton } from "@/components/ui/skeleton";

export default function Passport() {
  const navigate = useNavigate();
  const [selectedStamp, setSelectedStamp] = useState<StampWithMilestone | null>(null);

  // Fetch ALL stamps across all challenges (no challengeId filter)
  const { stamps, unlockedCount, totalCount, isLoading } = usePassportStamps();
  const { data: challenges, isLoading: challengesLoading } = useChallenges();

  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  // Group stamps by challenge_id for display
  const stampsByChallengeId = stamps.reduce<Record<string, StampWithMilestone[]>>((acc, stamp) => {
    if (!acc[stamp.challenge_id]) acc[stamp.challenge_id] = [];
    acc[stamp.challenge_id].push(stamp);
    return acc;
  }, {});

  const challengeMap = (challenges || []).reduce<Record<string, string>>((acc, c) => {
    acc[c.id] = c.title;
    return acc;
  }, {});

  const challengeGroups = Object.entries(stampsByChallengeId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-950/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold">Passport Stamp Vault</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress section */}
        <Card className="mb-8 bg-gradient-to-r from-amber-900/20 to-amber-800/10 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-400 flex items-center justify-between">
              <span>Total Stamps Collected</span>
              <span className="text-2xl">
                {unlockedCount} / {totalCount}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-3 bg-amber-950/50" />
            <p className="text-sm text-muted-foreground mt-2">
              {unlockedCount === 0
                ? "Start logging miles to earn your first stamp!"
                : unlockedCount === totalCount && totalCount > 0
                ? "🎉 Congratulations! You've collected all stamps across every journey!"
                : `${totalCount - unlockedCount} more stamps to collect across all challenges`}
            </p>
          </CardContent>
        </Card>

        {/* Two-tab layout matching ChallengePassport */}
        {isLoading || challengesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="stamps" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="stamps" className="flex items-center gap-2">
                <span className="text-amber-500">📜</span>
                Journey Stamps
              </TabsTrigger>
              <TabsTrigger value="checkpoint" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Passport Checkpoint
              </TabsTrigger>
            </TabsList>

            {/* Journey Stamps Tab */}
            <TabsContent value="stamps">
              {challengeGroups.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No stamps available yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Enroll in a challenge to start collecting stamps!
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => navigate("/challenges")}
                    >
                      Explore Challenges
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {challengeGroups.map(([challengeId, challengeStamps]) => (
                    <div key={challengeId}>
                      <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        {challengeMap[challengeId] || "Challenge"}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {challengeStamps.map((stamp) => (
                          <PassportStamp
                            key={stamp.id}
                            stamp={stamp}
                            onClick={() => setSelectedStamp(stamp)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Passport Checkpoint Tab */}
            <TabsContent value="checkpoint">
              {challengeGroups.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No milestones available yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {challengeGroups.map(([challengeId, challengeStamps]) => (
                    <div key={challengeId}>
                      <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        {challengeMap[challengeId] || "Challenge"}
                      </h3>
                      <div className="space-y-3">
                        {challengeStamps.map((stamp, index) => {
                          const mapsUrl =
                            stamp.latitude && stamp.longitude
                              ? `https://www.google.com/maps/search/?api=1&query=${stamp.latitude},${stamp.longitude}`
                              : null;

                          return (
                            <Card
                              key={stamp.id}
                              className={`border transition-colors ${
                                stamp.isUnlocked
                                  ? "border-amber-500/40 bg-amber-900/10"
                                  : "border-border bg-card opacity-70"
                              }`}
                            >
                              <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wide mb-0.5">
                                    Milestone {index + 1}
                                  </p>
                                  <h4 className="font-bold text-foreground truncate">
                                    {stamp.stamp_title || stamp.title}
                                  </h4>
                                  {stamp.location_name && (
                                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                      📍 {stamp.location_name}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {stamp.stamp_mileage_display || `${stamp.miles_required} miles`}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {stamp.isUnlocked && mapsUrl ? (
                                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                                      <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 gap-1.5">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        View on Map
                                      </Button>
                                    </a>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                      <Lock className="w-3.5 h-3.5" />
                                      <span>Reach {stamp.miles_required} mi</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Stamp detail modal — identical to ChallengePassport */}
      <Dialog open={!!selectedStamp} onOpenChange={() => setSelectedStamp(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedStamp?.isUnlocked ? "🏅 Stamp Details" : "🔒 Locked Stamp"}
            </DialogTitle>
          </DialogHeader>

          {selectedStamp && (
            <div className="flex flex-col items-center py-4 space-y-4">
              {selectedStamp.isUnlocked && selectedStamp.stamp_image_url ? (
                <img
                  src={selectedStamp.stamp_image_url}
                  alt={selectedStamp.stamp_title || selectedStamp.title}
                  className="w-48 h-48 object-contain rounded-xl"
                />
              ) : selectedStamp.stamp_image_url ? (
                <img
                  src={selectedStamp.stamp_image_url}
                  alt={selectedStamp.stamp_title || selectedStamp.title}
                  className="w-48 h-48 object-contain rounded-xl grayscale opacity-50"
                />
              ) : (
                <div className="w-48 h-48 rounded-xl bg-muted flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">
                  {selectedStamp.stamp_title || selectedStamp.title}
                </h3>
                {selectedStamp.location_name && (
                  <p className="text-muted-foreground">📍 {selectedStamp.location_name}</p>
                )}
                <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                  selectedStamp.isUnlocked
                    ? "bg-amber-500 text-amber-950"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {selectedStamp.stamp_mileage_display || `${selectedStamp.miles_required} miles`}
                </div>
                {selectedStamp.stamp_copy && (
                  <p className="text-muted-foreground italic text-sm">
                    "{selectedStamp.stamp_copy}"
                  </p>
                )}
                {selectedStamp.historical_event && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {selectedStamp.historical_event}
                  </p>
                )}
                {selectedStamp.isUnlocked && selectedStamp.unlockedAt && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Unlocked: {new Date(selectedStamp.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
