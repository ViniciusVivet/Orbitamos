"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Info,
  LockKeyhole,
  Pencil,
  Rocket,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listarAulasConcluidas, listarCursosAcademy, totalAulas } from "@/lib/cursos";
import { getTotalSkills, roadmaps, type CareerRoadmap, type RoadmapCategory } from "@/lib/roadmaps";

const CHECKS_STORAGE_PREFIX = "orbitamos-roadmap-check";
const CAREER_STORAGE_PREFIX = "orbitamos-career-journey";

const stageIcons = ["🧭", "🪐", "🛰️", "🚀", "⭐"];

function getStorageKey(prefix: string, userId: string | number | undefined) {
  return userId ? `${prefix}-${userId}` : null;
}

function useJourneyProgress(userId: string | number | undefined) {
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const storageKey = getStorageKey(CHECKS_STORAGE_PREFIX, userId);
    if (!storageKey) return;
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      try {
        const raw = localStorage.getItem(storageKey);
        setManualChecks(raw ? JSON.parse(raw) as Record<string, boolean> : {});
      } catch {
        setManualChecks({});
      }
    });

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;

    listarCursosAcademy()
      .then(async (courses) => {
        const lessonIds = courses.flatMap((course) =>
          course.modulos.flatMap((module) => module.aulas.map((lesson) => lesson.id))
        );
        const completed = new Set(await listarAulasConcluidas(lessonIds));
        const nextProgress: Record<string, number> = {};

        courses.forEach((course) => {
          const total = totalAulas(course);
          const done = course.modulos
            .flatMap((module) => module.aulas)
            .filter((lesson) => completed.has(lesson.id)).length;
          nextProgress[course.slug] = total > 0 ? done / total : 0;
        });

        if (active) setCourseProgress(nextProgress);
      })
      .catch(() => {
        if (active) setCourseProgress({});
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const toggleSkill = useCallback(
    (skillId: string) => {
      const storageKey = getStorageKey(CHECKS_STORAGE_PREFIX, userId);
      if (!storageKey) return;

      setManualChecks((previous) => {
        const next = { ...previous, [skillId]: !previous[skillId] };
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [userId]
  );

  const isSkillDone = useCallback(
    (skillId: string, courseSlug?: string) => {
      if (courseSlug && (courseProgress[courseSlug] ?? 0) >= 1) return true;
      return Boolean(manualChecks[skillId]);
    },
    [courseProgress, manualChecks]
  );

  return { courseProgress, isSkillDone, toggleSkill };
}

function getCategoryProgress(
  category: RoadmapCategory,
  isSkillDone: (id: string, courseSlug?: string) => boolean
) {
  const completed = category.skills.filter((skill) => isSkillDone(skill.id, skill.courseSlug)).length;
  return {
    completed,
    total: category.skills.length,
    percent: category.skills.length ? Math.round((completed / category.skills.length) * 100) : 0,
  };
}

function CareerPicker({
  selectedSlug,
  onSelect,
}: {
  selectedSlug: string | null;
  onSelect: (roadmap: CareerRoadmap) => void;
}) {
  return (
    <section>
      <div className="mb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">
          <Compass className="size-4" /> Escolha sua direção
        </div>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          Qual profissional você quer se tornar?
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
          Sua escolha organiza aulas, habilidades e projetos em um único mapa. Você poderá trocar depois sem perder o que já concluiu.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {roadmaps.map((roadmap) => {
          const selected = roadmap.slug === selectedSlug;
          return (
            <button
              key={roadmap.id}
              type="button"
              onClick={() => onSelect(roadmap)}
              className={`group rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 ${
                selected
                  ? `${roadmap.border} bg-gradient-to-br ${roadmap.color} ring-1 ring-white/20`
                  : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br ${roadmap.color} text-2xl`}>
                  {roadmap.icon}
                </span>
                {selected && <CheckCircle2 className="size-5 text-emerald-300" />}
              </div>
              <h3 className="mt-4 text-base font-black text-white">{roadmap.title}</h3>
              <p className="mt-1 min-h-10 text-xs leading-5 text-white/45">{roadmap.subtitle}</p>
              <div className="mt-4 flex items-center justify-between text-[11px] font-bold">
                <span className="text-white/35">{roadmap.estimatedMonths}</span>
                <span className={roadmap.accent}>
                  Ver mapa <ArrowRight className="ml-1 inline size-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function StageCard({
  category,
  index,
  activeIndex,
  isSkillDone,
  toggleSkill,
  courseProgress,
}: {
  category: RoadmapCategory;
  index: number;
  activeIndex: number;
  isSkillDone: (id: string, courseSlug?: string) => boolean;
  toggleSkill: (id: string) => void;
  courseProgress: Record<string, number>;
}) {
  const [open, setOpen] = useState(index === activeIndex);
  const progress = getCategoryProgress(category, isSkillDone);
  const complete = progress.percent === 100;
  const active = index === activeIndex;
  const upcoming = index > activeIndex;

  return (
    <article className="relative pl-12 sm:pl-16">
      <div
        className={`absolute left-[18px] top-0 grid size-9 -translate-x-1/2 place-items-center rounded-full border text-base sm:left-6 sm:size-11 ${
          complete
            ? "border-emerald-300 bg-emerald-300 text-black shadow-[0_0_25px_rgba(110,231,183,.35)]"
            : active
              ? "border-orbit-electric bg-[#07131b] shadow-[0_0_28px_rgba(0,212,255,.45)]"
              : "border-white/15 bg-[#0a0b10] text-white/35"
        }`}
      >
        {complete ? <Check className="size-4 sm:size-5" /> : upcoming ? <LockKeyhole className="size-3.5" /> : stageIcons[index]}
      </div>

      <div
        className={`overflow-hidden rounded-2xl border transition ${
          active
            ? "border-orbit-electric/40 bg-orbit-electric/[.06]"
            : complete
              ? "border-emerald-400/20 bg-emerald-400/[.04]"
              : "border-white/10 bg-white/[0.025]"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex min-h-[92px] w-full items-center gap-3 p-4 text-left sm:p-5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[.18em] text-white/35">
                Etapa {index + 1}
              </span>
              {active && (
                <span className="rounded-full bg-orbit-electric/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orbit-electric">
                  Você está aqui
                </span>
              )}
              {complete && (
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                  Concluída
                </span>
              )}
            </div>
            <h3 className="mt-1 text-base font-black text-white sm:text-lg">{category.title}</h3>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${complete ? "bg-emerald-400" : "bg-gradient-to-r from-orbit-electric to-orbit-purple"}`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-white/45">
                {progress.completed}/{progress.total}
              </span>
            </div>
          </div>
          {open ? <ChevronDown className="size-5 shrink-0 text-white/35" /> : <ChevronRight className="size-5 shrink-0 text-white/35" />}
        </button>

        {open && (
          <div className="space-y-2 border-t border-white/10 p-3 sm:p-4">
            {category.skills.map((skill) => {
              const checked = isSkillDone(skill.id, skill.courseSlug);
              const automatic = Boolean(skill.courseSlug && (courseProgress[skill.courseSlug] ?? 0) >= 1);

              return (
                <div key={skill.id} className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      disabled={automatic}
                      onClick={() => toggleSkill(skill.id)}
                      aria-label={checked ? `Desmarcar ${skill.label}` : `Marcar ${skill.label}`}
                      className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border transition ${
                        checked
                          ? "border-emerald-300 bg-emerald-300 text-black"
                          : "border-white/20 text-transparent hover:border-white/40"
                      } disabled:cursor-default`}
                    >
                      <Check className="size-3.5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={checked ? "text-sm text-white/45 line-through" : "text-sm font-medium text-white/80"}>
                        {skill.label}
                      </div>
                      {skill.hint && <p className="mt-1 text-xs leading-5 text-white/35">{skill.hint}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {automatic && (
                          <span className="text-[10px] font-bold text-emerald-300">Concluída pelas aulas</span>
                        )}
                        {skill.courseSlug && (
                          <Link
                            href={`/estudante/cursos/${skill.courseSlug}`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-orbit-electric hover:underline"
                          >
                            Abrir aulas <ArrowRight className="size-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

export default function CareerJourney() {
  const { user } = useAuth();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const { courseProgress, isSkillDone, toggleSkill } = useJourneyProgress(user?.id);

  useEffect(() => {
    const storageKey = getStorageKey(CAREER_STORAGE_PREFIX, user?.id);
    if (!storageKey) return;
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      const saved = localStorage.getItem(storageKey);
      if (saved && roadmaps.some((roadmap) => roadmap.slug === saved)) setSelectedSlug(saved);
    });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const selectedRoadmap = roadmaps.find((roadmap) => roadmap.slug === selectedSlug) ?? null;

  const summary = useMemo(() => {
    if (!selectedRoadmap) return { completed: 0, total: 0, percent: 0, activeIndex: 0 };
    const categoryProgress = selectedRoadmap.categories.map((category) =>
      getCategoryProgress(category, isSkillDone)
    );
    const completed = categoryProgress.reduce((total, item) => total + item.completed, 0);
    const total = getTotalSkills(selectedRoadmap);
    const firstIncomplete = categoryProgress.findIndex((item) => item.percent < 100);
    return {
      completed,
      total,
      percent: total ? Math.round((completed / total) * 100) : 0,
      activeIndex: firstIncomplete === -1 ? selectedRoadmap.categories.length - 1 : firstIncomplete,
    };
  }, [isSkillDone, selectedRoadmap]);

  const selectCareer = (roadmap: CareerRoadmap) => {
    const storageKey = getStorageKey(CAREER_STORAGE_PREFIX, user?.id);
    setSelectedSlug(roadmap.slug);
    setChoosing(false);
    if (storageKey) localStorage.setItem(storageKey, roadmap.slug);
  };

  if (!selectedRoadmap || choosing) {
    return (
      <div className="space-y-6 pb-12">
        {selectedRoadmap && (
          <button
            type="button"
            onClick={() => setChoosing(false)}
            className="text-xs font-bold text-white/45 hover:text-white"
          >
            ← Voltar para minha jornada
          </button>
        )}
        <CareerPicker selectedSlug={selectedSlug} onSelect={selectCareer} />
      </div>
    );
  }

  const currentCategory = selectedRoadmap.categories[summary.activeIndex];

  return (
    <div className="space-y-6 pb-12">
      <section className={`relative overflow-hidden rounded-3xl border ${selectedRoadmap.border} bg-gradient-to-br ${selectedRoadmap.color} p-5 sm:p-7`}>
        <div className="absolute -right-16 -top-20 size-64 rounded-full border border-white/10" />
        <div className="absolute -bottom-28 right-16 size-56 rounded-full bg-orbit-electric/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/50">
                <Rocket className="size-3.5 text-orbit-electric" /> Minha jornada profissional
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/20 text-2xl">
                  {selectedRoadmap.icon}
                </span>
                <div>
                  <h1 className="text-xl font-black text-white sm:text-3xl">{selectedRoadmap.title}</h1>
                  <p className="mt-1 text-xs text-white/50 sm:text-sm">{selectedRoadmap.subtitle}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChoosing(true)}
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 text-xs font-bold text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              <Pencil className="size-3.5" /> Trocar objetivo
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <div className="mb-2 flex justify-between text-xs font-bold text-white/55">
                <span>{summary.completed} de {summary.total} habilidades</span>
                <span>{summary.percent}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-black/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orbit-electric via-white to-orbit-purple transition-all duration-700"
                  style={{ width: `${summary.percent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Target className="size-4 text-orbit-electric" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/35">Etapa atual</div>
                <div className="text-xs font-black text-white">{currentCategory.title}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">Seu mapa até o nível júnior</div>
            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">Uma etapa de cada vez.</h2>
            <p className="mt-1 text-sm text-white/40">Abra a etapa atual para ver somente o que importa agora.</p>
          </div>

          <div className="relative space-y-4 before:absolute before:bottom-8 before:left-[17px] before:top-8 before:w-px before:bg-gradient-to-b before:from-orbit-electric before:via-orbit-purple/50 before:to-white/10 sm:before:left-[23px]">
            {selectedRoadmap.categories.map((category, index) => (
              <StageCard
                key={category.id}
                category={category}
                index={index}
                activeIndex={summary.activeIndex}
                isSkillDone={isSkillDone}
                toggleSkill={toggleSkill}
                courseProgress={courseProgress}
              />
            ))}

            <div className="relative pl-12 sm:pl-16">
              <div className="absolute left-[18px] top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-amber-300/30 bg-[#151006] text-base sm:left-6 sm:size-11">
                🏆
              </div>
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[.18em] text-amber-300/70">Destino</div>
                <div className="mt-1 font-black text-white">Pronto para buscar sua primeira oportunidade</div>
                <p className="mt-1 text-xs leading-5 text-white/40">Conhecimento, projetos e perfil profissional reunidos para vagas de nível júnior.</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-xs font-black text-white">
              <Info className="size-4 text-orbit-electric" /> Como avançar
            </div>
            <p className="mt-3 text-xs leading-5 text-white/40">
              Concluir um curso marca automaticamente as habilidades vinculadas. O que você já domina também pode ser marcado manualmente.
            </p>
          </div>
          <Link
            href="/estudante/aulas"
            className="flex min-h-12 items-center justify-between rounded-2xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 text-sm font-black text-black transition hover:opacity-90"
          >
            Continuar estudando <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/estudante/pratica"
            className="flex min-h-12 items-center justify-between rounded-2xl border border-white/15 bg-white/[0.03] px-4 text-sm font-bold text-white transition hover:bg-white/[0.07]"
          >
            Ir para a prática <ArrowRight className="size-4" />
          </Link>
        </aside>
      </section>
    </div>
  );
}
