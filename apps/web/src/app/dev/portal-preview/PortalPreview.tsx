"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StudentHome from "@/components/portal/StudentHome";
import CollaboratorHome from "@/components/portal/CollaboratorHome";
import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";
import { getNextIncompleteLesson } from "@/lib/learningExperience";
import type { Curso } from "@/lib/cursos";
import type { Job } from "@/lib/api";
import { collaboratorDemoProjects as projects, collaboratorDemoApplications as applications } from "@/lib/collaboratorPreviewFixtures";
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
const jobs: Job[] = [
  { id: 1, title: "Desenvolvimento de interfaces web", description: "", type: "Projeto", status: "aberta", createdAt: "2026-09-10", workModel: "Remoto", skills: ["React", "CSS"], budgetLabel: "A combinar" },
  { id: 2, title: "Design para experiências digitais", description: "", type: "Freelance", status: "aberta", createdAt: "2026-09-09", workModel: "Remoto", skills: ["Figma", "UI Design"] },
];

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
    <PortalSidebar mode={role} mobileOpen={open} onCloseMobile={close} preview activeSection="home"/>
    <div className="lg:pl-56">
      <PortalHeader mode={role} preview section="home" title="Dados demonstrativos" mobileOpen={open} onOpenMenu={() => setOpen(true)}/>
      <div className="px-4 py-4 sm:py-6 lg:px-6 lg:py-8">
        {role === "student" ? <StudentHome name="Alex" userId="academy-preview" preview
          progress={{ percent: 20, phase: "Início", nextGoal: "", level: populated ? 3 : 1, xp: populated ? 420 : 0, streakDays: populated ? 4 : 0 }}
          progressLoading={loading} courses={sampleCourses}
          nextLesson={getNextIncompleteLesson(sampleCourses, new Set(state === "complete" ? ["a1", "a2", "a3", "b1", "c1"] : ["a1"]))}
          completedLessons={state === "complete" ? 5 : populated ? 1 : 0}
          loading={loading} error={failed ? "Não foi possível atualizar suas aulas. Tente novamente para retomar seu progresso." : ""}
          summary={null} retry={() => setRetried(true)}/>
          : <CollaboratorHome preview name="Alex" projects={populated ? projects : []} jobs={populated ? jobs : []}
            applications={populated ? applications : []} loading={loading}
            failed={failed ? ["projetos", "vagas", "candidaturas"] : []} retry={() => setRetried(true)}/>}
      </div>
    </div>
  </div>;
}
