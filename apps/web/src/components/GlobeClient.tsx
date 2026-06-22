"use client";

import EarthGlobePure from "@/components/EarthGlobePure";

interface Props {
  level?: number;
  xp?: number;
  xpMax?: number;
  variant?: "default" | "hero";
  showWidgets?: boolean;
}

export default function GlobeClient({ level, xp, xpMax, variant, showWidgets }: Props) {
  return <EarthGlobePure level={level} xp={xp} xpMax={xpMax} variant={variant} showWidgets={showWidgets} />;
}
