"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Pause, Play, Search, SearchX, Workflow, X } from "lucide-react";
import ProjetosHero from "@/components/projetos/ProjetosHero";
import ProjetosFilters from "@/components/projetos/ProjetosFilters";
import ProjectCategoryWorld from "@/components/projetos/ProjectCategoryWorld";
import ProjectCard from "@/components/projetos/ProjectCard";
import ProjetosTestimonials from "@/components/projetos/ProjetosTestimonials";
import ProjetosCTA from "@/components/projetos/ProjetosCTA";
import { projetos } from "@/data/projetos";
import { CATEGORIAS, type Projeto } from "@/types/projeto";
import { filterProjectCatalog, orderProjectsForPortfolio, projectCatalogPresentation, projectCategoryCounts, type ProjectFilter } from "@/lib/projectCatalog";
import { getProjectEnvironment } from "@/lib/projectEnvironments";
import s from "@/components/projetos/ProjectCatalog.module.css";
import layout from "@/components/projetos/ProjectCategoryLayout.module.css";

const orderedProjects = orderProjectsForPortfolio(projetos);
const categoryTotals = projectCategoryCounts(projetos);
// Legacy case links use a document.body portal and must only render in the browser.
const HologramModal = dynamic(() => import("@/components/projetos/HologramModal"), { ssr: false });

function parseCategory(value: string | null): ProjectFilter {
  return value && CATEGORIAS.some((item) => item.slug === value) ? value as ProjectFilter : "todos";
}

function writeLocation(params: URLSearchParams, mode: "push" | "replace") {
  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) return;
  if (mode === "push") window.history.pushState(null, "", next);
  else window.history.replaceState(null, "", next);
}

