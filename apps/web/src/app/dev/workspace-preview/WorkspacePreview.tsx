"use client";
import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";
import ProjectWorkspace from "@/components/colaborador/ProjectWorkspace";
import ApplicationWorkspace from "@/components/colaborador/ApplicationWorkspace";
import PortfolioWorkspace from "@/components/colaborador/PortfolioWorkspace";
import { collaboratorDemoProjects as projects, collaboratorDemoApplications as applications } from "@/lib/collaboratorPreviewFixtures";
import s from "@/components/portal/PortalExperience.module.css";

function Preview() {
  const params = useSearchParams();
  const view = params.get("view") ?? "projects";
  const empty = params.get("state") === "empty";
  const [open, setOpen] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const failed = params.get("state") === "error" && !recovered;
  const loading = params.get("state") === "loading";
  const retry = failed ? () => setRecovered(true) : undefined;
  const close = useCallback(() => setOpen(false), []);
  const activeHref = view === "applications" ? "/colaborador/candidaturas" : view === "portfolio" ? "/colaborador/portfolio" : "/colaborador/projetos";
  return <div className={s.workspace + " min-h-screen text-white"} data-workspace-preview>
    <PortalSidebar mode="work" preview activeWorkHref={activeHref} mobileOpen={open} onCloseMobile={close}/>
    <div className="lg:pl-56">
      <PortalHeader mode="work" preview title="Dados demonstrativos" mobileOpen={open} onOpenMenu={() => setOpen(true)}/>
      <main className="px-4 py-4 sm:py-6 lg:px-6 lg:py-8">
        {view === "applications" ? <ApplicationWorkspace items={empty || failed ? [] : applications} loading={loading} error={failed ? "Não foi possível atualizar seus processos demonstrativos." : ""} onReload={retry} preview/> : view === "portfolio" ? <PortfolioWorkspace preview initialItems={[]}/> : <ProjectWorkspace projects={empty || failed ? [] : projects} loading={loading} error={failed ? "Não foi possível atualizar seus projetos demonstrativos." : ""} onRetry={retry} preview/>}
      </main>
    </div>
  </div>;
}
export default function WorkspacePreview() { return <Suspense fallback={<p role="status">Preparando a prévia…</p>}><Preview/></Suspense>; }
