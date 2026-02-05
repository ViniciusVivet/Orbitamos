"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSummary } from "@/lib/api";

export default function EstudanteProgresso() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getDashboardSummary>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    getDashboardSummary(token)
      .then(setSummary)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, [token]);

  const progress = summary?.progress ?? { percent: 0, phase: "", nextGoal: "", level: 1, xp: 0, streakDays: 0 };
  const checklist = summary?.weeklyChecklist ?? [];
  const achievements = summary?.achievements ?? [];
  const opportunities = summary?.opportunities ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Progresso</h1>
        <p className="mt-1 text-white/60">Sua evolução e conquistas</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-orbit-electric/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-orbit-electric">📊 Status da jornada</CardTitle>
              <CardDescription>Fase, nível e XP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-white font-semibold">{progress.phase}</div>
              <div className="text-white/70 text-sm">Nível {progress.level} • {progress.xp} XP</div>
              <div className="text-white/70 text-sm">Sequência: {progress.streakDays} dias</div>
              <div className="text-white/60 text-xs">Próxima meta: {progress.nextGoal}</div>
              <div className="pt-2">
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Progresso geral</span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orbit-purple/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-orbit-purple">✅ Checklist da semana</CardTitle>
              <CardDescription>Pequenas vitórias</CardDescription>
            </CardHeader>
            <CardContent>
              {checklist.length === 0 ? (
                <p className="text-white/50 text-sm">Sem tarefas no momento.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-center justify-between text-white/80">
                      <span>{item.label}</span>
                      <span className={item.done ? "text-orbit-electric" : "text-white/40"}>
                        {item.done ? "Concluído" : "Pendente"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-orbit-electric/20 bg-gray-900/50 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-orbit-electric">🏅 Conquistas</CardTitle>
              <CardDescription>Seu progresso visível</CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <p className="text-white/50 text-sm">Nenhuma conquista ainda. Continue nas aulas!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {achievements.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {opportunities.length > 0 && (
            <Card className="border-orbit-purple/20 bg-gray-900/50 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-orbit-purple">💼 Oportunidades</CardTitle>
                <CardDescription>Portas abrindo</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/80">
                  {opportunities.map((op) => (
                    <li key={op.title} className="flex items-center justify-between">
                      <span>{op.title}</span>
                      <span className="text-white/50 text-xs">{op.type}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
