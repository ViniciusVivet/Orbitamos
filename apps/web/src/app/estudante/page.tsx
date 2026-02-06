"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useProgress, defaultProgress } from "@/contexts/ProgressContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSummary, getDashboardSummary } from "@/lib/api";
import { whatsappMentoriaUrl } from "@/lib/social";

export default function EstudanteInicio() {
  const { user, token } = useAuth();
  const { progress: progressFromContext } = useProgress();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
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

  const progress = progressFromContext ?? defaultProgress;
  const nextAction = summary?.nextAction ?? {
    title: "Continuar o Módulo 1",
    description: "Registrar a primeira dúvida",
    cta: "/estudante/aulas",
  };
  const checklist = summary?.weeklyChecklist ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Olá, <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">{user?.name}</span>
        </h1>
        <p className="mt-1 text-white/60">Resumo da sua jornada</p>
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
          {/* Continuar de onde parou */}
          {progress.lastLesson && (
            <Card className="border-orbit-electric/30 bg-gradient-to-br from-orbit-electric/10 to-orbit-purple/10 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-orbit-electric">▶ Continuar de onde parou</CardTitle>
                <CardDescription>Última aula vista</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-white/90 font-medium">{progress.lastLesson}</p>
                <Link href="/estudante/aulas">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-bold hover:opacity-90">
                    Ir para as aulas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="border-orbit-electric/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-orbit-electric">📊 Seu progresso</CardTitle>
              <CardDescription>Fase atual e próxima meta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-white/60 mb-2">
                  <span>Progresso geral</span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
              {/* Streak em destaque */}
              <div className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm">
                <span className="text-xl">🔥</span>
                <span className="text-white/90 font-medium">
                  {progress.streakDays === 0
                    ? "Comece hoje para iniciar sua sequência!"
                    : `${progress.streakDays} dia${progress.streakDays !== 1 ? "s" : ""} seguidos`}
                </span>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <p className="text-white/80">Fase: <span className="font-semibold text-orbit-electric">{progress.phase}</span></p>
                <p className="mt-1 text-white/60">Próxima meta: {progress.nextGoal}</p>
                <p className="mt-1 text-white/50 text-xs">Nível {progress.level} • {progress.xp} XP</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orbit-purple/20 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="text-orbit-purple">🚀 Próxima ação</CardTitle>
              <CardDescription>Uma tarefa clara para hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-sm mb-4">{nextAction.title} — {nextAction.description}</p>
              <Link href={nextAction.cta}>
                <Button className="w-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-bold hover:from-orbit-purple hover:to-orbit-electric">
                  Ir para as aulas
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Próximo na agenda / mentoria */}
          <Card className="border-orbit-purple/20 bg-gray-900/50 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-orbit-purple">📅 Próximo na sua agenda</CardTitle>
              <CardDescription>Mentorias e eventos</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-white/70 text-sm">Nenhum evento agendado no momento.</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/estudante/mentorias">
                  <Button variant="outline" size="sm" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
                    Ver mentorias
                  </Button>
                </Link>
                <a href={whatsappMentoriaUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                    Agendar pelo WhatsApp
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gray-900/50 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">✅ Checklist da semana</CardTitle>
              <CardDescription>Pequenas vitórias</CardDescription>
            </CardHeader>
            <CardContent>
              {checklist.length === 0 ? (
                <p className="text-white/50 text-sm">Sem tarefas no momento.</p>
              ) : (
                <ul className="space-y-2">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
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
        </div>
      )}

      <Card className="border-white/10 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-white">Atalhos</CardTitle>
          <CardDescription>Navegue rápido</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/estudante/aulas">
            <Button variant="outline" className="border-orbit-electric text-orbit-electric hover:bg-orbit-electric hover:text-black">
              🎓 Aulas
            </Button>
          </Link>
          <Link href="/estudante/mentorias">
            <Button variant="outline" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
              👨‍🏫 Mentorias
            </Button>
          </Link>
          <Link href="/mensagens">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              💬 Enviar dúvida
            </Button>
          </Link>
          <Link href="/estudante/comunidade">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              🌐 Fórum / Comunidade
            </Button>
          </Link>
          <Link href="/estudante/progresso">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              📊 Progresso
            </Button>
          </Link>
          <Link href={whatsappMentoriaUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              📱 Solicitar mentoria
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
