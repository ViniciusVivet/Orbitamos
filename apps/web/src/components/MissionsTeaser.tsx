"use client";

import Link from "next/link";

export default function MissionsTeaser() {
  const Card = ({ title, locked = false }: { title: string; locked?: boolean }) => (
    <div className={`relative rounded-2xl border ${locked ? "border-white/10 bg-white/5" : "border-white/20 bg-white/10"} p-4 backdrop-blur-xl [transform:translateZ(12px)]`}> 
      <div className="text-sm font-semibold">{title}</div>
      {locked && (
        <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/50">
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs">Entrar para desbloquear</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-10">
      <div className="mb-4 text-center text-white/80">Missões da Semana — desbloqueie recompensas</div>
      <div className="relative mx-auto grid max-w-3xl grid-cols-3 gap-4">
        <Card title="Fácil • 10min de estudo" />
        <Card title="Normal • Atualizar LinkedIn" locked />
        <Card title="Épica • Projeto no GitHub" locked />

        {/* linha de constelação */}
        <svg className="pointer-events-none absolute left-0 top-0 h-full w-full" viewBox="0 0 600 160">
          <defs>
            <linearGradient id="tgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00D4FF"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>
          <path d="M 60 120 C 220 20, 380 220, 540 80" stroke="url(#tgrad)" strokeWidth="2" fill="none" opacity=".5" />
        </svg>
      </div>

      {/* cofre e XP fantasma */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm backdrop-blur-xl animate-constPulse">🔒 Cofre da Semana</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm backdrop-blur-xl">XP: 0/100</div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/entrar" className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-6 py-3 text-black font-bold inline-block">Entrar e começar agora</Link>
      </div>

      <style>{`
        @keyframes constPulse { 0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, .35) } 70% { box-shadow: 0 0 0 12px rgba(124, 58, 237, 0) } 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0) } }
        .animate-constPulse { animation: constPulse 2.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}


