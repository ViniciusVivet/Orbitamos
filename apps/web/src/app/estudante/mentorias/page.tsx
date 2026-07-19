"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  Code2,
  Compass,
  MessageCircle,
  Route,
  Users,
} from "lucide-react";
import { whatsappMentoriaUrl } from "@/lib/social";

const mentoringGoals = [
  {
    icon: Compass,
    title: "Definir uma direção",
    description: "Para quem está perdido entre tecnologias, cursos e possibilidades de carreira.",
  },
  {
    icon: Code2,
    title: "Destravar tecnicamente",
    description: "Para organizar estudos, entender lacunas e decidir o que praticar primeiro.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Preparar o próximo passo",
    description: "Para revisar portfólio, posicionamento e caminho até oportunidades reais.",
  },
];

export default function EstudanteMentorias() {
  return (
    <div className="-mx-4 -mt-4 min-h-screen overflow-hidden pb-14 sm:-mt-6 lg:-mx-6 lg:-mt-8">
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-10 pt-10 sm:px-8 lg:px-10">
        <div className="absolute inset-0 -z-20 bg-[#03050a]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_90%_at_85%_10%,rgba(139,92,246,.3),transparent_62%),radial-gradient(ellipse_55%_75%_at_5%_55%,rgba(0,212,255,.14),transparent_70%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-violet-300">
            <Users className="size-4" /> Orientação humana
          </div>
          <h1 className="mt-3 max-w-4xl text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Você não precisa descobrir <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">tudo sozinho.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
            Use a mentoria para transformar dúvida em plano: explique seu momento, receba uma direção e volte para a prática com um próximo passo claro.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={whatsappMentoriaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black transition hover:bg-white/90 touch-manipulation"
            >
              <MessageCircle className="size-4" /> Solicitar orientação
            </Link>
            <Link
              href="/mentorias"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/20 px-6 text-sm font-bold text-white transition hover:bg-white/10 touch-manipulation"
            >
              Conhecer os programas <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-9 px-4 pt-8 sm:px-8 lg:px-10">
        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">Comece pelo seu objetivo</p>
            <h2 className="mt-1 text-2xl font-black text-white">Em que ponto você precisa de ajuda?</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {mentoringGoals.map((goal) => {
              const Icon = goal.icon;
              return (
                <article key={goal.title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
                  <div className="grid size-11 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/[.08] text-cyan-300">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-white">{goal.title}</h3>
                  <p className="mt-2 text-sm leading-5 text-white/50">{goal.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
          <section className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-400/[.09] to-cyan-400/[.035] p-5 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-violet-300">
              <Route className="size-4" /> Programas da Orbitamos
            </div>
            <div className="mt-6 space-y-4">
              <article className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white">Mentoria Tech 9 Meses</h3>
                    <p className="mt-1 text-sm text-white/45">Estrutura de longo prazo para quem está começando.</p>
                  </div>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[.08] px-3 py-1 text-xs font-bold text-cyan-200">Iniciante</span>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {["Lógica e desenvolvimento web", "Banco de dados", "Prática orientada", "Preparação para o mercado"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/55">
                      <Check className="size-3.5 shrink-0 text-cyan-300" /> {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-2xl border border-white/10 bg-black/25 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white">Programa Quebrada Dev</h3>
                    <p className="mt-1 text-sm text-white/45">Prática e projetos para quem já possui uma base.</p>
                  </div>
                  <span className="rounded-full border border-violet-300/20 bg-violet-300/[.08] px-3 py-1 text-xs font-bold text-violet-200">Intermediário</span>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {["Projetos da vida real", "Revisão técnica", "Portfólio guiado", "Oportunidades conforme desempenho"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/55">
                      <Check className="size-3.5 shrink-0 text-violet-300" /> {item}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/35">
              A participação, disponibilidade e formato são confirmados diretamente com o time. A página não presume vaga ou sessão agendada.
            </p>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-[#080a0f] p-5 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-300">
              <BookOpenCheck className="size-4" /> Antes de solicitar
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">Chegue com contexto.</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">Uma boa conversa começa quando você consegue explicar seu momento atual.</p>
            <ol className="mt-6 space-y-3">
              {[
                "Qual é seu objetivo nos próximos três meses?",
                "O que você já estudou ou construiu?",
                "Qual dificuldade está impedindo seu avanço?",
                "Quanto tempo real você consegue dedicar por semana?",
              ].map((item, index) => (
                <li key={item} className="flex gap-3 rounded-xl bg-white/[.035] p-3 text-sm leading-5 text-white/65">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-300 text-xs font-black text-black">{index + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[.055] p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">Enquanto a conversa não acontece</p>
              <h2 className="mt-2 text-2xl font-black text-white">Continue produzindo evidências do seu aprendizado.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-5 text-white/45">Uma aula concluída e um desafio tentado dão contexto concreto para receber uma orientação melhor.</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/estudante/aulas" className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-white/10">
                Abrir aulas
              </Link>
              <Link href="/estudante/pratica" className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-black text-black hover:bg-cyan-200">
                Ir para prática
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
