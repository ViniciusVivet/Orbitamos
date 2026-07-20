"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Check, ChevronDown, ChevronRight, Compass, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { roadmaps, getTotalSkills, type CareerRoadmap, type RoadmapCategory } from "@/lib/roadmaps";
import { listarAulasConcluidas, listarCursosAcademy, totalAulas } from "@/lib/cursos";

const STORAGE_PREFIX = "orbitamos-roadmap-check";

function useRoadmapProgress(userId: string | number | undefined) {
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  // Load manual checks from localStorage
  useEffect(() => {
    if (!userId) return;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}-${userId}`);
      if (raw) setManualChecks(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, [userId]);

  // Load course completion percentages
  useEffect(() => {
    let active = true;
    listarCursosAcademy()
      .then(async (courses) => {
        const lessonIds = courses.flatMap((c) =>
          c.modulos.flatMap((m) => m.aulas.map((a) => a.id))
        );
        const completed = new Set(await listarAulasConcluidas(lessonIds));
        const progress: Record<string, number> = {};
        courses.forEach((course) => {
          const total = totalAulas(course);
          const done = course.modulos
            .flatMap((m) => m.aulas)
            .filter((a) => completed.has(a.id)).length;
          progress[course.slug] = total > 0 ? done / total : 0;
        });
        if (active) setCourseProgress(progress);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [userId]);

  const toggleSkill = useCallback(
    (skillId: string) => {
      if (!userId) return;
      setManualChecks((prev) => {
        const next = { ...prev, [skillId]: !prev[skillId] };
        localStorage.setItem(`${STORAGE_PREFIX}-${userId}`, JSON.stringify(next));
        return next;
      });
    },
    [userId]
  );

  const isSkillDone = useCallback(
    (skillId: string, courseSlug?: string): boolean => {
      // If linked to a course and course is 100% complete, auto-check
      if (courseSlug && (courseProgress[courseSlug] ?? 0) >= 1) return true;
      return !!manualChecks[skillId];
    },
    [manualChecks, courseProgress]
  );

  const getCompletedCount = useCallback(
    (roadmap: CareerRoadmap): number => {
      return roadmap.categories.reduce(
        (sum, cat) => sum + cat.skills.filter((s) => isSkillDone(s.id, s.courseSlug)).length,
        0
      );
    },
    [isSkillDone]
  );

  return { isSkillDone, toggleSkill, getCompletedCount, loaded, courseProgress };
}

function CategorySection({
  category,
  isSkillDone,
  toggleSkill,
  accent,
  courseProgress,
}: {
  category: RoadmapCategory;
  isSkillDone: (id: string, slug?: string) => boolean;
  toggleSkill: (id: string) => void;
  accent: string;
  courseProgress: Record<string, number>;
}) {
  const done = category.skills.filter((s) => isSkillDone(s.id, s.courseSlug)).length;
  const total = category.skills.length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-bold uppercase tracking-[.16em] text-white/50">
          {category.title}
        </h4>
        <span className={`text-[10px] font-bold ${done === total ? "text-emerald-400" : "text-white/30"}`}>
          {done}/{total}
        </span>
      </div>
      <div className="space-y-1">
        {category.skills.map((skill) => {
          const checked = isSkillDone(skill.id, skill.courseSlug);
          const autoChecked = skill.courseSlug && (courseProgress[skill.courseSlug] ?? 0) >= 1;
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => !autoChecked && toggleSkill(skill.id)}
              className={`group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition touch-manipulation ${
                checked
                  ? "bg-white/[0.03]"
                  : "bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <span
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition ${
                  checked
                    ? "border-emerald-400 bg-emerald-400 text-black"
                    : "border-white/20 text-transparent group-hover:border-white/35"
                }`}
              >
                <Check className="size-3" />
              </span>
              <div className="min-w-0 flex-1">
                <span
                  className={`text-sm ${
                    checked ? "text-white/45 line-through" : "text-white/80"
                  }`}
                >
                  {skill.label}
                </span>
                {skill.hint && (
                  <p className="mt-0.5 text-[11px] leading-4 text-white/25">
                    {skill.hint}
                  </p>
                )}
                {skill.courseSlug && (
                  <Link
                    href={`/estudante/cursos/${skill.courseSlug}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold ${accent} hover:underline`}
                  >
                    Ir para o curso <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RoadmapCard({
  roadmap,
  isSkillDone,
  toggleSkill,
  getCompletedCount,
  courseProgress,
}: {
  roadmap: CareerRoadmap;
  isSkillDone: (id: string, slug?: string) => boolean;
  toggleSkill: (id: string) => void;
  getCompletedCount: (r: CareerRoadmap) => number;
  courseProgress: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const total = getTotalSkills(roadmap);
  const completed = getCompletedCount(roadmap);
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`rounded-2xl border ${roadmap.border} bg-[#0b0d12] transition`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 p-5 text-left touch-manipulation"
      >
        <div
          className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${roadmap.color} text-2xl`}
        >
          {roadmap.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-black text-white">{roadmap.title}</h3>
          <p className="mt-0.5 text-xs text-white/40">{roadmap.subtitle}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${percent === 100 ? "text-emerald-400" : "text-white/50"}`}>
              {percent}%
            </span>
          </div>
        </div>
        <div className="shrink-0 text-white/30">
          {open ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/5 px-5 pb-5 pt-4 space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/35">
            <span className="flex items-center gap-1">
              <Info className="size-3" /> {roadmap.estimatedMonths} de estudo focado
            </span>
            <span>
              {completed} de {total} skills
            </span>
          </div>
          {roadmap.categories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              isSkillDone={isSkillDone}
              toggleSkill={toggleSkill}
              accent={roadmap.accent}
              courseProgress={courseProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EstudanteTrilhas() {
  const { user } = useAuth();
  const { isSkillDone, toggleSkill, getCompletedCount, courseProgress } =
    useRoadmapProgress(user?.id);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">
          <Compass className="size-4" /> Trilhas de carreira
        </div>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          O que voce precisa saber para ser junior.
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-white/45">
          Escolha sua area, acompanhe o checklist e veja seu progresso real. Skills vinculadas a cursos da OrbitAcademy sao marcadas automaticamente.
        </p>
      </div>

      <div className="space-y-3">
        {roadmaps.map((roadmap) => (
          <RoadmapCard
            key={roadmap.id}
            roadmap={roadmap}
            isSkillDone={isSkillDone}
            toggleSkill={toggleSkill}
            getCompletedCount={getCompletedCount}
            courseProgress={courseProgress}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-5 text-white/35">
        <strong className="text-white/50">Como funciona:</strong> Marque manualmente as skills que voce ja domina ou deixe o sistema marcar automaticamente quando concluir um curso vinculado. Seu progresso fica salvo neste dispositivo.
      </div>
    </div>
  );
}
