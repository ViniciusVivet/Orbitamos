import Image from "next/image";
import type { Projeto } from "@/types/projeto";
import { CATEGORIAS, STATUS_LABELS } from "@/types/projeto";
import { Button } from "@/components/ui/button";

function getCategoriaLabel(slug: string) {
  return CATEGORIAS.find((c) => c.slug === slug)?.label ?? slug;
}

interface CaseHeaderProps {
  projeto: Projeto;
}

export default function CaseHeader({ projeto }: CaseHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-white/10 bg-[#03050a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(0,212,255,0.18),transparent_32%),radial-gradient(circle_at_18%_78%,rgba(139,92,246,0.16),transparent_28%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#03050a]/50 to-[#03050a]" />

      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-orbit-electric/25 bg-orbit-electric/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-orbit-electric">
              Orbitamos Studio
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
              {getCategoriaLabel(projeto.categoria)}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[0.96] text-white sm:text-5xl lg:text-6xl">
            {projeto.nome}
          </h1>

          <p className="mt-5 text-base leading-8 text-white/62 sm:text-lg">
            {projeto.resumo}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {projeto.link && (
              <Button asChild className="h-12 rounded-md bg-white px-6 font-bold text-black hover:bg-orbit-electric">
                <a href={projeto.link} target="_blank" rel="noreferrer">
                  Visitar projeto
                </a>
              </Button>
            )}
            <Button asChild variant="outline" className="h-12 rounded-md border-white/15 bg-white/[0.03] px-6 font-bold text-white hover:bg-white/10 hover:text-white">
              <a href="https://wa.me/5511949138973?text=Ol%C3%A1%2C+vi+um+case+da+Orbitamos+e+quero+fazer+um+or%C3%A7amento" target="_blank" rel="noreferrer">
                Pedir orçamento
              </a>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08] sm:grid-cols-4">
            <div className="bg-[#050812]/90 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Status</p>
              <p className="mt-1 text-sm font-bold text-white">{STATUS_LABELS[projeto.status]}</p>
            </div>
            <div className="bg-[#050812]/90 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Foco</p>
              <p className="mt-1 text-sm font-bold text-white">{projeto.tags[0] ?? "Projeto digital"}</p>
            </div>
            <div className="bg-[#050812]/90 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Entrega</p>
              <p className="mt-1 text-sm font-bold text-white">Mobile-first</p>
            </div>
            <div className="bg-[#050812]/90 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Stack</p>
              <p className="mt-1 text-sm font-bold text-white">{projeto.stack[0] ?? "Web"}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] border border-orbit-electric/10 bg-orbit-electric/[0.03] blur-sm" />
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={projeto.imagemPrincipal}
                alt={`Imagem do case ${projeto.nome}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            </div>
            <div className="grid gap-px bg-white/[0.08] sm:grid-cols-3">
              {projeto.tags.slice(0, 3).map((tag) => (
                <div key={tag} className="bg-[#080b14]/95 px-4 py-3 text-sm font-semibold text-white/70">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
