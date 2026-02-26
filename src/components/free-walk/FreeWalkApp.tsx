import React, { useState, useCallback } from "react";
import { useWalkTimer } from "@/hooks/useWalkTimer";
import { SplashScreen } from "./SplashScreen";
import { OnboardScreen } from "./OnboardScreen";
import { RouteScreen } from "./RouteScreen";
import { ActiveWalkScreen } from "./ActiveWalkScreen";
import { CompleteScreen } from "./CompleteScreen";
import { StillFeature } from "./still/StillFeature";

type Screen = "splash" | "onboard" | "route" | "walk" | "complete" | "still";

export function FreeWalkApp() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [walkerName, setWalkerName] = useState("Walker");
  const [finalTime, setFinalTime] = useState("—");
  const [finalCal, setFinalCal] = useState(0);

  const timer = useWalkTimer();

  const goTo = useCallback(
    (s: Screen) => {
      if (s !== "walk") timer.stop();
      setScreen(s);
      window.scrollTo(0, 0);
    },
    [timer]
  );

  const handleStartWalk = useCallback(() => {
    timer.start();
    goTo("walk");
  }, [timer, goTo]);

  const handleFinishWalk = useCallback(() => {
    const m = String(Math.floor(timer.seconds / 60)).padStart(2, "0");
    const s = String(timer.seconds % 60).padStart(2, "0");
    setFinalTime(`${m}:${s}`);
    setFinalCal(Math.floor(timer.seconds * 0.13));
    timer.stop();
    setScreen("complete");
    window.scrollTo(0, 0);
  }, [timer]);

  return (
    <div className="font-sans antialiased">
      {screen === "splash" && (
        <SplashScreen
          onStart={() => goTo("onboard")}
          onPreview={() => goTo("route")}
        />
      )}

      {screen === "onboard" && (
        <OnboardScreen
          onNext={(name) => { setWalkerName(name); goTo("route"); }}
          onBack={() => goTo("splash")}
        />
      )}

      {screen === "route" && (
        <RouteScreen
          onBegin={handleStartWalk}
          onBack={() => goTo("onboard")}
        />
      )}

      {screen === "walk" && (
        <ActiveWalkScreen
          queen={null}
          walkerName={walkerName}
          stats={{
            clock: timer.clock,
            miles: timer.miles,
            pct: timer.pct,
            steps: timer.steps,
            calories: timer.calories,
            pace: timer.pace,
            paused: timer.paused,
          }}
          onTogglePause={timer.togglePause}
          onFinish={handleFinishWalk}
        />
      )}

      {screen === "complete" && (
        <CompleteScreen
          queen={null}
          walkerName={walkerName}
          time={finalTime}
          calories={finalCal}
          onRestart={() => goTo("splash")}
          onWalkAnother={() => goTo("route")}
          onEnterStill={() => goTo("still")}
        />
      )}

      {screen === "still" && (
        <StillFeature
          queen={null}
          walkTime={finalTime}
          walkCalories={finalCal}
          onExit={() => goTo("splash")}
        />
      )}
    </div>
  );
}
