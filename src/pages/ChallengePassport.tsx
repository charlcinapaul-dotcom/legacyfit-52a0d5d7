import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Book, MapPin, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PassportStamp } from "@/components/PassportStamp";
import { MileLogger } from "@/components/MileLogger";
import { EnrollmentBadge } from "@/components/EnrollmentBadge";
import { usePassportStamps, type StampWithMilestone } from "@/hooks/usePassportStamps";
import { useChallengeBySlug } from "@/hooks/useChallengeBySlug";
import { useEnrollmentStatus } from "@/hooks/useEnrollmentStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function ChallengePassport() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedStamp, setSelectedStamp] = useState<StampWithMilestone | null>(null);

  const { data: challengeData, isLoading: challengeLoading } = useChallengeBySlug(slug);
  const challengeId = challengeData?.challenge?.id;
  
  const { data: enrollment } = useEnrollmentStatus(challengeId);
  const { stamps, unlockedCount, totalCount, isLoading: stampsLoading } = usePassportStamps(challengeId);

  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
  const isLoading = challengeLoading || stampsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-amber-950/5 to-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Skeleton className="h-6 w-40" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-32 rounded-xl mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!challengeData) {
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

  const challenge = challengeData.challenge;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-950/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/challenge/${slug}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Book className="w-6 h-6 text-amber-500" />
              <h1 className="text-xl font-bold">{challenge.title} Passport</h1>
              {enrollment && <EnrollmentBadge status={enrollment.status} />}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress section */}
        <Card className="mb-8 bg-gradient-to-r from-amber-900/20 to-amber-800/10 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-400 flex items-center justify-between">
              <span>Stamps Collected</span>
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
                : unlockedCount === totalCount
                ? "🎉 Congratulations! You've collected all stamps for this journey!"
                : `${totalCount - unlockedCount} more stamps to collect`}
            </p>
          </CardContent>
        </Card>

        {/* Mile Logger */}
        {challengeId && (
          <div className="mb-8">
            <MileLogger challengeId={challengeId} challengeSlug={slug} challengeName={challenge.title} />
          </div>
        )}

        {/* Tabbed content */}
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
...
          <TabsContent value="checkpoint">
            <div className="space-y-3">
              {stamps.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No milestones available yet.</p>
                  </CardContent>
                </Card>
              ) : (
                stamps.map((stamp, index) => {
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
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to challenge link */}
        <div className="mt-8 text-center">
          <Link to={`/challenge/${slug}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Challenge
            </Button>
          </Link>
        </div>
      </main>

      {/* Stamp detail modal */}
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
                  <Book className="w-16 h-16 text-muted-foreground" />
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
