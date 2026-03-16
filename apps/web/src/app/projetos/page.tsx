"use client";

import { useMemo, useState } from "react";
import ProjetosHero from "@/components/projetos/ProjetosHero";
import ProjetosStats from "@/components/projetos/ProjetosStats";
import ProjetosFilters from "@/components/projetos/ProjetosFilters";
import ProjectCard from "@/components/projetos/ProjectCard";
import ProjetosTestimonials from "@/components/projetos/ProjetosTestimonials";
import WhatWeBuild from "@/components/projetos/WhatWeBuild";
import ProjetosImpacto from "@/components/projetos/ProjetosImpacto";
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
      {/* 1. Hero */}
      <ProjetosHero />

      {/* 2. Números de tração */}
      <ProjetosStats />

      {/* 3. Filtros + Grid de projetos */}
      <div className="container mx-auto px-4 py-6">
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

      {/* 4. Depoimentos de clientes */}
      <ProjetosTestimonials />

      {/* 5. Capacidade técnica */}
      <WhatWeBuild />

      {/* 6. Diferencial / impacto social (argumento para investidor) */}
      <ProjetosImpacto />

      {/* 7. CTA final */}
      <ProjetosCTA />
    </div>
  );
}
