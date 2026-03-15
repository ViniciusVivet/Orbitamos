"use client";

type Milestone = { range: string; label: string; xp: string; icon: string };

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const CONST_STARS = (() => {
  const rng = seededRng(99);
  return Array.from({ length: 32 }, () => ({
    cx: rng() * 900,
    cy: rng() * 220,
    r:  rng() * 1.8 + 0.3,
    op: rng() * 0.4 + 0.15,
  }));
})();

const MILESTONES: Milestone[] = [
  { range: "1–3 meses",  label: "Lógica e Fundamentos", xp: "+80 XP",      icon: "🧠" },
  { range: "3–5 meses",  label: "HTML · CSS · JS",      xp: "+120 XP",     icon: "💻" },
  { range: "6–8 meses",  label: "Projetos e Portfólio", xp: "+160 XP",     icon: "🚀" },
  { range: "9–12 meses", label: "Primeiro Estágio",     xp: "Épica 🏆",    icon: "⭐" },
  { range: "12+ meses",  label: "Dev Jr · Efetivação",  xp: "Lendária 🌟", icon: "🎯" },
];

const COLORS = [
  { active: "from-emerald-400 to-cyan-400",      done: "from-emerald-500/70 to-cyan-500/70",       glow: "shadow-[0_0_28px_rgba(52,211,153,0.55)]",   nodeColor: "#34D399", xpColor: "text-emerald-900" },
  { active: "from-sky-400 to-blue-500",          done: "from-sky-500/70 to-blue-600/70",           glow: "shadow-[0_0_28px_rgba(56,189,248,0.55)]",   nodeColor: "#38BDF8", xpColor: "text-sky-900"     },
  { active: "from-orbit-electric to-orbit-purple", done: "from-orbit-electric/70 to-orbit-purple/70", glow: "shadow-[0_0_28px_rgba(0,212,255,0.55)]", nodeColor: "#00D4FF", xpColor: "text-black/70"    },
  { active: "from-amber-400 to-orange-500",      done: "from-amber-500/70 to-orange-600/70",       glow: "shadow-[0_0_28px_rgba(251,191,36,0.55)]",   nodeColor: "#FBBF24", xpColor: "text-amber-900"   },
  { active: "from-pink-400 to-rose-500",         done: "from-pink-500/70 to-rose-600/70",          glow: "shadow-[0_0_28px_rgba(244,114,182,0.6)]",   nodeColor: "#F472B6", xpColor: "text-rose-900"    },
];

// Nós da constelação no espaço SVG 900×220
const POINTS = [
  { x: 70,  y: 148 },
  { x: 240, y: 65  },
  { x: 420, y: 155 },
  { x: 600, y: 75  },
  { x: 800, y: 150 },
];

// Segmentos independentes entre nós consecutivos
const SEGMENTS = [
  "M 70 148 C 140 148, 170 65, 240 65",
  "M 240 65 C 310 65, 350 155, 420 155",
  "M 420 155 C 490 155, 530 75, 600 75",
  "M 600 75 C 670 75, 730 150, 800 150",
];

// Posição dos labels como % do container (para escalar com o SVG)
const LABEL_POS = [
  { left: "5%",  top: "4%"  },
  { left: "22%", top: "45%" },
  { left: "41%", top: "3%"  },
  { left: "58%", top: "46%" },
  { left: "71%", top: "4%"  },
];

