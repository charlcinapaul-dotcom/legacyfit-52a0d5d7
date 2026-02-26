import { useState, useRef, useCallback, useEffect } from "react";

export function useSilenceTimer(durationSec = 60) {
  const [remaining, setRemaining] = useState(durationSec);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (running) {
      stop();
      return;
    }
    if (done) {
      setRemaining(durationSec);
      setDone(false);
    }
    setRunning(true);
  }, [running, done, stop, durationSec]);

  const reset = useCallback(() => {
    stop();
    setRemaining(durationSec);
    setDone(false);
  }, [stop, durationSec]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          stop();
          setDone(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, stop]);

  const deg = ((durationSec - remaining) / durationSec) * 360;

  return { remaining, running, done, deg, toggle, reset };
}
