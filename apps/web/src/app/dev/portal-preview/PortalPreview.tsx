"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StudentHome from "@/components/portal/StudentHome";
import CollaboratorHome from "@/components/portal/CollaboratorHome";
import PortalSidebar from "@/components/portal/PortalSidebar";
import { getNextIncompleteLesson } from "@/lib/learningExperience";
import type { Curso } from "@/lib/cursos";
import type { Project, Job, JobApplication } from "@/lib/api";
import s from "@/components/portal/PortalExperience.module.css";

// Isolated visual fixtures. This route returns 404 outside development.
// No credentials, API mutations, or changes to the real authenticated layouts.
const courses: Curso[] = [
  { id: "demo-logica", slug: "logica-programacao-python", titulo: "Lógica de programação com Python", modulos: [{ id: "fundamentos", titulo: "Primeiros passos", aulas: [
    { id: "a1", titulo: "Como um programa pensa", youtubeVideoId: "" },
    { id: "a2", titulo: "Variáveis e tipos de dados.", youtubeVideoId: "" },
    { id: "a3", titulo: "Variáveis e decisões", youtubeVideoId: "" },
  ] }] },
  { id: "demo-web", slug: "html-css-js", titulo: "HTML, CSS e JavaScript", modulos: [{ id: "web", titulo: "Sua primeira página", aulas: [{ id: "b1", titulo: "Estrutura de uma página", youtubeVideoId: "" }] }] },
  { id: "demo-git", slug: "github-colaborativo", titulo: "GitHub e colaboração", modulos: [{ id: "git", titulo: "Versionamento", aulas: [{ id: "c1", titulo: "Seu primeiro commit", youtubeVideoId: "" }] }] },
];
const projects: Project[] = [
  { id: 1, title: "Uma nova experiência para a comunidade", description: "Protótipo e interface", status: "in_progress", createdAt: "2026-09-10", clientName: "Projeto demonstrativo", progress: 65 },
  { id: 2, title: "Portfólio de uma marca autoral", description: "Design de interface", status: "in_progress", createdAt: "2026-09-09", progress: 30 },
];
const jobs: Job[] = [
  { id: 1, title: "Desenvolvimento de interfaces web", description: "", type: "Projeto", status: "aberta", createdAt: "2026-09-10", workModel: "Remoto", skills: ["React", "CSS"], budgetLabel: "A combinar" },
  { id: 2, title: "Design para experiências digitais", description: "", type: "Freelance", status: "aberta", createdAt: "2026-09-09", workModel: "Remoto", skills: ["Figma", "UI Design"] },
];
const applications: JobApplication[] = [{ id: 1, jobId: 1, jobTitle: "Desenvolvimento de interfaces web", jobType: "Projeto", status: "reviewing", createdAt: "2026-09-12T12:00:00Z" }];

export default function PortalPreview({ role, state }: { role: "student" | "work"; state: string }) {
  const [open, setOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (previewRef.current) previewRef.current.dataset.previewReady = "true"; }, []);
  const [retried, setRetried] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const failed = state === "error" && !retried;
  const loading = state === "loading";
  const populated = state === "filled" || state === "complete" || retried;
  const sampleCourses = populated ? courses : [];
  return <div ref={previewRef} data-portal-preview data-preview-ready="false" className={s.workspace + " min-h-screen text-white"}>
    <PortalSidebar mode={role} mobileOpen={open} onCloseMobile={close}/>
    <div className="lg:pl-56">
      <header className={s.workspaceHeader + " sticky z-30 flex items-center gap-3 border-b border-white/10 px-4 lg:px-6"}>
        <button className="min-h-11 px-2 lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}>☰</button>
        <span className="text-xs text-slate-300">Prévia local · dados demonstrativos · {role === "student" ? "Academy" : "Studio"}</span>
      </header>
      <div className="px-4 py-4 sm:py-6 lg:px-6 lg:py-8">
        {role === "student" ? <StudentHome name="Alex"
          progress={{ percent: 20, phase: "Início", nextGoal: "", level: populated ? 3 : 1, xp: populated ? 420 : 0, streakDays: populated ? 4 : 0 }}
          progressLoading={loading} courses={sampleCourses}
          nextLesson={getNextIncompleteLesson(sampleCourses, new Set(state === "complete" ? ["a1", "a2", "a3", "b1", "c1"] : ["a1"]))}
          completedLessons={state === "complete" ? 5 : populated ? 1 : 0}
          loading={loading} error={failed ? "Não foi possível atualizar suas aulas. Tente novamente para retomar seu progresso." : ""}
          summary={null} retry={() => setRetried(true)}/>
          : <CollaboratorHome name="Alex" projects={populated ? projects : []} jobs={populated ? jobs : []}
            applications={populated ? applications : []} loading={loading}
            failed={failed ? ["projetos", "vagas", "candidaturas"] : []} retry={() => setRetried(true)}/>}
      </div>
    </div>
  </div>;
}
