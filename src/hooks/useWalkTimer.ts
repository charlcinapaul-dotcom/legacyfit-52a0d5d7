import { useState, useEffect, useRef, useCallback } from "react";

export function useWalkTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setSeconds(0);
    setRunning(true);
    setPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    setPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, paused]);

  const TOTAL = 90 * 60;
  const miles = Math.min((seconds / TOTAL) * 5, 5);
  const pct = Math.min((seconds / TOTAL) * 100, 100);
  const steps = Math.floor(seconds * 1.92);
  const calories = Math.floor(seconds * 0.13);
  const paceMin = Math.floor(TOTAL / 5 / 60);
  const paceSec = String(Math.floor((TOTAL / 5) % 60)).padStart(2, "0");
  const pace = `${paceMin}:${paceSec}`;

  const clockMin = String(Math.floor(seconds / 60)).padStart(2, "0");
  const clockSec = String(seconds % 60).padStart(2, "0");
  const clock = `${clockMin}:${clockSec}`;

  return {
    seconds,
    running,
    paused,
    start,
    togglePause,
    stop,
    clock,
    miles: miles.toFixed(1),
    pct,
    steps: steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : String(steps),
    calories,
    pace,
  };
}
