import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { OrbitScene } from "@/components/brand/OrbitPhoto";
import { discordUrl } from "@/lib/social";

export default function EstudanteComunidade() {
  return <div className="mx-auto max-w-6xl py-3">
    <p className="text-xs font-semibold uppercase tracking-[.22em] text-cyan-300">OrbitAcademy / Comunidade</p>
    <section className="mt-7 grid items-center gap-8 border-b border-white/10 pb-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-12">
      <div>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">Aprender também<br/>é uma conversa.</h1>
        <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Uma dúvida que você compartilha pode destravar o próximo passo de outra pessoa. Traga o que está estudando, o que tentou e o que ainda não entendeu.</p>
        <Link href="/forum" className="mt-7 inline-flex min-h-12 items-center gap-5 rounded-full bg-cyan-300 px-6 font-semibold text-slate-950 hover:bg-cyan-200">Abrir o fórum<ArrowRight size={18}/></Link>
      </div>
      <OrbitScene kind="equipe" className="rounded-[3px_36px_3px_3px]" sizes="(max-width: 1023px) 100vw, 48vw"/>
    </section>
    <div className="grid gap-8 py-8 sm:grid-cols-2">
      <div><span className="text-xs font-mono text-cyan-300">01 / TROCA COM CONTEXTO</span><h2 className="mt-3 font-display text-xl text-white">A conversa fica no fórum.</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-300">Publique dúvidas, compartilhe descobertas e acompanhe as respostas. Um título específico ajuda outras pessoas a encontrar o assunto.</p></div>
      <div><span className="text-xs font-mono text-violet-300">02 / MAIS PERTO DA GALERA</span><h2 className="mt-3 font-display text-xl text-white">Encontre a comunidade no Discord.</h2><p className="mt-2 text-sm leading-6 text-slate-300">Um outro espaço para trocar ideias e manter contato.</p><Link href={discordUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-violet-200 hover:text-white"><MessageCircle size={17}/>Entrar no Discord<ArrowUpRight size={16}/></Link></div>
    </div>
  </div>;
}
