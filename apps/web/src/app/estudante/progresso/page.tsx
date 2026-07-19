"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Flame,
  Orbit,
  Rocket,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { defaultProgress, useProgress } from "@/contexts/ProgressContext";
import { getDashboardSummary, type DashboardSummary } from "@/lib/api";
import { listarAulasConcluidas, listarCursosAcademy, totalAulas, type Curso } from "@/lib/cursos";
import { desafios } from "@/lib/desafios";

type CourseProgress = {
  course: Curso;
  completed: number;
  total: number;
};

export default function EstudanteProgresso() {
  const { token, user } = useAuth();
  const { progress: progressFromContext } = useProgress();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [dashboard, courses] = await Promise.all([
          token ? getDashboardSummary(token) : Promise.resolve(null),
          listarCursosAcademy(),
        ]);
        const lessonIds = courses.flatMap((course) =>
          course.modulos.flatMap((module) => module.aulas.map((lesson) => lesson.id))
        );
        const completedIds = new Set(await listarAulasConcluidas(lessonIds));
        const stats = courses.map((course) => {
          const ids = course.modulos.flatMap((module) => module.aulas.map((lesson) => lesson.id));
          return {
            course,
            completed: ids.filter((id) => completedIds.has(id)).length,
            total: totalAulas(course),
          };
        });

        let challengeCount = 0;
        if (user?.id) {
          challengeCount = desafios.filter((challenge) => {
            try {
              const raw = localStorage.getItem(`orbitamos-pratica-${user.id}-${challenge.slug}`);
              if (!raw) return false;
              const parsed = JSON.parse(raw) as { stepStatus?: string[] };
              return parsed.stepStatus?.length === challenge.steps.length &&
                parsed.stepStatus.every((status) => status === "success");
            } catch {
              return false;
            }
          }).length;
        }

        if (!active) return;
        setSummary(dashboard);
        setCourseProgress(stats);
        setCompletedChallenges(challengeCount);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Não foi possível sincronizar sua evolução.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [token, user?.id]);

  const progress = progressFromContext ?? defaultProgress;
  const checklist = summary?.weeklyChecklist ?? [];
  const achievements = summary?.achievements ?? [];
  const totalLessons = courseProgress.reduce((total, item) => total + item.total, 0);
  const completedLessons = courseProgress.reduce((total, item) => total + item.completed, 0);
  const academyPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : progress.percent;
  const activeCourses = courseProgress.filter((item) => item.completed > 0 && item.completed < item.total);
  const completedCourses = courseProgress.filter((item) => item.total > 0 && item.completed === item.total).length;
  const completedChecklist = checklist.filter((item) => item.done).length;

  const nextMilestone = useMemo(() => {
    const current = Math.max(0, progress.xp);
    const next = Math.ceil((current + 1) / 100) * 100;
    return { next, missing: Math.max(next - current, 0), percent: Math.min((current % 100), 100) };
  }, [progress.xp]);

  return (
    <div className="-mx-4 -mt-4 min-h-screen overflow-hidden pb-14 sm:-mt-6 lg:-mx-6 lg:-mt-8">
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-10 pt-10 sm:px-8 lg:px-10">
        <div className="absolute inset-0 -z-20 bg-[#03050a]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_100%_at_85%_10%,rgba(139,92,246,.27),transparent_60%),radial-gradient(ellipse_55%_80%_at_5%_55%,rgba(0,212,255,.16),transparent_68%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">
            <Orbit className="size-4" /> Telemetria da jornada
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Sua evolução, <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">sem atalhos.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Acompanhe o que você concluiu, o que está praticando e qual é o próximo marco da sua órbita.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[.07] p-4">
              <BookOpen className="size-5 text-cyan-300" />
              <div className="mt-4 text-3xl font-black text-white">{completedLessons}</div>
              <div className="mt-1 text-xs text-white/45">de {totalLessons || "—"} aulas concluídas</div>
            </div>
            <div className="rounded-2xl border border-violet-400/20 bg-violet-400/[.07] p-4">
              <Rocket className="size-5 text-violet-300" />
              <div className="mt-4 text-3xl font-black text-white">{progress.xp}</div>
              <div className="mt-1 text-xs text-white/45">XP · nível {progress.level}</div>
            </div>
            <div className="rounded-2xl border border-orange-400/20 bg-orange-400/[.07] p-4">
              <Flame className="size-5 text-orange-300" />
              <div className="mt-4 text-3xl font-black text-white">{progress.streakDays}</div>
              <div className="mt-1 text-xs text-white/45">{progress.streakDays === 1 ? "dia de sequência" : "dias de sequência"}</div>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[.07] p-4">
              <Code2 className="size-5 text-emerald-300" />
              <div className="mt-4 text-3xl font-black text-white">{completedChallenges}</div>
              <div className="mt-1 text-xs text-white/45">de {desafios.length} desafios concluídos</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8 sm:px-8 lg:px-10">
        {error && (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Parte dos dados não sincronizou. Os números disponíveis continuam preservados.
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-10 text-sm text-white/45">
            <span className="size-5 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
            Montando sua linha de evolução...
          </div>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
              <section className="rounded-3xl border border-white/10 bg-[#080a0f] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-orbit-electric">
                      <Target className="size-4" /> Progresso acadêmico
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-white">{academyPercent}% da academia explorada</h2>
                    <p className="mt-1 text-sm text-white/45">{completedCourses} cursos completos · {activeCourses.length} em andamento</p>
                  </div>
                  <Link href="/estudante/aulas" className="flex items-center gap-1 text-xs font-bold text-orbit-electric">
                    Continuar aulas <ArrowRight className="size-3.5" />
                  </Link>
                </div>
                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" style={{ width: `${academyPercent}%` }} />
                </div>

                <div className="mt-6 space-y-3">
                  {(activeCourses.length ? activeCourses : courseProgress.slice(0, 3)).map((item) => {
                    const percent = item.total ? Math.round((item.completed / item.total) * 100) : 0;
                    return (
                      <Link
                        key={item.course.id}
                        href={`/estudante/cursos/${item.course.slug}`}
                        className="group block rounded-2xl border border-white/8 bg-white/[.025] p-4 transition hover:border-orbit-electric/25 hover:bg-white/[.05]"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-white group-hover:text-orbit-electric">{item.course.titulo}</h3>
                            <p className="mt-1 text-xs text-white/40">{item.completed} de {item.total} aulas</p>
                          </div>
                          <span className="text-sm font-black text-white/70">{percent}%</span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/50">
                          <div className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" style={{ width: `${percent}%` }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-400/[.09] to-cyan-400/[.035] p-5 sm:p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-violet-300">
                  <Sparkles className="size-4" /> Próximo marco
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="text-4xl font-black text-white">{nextMilestone.next} XP</div>
                    <p className="mt-1 text-sm text-white/45">Faltam {nextMilestone.missing} XP para alcançar</p>
                  </div>
                  <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-orbit-electric to-orbit-purple text-xl font-black text-black">
                    {progress.level}
                  </div>
                </div>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-black/40">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" style={{ width: `${nextMilestone.percent}%` }} />
                </div>
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">Próxima meta</div>
                  <p className="mt-2 text-sm leading-5 text-white/70">{progress.nextGoal || "Concluir sua próxima aula e manter a sequência."}</p>
                </div>
                <Link href="/estudante/orbita" className="mt-5 flex items-center gap-1 text-xs font-bold text-violet-300">
                  Ver na Jornada <ArrowRight className="size-3.5" />
                </Link>
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-300">
                      <Check className="size-4" /> Meta semanal
                    </div>
                    <h2 className="mt-2 text-xl font-black text-white">Consistência antes de intensidade.</h2>
                  </div>
                  {checklist.length > 0 && <span className="text-2xl font-black text-emerald-300">{completedChecklist}/{checklist.length}</span>}
                </div>
                <div className="mt-5 space-y-2">
                  {checklist.length ? checklist.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-xl bg-black/25 px-3 py-3">
                      <span className={`grid size-6 shrink-0 place-items-center rounded-full border ${item.done ? "border-emerald-400 bg-emerald-400 text-black" : "border-white/20 text-transparent"}`}>
                        <Check className="size-3.5" />
                      </span>
                      <span className={item.done ? "text-sm text-white/40 line-through" : "text-sm text-white/70"}>{item.label}</span>
                    </div>
                  )) : (
                    <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-white/45">Conclua uma aula para começar sua meta semanal.</p>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-amber-300">
                  <Trophy className="size-4" /> Conquistas
                </div>
                <h2 className="mt-2 text-xl font-black text-white">Marcos que você já desbloqueou.</h2>
                {achievements.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {achievements.map((achievement) => (
                      <span key={achievement} className="rounded-full border border-amber-300/20 bg-amber-300/[.07] px-3 py-2 text-xs font-bold text-amber-100">
                        {achievement}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-4">
                    <p className="text-sm text-white/45">Sua primeira conquista aparece quando você começa a transformar estudo em constância.</p>
                    <Link href="/estudante/aulas" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orbit-electric">
                      Abrir próxima aula <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                )}
              </section>
            </div>

            <section className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[.045] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-300">
                    <Code2 className="size-4" /> Habilidade em construção
                  </div>
                  <h2 className="mt-2 text-xl font-black text-white">
                    {completedChallenges ? `${completedChallenges} desafio${completedChallenges > 1 ? "s" : ""} vencido${completedChallenges > 1 ? "s" : ""}.` : "Leve o aprendizado para o código."}
                  </h2>
                  <p className="mt-1 text-sm text-white/45">Práticas concluídas ficam salvas neste dispositivo e entram neste mapa.</p>
                </div>
                <Link href="/estudante/pratica" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-black text-black hover:bg-emerald-300 touch-manipulation">
                  Abrir desafios <ArrowRight className="size-4" />
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
