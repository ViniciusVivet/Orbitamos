"use client";

import Link from "next/link";

type Missao = {
  id: string;
  dificuldade: "Facil" | "Normal" | "Epica";
  titulo: string;
  xp: number;
  duracao: string;
  locked?: boolean;
};

const missoes: Missao[] = [
  { id: "easy-study",      dificuldade: "Facil",  titulo: "10min de estudo focado",            xp: 10, duracao: "10 min", locked: false },
  { id: "normal-linkedin", dificuldade: "Normal", titulo: "Atualizar LinkedIn com perfil dev",  xp: 25, duracao: "30 min", locked: false },
  { id: "epic-project",    dificuldade: "Epica",  titulo: "Subir 1 projeto no GitHub",          xp: 60, duracao: "1–2 h",  locked: true  },
];

const DIFF = {
  Facil:  { label: "Fácil",  badge: "bg-emerald-500/25 text-emerald-300 border-emerald-400/60", glow: "shadow-[0_0_24px_rgba(52,211,153,0.25)]",  border: "border-emerald-400/40", icon: "🟢" },
  Normal: { label: "Normal", badge: "bg-sky-500/25 text-sky-200 border-sky-400/60",             glow: "shadow-[0_0_24px_rgba(56,189,248,0.25)]",   border: "border-sky-400/40",     icon: "🔵" },
  Epica:  { label: "Épica",  badge: "bg-purple-500/30 text-purple-200 border-purple-400/70",    glow: "shadow-[0_0_28px_rgba(167,139,250,0.35)]",  border: "border-purple-400/50",  icon: "🟣" },
};

function DificuldadeBadge({ tipo }: { tipo: Missao["dificuldade"] }) {
  const d = DIFF[tipo];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${d.badge}`}>
      {d.icon} {d.label}
    </span>
  );
}

export default function MissionsTeaser() {
  const xpTotal = missoes.reduce((acc, m) => acc + m.xp, 0);
  const xpAtual = 0;

  return (
    <div>
      {/* Barra de XP da semana */}
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-white/60 font-medium">XP da semana</span>
        <span className="font-bold text-orbit-electric">{xpAtual} / {xpTotal} XP</span>
      </div>
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple shadow-[0_0_10px_rgba(0,212,255,0.6)]"
          style={{ width: xpAtual === 0 ? "2px" : `${(xpAtual / xpTotal) * 100}%` }}
        />
      </div>

      {/* Cards de missão */}
      <div className="relative mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        {missoes.map((m) => {
          const d = DIFF[m.dificuldade];
          return (
            <div
              key={m.id}
              className={`relative rounded-2xl border bg-black/50 p-4 backdrop-blur-xl transition-transform hover:-translate-y-0.5 ${d.border} ${d.glow}`}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <DificuldadeBadge tipo={m.dificuldade} />
                <span className="text-sm font-extrabold text-orbit-electric drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]">
                  +{m.xp} XP
                </span>
              </div>
              <div className="text-sm font-bold text-white leading-snug">{m.titulo}</div>
              <div className="mt-1.5 text-[11px] text-white/50">⏱ {m.duracao}</div>

              {m.locked && (
                <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/70 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-2xl">🔒</span>
                    <div className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[10px] font-semibold text-white/70 text-center">
                      Entre para desbloquear
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cofre da semana + CTA */}
      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="animate-constPulse rounded-2xl border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-200 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
          🏆 Cofre da Semana<span className="hidden sm:inline"> — complete tudo e abra o baú</span>
        </div>
        <Link
          href="/entrar"
          className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-5 py-3 text-xs font-extrabold text-black shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-shadow inline-flex items-center gap-1 min-h-[44px]"
        >
          ⚡ Entrar e ganhar XP
        </Link>
      </div>

      <style>{`
        @keyframes constPulse {
          0%   { box-shadow: 0 0 0 0 rgba(139,92,246,.5), 0 0 20px rgba(139,92,246,.2) }
          70%  { box-shadow: 0 0 0 10px rgba(139,92,246,0), 0 0 20px rgba(139,92,246,.2) }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0), 0 0 20px rgba(139,92,246,.2) }
        }
        .animate-constPulse { animation: constPulse 2.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
