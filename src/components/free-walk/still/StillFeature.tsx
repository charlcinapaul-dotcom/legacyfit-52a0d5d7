import React, { useState } from "react";
import { Queen } from "@/data/queens";
import { StillMoment } from "@/data/still";
import { StillHome } from "./StillHome";
import { StillBefore } from "./StillBefore";
import { StillDuring } from "./StillDuring";
import { StillAfter } from "./StillAfter";

type StillScreen = "home" | "before" | "during" | "after";

interface Props {
  queen: Queen | null;
  walkTime?: string;
  walkCalories?: number;
  onExit: () => void;
}

export function StillFeature({ queen, walkTime, onExit }: Props) {
  const [screen, setScreen] = useState<StillScreen>("home");
  const [moment, setMoment] = useState<StillMoment>("before");

  const goTo = (s: StillScreen) => { setScreen(s); window.scrollTo(0, 0); };

  if (screen === "home") return <StillHome selectedMoment={moment} onSelectMoment={setMoment} onEnter={() => goTo(moment)} onBack={onExit}/>;
  if (screen === "before") return <StillBefore queen={queen} onNext={() => goTo("during")} onBack={() => goTo("home")}/>;
  if (screen === "during") return <StillDuring onNext={() => goTo("after")} onBack={() => goTo("before")}/>;
  if (screen === "after") return <StillAfter queen={queen} walkTime={walkTime} onComplete={onExit} onBack={() => goTo("during")}/>;
  return null;
}
