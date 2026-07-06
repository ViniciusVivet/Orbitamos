"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useProgress, defaultProgress } from "@/contexts/ProgressContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardSummary, getDashboardSummary } from "@/lib/api";
import { whatsappMentoriaUrl } from "@/lib/social";
import { listarAulasConcluidas, listarCursosAcademy, totalAulas, type Curso } from "@/lib/cursos";
import { getNextIncompleteLesson, type FlatLesson } from "@/lib/learningExperience";

export default function EstudanteInicio() {
  const { user, token } = useAuth();
  const { progress: progressFromContext } = useProgress();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nextLesson, setNextLesson] = useState<FlatLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [academyLoading, setAcademyLoading] = useState(true);
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

  useEffect(() => {
    let active = true;
    setAcademyLoading(true);
    listarCursosAcademy()
      .then(async (items) => {
        if (!active) return;
        setCursos(items);
        const lessonIds = items.flatMap((curso) => curso.modulos.flatMap((mod) => mod.aulas.map((aula) => aula.id)));
        const completed = await listarAulasConcluidas(lessonIds);
        if (!active) return;
        const completedSet = new Set(completed);
        setCompletedLessons(completedSet.size);
        setNextLesson(getNextIncompleteLesson(items, completedSet));
      })
      .catch(() => {
        if (!active) return;
        setCursos([]);
        setNextLesson(null);
      })
      .finally(() => {
        if (active) setAcademyLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const progress = progressFromContext ?? defaultProgress;
  const nextAction = summary?.nextAction ?? {
    title: "Continuar o Módulo 1",
    description: "Registrar a primeira dúvida",
    cta: "/estudante/aulas",
  };
  const checklist = summary?.weeklyChecklist ?? [];
  const totalLessons = cursos.reduce((acc, curso) => acc + totalAulas(curso), 0);
  const academyPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : progress.percent;
  const continueHref = nextLesson ? `/estudante/cursos/${nextLesson.curso.slug}` : "/estudante/aulas";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Olá, <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="mt-1 text-white/60">Resumo da sua jornada</p>
        </div>
        <Link href={continueHref} className="shrink-0">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-bold hover:opacity-90 text-base px-6 py-3">
            Continuar estudando
          </Button>
        </Link>
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
          <Card className="border-orbit-electric/30 bg-gradient-to-br from-orbit-electric/10 to-orbit-purple/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-orbit-electric">Continuar sua jornada</CardTitle>
              <CardDescription>
                {academyLoading ? "Buscando sua próxima aula..." : "Uma ação clara para estudar hoje"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-xl font-black text-white">
                  {nextLesson ? nextLesson.aula.titulo : progress.lastLesson || "Comece pela primeira trilha"}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  {nextLesson
                    ? `${nextLesson.curso.titulo} • ${nextLesson.moduloTitulo} • aula ${nextLesson.index + 1} de ${nextLesson.total}`
                    : "Escolha uma trilha, abra a primeira aula e conclua uma prática pequena hoje."}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="bg-gradient-to-r from-orbit-electric to-orbit-purple font-bold text-black hover:opacity-90">
                    <Link href={continueHref}>Abrir aula recomendada</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Link href="/estudante/aulas">Ver todas as trilhas</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Progresso da academia</span>
                  <span>{academyPercent}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple"
                    style={{ width: `${academyPercent}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-white/45">
                  {completedLessons} de {totalLessons || "?"} aulas concluídas
                </p>
              </div>
            </CardContent>
          </Card>

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
              <p className="text-white/80 text-sm">{nextAction.title} — {nextAction.description}</p>
              <p className="mt-2 text-xs text-white/50">Use o botão &quot;Ir para sala de aula&quot; no menu acima para acessar as aulas.</p>
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
                <Button asChild variant="outline" size="sm" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
                  <Link href="/estudante/mentorias">Ver mentorias</Link>
                </Button>
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
          <Button asChild variant="outline" className="border-orbit-electric text-orbit-electric hover:bg-orbit-electric hover:text-black">
            <Link href="/estudante/orbita">Órbita</Link>
          </Button>
          <Button asChild variant="outline" className="border-orbit-electric text-orbit-electric hover:bg-orbit-electric hover:text-black">
            <Link href="/estudante/aulas">🎓 Aulas</Link>
          </Button>
          <Button asChild variant="outline" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
            <Link href="/estudante/mentorias">👨‍🏫 Mentorias</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/mensagens">💬 Enviar dúvida</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/estudante/comunidade">🌐 Fórum / Comunidade</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/estudante/progresso">📊 Progresso</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <a href={whatsappMentoriaUrl} target="_blank" rel="noreferrer">📱 Solicitar mentoria</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

