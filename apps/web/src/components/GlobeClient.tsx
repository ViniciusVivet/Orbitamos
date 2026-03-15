"use client";

import EarthGlobePure from "@/components/EarthGlobePure";

interface Props {
  level?: number;
  xp?: number;
  xpMax?: number;
}

export default function GlobeClient({ level, xp, xpMax }: Props) {
  return <EarthGlobePure level={level} xp={xp} xpMax={xpMax} />;
}
