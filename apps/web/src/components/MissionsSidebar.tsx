"use client";

import { useState } from "react";
import Link from "next/link";

export default function MissionsSidebar() {
  const [open, setOpen] = useState(true);
  const items = [
    { id: "easy", label: "Fácil • 10min de estudo", icon: "🟢" },
    { id: "normal", label: "Normal • Atualizar LinkedIn", icon: "🟣", locked: true },
    { id: "epic", label: "Épica • Projeto no GitHub", icon: "🔵", locked: true },
  ];

  return (
    <aside className={`fixed left-4 top-28 z-40 transition-all ${open ? "w-64" : "w-12"}`}>
      <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <button
            aria-label={open ? "Recolher missões" : "Expandir missões"}
            className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
            onClick={() => setOpen(!open)}
          >
            {open ? "←" : "→"}
          </button>
          {open && <div className="text-sm font-semibold">Missões da Semana</div>}
        </div>

        {open && (
          <div className="p-3">
            {/* progresso */}
            <div className="mb-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/5 rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" />
              </div>
              <div className="mt-1 text-[10px] text-white/60">XP: 0/100</div>
            </div>

            {/* lista */}
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id} className="group">
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm hover:bg-white/10">
                    <span>{it.icon}</span>
                    <span className="truncate">{it.label}</span>
                  </div>
                  {it.locked && (
                    <Link href="/entrar" className="mt-1 block rounded-lg bg-white/10 px-2 py-1 text-center text-[11px] hover:bg-white/20">
                      Entrar para desbloquear
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* cofre */}
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs animate-constPulse">🔒 Cofre da Semana</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes constPulse { 0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, .35) } 70% { box-shadow: 0 0 0 12px rgba(124, 58, 237, 0) } 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0) } }
        .animate-constPulse { animation: constPulse 2.4s ease-in-out infinite; }
      `}</style>
    </aside>
  );
}


