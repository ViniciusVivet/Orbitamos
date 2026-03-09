"use client";

import { CATEGORIAS } from "@/types/projeto";

const TODOS = { slug: "todos" as const, label: "Todos" };

type FilterSlug = "todos" | (typeof CATEGORIAS)[number]["slug"];

interface ProjetosFiltersProps {
  activeFilter: string;
  onFilter: (slug: FilterSlug) => void;
}

export default function ProjetosFilters({ activeFilter, onFilter }: ProjetosFiltersProps) {
  const options = [TODOS, ...CATEGORIAS];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-6">
      {options.map(({ slug, label }) => (
        <button
          key={slug}
          type="button"
          onClick={() => onFilter(slug)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeFilter === slug
              ? "bg-gradient-to-r from-orbit-electric/20 to-orbit-purple/20 border border-orbit-electric/50 text-white"
              : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/25"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
