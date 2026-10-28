"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Trophy } from "lucide-react";
import OrbitPhoto from "@/components/brand/OrbitPhoto";
import { coursePhotoKind } from "@/components/brand/orbitamosPhotography";
import { useAuth } from "@/contexts/AuthContext";
import { defaultProgress, useProgress } from "@/contexts/ProgressContext";
import { getDashboardSummary, type DashboardSummary } from "@/lib/api";
import { listarAulasConcluidas, listarCursosAcademy, totalAulas, type Curso } from "@/lib/cursos";
import AcademyActivityProgress from "@/components/estudante/AcademyActivityProgress";

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

        if (!active) return;
        setSummary(dashboard);
        setCourseProgress(stats);
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
  const academyPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const activeCourses = courseProgress.filter((item) => item.completed > 0 && item.completed < item.total);
  const completedCourses = courseProgress.filter((item) => item.total > 0 && item.completed === item.total).length;
  const completedChecklist = checklist.filter((item) => item.done).length;

  const nextMilestone = useMemo(() => {
    const current = Math.max(0, progress.xp);
    const next = Math.ceil((current + 1) / 100) * 100;
    return { next, missing: Math.max(next - current, 0), percent: Math.min((current % 100), 100) };
  }, [progress.xp]);

  return (
    <div className="mx-auto max-w-[1180px] pb-12 text-[#edf3ef]">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#b6d8c8]">MEU PROGRESSO</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Seu caminho, até aqui.</h1></div>
        <Link href="/estudante/trilhas" className="inline-flex min-h-11 items-center gap-2 text-xs text-[#c6e4ce]">Ver minhas trilhas<ArrowRight size={16}/></Link>
      </header>
      <AcademyActivityProgress userId={user?.id}/>
      {error && <p role="status" className="mb-6 rounded-xl border border-amber-200/25 bg-amber-200/5 px-4 py-3 text-xs leading-6 text-amber-100">Parte dos dados não sincronizou. Os registros disponíveis continuam preservados.</p>}
      <section className="mt-9 border-t border-white/15 pt-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-xl font-semibold tracking-tight">Suas aulas</h2><p className="mt-2 text-xs leading-6 text-[#b3c8ca]">{completedLessons} de {totalLessons || "—"} aulas · {completedCourses} cursos completos · {activeCourses.length} em andamento</p></div>
          <Link href="/estudante/aulas" className="inline-flex min-h-11 items-center gap-2 text-xs text-[#c6e4ce]">Escolher uma aula<ArrowRight size={16}/></Link>
        </div>
        {loading ? <p role="status" className="py-6 text-sm text-[#b3c8ca]">Buscando seu histórico de aulas…</p> : <>
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#c6e4ce]" style={{width:academyPercent+"%"}}/></div>
          <div className="grid gap-3 md:grid-cols-2">{(activeCourses.length ? activeCourses : courseProgress.slice(0, 4)).map(item => {
            const percent = item.total ? Math.round(item.completed / item.total * 100) : 0;
            return <Link key={item.course.id} href={`/estudante/cursos/${item.course.slug}`} className="flex items-center gap-4 overflow-hidden rounded-xl border border-white/15 bg-[#111e27] p-3">
              <OrbitPhoto kind={coursePhotoKind(item.course.slug)} className="!aspect-square w-20 shrink-0 rounded-lg" sizes="80px"/>
              <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold leading-6">{item.course.titulo}</h3><p className="mt-2 text-xs text-[#b3c8ca]">{item.completed} de {item.total} aulas · {percent}%</p></div><ArrowRight size={17} className="shrink-0 text-[#c6e4ce]"/>
            </Link>;
          })}</div>
        </>}
      </section>
      <details className="mt-8 border-t border-white/15 py-3">
        <summary className="min-h-11 cursor-pointer py-3 text-sm text-[#c6e4ce]">Ver XP, metas e conquistas das aulas</summary>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <section className="rounded-xl border border-white/15 bg-[#111e27] p-5"><h2 className="text-sm font-semibold">Seu ritmo nas aulas</h2><div className="mt-4 flex gap-7"><div><strong className="text-2xl font-semibold">{progress.xp}</strong><p className="mt-1 text-xs text-[#b3c8ca]">XP · nível {progress.level}</p></div><div><strong className="text-2xl font-semibold">{progress.streakDays}</strong><p className="mt-1 text-xs text-[#b3c8ca]">{progress.streakDays === 1 ? "dia de sequência" : "dias de sequência"}</p></div></div><div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#c6e4ce]" style={{width:nextMilestone.percent+"%"}}/></div><p className="mt-3 text-xs leading-6 text-[#b3c8ca]">Faltam {nextMilestone.missing} XP para {nextMilestone.next} XP.</p><p className="mt-3 text-xs leading-6 text-[#b3c8ca]">{progress.nextGoal || "Conclua uma aula e continue no seu ritmo."}</p></section>
          <section className="rounded-xl border border-white/15 bg-[#111e27] p-5"><h2 className="text-sm font-semibold">Meta semanal {checklist.length > 0 && <span className="ml-2 text-[#c6e4ce]">{completedChecklist}/{checklist.length}</span>}</h2><div className="mt-4 space-y-3">{checklist.length ? checklist.map(item => <div key={item.label} className="flex items-start gap-3 text-xs leading-6 text-[#b3c8ca]"><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${item.done ? "border-[#c6e4ce] bg-[#c6e4ce] text-[#173c36]" : "border-white/25 text-transparent"}`}><Check size={12}/></span><span className={item.done ? "line-through" : ""}>{item.label}</span></div>) : <p className="text-xs leading-6 text-[#b3c8ca]">Sua meta aparece quando você começa uma aula.</p>}</div></section>
          <section className="sm:col-span-2"><h2 className="flex items-center gap-2 text-sm font-semibold"><Trophy size={17} className="text-[#d5ddaf]"/> Conquistas</h2>{achievements.length ? <div className="mt-4 flex flex-wrap gap-2">{achievements.map(achievement => <span key={achievement} className="rounded-full border border-[#c6e4ce]/30 px-3 py-2 text-xs text-[#c6e4ce]">{achievement}</span>)}</div> : <p className="mt-3 text-xs leading-6 text-[#b3c8ca]">Ainda sem conquistas de aulas. Uma tentativa de cada vez.</p>}</section>
        </div>
      </details>
    </div>
  );
}
