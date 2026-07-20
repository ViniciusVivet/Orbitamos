"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  FileText,
  ListVideo,
  Menu,
  NotebookPen,
  PlayCircle,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import LessonQuickQuiz from "@/components/estudante/LessonQuickQuiz";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { addProgressLesson } from "@/lib/api";
import type { UserId } from "@/lib/api";
import {
  aulaNoCurso,
  buscarCursoAcademyPorSlug,
  listarAulasConcluidas,
  marcarAulaAcademyConcluida,
  proximaAulaId,
  totalAulas,
  type Curso,
  type MaterialAula,
} from "@/lib/cursos";
import { flattenCourseLessons, getLessonGuide, getLessonKind, lessonKindLabels } from "@/lib/learningExperience";

const PROGRESS_STORAGE_KEY = "orbitacademy-progress";
const NOTES_STORAGE_KEY = "orbitacademy-notes";
const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{6,20}$/;

function youtubeEmbedUrl(videoId: string | undefined) {
  if (!videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

function materialDownloadUrl(material: MaterialAula) {
  return `${material.url}${material.url.includes("?") ? "&" : "?"}download=1`;
}

type StoredCourseProgress = {
  completed: string[];
  lastLessonId: string | null;
};

function getStoredProgress(courseSlug: string, userId: UserId | undefined): StoredCourseProgress {
  if (typeof window === "undefined" || !userId) return { completed: [], lastLessonId: null };
  try {
    const parsed = JSON.parse(localStorage.getItem(`${PROGRESS_STORAGE_KEY}-${userId}-${courseSlug}`) ?? "{}");
    return {
      completed: Array.isArray(parsed.concluidas) ? parsed.concluidas : [],
      lastLessonId: typeof parsed.ultimaAulaId === "string" ? parsed.ultimaAulaId : null,
    };
  } catch {
    return { completed: [], lastLessonId: null };
  }
}

function storeProgress(courseSlug: string, userId: UserId, completed: string[], lastLessonId: string) {
  localStorage.setItem(
    `${PROGRESS_STORAGE_KEY}-${userId}-${courseSlug}`,
    JSON.stringify({ concluidas: completed, ultimaAulaId: lastLessonId })
  );
}

function MaterialCard({ material }: { material: MaterialAula }) {
  return (
    <article className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 transition hover:bg-white/[0.07] sm:p-4">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-orbit-electric/10 text-orbit-electric">
        <FileText className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-white">{material.titulo}</h3>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-white/35">{material.tipo}</p>
      </div>
      <a
        href={materialDownloadUrl(material)}
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 text-white/55 transition hover:border-orbit-electric/35 hover:text-orbit-electric"
        aria-label={`Baixar ${material.titulo}`}
      >
        <Download className="size-4" />
      </a>
    </article>
  );
}

function SectionHeading({
  number,
  title,
  subtitle,
  done,
}: {
  number: number;
  title: string;
  subtitle: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-black ${
          done ? "bg-emerald-400/15 text-emerald-300" : "bg-orbit-electric/10 text-orbit-electric"
        }`}
      >
        {done ? <Check className="size-4" /> : number}
      </span>
      <div>
        <h2 className="text-lg font-black leading-tight text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-white/40">{subtitle}</p>
      </div>
    </div>
  );
}

function Curriculum({
  course,
  lessonId,
  completed,
  onSelect,
}: {
  course: Curso;
  lessonId: string | null;
  completed: string[];
  onSelect: (lessonId: string) => void;
}) {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(course.modulos.map((module) => [module.id, module.aulas.some((lesson) => lesson.id === lessonId)]))
  );

  useEffect(() => {
    let active = true;
    const currentModule = course.modulos.find((module) =>
      module.aulas.some((lesson) => lesson.id === lessonId)
    );

    if (currentModule) {
      queueMicrotask(() => {
        if (!active) return;
        setOpenModules((current) =>
          current[currentModule.id] ? current : { ...current, [currentModule.id]: true }
        );
      });
    }

    return () => {
      active = false;
    };
  }, [course.modulos, lessonId]);

  return (
    <nav className="space-y-2" aria-label="Conteúdo do curso">
      {course.modulos.map((module, moduleIndex) => {
        const open = openModules[module.id] ?? false;
        const moduleCompleted = module.aulas.filter((lesson) => completed.includes(lesson.id)).length;
        return (
          <section key={module.id} className="overflow-hidden rounded-xl bg-white/[0.035]">
            <button
              type="button"
              onClick={() => setOpenModules((current) => ({ ...current, [module.id]: !open }))}
              className="flex min-h-12 w-full items-center gap-3 px-3 text-left"
              aria-expanded={open}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-[11px] font-black text-white/45">
                {moduleIndex + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-white/80">{module.titulo}</span>
                <span className="mt-0.5 block text-[10px] text-white/35">
                  {moduleCompleted}/{module.aulas.length} aulas
                </span>
              </span>
              <ChevronDown className={`size-4 shrink-0 text-white/30 transition ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="border-t border-white/[0.06] py-1">
                {module.aulas.map((lesson, lessonIndex) => {
                  const active = lesson.id === lessonId;
                  const done = completed.includes(lesson.id);
                  const kind = getLessonKind(lesson);
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => onSelect(lesson.id)}
                      className={`flex min-h-11 w-full items-start gap-2.5 px-3 py-2.5 text-left transition ${
                        active ? "bg-orbit-electric/10 text-orbit-electric" : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                      ) : active ? (
                        <PlayCircle className="mt-0.5 size-4 shrink-0" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-white/20" />
                      )}
                      <span className="text-xs leading-5">
                        <span className="mr-1 text-white/25">{lessonIndex + 1}.</span>
                        {lesson.titulo}
                        <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wide text-white/25">
                          {lessonKindLabels[kind]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </nav>
  );
}

export default function CourseLearningRoom() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, token } = useAuth();
  const { refetchProgress } = useProgress();
  const userId = user?.id;

  const [course, setCourse] = useState<Curso | null | undefined>();
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    let active = true;
    buscarCursoAcademyPorSlug(slug)
      .then((result) => {
        if (!active) return;
        setCourse(result ?? null);
        setLessonId((current) => {
          const storedLessonId = getStoredProgress(slug, userId).lastLessonId;
          if (storedLessonId && result && aulaNoCurso(result, storedLessonId)) return storedLessonId;
          if (current && result && aulaNoCurso(result, current)) return current;
          return result?.modulos[0]?.aulas[0]?.id ?? null;
        });
      })
      .catch(() => {
        if (active) setCourse(null);
      });
    return () => {
      active = false;
    };
  }, [slug, userId]);

  useEffect(() => {
    if (!course) return;
    let active = true;
    const lessonIds = course.modulos.flatMap((module) => module.aulas.map((lesson) => lesson.id));
    const stored = getStoredProgress(slug, userId);
    listarAulasConcluidas(lessonIds)
      .then((result) => {
        if (active) {
          const validCompleted = new Set(
            [...stored.completed, ...result].filter((lessonId) => lessonIds.includes(lessonId))
          );
          setCompleted([...validCompleted]);
        }
      })
      .catch(() => {
        if (active) setCompleted(stored.completed.filter((lessonId) => lessonIds.includes(lessonId)));
      });
    return () => {
      active = false;
    };
  }, [course, slug, userId]);

  const lesson = useMemo(
    () => (course && lessonId ? aulaNoCurso(course, lessonId) : undefined),
    [course, lessonId]
  );
  const flatLessons = useMemo(() => (course ? flattenCourseLessons(course) : []), [course]);
  const lessonIndex = flatLessons.findIndex((item) => item.aula.id === lessonId);
  const previousLesson = lessonIndex > 0 ? flatLessons[lessonIndex - 1]?.aula : null;
  const nextLesson = lessonIndex >= 0 ? flatLessons[lessonIndex + 1]?.aula ?? null : null;
  const guide = useMemo(
    () => (course && lesson ? getLessonGuide(course, lesson, Math.max(lessonIndex, 0)) : null),
    [course, lesson, lessonIndex]
  );
  const embedUrl = youtubeEmbedUrl(lesson?.youtubeVideoId);
  const total = course ? totalAulas(course) : 0;
  const progressPercent = total ? Math.round((completed.length / total) * 100) : 0;
  const lessonDone = lessonId ? completed.includes(lessonId) : false;
  const notesKey = userId && lessonId ? `${NOTES_STORAGE_KEY}-${userId}-${lessonId}` : null;

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setNotes(notesKey ? localStorage.getItem(notesKey) ?? "" : "");
      setNotesSaved(false);
    });
    return () => {
      active = false;
    };
  }, [notesKey]);

  const scrollToSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!curriculumOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCurriculumOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [curriculumOpen]);

  const selectLesson = useCallback((id: string) => {
    setLessonId(id);
    setCurriculumOpen(false);
    if (userId) storeProgress(slug, userId, completed, id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [completed, slug, userId]);

  const saveNotes = () => {
    if (!notesKey) return;
    localStorage.setItem(notesKey, notes);
    setNotesSaved(true);
    window.setTimeout(() => setNotesSaved(false), 1800);
  };

  const completeLesson = useCallback(async () => {
    if (!lessonId || !course || !userId || completing) return;
    setCompleting(true);
    const nextId = proximaAulaId(course, lessonId);
    const nextCompleted = completed.includes(lessonId) ? completed : [...completed, lessonId];
    setCompleted(nextCompleted);
    storeProgress(slug, userId, nextCompleted, nextId ?? lessonId);

    if (token && lesson) {
      try {
        await marcarAulaAcademyConcluida(lessonId);
        if (!lessonDone) await addProgressLesson(token, { xpGained: 10, lessonTitle: lesson.titulo });
        await refetchProgress();
      } catch {
        // O progresso local continua disponível mesmo com falha de rede.
      }
    }

    setCompleting(false);
    if (nextId) {
      setLessonId(nextId);
      setCurriculumOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [completed, completing, course, lesson, lessonDone, lessonId, refetchProgress, slug, token, userId]);

  if (course === undefined) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <div className="mx-auto size-9 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
          <p className="mt-4 text-sm text-white/45">Preparando sua sala de aula...</p>
        </div>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <BookOpen className="mx-auto size-10 text-white/25" />
          <p className="mt-3 text-white/60">Curso ou aula não encontrado.</p>
          <Link href="/estudante/aulas" className="mt-3 inline-flex text-sm font-bold text-orbit-electric">
            Voltar para Aulas
          </Link>
        </div>
      </div>
    );
  }

  const quizPerfect = quizScore !== null && quizScore.total > 0 && quizScore.correct === quizScore.total;
  const lessonSteps = [
    { id: "secao-entenda", label: "Entenda", done: quizPerfect || lessonDone },
    { id: "secao-revisao", label: "Revise", done: quizPerfect },
    { id: "secao-pratica", label: "Pratique", done: lessonDone },
    { id: "secao-concluir", label: "Conclua", done: lessonDone },
  ];

  return (
    <div className="-mx-4 -mt-4 min-h-[calc(100vh-5rem)] bg-[#050608] pb-16 sm:-mt-6 lg:-mx-6 lg:-mt-8">
      <header className="border-b border-white/[0.07] bg-[#08090c] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3">
          <Link
            href="/estudante/aulas"
            className="grid size-10 shrink-0 place-items-center rounded-xl text-white/55 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Voltar para Aulas"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold uppercase tracking-[.18em] text-orbit-electric/70">{course.titulo}</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-white/65">{lesson.titulo}</p>
          </div>
          <div className="hidden min-w-40 sm:block">
            <div className="mb-1 flex justify-between text-[10px] text-white/35">
              <span>{completed.length}/{total} aulas</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurriculumOpen(true)}
            className="flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-white/65 lg:hidden"
            aria-expanded={curriculumOpen}
            aria-controls="course-curriculum-drawer"
          >
            <Menu className="size-4" /> <span className="hidden sm:inline">Conteúdo</span>
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[minmax(0,1fr)_330px]">
        <main className="min-w-0">
          <section className="bg-black">
            <div className="mx-auto aspect-video w-full max-w-6xl">
              {embedUrl ? (
                <iframe
                  key={lesson.id}
                  className="h-full w-full"
                  src={embedUrl}
                  title={lesson.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,rgba(0,212,255,.08),transparent_55%)] px-6 text-center">
                  <div>
                    <FileText className="mx-auto size-10 text-orbit-electric/60" />
                    <h2 className="mt-3 font-black text-white">Aula em material guiado</h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-white/40">Use a aba Materiais e siga os objetivos desta aula.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="px-4 sm:px-6 lg:px-8">
            <section className="border-b border-white/[0.07] py-5 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/35">
                    {guide ? lessonKindLabels[guide.kind] : "Aula"} · {lessonIndex + 1} de {flatLessons.length}
                    {lessonDone && <span className="text-emerald-300">• Concluída</span>}
                  </div>
                  <h1 className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl lg:text-3xl">{lesson.titulo}</h1>
                  {lesson.conteudo && <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">{lesson.conteudo}</p>}
                </div>
                <button
                  type="button"
                  onClick={lessonDone && nextLesson ? () => selectLesson(nextLesson.id) : () => scrollToSection("secao-concluir")}
                  className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-5 text-sm font-black text-black transition hover:opacity-90"
                >
                  {lessonDone ? (nextLesson ? "Próxima aula" : "Curso concluído") : "Concluir aula"}
                  {lessonDone ? <ArrowRight className="size-4" /> : <Target className="size-4" />}
                </button>
              </div>

              {/* Trilho da aula: o caminho que o aluno percorre nesta página */}
              <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {lessonSteps.map((step, index) => (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(step.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                        step.done
                          ? "border-emerald-400/25 bg-emerald-400/[.06] text-emerald-200"
                          : "border-white/10 bg-white/[0.03] text-white/55 hover:border-orbit-electric/30 hover:text-white"
                      }`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-lg text-[11px] font-black ${
                          step.done ? "bg-emerald-400/20 text-emerald-300" : "bg-white/[0.06] text-white/45"
                        }`}
                      >
                        {step.done ? <Check className="size-3.5" /> : index + 1}
                      </span>
                      <span className="text-xs font-bold">{step.label}</span>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={!previousLesson}
                  onClick={() => previousLesson && selectLesson(previousLesson.id)}
                  className="flex min-h-10 items-center gap-2 rounded-xl px-2 text-xs font-bold text-white/45 transition hover:bg-white/[0.04] hover:text-white disabled:invisible"
                >
                  <ChevronLeft className="size-4" /> Anterior
                </button>
                <button
                  type="button"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && selectLesson(nextLesson.id)}
                  className="flex min-h-10 items-center gap-2 rounded-xl px-2 text-xs font-bold text-white/45 transition hover:bg-white/[0.04] hover:text-white disabled:invisible"
                >
                  Próxima <ChevronRight className="size-4" />
                </button>
              </div>
            </section>

            {/* ── 1. Entenda ── */}
            {guide && (
              <section id="secao-entenda" className="scroll-mt-24 border-b border-white/[0.07] py-6 sm:py-8">
                <SectionHeading
                  number={1}
                  title="Entenda a aula"
                  subtitle="Leia os objetivos antes do conteúdo: eles mostram o que observar."
                  done={quizPerfect || lessonDone}
                />
                <div className="mt-5 grid max-w-4xl gap-3 sm:grid-cols-2">
                  {guide.objectives.map((objective, index) => (
                    <div key={objective} className="flex gap-3 rounded-2xl bg-white/[0.035] p-4">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-orbit-electric/10 text-xs font-black text-orbit-electric">
                        <Sparkles className="size-3.5" aria-hidden="true" />
                      </span>
                      <p className="text-sm leading-6 text-white/65">
                        <span className="mr-1 text-white/30">{index + 1}.</span>
                        {objective}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 max-w-4xl space-y-3">
                  {(lesson.materiais?.length ?? 0) > 0 && (
                    <details className="group rounded-2xl bg-white/[0.03]">
                      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2.5 px-4 text-sm font-bold text-white/70 transition hover:text-white">
                        <FileText className="size-4 text-orbit-electric" />
                        Materiais da aula
                        <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[9px] text-white/45">{lesson.materiais!.length}</span>
                        <ChevronDown className="ml-auto size-4 text-white/30 transition group-open:rotate-180" />
                      </summary>
                      <div className="space-y-2 px-4 pb-4">
                        {lesson.materiais!.map((material) => <MaterialCard key={material.id} material={material} />)}
                      </div>
                    </details>
                  )}

                  <details className="group rounded-2xl bg-white/[0.03]">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2.5 px-4 text-sm font-bold text-white/70 transition hover:text-white">
                      <NotebookPen className="size-4 text-orbit-electric" />
                      Minhas anotações
                      {notes.trim().length > 0 && <span className="size-1.5 rounded-full bg-orbit-electric" aria-label="Há anotações salvas" />}
                      <ChevronDown className="ml-auto size-4 text-white/30 transition group-open:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4">
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="O que você não quer esquecer desta aula?"
                        className="min-h-36 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-orbit-electric/40"
                      />
                      <button type="button" onClick={saveNotes} className="mt-3 min-h-11 rounded-xl bg-white px-5 text-xs font-black text-black">
                        {notesSaved ? "Anotações salvas" : "Salvar anotações"}
                      </button>
                    </div>
                  </details>
                </div>
              </section>
            )}

            {/* ── 2. Revise ── */}
            {guide && (
              <section id="secao-revisao" className="scroll-mt-24 border-b border-white/[0.07] py-6 sm:py-8">
                <SectionHeading
                  number={2}
                  title="Revise o que aprendeu"
                  subtitle="Responda sem consultar. Errou? Volte ao vídeo e tente de novo."
                  done={quizPerfect}
                />
                <div className="mt-5 max-w-3xl">
                  <LessonQuickQuiz
                    key={lesson.id}
                    questions={guide.quiz}
                    storageKey={userId ? `orbitamos-quiz-v2-${userId}-${lesson.id}` : null}
                    onScoreChange={(correct, total) => setQuizScore({ correct, total })}
                  />
                </div>
              </section>
            )}

            {/* ── 3. Pratique ── */}
            {guide && (
              <section id="secao-pratica" className="scroll-mt-24 border-b border-white/[0.07] py-6 sm:py-8">
                <SectionHeading
                  number={3}
                  title="Pratique de verdade"
                  subtitle="É aqui que o conteúdo vira habilidade. Reserve alguns minutos."
                  done={lessonDone}
                />
                <div className="mt-5 max-w-3xl rounded-2xl bg-orbit-purple/[0.08] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-orbit-purple">Aplicação rápida</p>
                  <h3 className="mt-2 text-lg font-black text-white">{guide.practice.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{guide.practice.description}</p>
                  <ul className="mt-4 space-y-1.5">
                    {guide.checklist.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs leading-5 text-white/50">
                        <CheckCircle2 className="size-3.5 shrink-0 text-orbit-purple/70" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 rounded-xl bg-black/25 p-3 text-xs leading-5 text-white/45">
                    <strong className="text-white/70">Entrega esperada:</strong> {guide.practice.deliverable}
                  </div>
                  {guide.practice.href && (
                    <Link
                      href={guide.practice.href}
                      className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-orbit-electric"
                    >
                      Abrir laboratório guiado
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              </section>
            )}

            {/* ── 4. Conclua ── */}
            <section id="secao-concluir" className="scroll-mt-24 py-6 sm:py-8">
              <SectionHeading
                number={4}
                title="Conclua a aula"
                subtitle={lessonDone ? "Aula registrada no seu progresso." : "Marque como concluída para registrar o progresso e ganhar XP."}
                done={lessonDone}
              />
              <div className="mt-5 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-black text-white">{lessonDone ? "Aula concluída" : "Pronto para seguir?"}</div>
                  <p className="mt-1 text-xs text-white/40">
                    {!lessonDone && !quizPerfect
                      ? "Dica: complete a revisão da etapa 2 antes de concluir."
                      : nextLesson
                        ? `Próxima: ${nextLesson.titulo}`
                        : "Esta é a última aula do curso."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={completeLesson}
                  disabled={completing || (lessonDone && !nextLesson)}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-5 text-sm font-black text-black disabled:opacity-50"
                >
                  {completing ? "Salvando..." : lessonDone ? "Ir para próxima aula" : "Concluir e continuar"}
                  {!completing && (lessonDone ? <ArrowRight className="size-4" /> : <Check className="size-4" />)}
                </button>
              </div>
            </section>
          </div>
        </main>

        <aside className="hidden border-l border-white/[0.07] bg-[#08090c] lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-4">
            <div className="mb-4 flex items-center gap-2">
              <ListVideo className="size-4 text-orbit-electric" />
              <h2 className="text-sm font-black text-white">Conteúdo do curso</h2>
            </div>
            <Curriculum course={course} lessonId={lessonId} completed={completed} onSelect={selectLesson} />
          </div>
        </aside>
      </div>

      {curriculumOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setCurriculumOpen(false)} aria-label="Fechar conteúdo" />
          <aside
            id="course-curriculum-drawer"
            role="dialog"
            aria-modal="true"
            className="absolute inset-y-0 right-0 w-[min(90vw,360px)] overflow-y-auto border-l border-white/10 bg-[#08090c] p-4 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-orbit-electric">Curso</p>
                <h2 className="mt-1 text-sm font-black text-white">Conteúdo das aulas</h2>
              </div>
              <button type="button" onClick={() => setCurriculumOpen(false)} className="grid size-10 place-items-center rounded-xl text-white/50 hover:bg-white/5">
                <X className="size-5" />
              </button>
            </div>
            <Curriculum course={course} lessonId={lessonId} completed={completed} onSelect={selectLesson} />
          </aside>
        </div>
      )}
    </div>
  );
}
