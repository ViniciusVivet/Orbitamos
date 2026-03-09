import Image from "next/image";
import type { Projeto } from "@/types/projeto";
import { CATEGORIAS } from "@/types/projeto";

function getCategoriaLabel(slug: string) {
  return CATEGORIAS.find((c) => c.slug === slug)?.label ?? slug;
}

interface CaseHeaderProps {
  projeto: Projeto;
}

export default function CaseHeader({ projeto }: CaseHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black" />
      <div className="relative aspect-[21/9] w-full md:aspect-[3/1]">
        <Image
          src={projeto.imagemPrincipal}
          alt={projeto.nome}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
        <div className="container mx-auto">
          <span className="text-xs font-medium tracking-widest text-orbit-electric uppercase">
            {getCategoriaLabel(projeto.categoria)}
          </span>
          <h1 className="mt-1 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {projeto.nome}
          </h1>
        </div>
      </div>
    </header>
  );
}
