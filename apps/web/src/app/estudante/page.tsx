"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Flame,
  Globe2,
  GraduationCap,
  MessageCircle,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { defaultProgress, useProgress } from "@/contexts/ProgressContext";
import type { DashboardSummary } from "@/lib/api";
import { getDashboardSummary } from "@/lib/api";
import { getNextIncompleteLesson, type FlatLesson } from "@/lib/learningExperience";
import { listarAulasConcluidas, listarCursosAcademy, totalAulas, type Curso } from "@/lib/cursos";

type QuickAccess = {
  href: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  color: string;
};

const quickAccess: QuickAccess[] = [
  {
    href: "/estudante/aulas",
    title: "Explorar aulas",
    description: "Encontre cursos, trilhas e práticas.",
    icon: BookOpen,
    color: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
  },
  {
    href: "/estudante/orbita",
    title: "Minha jornada",
    description: "Veja sua órbita, fase e próximos marcos.",
    icon: Globe2,
    color: "text-violet-300 bg-violet-400/10 border-violet-400/20",
  },
  {
    href: "/mensagens",
    title: "Mensagens",
    description: "Converse com a comunidade e tire dúvidas.",
    icon: MessageCircle,
    color: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  },
  {
    href: "/estudante/mentorias",
    title: "Mentorias",
    description: "Encontre orientação para o próximo passo.",
    icon: GraduationCap,
    color: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function EstudanteInicio() {
  const { user, token } = useAuth();
  const { progress: progressFromContext } = useProgress();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [courses, setCourses] = useState<Curso[]>([]);
  const [nextLesson, setNextLesson] = useState<FlatLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [academyLoading, setAcademyLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getDashboardSummary(token)
      .then(setSummary)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Não foi possível sincronizar seu resumo."));
  }, [token]);

  useEffect(() => {
    let active = true;
    listarCursosAcademy()
      .then(async (items) => {
        if (!active) return;
        setCourses(items);
        const lessonIds = items.flatMap((course) =>
          course.modulos.flatMap((module) => module.aulas.map((lesson) => lesson.id))
        );
        const completed = await listarAulasConcluidas(lessonIds);
        if (!active) return;
        const completedSet = new Set(completed);
        setCompletedLessons(completedSet.size);
        setNextLesson(getNextIncompleteLesson(items, completedSet));
      })
      .catch(() => {
        if (active) {
          setCourses([]);
          setNextLesson(null);
        }
      })
      .finally(() => {
        if (active) setAcademyLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const progress = progressFromContext ?? defaultProgress;
  const firstName = user?.name?.split(" ")[0] || "estudante";
  const totalLessons = courses.reduce((total, course) => total + totalAulas(course), 0);
  const academyPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : progress.percent;
  const continueHref = nextLesson ? `/estudante/cursos/${nextLesson.curso.slug}` : "/estudante/aulas";
  const checklist = summary?.weeklyChecklist ?? [];
  const completedChecklist = checklist.filter((item) => item.done).length;
  const achievements = summary?.achievements ?? [];
  const opportunities = summary?.opportunities ?? [];

  const recommendedCourses = useMemo(() => {
    if (!nextLesson) return courses.slice(0, 3);
    return [
      nextLesson.curso,
      ...courses.filter((course) => course.slug !== nextLesson.curso.slug),
    ].slice(0, 3);
  }, [courses, nextLesson]);

  return (
    <div className="-mx-4 -mt-4 min-h-screen overflow-hidden pb-14 sm:-mt-6 lg:-mx-6 lg:-mt-8">
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-10 pt-8 sm:px-8 lg:px-10 lg:pb-14 lg:pt-12">
        <div className="absolute inset-0 -z-20 bg-[#03050a]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_90%_at_80%_10%,rgba(139,92,246,.25),transparent_60%),radial-gradient(ellipse_65%_80%_at_5%_50%,rgba(0,212,255,.16),transparent_65%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">
                <span className="size-2 animate-pulse rounded-full bg-orbit-electric" />
                Central do estudante
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {getGreeting()}, <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">{firstName}</span>.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
                Seu mapa para estudar, praticar e transformar aprendizado em oportunidade.
              </p>
            </div>

            <Link
              href="/estudante/progresso"
              className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl transition hover:border-orbit-electric/30"
            >
              <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-orbit-electric to-orbit-purple font-black text-black">
                {progress.level}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Seu nível</div>
                <div className="text-sm font-bold text-white">{progress.xp} XP acumulados</div>
              </div>
              <ChevronRight className="size-4 text-white/35" />
            </Link>
          </header>

          <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.65fr)]">
            <article className="group relative min-h-[330px] overflow-hidden rounded-[28px] border border-orbit-electric/20 bg-gradient-to-br from-[#10273a] via-[#11152c] to-[#291746] p-6 shadow-[0_24px_100px_rgba(0,0,0,.35)] sm:p-8">
              <div className="absolute -right-20 -top-28 size-80 rounded-full border border-white/10" />
              <div className="absolute -right-5 -top-8 size-56 rounded-full border border-white/10" />
              <div className="absolute bottom-0 right-0 h-44 w-72 bg-[radial-gradient(circle_at_bottom_right,rgba(0,212,255,.25),transparent_65%)]" />

              <div className="relative flex h-full max-w-3xl flex-col">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-200">
                  <Rocket className="size-4" />
                  {academyLoading ? "Calculando sua rota" : "Continue sua missão"}
                </div>
                <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl">
                  {nextLesson?.aula.titulo || progress.lastLesson || "Escolha sua primeira trilha"}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                  {nextLesson
                    ? `${nextLesson.curso.titulo} · ${nextLesson.moduloTitulo} · aula ${nextLesson.index + 1} de ${nextLesson.total}`
                    : "Seu próximo passo começa com uma aula curta. Escolha um tema e coloque a mão na massa."}
                </p>

                <div className="mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="h-12 rounded-full bg-white px-6 font-black text-black hover:bg-white/90">
                      <Link href={continueHref}>▶ {nextLesson ? "Continuar aula" : "Começar agora"}</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-12 rounded-full border-white/20 bg-black/15 px-5 text-white hover:bg-white/10">
                      <Link href="/estudante/aulas">Ver catálogo</Link>
                    </Button>
                  </div>
                  <div className="min-w-48">
                    <div className="mb-2 flex justify-between text-xs text-white/50">
                      <span>OrbitAcademy</span>
                      <span>{academyPercent}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple"
                        style={{ width: `${academyPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-white/35">{completedLessons} de {totalLessons || "—"} aulas concluídas</p>
                  </div>
                </div>
              </div>
            </article>

            <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Link
                href="/estudante/orbita"
                className="group relative overflow-hidden rounded-3xl border border-violet-400/20 bg-violet-400/[.08] p-5 transition hover:border-violet-300/40 hover:bg-violet-400/[.12]"
              >
                <div className="absolute -right-8 -top-8 size-28 rounded-full border border-violet-300/15" />
                <Globe2 className="size-7 text-violet-300" />
                <div className="mt-5 text-[10px] font-bold uppercase tracking-widest text-white/35">Sua órbita</div>
                <div className="mt-1 text-xl font-black text-white">{progress.phase || "Fase inicial"}</div>
                <p className="mt-2 text-sm text-white/50">{progress.nextGoal || "Concluir as primeiras aulas da trilha."}</p>
                <span className="mt-5 flex items-center gap-1 text-xs font-bold text-violet-300">Abrir jornada <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span>
              </Link>

              <Link
                href="/estudante/progresso"
                className="group rounded-3xl border border-orange-400/20 bg-orange-400/[.07] p-5 transition hover:border-orange-300/40 hover:bg-orange-400/[.11]"
              >
                <div className="flex items-center justify-between">
                  <Flame className="size-7 text-orange-300" />
                  <span className="text-3xl font-black text-white">{progress.streakDays}</span>
                </div>
                <div className="mt-5 text-[10px] font-bold uppercase tracking-widest text-white/35">Sequência de estudos</div>
                <div className="mt-1 font-bold text-white">
                  {progress.streakDays ? `${progress.streakDays} dias mantendo o ritmo` : "Sua sequência começa hoje"}
                </div>
                <span className="mt-4 flex items-center gap-1 text-xs font-bold text-orange-300">Ver progresso <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span>
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 pt-8 sm:px-8 lg:px-10">
        {error && (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Alguns dados não sincronizaram agora, mas você ainda pode continuar estudando.
          </div>
        )}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">Mapa rápido</p>
              <h2 className="mt-1 text-2xl font-black text-white">Tudo ao seu alcance</h2>
            </div>
            <span className="hidden text-xs text-white/35 sm:block">Escolha o que precisa agora</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickAccess.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-white/10 bg-white/[.035] p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[.065]"
                >
                  <div className={`grid size-10 place-items-center rounded-xl border ${item.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-white">{item.title}</h3>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-white/45">{item.description}</p>
                  <span className="mt-4 flex items-center gap-1 text-xs font-bold text-white/55 transition group-hover:text-orbit-electric">
                    Acessar <ChevronRight className="size-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
          <section className="rounded-3xl border border-white/10 bg-[#080a0f] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-300">
                  <Target className="size-4" /> Missão da semana
                </div>
                <h2 className="mt-2 text-xl font-black text-white">Pequenos passos, progresso real.</h2>
              </div>
              {checklist.length > 0 && (
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  {completedChecklist}/{checklist.length}
                </span>
              )}
            </div>

            {checklist.length > 0 ? (
              <div className="mt-6 space-y-2">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[.025] px-3 py-3">
                    <span className={`grid size-6 shrink-0 place-items-center rounded-full border ${item.done ? "border-emerald-400 bg-emerald-400 text-black" : "border-white/20 text-transparent"}`}>
                      <Check className="size-3.5" />
                    </span>
                    <span className={item.done ? "text-sm text-white/40 line-through" : "text-sm text-white/75"}>{item.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-5">
                <p className="text-sm text-white/55">Sua primeira missão é simples: abra uma aula e conclua uma prática curta.</p>
                <Link href={continueHref} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orbit-electric">
                  Começar missão <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[.055] to-white/[.02] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-orbit-purple">
              <Trophy className="size-4" /> Evolução
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-black/30 p-3 text-center">
                <div className="text-2xl font-black text-white">{progress.level}</div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/35">Nível</div>
              </div>
              <div className="rounded-xl bg-black/30 p-3 text-center">
                <div className="text-2xl font-black text-orbit-electric">{progress.xp}</div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/35">XP</div>
              </div>
              <div className="rounded-xl bg-black/30 p-3 text-center">
                <div className="text-2xl font-black text-orbit-purple">{achievements.length}</div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/35">Conquistas</div>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs text-white/45">
                <span>Progresso geral</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/40">
                <div className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
            <Link href="/estudante/progresso" className="mt-5 flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white">
              Ver evolução completa <ArrowRight className="size-3.5" />
            </Link>
          </section>
        </div>

        {recommendedCourses.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-purple">Sua próxima escolha</p>
                <h2 className="mt-1 text-2xl font-black text-white">Continue explorando</h2>
              </div>
              <Link href="/estudante/aulas" className="flex items-center gap-1 text-xs font-bold text-white/50 hover:text-orbit-electric">
                Ver todas <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendedCourses.map((course, index) => (
                <Link
                  key={course.id}
                  href={`/estudante/cursos/${course.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#090b11] transition hover:-translate-y-1 hover:border-orbit-electric/35"
                >
                  <div className={`relative aspect-[2.1/1] bg-gradient-to-br ${index === 0 ? "from-cyan-500/30 via-blue-950 to-black" : index === 1 ? "from-violet-500/30 via-purple-950 to-black" : "from-emerald-500/25 via-teal-950 to-black"}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,.2),transparent_30%)]" />
                    <BookOpen className="absolute bottom-4 left-4 size-7 text-white/70" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white group-hover:text-orbit-electric">{course.titulo}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{course.descricao}</p>
                    <span className="mt-4 block text-xs font-bold text-white/60">{totalAulas(course)} aulas</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">Novidades na estação</p>
            <h2 className="mt-1 text-2xl font-black text-white">O que está acontecendo</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Link href="/estudante/aulas" className="group rounded-2xl border border-cyan-400/20 bg-cyan-400/[.06] p-5 transition hover:bg-cyan-400/[.1]">
              <Sparkles className="size-6 text-cyan-300" />
              <span className="mt-5 block text-[10px] font-bold uppercase tracking-widest text-cyan-300">Já disponível</span>
              <h3 className="mt-2 text-lg font-black text-white">Novo catálogo de aulas</h3>
              <p className="mt-2 text-sm leading-5 text-white/50">Pesquise por tema e navegue pelas trilhas em uma experiência completamente nova.</p>
            </Link>
            <Link href="/forum" className="group rounded-2xl border border-violet-400/20 bg-violet-400/[.06] p-5 transition hover:bg-violet-400/[.1]">
              <Users className="size-6 text-violet-300" />
              <span className="mt-5 block text-[10px] font-bold uppercase tracking-widest text-violet-300">Comunidade</span>
              <h3 className="mt-2 text-lg font-black text-white">Aprenda com a galera</h3>
              <p className="mt-2 text-sm leading-5 text-white/50">Compartilhe uma descoberta, publique uma dúvida ou ajude alguém no fórum.</p>
            </Link>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
              <Target className="size-6 text-amber-300" />
              <span className="mt-5 block text-[10px] font-bold uppercase tracking-widest text-amber-300">Em desenvolvimento</span>
              <h3 className="mt-2 text-lg font-black text-white">Quizzes e desafios</h3>
              <p className="mt-2 text-sm leading-5 text-white/50">Novas experiências práticas serão integradas às aulas e ao seu progresso.</p>
            </div>
          </div>
        </section>

        {(opportunities.length > 0 || summary?.mentorship) && (
          <section className="grid gap-4 md:grid-cols-2">
            {opportunities.length > 0 && (
              <Link href="/colaborador/vagas" className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[.055] p-5">
                <div className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300">Oportunidades</div>
                <h3 className="mt-2 text-lg font-black text-white">{opportunities[0].title}</h3>
                <p className="mt-1 text-sm text-white/45">{opportunities[0].type}</p>
              </Link>
            )}
            {summary?.mentorship && (
              <Link href="/estudante/mentorias" className="rounded-2xl border border-amber-400/20 bg-amber-400/[.055] p-5">
                <div className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">Mentoria</div>
                <h3 className="mt-2 text-lg font-black text-white">
                  {summary.mentorship.nextSession || "Planeje seu próximo encontro"}
                </h3>
                <p className="mt-1 text-sm text-white/45">{summary.mentorship.totalSessions} sessões registradas</p>
              </Link>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
