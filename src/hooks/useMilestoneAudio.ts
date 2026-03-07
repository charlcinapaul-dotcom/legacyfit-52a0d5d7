import { useRef, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches or generates an ElevenLabs audio URL for a milestone,
 * then plays it. Also returns mute/replay controls.
 */
export function useMilestoneAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  /**
   * Resolve an audio URL for a milestone:
   *  1. If the DB milestone already has audio_url → use it
   *  2. Otherwise call generate-milestone-audio edge fn to create + save it
   */
  const resolveAudioUrl = useCallback(
    async (milestoneDbId: string, existingAudioUrl: string | null): Promise<string | null> => {
      if (existingAudioUrl) return existingAudioUrl;

      try {
        const { data, error } = await supabase.functions.invoke("generate-milestone-audio", {
          body: { milestoneId: milestoneDbId },
        });

        if (error) {
          console.error("Audio generation error:", error);
          return null;
        }

        return data?.audioUrl ?? null;
      } catch (e) {
        console.error("Failed to generate milestone audio:", e);
        return null;
      }
    },
    []
  );

  /**
   * Play audio for a milestone. Stops any currently playing audio first.
   */
  const playMilestoneAudio = useCallback(
    async (milestoneDbId: string, existingAudioUrl: string | null) => {
      // Stop whatever is playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setCurrentAudioUrl(null);

      if (muted) return;

      const url = await resolveAudioUrl(milestoneDbId, existingAudioUrl);
      if (!url) return;

      setCurrentAudioUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);

      try {
        await audio.play();
      } catch (e) {
        console.error("Audio play failed:", e);
        setIsPlaying(false);
      }
    },
    [muted, resolveAudioUrl]
  );

  const replay = useCallback(() => {
    if (!currentAudioUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(currentAudioUrl);
    audioRef.current = audio;
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  }, [currentAudioUrl]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (!m) {
        // Muting — stop current audio
        audioRef.current?.pause();
        setIsPlaying(false);
      }
      return !m;
    });
  }, []);

  return { playMilestoneAudio, toggleMute, replay, muted, isPlaying, currentAudioUrl };
}
