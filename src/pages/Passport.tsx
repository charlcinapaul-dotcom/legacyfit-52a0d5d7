import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Book, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PassportStamp } from "@/components/PassportStamp";
import { MileLogger } from "@/components/MileLogger";
import { usePassportStamps, useChallenges, type StampWithMilestone } from "@/hooks/usePassportStamps";
import { Skeleton } from "@/components/ui/skeleton";

export default function Passport() {
  const navigate = useNavigate();
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | undefined>();
  const [selectedStamp, setSelectedStamp] = useState<StampWithMilestone | null>(null);

  const { data: challenges, isLoading: challengesLoading } = useChallenges();
  const { stamps, unlockedCount, totalCount, isLoading: stampsLoading } = usePassportStamps(selectedChallengeId);

  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-amber-950/5 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Book className="w-6 h-6 text-amber-500" />
              <h1 className="text-xl font-bold">My Passport</h1>
            </div>
          </div>

          {/* Challenge filter */}
          <Select value={selectedChallengeId || "all"} onValueChange={(v) => setSelectedChallengeId(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Challenges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Challenges</SelectItem>
              {challenges?.map((challenge) => (
                <SelectItem key={challenge.id} value={challenge.id}>
                  {challenge.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                ? "🎉 Congratulations! You've collected all stamps!"
                : `${totalCount - unlockedCount} more stamps to collect`}
            </p>
          </CardContent>
        </Card>

        {/* Mile Logger */}
        {selectedChallengeId && (
          <div className="mb-8">
            <MileLogger challengeId={selectedChallengeId} />
          </div>
        )}

        {/* Stamps grid */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-amber-500">📜</span>
            {selectedChallengeId ? "Challenge Stamps" : "All Stamps"}
          </h2>
        </div>

        {stampsLoading || challengesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : stamps.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Book className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No stamps available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Select a challenge to start collecting stamps!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stamps.map((stamp) => (
              <PassportStamp
                key={stamp.id}
                stamp={stamp}
                onClick={() => setSelectedStamp(stamp)}
              />
            ))}
          </div>
        )}
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
