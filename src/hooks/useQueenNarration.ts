import { useEffect, useRef, useState } from "react";
import { ROUTE_STOPS } from "@/data/queens";

interface UseQueenNarrationOptions {
  currentStopIndex: number;
  paused: boolean;
  active: boolean;
  voiceURI?: string;
}

function getVoice(voiceURI: string): SpeechSynthesisVoice | null {
  if (!voiceURI) return null;
  return window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURI) ?? null;
}

function makeUtterance(
  text: string,
  voiceURI: string,
  onStart: () => void,
  onEnd: () => void
): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92;
  u.pitch = 1.05;
  const voice = getVoice(voiceURI);
  if (voice) u.voice = voice;
  u.onstart = onStart;
  u.onend = onEnd;
  u.onerror = onEnd;
  return u;
}

export function useQueenNarration({ currentStopIndex, paused, active, voiceURI = "" }: UseQueenNarrationOptions) {
  const [muted, setMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const onStart = () => setIsSpeaking(true);
  const onEnd = () => setIsSpeaking(false);

  // Speak the current stop's description when the stop index changes
  useEffect(() => {
    if (!active) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (muted) return;

    const stop = ROUTE_STOPS[currentStopIndex];
    if (!stop) return;

    const utterance = makeUtterance(stop.desc, voiceURI, onStart, onEnd);
    utteranceRef.current = utterance;

    // Small delay so the UI has time to render the new queen banner first
    const t = setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 600);

    return () => clearTimeout(t);
  }, [currentStopIndex, active, voiceURI]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const stop = ROUTE_STOPS[currentStopIndex];
      if (!stop) return;
      const utterance = makeUtterance(stop.desc, voiceURI, onStart, onEnd);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [muted]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = () => setMuted((m) => !m);

  return { isSpeaking, muted, toggleMute };
}
