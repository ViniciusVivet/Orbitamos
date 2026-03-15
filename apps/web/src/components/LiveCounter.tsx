"use client";

import { useEffect, useState } from "react";

interface Props {
  value: number;
  colorClass?: string;     // ex: "text-orbit-electric"
  glowStyle?: string;      // ex: "drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]"
  live?: boolean;          // exibe badge "ao vivo" com sync periódico
  duration?: number;       // duração do count-up em ms
}

export default function LiveCounter({
  value,
  colorClass = "text-orbit-electric",
  glowStyle  = "drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]",
  live       = false,
  duration   = 1400,
}: Props) {
  const [display,  setDisplay]  = useState(0);
  const [syncing,  setSyncing]  = useState(false);

  // Count-up com easeOutExpo ao montar
  useEffect(() => {
    const start = performance.now();
    const tick  = (now: number) => {
      const t       = Math.min((now - start) / duration, 1);
      const eased   = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
      setDisplay(Math.round(eased * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  // Sincronização periódica — cria a sensação de dado ao vivo
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 700);
    }, 5000);
    return () => clearInterval(id);
  }, [live]);

  return (
    <div className="relative inline-block">
      {/* Badge "ao vivo" */}
      {live && (
        <div className="absolute -right-1 -top-3 flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-400">
            {syncing ? "sync…" : "ao vivo"}
          </span>
        </div>
      )}

      {/* Número */}
      <div
        className={`tabular-nums transition-transform duration-150 text-4xl md:text-6xl font-extrabold mb-2 ${colorClass} ${glowStyle} ${syncing ? "scale-110" : "scale-100"}`}
      >
        {display}
      </div>
    </div>
  );
}
