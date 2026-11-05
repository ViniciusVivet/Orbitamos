"use client";

import { useMemo, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SearchX, X } from "lucide-react";
import ProjetosHero from "@/components/projetos/ProjetosHero";
import ProjetosStats from "@/components/projetos/ProjetosStats";
import ProjetosFilters from "@/components/projetos/ProjetosFilters";
import ProjectCard from "@/components/projetos/ProjectCard";
import ProjetosTestimonials from "@/components/projetos/ProjetosTestimonials";
import WhatWeBuild from "@/components/projetos/WhatWeBuild";
import ProjetosCTA from "@/components/projetos/ProjetosCTA";
import HologramModal from "@/components/projetos/HologramModal";
import { projetos } from "@/data/projetos";
import { CATEGORIAS, type Projeto } from "@/types/projeto";
import { filterProjectCatalog, projectCatalogPresentation, projectCategoryCounts, type ProjectFilter } from "@/lib/projectCatalog";
import s from "@/components/projetos/ProjectCatalog.module.css";

function ProjetosContent() {
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>(() => {
    const category = searchParams.get("categoria");
    return category && (category === "todos" || CATEGORIAS.some((item) => item.slug === category))
      ? (category as ProjectFilter)
      : "todos";
  });
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(() => {
    const caseSlug = searchParams.get("case");
    return projetos.find((project) => project.slug === caseSlug) ?? null;
  });
  const paramsKey = searchParams.toString();
  const [sourceParams, setSourceParams] = useState(paramsKey);
  // A navegação de categoria pelo menu também funciona quando a página já está aberta.
  if (sourceParams !== paramsKey) {
    setSourceParams(paramsKey);
    const category = searchParams.get("categoria");
    setActiveFilter(category && CATEGORIAS.some((item) => item.slug === category) ? category as ProjectFilter : "todos");
    setQuery(searchParams.get("q") ?? "");
    setSelectedProjeto(projetos.find((project) => project.slug === searchParams.get("case")) ?? null);
  }

  const handleCloseModal = useCallback(() => setSelectedProjeto(null), []);

  const { filtered, featured, remaining } = useMemo(() => projectCatalogPresentation(projetos, activeFilter, query), [activeFilter, query]);
  const counts = useMemo(() => projectCategoryCounts(filterProjectCatalog(projetos, "todos", query)), [query]);
  const resetCatalog = () => { setQuery(""); setActiveFilter("todos"); };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 1. Hero */}
      <ProjetosHero />

      {/* 2. Números de tração */}
      <ProjetosStats />

      <section id="projetos-grid" className={s.catalog} aria-labelledby="project-catalog-title">
        <div className={s.inner}>
          <div className={s.heading}>
            <h2 id="project-catalog-title">Projetos em detalhe.</h2>
            <p>Encontre uma referência para o que você quer construir.</p>
          </div>
          <div className={s.tools}>
            <label className={s.searchLabel} htmlFor="project-search">Buscar projeto ou objetivo</label>
            <div className={s.search}>
              <Search aria-hidden="true" />
              <input id="project-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: loja, moda, sistema" autoComplete="off" aria-controls="projetos-resultados" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca"><X size={17} aria-hidden="true" /></button>}
            </div>
            <ProjetosFilters activeFilter={activeFilter} onFilter={setActiveFilter} counts={counts} />
          </div>
          <div className={s.resultMeta}>
            <p role="status" aria-live="polite"><strong>{filtered.length} {filtered.length === 1 ? "projeto" : "projetos"}</strong>{query || activeFilter !== "todos" ? " encontrados" : " para explorar"}</p>
            {featured.length > 0 && <span>Novos no portfólio</span>}
          </div>
          <div id="projetos-resultados">
            {featured.length > 0 && <div className={s.featuredGrid} role="group" aria-label="Seleção de projetos">
              {featured.map((projeto) => <ProjectCard key={projeto.slug} projeto={projeto} featured />)}
            </div>}
            {featured.length > 0 && remaining.length > 0 && <h3 className={s.collectionHeading}>Mais projetos</h3>}
            {remaining.length > 0 && <div className={s.grid}>
              {remaining.map((projeto) => <ProjectCard key={projeto.slug} projeto={projeto} />)}
            </div>}
            {filtered.length === 0 && <div className={s.empty}>
              <SearchX aria-hidden="true" />
              <h3>Nenhum projeto por aqui ainda.</h3>
              <p>Tente outro nome, uma palavra mais curta ou outro tipo de projeto.</p>
              <button type="button" onClick={resetCatalog}>Ver todos os projetos</button>
            </div>}
          </div>
        </div>
      </section>

      {/* 4. Depoimentos de clientes */}
      <ProjetosTestimonials />

      {/* 5. Capacidade técnica */}
      <WhatWeBuild />

      {/* 6. CTA final */}
      <ProjetosCTA />

      {/* Hologram overlay */}
      {selectedProjeto && (
        <HologramModal
          key={selectedProjeto.slug}
          projeto={selectedProjeto}
          projetos={projetos}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default function ProjetosPage() {
  return (
    <Suspense>
      <ProjetosContent />
    </Suspense>
  );
}
