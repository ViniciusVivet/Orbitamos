import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { OrbitScene } from "./OrbitPhoto";

export default function WorkspaceWelcome({ kind }: { kind: "portfolio" | "squad" }) {
  const portfolio = kind === "portfolio";
  return <section className="grid items-center gap-7 border-y border-white/10 py-7 lg:grid-cols-2 lg:gap-10">
    <OrbitScene kind={portfolio ? "criacao" : "equipe"} className="rounded-[3px_28px_3px_3px]" sizes="(max-width: 1023px) 100vw, 40vw"/>
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[.2em] text-cyan-300">{portfolio ? "Do processo à apresentação" : "Trabalho se constrói junto"}</p>
      <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white">{portfolio ? "Seu melhor trabalho merece contexto." : "Seu squad começa por uma conexão."}</h2>
      <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">{portfolio ? "Adicione seu primeiro case em “Novo case”. Mostre um trabalho que você realmente fez: o problema, sua contribuição e o resultado alcançado." : "Quando você entrar em um projeto, os integrantes reais da equipe aparecerão aqui. A imagem é ilustrativa; nenhum perfil fictício é exibido."}</p>
      {portfolio ? <ol className="mt-6 space-y-3 text-sm text-slate-300">{["Escolha um projeto real, inclusive de estudo.", "Conte qual parte foi feita por você.", "Use prints próprios e um link para explorar."].map((step,index)=><li key={step} className="flex gap-3 border-t border-white/10 pt-3"><span className="font-mono text-cyan-300">0{index+1}</span>{step}</li>)}</ol> : <Link href="/colaborador/vagas" className="mt-6 inline-flex min-h-12 items-center gap-4 rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 hover:bg-cyan-200">Ver oportunidades<ArrowUpRight size={18}/></Link>}
    </div>
  </section>;
}
