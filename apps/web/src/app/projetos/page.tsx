"use client";

import { useMemo, useState } from "react";
import ProjetosHero from "@/components/projetos/ProjetosHero";
import ProjetosFilters from "@/components/projetos/ProjetosFilters";
import ProjectCard from "@/components/projetos/ProjectCard";
import WhatWeBuild from "@/components/projetos/WhatWeBuild";
import ProjetosCTA from "@/components/projetos/ProjetosCTA";
import { projetos } from "@/data/projetos";
import type { CategoriaSlug } from "@/types/projeto";

type FilterSlug = "todos" | CategoriaSlug;

export default function ProjetosPage() {
  const [activeFilter, setActiveFilter] = useState<FilterSlug>("todos");

  const filtered = useMemo(() => {
    if (activeFilter === "todos") return projetos;
    return projetos.filter((p) => p.categoria === activeFilter);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-black text-white">
      <ProjetosHero />
      <div className="container mx-auto px-4 py-10">
        <ProjetosFilters
          activeFilter={activeFilter}
          onFilter={setActiveFilter}
        />
        <div
          id="projetos-grid"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((projeto) => (
            <ProjectCard key={projeto.slug} projeto={projeto} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-white/60">
            Nenhum projeto nesta categoria no momento.
          </p>
        )}
      </div>
      <WhatWeBuild />
      <ProjetosCTA />
    </div>
  );
}