function ProjetosContent() {
  const searchParams = useSearchParams();
  const catalogRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>(() => parseCategory(searchParams.get("categoria")));
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [paused, setPaused] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(() => projetos.find((project) => project.slug === searchParams.get("case")) ?? null);
  const paramsKey = searchParams.toString();
  const [sourceParams, setSourceParams] = useState(paramsKey);

  // Native history, browser Back and category links in the main menu share one state.
  if (sourceParams !== paramsKey) {
    setSourceParams(paramsKey);
    setActiveFilter(parseCategory(searchParams.get("categoria")));
    setQuery(searchParams.get("q") ?? "");
    setSelectedProjeto(projetos.find((project) => project.slug === searchParams.get("case")) ?? null);
  }

  const environment = getProjectEnvironment(activeFilter);
  const { filtered, featured, remaining } = useMemo(() => projectCatalogPresentation(projetos, activeFilter, query), [activeFilter, query]);
  const counts = useMemo(() => projectCategoryCounts(filterProjectCatalog(projetos, "todos", query)), [query]);
  const automationWithoutPublicCase = activeFilter === "automacoes" && categoryTotals.automacoes === 0;

  const handleFilter = useCallback((category: ProjectFilter) => {
    const catalog = catalogRef.current;
    const wasPastCatalog = catalog ? catalog.getBoundingClientRect().top < 0 : false;
    const params = new URLSearchParams(window.location.search);
    if (category === "todos") params.delete("categoria");
    else params.set("categoria", category);
    params.delete("case");
    setActiveFilter(category);
    setSelectedProjeto(null);
    writeLocation(params, "push");
    // A short result list must not leave a visitor looking at the footer after filtering.
    if (wasPastCatalog) requestAnimationFrame(() => {
      const target = catalogRef.current;
      if (!target) return;
      const clearance = 64 + (dockRef.current?.offsetHeight ?? 80) + 20;
      window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - clearance), behavior: "instant" });
    });
  }, []);

  const handleQuery = useCallback((value: string) => {
    setQuery(value);
    const params = new URLSearchParams(window.location.search);
    if (value) params.set("q", value);
    else params.delete("q");
    writeLocation(params, "replace");
  }, []);

  const resetCatalog = useCallback(() => {
    setQuery("");
    setActiveFilter("todos");
    const params = new URLSearchParams(window.location.search);
    params.delete("categoria");
    params.delete("q");
    params.delete("case");
    setSelectedProjeto(null);
    writeLocation(params, "push");
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProjeto(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("case");
    writeLocation(params, "replace");
  }, []);

  return (
    <div className={layout.page}>
      <ProjectCategoryWorld category={activeFilter} paused={paused}>
        <div ref={dockRef} className={`${layout.dock} ${s.filterDock}`} data-project-category-dock>
          <div className={layout.dockInner}>
            <div className={layout.categoryControls}>
              <ProjetosFilters activeFilter={activeFilter} onFilter={handleFilter} counts={counts} />
            </div>
            <button
              type="button"
              className={layout.pauseControl}
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              aria-label={paused ? "Retomar movimento do cenário" : "Pausar movimento do cenário"}
              title={paused ? "Retomar movimento do cenário" : "Pausar movimento do cenário"}
              data-world-pause-control
            >
              {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              <span>{paused ? "Retomar" : "Pausar"}</span>
            </button>
          </div>
        </div>

        <ProjetosHero environment={environment} />

        <section ref={catalogRef} id="projetos-grid" className={s.catalog} aria-labelledby="project-catalog-title">
          <div className={s.inner}>
            <div className={s.catalogToolbar} data-automation-toolbar={automationWithoutPublicCase && !query}>
              <div className={s.heading}>
                <h2 id="project-catalog-title">Projetos</h2>
                <p className={s.resultMeta} role="status" aria-live="polite"><strong>{filtered.length} {filtered.length === 1 ? "projeto" : "projetos"}</strong>{query || activeFilter !== "todos" ? filtered.length === 1 ? " encontrado" : " encontrados" : " para explorar"}</p>
              </div>
              <div className={s.tools}>
                <label className={s.searchLabel} htmlFor="project-search">Buscar projeto ou objetivo</label>
                <div className={s.search}>
                  <Search aria-hidden="true" />
                  <input id="project-search" type="search" value={query} onChange={(event) => handleQuery(event.target.value)} placeholder="Buscar projetos" autoComplete="off" aria-controls="projetos-resultados" />
                  {query && <button type="button" onClick={() => handleQuery("")} aria-label="Limpar busca"><X size={17} aria-hidden="true" /></button>}
                </div>
              </div>
            </div>
            <div id="projetos-resultados">
              {featured.length > 0 && <div className={s.featuredGrid} role="group" aria-label="Seleção de projetos">
                {featured.map((projeto, index) => <ProjectCard key={projeto.slug} projeto={projeto} variant={index === 0 ? "lead" : "feature"} />)}
              </div>}
              {featured.length > 0 && remaining.length > 0 && <h3 className={s.collectionHeading}>Outras referências</h3>}
              {remaining.length > 0 && <div className={s.grid}>
                {remaining.map((projeto) => <ProjectCard key={projeto.slug} projeto={projeto} />)}
              </div>}
              {filtered.length === 0 && (automationWithoutPublicCase ? <div className={`${s.empty} ${layout.automationEmpty}`} data-automation-empty>
                <Workflow aria-hidden="true" />
                <div>
                  <h3>Ainda não há um case público de automação nesta seleção.</h3>
                  <p>Conte qual rotina quer conectar pelo botão acima ou conheça os outros projetos.</p>
                </div>
                <button type="button" onClick={resetCatalog}>Ver todos os projetos</button>
              </div> : <div className={s.empty}>
                <SearchX aria-hidden="true" />
                <h3>Nenhum projeto por aqui ainda.</h3>
                <p>Tente outro nome, uma palavra mais curta ou outro tipo de projeto.</p>
                <button type="button" onClick={resetCatalog}>Ver todos os projetos</button>
              </div>)}
            </div>
          </div>
        </section>
      </ProjectCategoryWorld>

      <ProjetosTestimonials />
      <ProjetosCTA />

      {selectedProjeto && <HologramModal key={selectedProjeto.slug} projeto={selectedProjeto} projetos={orderedProjects} onClose={handleCloseModal} />}
    </div>
  );
}

function ProjetosFallback() {
  return <div className={layout.loadingShell} aria-busy="true"><p>Portfólio Orbitamos</p><h1>Conheça os projetos da Orbitamos.</h1><span aria-hidden="true" /></div>;
}

export default function ProjetosPage() {
  return <Suspense fallback={<ProjetosFallback />}><ProjetosContent /></Suspense>;
}