export default function ConstellationStepper({ current = 2 }: { current?: number }) {
  const completedCount = current + 1; // nós concluídos

  return (
    <div className="relative mx-auto mt-6 w-full max-w-5xl px-4">

      {/* Cabeçalho da trilha */}
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-extrabold tracking-[0.2em] uppercase bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
          🗺️ Trilha de conquistas
        </p>
        <p className="text-xs font-bold text-white/50">
          {completedCount} / {POINTS.length} etapas
        </p>
      </div>

      <div className="relative mx-auto h-[220px] w-full">
        <svg width="100%" height="220" viewBox="0 0 900 220">
          <defs>
            <linearGradient id="cg-done" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="cg-todo" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow-strong" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id="nebula1" cx="25%" cy="50%" r="40%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#00D4FF" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="nebula2" cx="75%" cy="45%" r="40%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.14"/>
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Nebulosas de fundo */}
          <ellipse cx="180" cy="110" rx="160" ry="90" fill="url(#nebula1)" />
          <ellipse cx="540" cy="110" rx="160" ry="90" fill="url(#nebula2)" />

          {/* Estrelinhas de fundo */}
          {CONST_STARS.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fff" opacity={s.op} />
          ))}

          {/* Segmentos do caminho */}
          {SEGMENTS.map((d, i) => {
            const segDone = i + 1 < completedCount; // segmento totalmente concluído
            const segCurrent = i + 1 === completedCount; // segmento até o nó atual
            const active = segDone || segCurrent;
            return (
              <g key={i}>
                {/* Sombra / trilha sempre visível */}
                <path d={d} stroke="url(#cg-todo)" strokeWidth="2" fill="none" strokeDasharray={active ? "none" : "6 8"} />
                {/* Trilha ativa com glow */}
                {active && (
                  <path d={d} stroke="url(#cg-done)" strokeWidth="2.5" fill="none" filter="url(#glow-soft)" opacity="0.9" />
                )}
              </g>
            );
          })}

          {/* Nós da constelação */}
          {POINTS.map((p, idx) => {
            const done    = idx < current;
            const active  = idx === current;
            const locked  = idx > current;

            return (
              <g key={idx} transform={`translate(${p.x}, ${p.y})`}>
                {/* Halo externo para nó atual */}
                {active && (
                  <>
                    <circle r="28" fill="#8B5CF6" opacity="0.08" />
                    <circle r="22" stroke="#00D4FF" strokeWidth="1" fill="none" opacity="0.4"
                      className="animate-[ping_2s_ease-out_infinite]" />
                  </>
                )}

                {/* Corpo do nó */}
                {done && (
                  <>
                    <circle r="14" fill={COLORS[idx].nodeColor} filter="url(#glow-soft)" opacity="0.85" />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#000" fontWeight="bold">✓</text>
                  </>
                )}
                {active && (
                  <>
                    <circle r="16" fill="#0a0a1a" stroke={COLORS[idx].nodeColor} strokeWidth="2.5" filter="url(#glow-strong)" />
                    <polygon points="0,-10 10,0 0,10 -10,0" fill={COLORS[idx].nodeColor} filter="url(#glow-strong)" />
                    <line x1="-14" y1="0" x2="14" y2="0" stroke={COLORS[idx].nodeColor} strokeWidth="1.2" opacity="0.6" />
                    <line x1="0" y1="-14" x2="0" y2="14" stroke={COLORS[idx].nodeColor} strokeWidth="1.2" opacity="0.6" />
                  </>
                )}
                {locked && (
                  <>
                    <circle r="12" fill="#ffffff0d" stroke="#ffffff22" strokeWidth="1.5" />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#ffffff55">🔒</text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Labels HTML (posicionados em % para escalar com o SVG) */}
        {POINTS.map((_, idx) => {
          const done   = idx < current;
          const active = idx === current;
          const locked = idx > current;
          const pos    = LABEL_POS[idx];
          const m      = MILESTONES[idx];
          const c      = COLORS[idx];

          return (
            <div
              key={`label-${idx}`}
              className={`absolute w-[155px] rounded-xl px-3 py-2 text-left transition-all
                ${done   ? `bg-gradient-to-br ${c.done} text-black shadow-[0_0_18px_rgba(0,0,0,0.3)]` : ""}
                ${active ? `bg-gradient-to-br ${c.active} text-black ${c.glow} ring-1 ring-white/30` : ""}
                ${locked ? "bg-white/5 text-white/40 border border-white/10" : ""}
              `}
              style={{ left: pos.left, top: pos.top }}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[11px]">{m.icon}</span>
                <span className={`text-[10px] font-extrabold uppercase tracking-wide ${locked ? "opacity-40" : "opacity-90"}`}>
                  {m.range}
                </span>
              </div>
              <div className={`text-[12px] font-bold leading-tight ${locked ? "opacity-30" : ""}`}>{m.label}</div>
              <div className={`mt-1 text-[10px] font-extrabold ${done || active ? c.xpColor : "text-white/20"}`}>
                {m.xp}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 0.6 }
          100% { transform: scale(1.6); opacity: 0   }
        }
      `}</style>
    </div>
  );
}
