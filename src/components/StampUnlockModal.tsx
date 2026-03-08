import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Share2, Volume2, VolumeX, ArrowRight } from "lucide-react";
import type { UnlockedStamp } from "@/hooks/useMileLogging";

interface StampUnlockModalProps {
  stamps: UnlockedStamp[];
  onClose: () => void;
  challengeSlug?: string;
  /** 0-based order index of the first newly unlocked milestone within the challenge */
  milestoneStartIndex?: number;
  /** Whether the user has already paid for this challenge */
  isEnrolled?: boolean;
  /** Called when user taps "Continue Challenge" on the first-mile stamp (unenrolled path) */
  onContinueToPurchase?: (stamp: UnlockedStamp) => void;
  /** Called when user taps "Share Achievement" on the first-mile stamp (unenrolled path) */
  onShareAchievement?: (stamp: UnlockedStamp) => void;
}

export function StampUnlockModal({
  stamps,
  onClose,
  challengeSlug,
  milestoneStartIndex = 0,
  isEnrolled = true,
  onContinueToPurchase,
  onShareAchievement,
}: StampUnlockModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef<Set<number>>(new Set());

  const currentStamp = stamps[currentIndex];
  const hasMore = currentIndex < stamps.length - 1;

  // Auto-play audio when stamp appears
  useEffect(() => {
    if (!currentStamp?.audioUrl) return;
    if (hasPlayedRef.current.has(currentIndex)) return;

    const timer = setTimeout(() => {
      hasPlayedRef.current.add(currentIndex);
      if (audioRef.current) {
        audioRef.current.src = currentStamp.audioUrl!;
        audioRef.current.play().catch(console.error);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [currentIndex, currentStamp]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (stamps.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, stamps.length]);

  if (!currentStamp) return null;

  const handleNext = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    if (hasMore) {
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
    onClose();
  };

  const toggleNarration = () => {
    if (!audioRef.current || !currentStamp.audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = currentStamp.audioUrl;
      audioRef.current.play().catch(console.error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `I earned a LegacyFit Passport Stamp!`,
        text: `Just unlocked "${currentStamp.stampTitle}" at ${currentStamp.milesRequired} miles! 🏅`,
        url: window.location.origin + "/passport",
      });
    } catch {
      // User cancelled or share not supported
    }
  };

  return (
    <Dialog open={stamps.length > 0} onOpenChange={() => handleClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-background to-amber-950/10 border-amber-500/30">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-amber-400">
            🏅 Stamp Unlocked!
          </DialogTitle>
        </DialogHeader>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onPlay={() => setIsPlaying(true)}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
        />

        <div className="flex flex-col items-center py-6 space-y-6">
          {/* Stamp display with animation */}
          <div
            className={`relative transition-all duration-500 ${
              isAnimating ? "scale-110 rotate-[-5deg]" : "scale-100 rotate-0"
            }`}
          >
            {currentStamp.stampImageUrl ? (
              <div className="relative">
                <img
                  src={currentStamp.stampImageUrl}
                  alt={currentStamp.stampTitle}
                  className="w-48 h-48 object-contain rounded-xl shadow-2xl shadow-amber-500/30"
                />
                <div className="absolute inset-0 rounded-xl ring-4 ring-amber-500/50 ring-offset-4 ring-offset-background" />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/30 ring-4 ring-amber-500/50 ring-offset-4 ring-offset-background">
                <MapPin className="w-16 h-16 text-amber-200 mb-2" />
                <span className="text-amber-100 font-bold text-lg text-center px-4">
                  {currentStamp.stampTitle}
                </span>
              </div>
            )}

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-amber-400/20 blur-2xl -z-10" />
          </div>

          {/* Stamp details */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              {currentStamp.stampTitle}
            </h3>
            {currentStamp.locationName && (
              <p className="text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4" />
                {currentStamp.locationName}
              </p>
            )}
            <div className="inline-block bg-amber-500 text-amber-950 px-4 py-1 rounded-full font-bold text-sm">
              {currentStamp.milesRequired} MILES ACHIEVED
            </div>
            {currentStamp.stampCopy && (
              <p className="text-muted-foreground italic text-sm max-w-xs mx-auto mt-3">
                "{currentStamp.stampCopy}"
              </p>
            )}
          </div>

          {/* Audio Narration Controls */}
          {currentStamp.audioUrl && (
            <div className="w-full px-2">
              <div className="relative bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleNarration}
                    className="shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center hover:bg-amber-500/30 transition-colors"
                    aria-label={isPlaying ? "Stop narration" : "Play narration"}
                  >
                    {isPlaying ? (
                      <VolumeX className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-amber-400/80 uppercase tracking-wide">
                      Legacy Guide · {currentStamp.stampTitle}
                    </p>
                  </div>
                </div>
                {isPlaying && (
                  <div className="absolute bottom-2 left-14 right-4 flex gap-1">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full bg-amber-500/40 animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-amber-500 text-amber-950 hover:bg-amber-400"
            >
              {hasMore ? `Next (${stamps.length - currentIndex - 1} more)` : "Continue"}
            </Button>
          </div>

          {/* Progress indicator */}
          {stamps.length > 1 && (
            <div className="flex gap-1">
              {stamps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= currentIndex ? "bg-amber-500" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
