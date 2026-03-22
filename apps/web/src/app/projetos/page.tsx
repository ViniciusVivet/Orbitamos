"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProjetosHero from "@/components/projetos/ProjetosHero";
import ProjetosStats from "@/components/projetos/ProjetosStats";
import ProjetosFilters from "@/components/projetos/ProjetosFilters";
import ProjectCard from "@/components/projetos/ProjectCard";
import ProjetosTestimonials from "@/components/projetos/ProjetosTestimonials";
import WhatWeBuild from "@/components/projetos/WhatWeBuild";
import ProjetosCTA from "@/components/projetos/ProjetosCTA";
import HologramModal from "@/components/projetos/HologramModal";
import { projetos } from "@/data/projetos";
import type { CategoriaSlug, Projeto } from "@/types/projeto";

type FilterSlug = "todos" | CategoriaSlug;

function ProjetosContent() {
  const [activeFilter, setActiveFilter] = useState<FilterSlug>("todos");
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const caseSlug = searchParams.get("case");
    if (caseSlug) {
      const projeto = projetos.find((p) => p.slug === caseSlug);
      if (projeto) setSelectedProjeto(projeto);
    }
  }, [searchParams]);

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
            <ProjectCard
              key={projeto.slug}
              projeto={projeto}
              onOpenCase={setSelectedProjeto}
            />
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

      {/* 6. CTA final */}
      <ProjetosCTA />

      {/* Hologram overlay */}
      {selectedProjeto && (
        <HologramModal
          projeto={selectedProjeto}
          projetos={projetos}
          onClose={() => setSelectedProjeto(null)}
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
