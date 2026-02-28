import { useEffect, useRef, useState } from "react";
import { ROUTE_STOPS } from "@/data/queens";

interface UseQueenNarrationOptions {
  currentStopIndex: number;
  paused: boolean;
  active: boolean; // false when walk is not in progress
}

export function useQueenNarration({ currentStopIndex, paused, active }: UseQueenNarrationOptions) {
  const [muted, setMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Speak the current stop's description when the stop index changes
  useEffect(() => {
    if (!active) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (muted) return;

    const stop = ROUTE_STOPS[currentStopIndex];
    if (!stop) return;

    const utterance = new SpeechSynthesisUtterance(stop.desc);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;

    // Small delay so the UI has time to render the new queen banner first
    const t = setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 600);

    return () => clearTimeout(t);
  }, [currentStopIndex, active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pause / resume in sync with the walk timer
  useEffect(() => {
    if (!active) return;
    if (paused) {
      window.speechSynthesis.pause();
    } else {
      window.speechSynthesis.resume();
    }
  }, [paused, active]);

  // Cancel everything when the walk ends
  useEffect(() => {
    if (!active) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [active]);

  // Mute / unmute
  useEffect(() => {
    if (muted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (active && !paused) {
      // Re-read the current stop when unmuting
      const stop = ROUTE_STOPS[currentStopIndex];
      if (!stop) return;
      const utterance = new SpeechSynthesisUtterance(stop.desc);
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [muted]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = () => setMuted((m) => !m);

  return { isSpeaking, muted, toggleMute };
}
