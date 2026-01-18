"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSummary, getDashboardSummary } from "@/lib/api";

export default function MissionsSidebar() {
  const [open, setOpen] = useState(true);
  const { token, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let isMounted = true;
    setLoading(true);
    getDashboardSummary(token)
      .then((result) => {
        if (!isMounted) return;
        setSummary(result);
      })
      .catch(() => {
        if (!isMounted) return;
        setSummary(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  const checklist = summary?.weeklyChecklist?.length
    ? summary.weeklyChecklist.map((item, index) => ({
        id: `${index}-${item.label}`,
        label: item.label,
        icon: item.done ? "✅" : "🟣",
        done: item.done,
      }))
    : [
        { id: "easy", label: "Fácil • 10min de estudo", icon: "🟢", done: false },
        { id: "normal", label: "Normal • Atualizar LinkedIn", icon: "🟣", done: false },
        { id: "epic", label: "Épica • Projeto no GitHub", icon: "🔵", done: false },
      ];
  const progressPercent = summary?.progress?.percent ?? 20;
  const xpAtual = summary?.progress?.xp ?? 0;

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
          {open && (
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="text-orbit-electric">🛸</span>
              Missões da Semana
            </div>
          )}
        </div>

        {open && (
          <div className="p-3">
            {/* progresso */}
            <div className="mb-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] text-white/60">XP: {xpAtual}/100</div>
            </div>

            {/* lista */}
            {loading ? (
              <p className="text-xs text-white/60">Carregando missões...</p>
            ) : (
              <ul className="space-y-2">
                {checklist.map((it) => (
                  <li key={it.id} className="group">
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm hover:bg-white/10">
                      <span>{it.icon}</span>
                      <span className="truncate">{it.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* cofre */}
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs animate-constPulse">🔒 Cofre da Semana</div>

            {/* acesso ao dashboard */}
            <div className="mt-3">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="block rounded-lg bg-gradient-to-r from-orbit-electric to-orbit-purple px-3 py-2 text-center text-xs font-semibold text-black"
                >
                  Ir para o dashboard
                </Link>
              ) : (
                <Link
                  href="/entrar"
                  className="block rounded-lg bg-white/10 px-3 py-2 text-center text-xs text-white/70 hover:bg-white/20"
                >
                  Faça login ou cadastre-se
                </Link>
              )}
            </div>
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


