import React, { useState, useCallback, useRef } from "react";
import { SplashScreen } from "./SplashScreen";
import { OnboardScreen } from "./OnboardScreen";
import { ConfirmScreen } from "./ConfirmScreen";
import { RouteScreen } from "./RouteScreen";
import { ActiveWalkScreen } from "./ActiveWalkScreen";
import { CompleteScreen } from "./CompleteScreen";

type Screen = "splash" | "onboard" | "confirm" | "route" | "walk" | "complete" | "still";

export function FreeWalkApp() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [walkerName, setWalkerName] = useState("Walker");
  const [fitnessLevel, setFitnessLevel] = useState("starting");
  const [goals, setGoals] = useState<string[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>("");
  const [goalMiles, setGoalMiles] = useState(5);
  const [finalMiles, setFinalMiles] = useState(0);
  const unlockedRef = useRef<Set<string>>(new Set());

  const goTo = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  }, []);

  const handleFinishWalk = useCallback((miles: number) => {
    setFinalMiles(miles);
    window.speechSynthesis.cancel();
    setScreen("complete");
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans antialiased relative">
      {screen === "splash" && (
        <SplashScreen
          onStart={() => goTo("onboard")}
          onPreview={() => goTo("route")}
        />
      )}

      {screen === "onboard" && (
        <OnboardScreen
          onNext={(name, fitness, g, vURI) => {
            setWalkerName(name);
            setFitnessLevel(fitness);
            setGoals(g);
            setVoiceURI(vURI);
            goTo("confirm");
          }}
          onBack={() => goTo("splash")}
        />
      )}

      {screen === "confirm" && (
        <ConfirmScreen
          walkerName={walkerName}
          fitnessLevel={fitnessLevel}
          goals={goals}
          onConfirm={() => goTo("route")}
          onBack={() => goTo("onboard")}
        />
      )}

      {screen === "route" && (
        <RouteScreen
          goalMiles={goalMiles}
          onGoalChange={setGoalMiles}
          onBegin={() => goTo("walk")}
          onBack={() => goTo("onboard")}
        />
      )}

      {screen === "walk" && (
        <ActiveWalkScreen
          queen={null}
          walkerName={walkerName}
          voiceURI={voiceURI}
          goalMiles={goalMiles}
          onFinish={handleFinishWalk}
          onStampsUnlocked={(ids) => {
            unlockedRef.current = ids;
          }}
        />
      )}

      {screen === "complete" && (
        <CompleteScreen
          queen={null}
          walkerName={walkerName}
          miles={finalMiles}
          unlockedStampIds={unlockedRef.current}
          onRestart={() => goTo("splash")}
          onWalkAnother={() => goTo("route")}
          onEnterStill={() => goTo("still")}
        />
      )}

      {/* Still feature — hidden until re-enabled (STILL_FEATURE_ENABLED: false) */}
    </div>
  );
}
