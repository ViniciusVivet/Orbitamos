"use client";

import Image from "next/image";
import type { Projeto } from "@/types/projeto";
import { CATEGORIAS, STATUS_LABELS } from "@/types/projeto";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  projeto: Projeto;
  onOpenCase: (projeto: Projeto) => void;
}

function getCategoriaLabel(slug: string) {
  return CATEGORIAS.find((c) => c.slug === slug)?.label ?? slug;
}

export default function ProjectCard({ projeto, onOpenCase }: ProjectCardProps) {
  return (
    <article onClick={() => onOpenCase(projeto)} className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-orbit-electric/30 hover:bg-white/[0.08] hover:shadow-[0_0_30px_theme(colors.orbit-electric/.08)]">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={projeto.thumbnail}
          alt={projeto.nome}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {getCategoriaLabel(projeto.categoria)}
          </span>
          <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-xs text-white/90">
            {STATUS_LABELS[projeto.status]}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white">{projeto.nome}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/70">{projeto.resumo}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {projeto.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/80"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-orbit-electric/30 text-orbit-electric hover:bg-orbit-electric/10 hover:border-orbit-electric/60 transition-all duration-150"
            onClick={() => onOpenCase(projeto)}
          >
            ⬡ Ver case
          </Button>
          {projeto.link && (
            <Button asChild size="sm" className="bg-orbit-electric/20 text-orbit-electric hover:bg-orbit-electric/30 border border-orbit-electric/40">
              <a href={projeto.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                Abrir projeto
              </a>
            </Button>
          )}
          {projeto.github && (
            <Button asChild size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <a href={projeto.github} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                GitHub
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
