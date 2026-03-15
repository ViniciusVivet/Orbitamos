"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  colorClass?: string;
  glowStyle?: string;
  live?: boolean;
}

export default function LiveCounter({
  value,
  colorClass = "text-orbit-electric",
  glowStyle  = "drop-shadow-[0_0_20px_rgba(0,212,255,0.5)]",
  live       = false,
}: Props) {
  const ref               = useRef<HTMLDivElement>(null);
  const [visible,  setVisible]  = useState(false);
  const [animKey,  setAnimKey]  = useState(0);
  const [showVal,  setShowVal]  = useState(value);

  // Dispara o flip quando o elemento entra no viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // "Quase incrementa": a cada 9s flipa para value+1 por 800ms e volta
  // Cria tensão psicológica — parece que está prestes a subir
  useEffect(() => {
    if (!live || !visible) return;
    const id = setInterval(() => {
      setShowVal(value + 1);
      setAnimKey(k => k + 1);
      setTimeout(() => {
        setShowVal(value);
        setAnimKey(k => k + 1);
      }, 800);
    }, 9000);
    return () => clearInterval(id);
  }, [live, visible, value]);

  return (
    <div ref={ref}>
      <div
        key={animKey}
        className={`tabular-nums text-4xl md:text-6xl font-extrabold mb-2 ${colorClass} ${glowStyle}`}
        style={{
          animation:     visible ? "flipIn 0.65s cubic-bezier(0.23,1,0.32,1) forwards" : "none",
          opacity:       visible ? undefined : 0,
          transformOrigin: "top center",
        }}
      >
        {showVal}
      </div>

      <style>{`
        @keyframes flipIn {
          0%   { transform: perspective(400px) rotateX(-90deg); opacity: 0.2; }
          55%  { transform: perspective(400px) rotateX(12deg);  opacity: 1;   }
          75%  { transform: perspective(400px) rotateX(-5deg);               }
          100% { transform: perspective(400px) rotateX(0deg);                }
        }
      `}</style>
    </div>
  );
}
