import { useState, useEffect, useCallback } from "react";

const RATE_LIMIT_KEY_PREFIX = "rate_limit_until_";

export function useRateLimitCountdown(challengeId?: string) {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const storageKey = `${RATE_LIMIT_KEY_PREFIX}${challengeId}`;

  // Check if there's an active countdown on mount
  useEffect(() => {
    if (!challengeId) return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const until = Number(stored);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining > 0) {
        setSecondsRemaining(remaining);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [challengeId, storageKey]);

  // Countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(storageKey);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining, storageKey]);

  const triggerRateLimit = useCallback(() => {
    // Set a ~10 minute cooldown (conservative estimate for hourly window)
    const cooldownMs = 10 * 60 * 1000;
    const until = Date.now() + cooldownMs;
    localStorage.setItem(storageKey, String(until));
    setSecondsRemaining(Math.ceil(cooldownMs / 1000));
  }, [storageKey]);

  const isRateLimited = secondsRemaining > 0;

  const formatCountdown = () => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return { isRateLimited, secondsRemaining, formatCountdown, triggerRateLimit };
}
