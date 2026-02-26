import { useState, useEffect, useRef, useCallback } from "react";
import { BREATH_PHASES } from "@/data/still";

interface BreathState {
  word: string;
  count: number;
  max: number;
  running: boolean;
}

export function useBreath() {
  const [state, setState] = useState<BreathState>({
    word: "Breathe",
    count: 0,
    max: 4,
    running: false,
  });
  const phaseRef = useRef(0);
  const countRef = useRef(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    phaseRef.current = 0;
    countRef.current = 1;
    setState({ word: "Breathe", count: 0, max: 4, running: false });
  }, []);

  const toggle = useCallback(() => {
    if (intervalRef.current) {
      stop();
      return;
    }

    phaseRef.current = 0;
    countRef.current = 1;

    const tick = () => {
      const phase = BREATH_PHASES[phaseRef.current];
      setState({ word: phase.word, count: countRef.current, max: phase.max, running: true });
      countRef.current++;
      if (countRef.current > phase.max) {
        phaseRef.current = (phaseRef.current + 1) % BREATH_PHASES.length;
        countRef.current = 1;
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
  }, [stop]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return { ...state, toggle, stop };
}
