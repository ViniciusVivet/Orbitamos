"use client";

import { CATEGORIAS } from "@/types/projeto";
import type { ProjectFilter } from "@/lib/projectCatalog";
import s from "./ProjectCatalog.module.css";

const options = [{ slug: "todos" as const, label: "Todos" }, ...CATEGORIAS];

export default function ProjetosFilters({ activeFilter, onFilter, counts }: {
  activeFilter: ProjectFilter;
  onFilter: (slug: ProjectFilter) => void;
  counts: Record<ProjectFilter, number>;
}) {
  return <>
    <div className={s.mobileFilter}>
      <label htmlFor="project-category">Tipo de projeto</label>
      <select id="project-category" value={activeFilter} onChange={(event) => onFilter(event.target.value as ProjectFilter)} aria-controls="projetos-resultados">
        {options.map(({ slug, label }) => <option key={slug} value={slug}>{label} ({counts[slug]})</option>)}
      </select>
    </div>
    <div className={s.filters} role="group" aria-label="Filtrar projetos por tipo">
    {options.map(({ slug, label }) => <button
      key={slug}
      type="button"
      onClick={() => onFilter(slug)}
      className={s.filter}
      aria-pressed={activeFilter === slug}
      aria-controls="projetos-resultados"
    >{label}<span aria-hidden="true">{counts[slug]}</span></button>)}
    </div>
  </>;
}
