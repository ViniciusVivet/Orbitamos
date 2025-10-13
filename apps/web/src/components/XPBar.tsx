"use client";

import { useEffect, useState } from "react";

type Props = { currentMonths?: number; targetMonths?: number };

export default function XPBar({ currentMonths = 10, targetMonths = 9 }: Props) {
  const progress = Math.min(100, Math.round((currentMonths / targetMonths) * 100));
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnim(progress), 200);
    return () => clearTimeout(t);
  }, [progress]);

  return (
    <div className="mx-auto mt-6 w-full max-w-xl">
      <div className="mb-2 flex items-center justify-between text-xs text-white/70">
        <span>Rumo ao primeiro trampo</span>
        <span>{anim}%</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple transition-[width] duration-700"
          style={{ width: `${anim}%` }}
        />
      </div>
      <div className="mt-1 text-center text-[11px] text-white/60">
        {currentMonths} / {targetMonths} meses
      </div>
    </div>
  );
}


