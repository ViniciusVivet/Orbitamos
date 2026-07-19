"use client";

import Link from "next/link";
import { Code2, ChevronRight } from "lucide-react";
import { desafios } from "@/lib/desafios";

export default function PraticaIndex() {
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-orbit-electric/25 bg-orbit-electric/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-orbit-electric">
          <Code2 className="size-3" /> Modo Prática
        </div>
        <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">
          Desafios de Código
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Escreva código real no editor, execute e veja o resultado. O chat te guia passo a passo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {desafios.map((desafio) => (
          <Link
            key={desafio.slug}
            href={`/estudante/pratica/${desafio.slug}`}
            className="group rounded-xl border border-white/10 bg-[#0d1117] p-5 transition-all hover:border-orbit-electric/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,212,255,0.08)]"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-orbit-electric/10 px-2 py-0.5 text-[10px] font-bold uppercase text-orbit-electric">
                {desafio.linguagem}
              </span>
              <ChevronRight className="size-4 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-orbit-electric" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">{desafio.titulo}</h3>
            <p className="mt-1 text-xs text-white/50 leading-relaxed">{desafio.descricao}</p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-white/35">
              <span>{desafio.steps.length} passos</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>~5 min</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
