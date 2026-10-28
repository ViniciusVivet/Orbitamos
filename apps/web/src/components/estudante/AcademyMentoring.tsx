"use client";

import Link from "next/link";
import OrbitPhoto from "@/components/brand/OrbitPhoto";
import s from "@/components/estudante/StudentLibrary.module.css";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  Code2,
  Compass,
  MessageCircle,
  Route,
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

export default function AcademyMentoring() {
  return (
    <div data-academy-mentoring className="-mx-4 -mt-4 min-h-screen overflow-hidden pb-14 sm:-mt-6 lg:-mx-6 lg:-mt-8">
      <section className="border-b border-white/10 px-4 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl"><div className={s.hero}>
          <div><span>MENTORIAS</span><h1>Uma conversa pode<br/>{" "}abrir caminho.</h1><p>Conte onde você travou e confira as opções de orientação.</p><div className="mt-5 flex flex-wrap gap-3">
            <Link href={whatsappMentoriaUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#c6e4ce] px-5 text-xs font-semibold text-[#173c36]"><MessageCircle size={16}/> Solicitar orientação</Link>
            <Link href="/mentorias" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#c6e4ce]/30 px-5 text-xs font-semibold text-[#c6e4ce]">Ver programas<ArrowRight size={16}/></Link>
          </div></div><OrbitPhoto kind="mentoria" className={s.cover} sizes="(max-width: 650px) 92vw, 45vw"/>
        </div></div>
      </section>

      <div className="mx-auto max-w-7xl space-y-9 px-4 pt-8 sm:px-8 lg:px-10">
        <section>
          <div>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">Comece pelo seu objetivo</p>
            <h2 className="mt-1 text-2xl font-black text-white">Em que ponto você precisa de ajuda?</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {mentoringGoals.map((goal) => {
              const Icon = goal.icon;
              return (
                <article key={goal.title} className="flex items-start gap-3 border-t border-white/15 pt-5">
                  <div className="mt-1 shrink-0 text-[#b6d8c8]">
                    <Icon className="size-5" />
                  </div>
                  <div>
                  <h3 className="text-base font-semibold text-white">{goal.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[#b3c8ca]">{goal.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
          <section className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-400/[.09] to-cyan-400/[.035] p-5 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-violet-300">
              <Route className="size-4" /> Programas da Orbitamos
            </div>
            <div className="mt-6 space-y-4">
              <article className="overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-5"><OrbitPhoto kind="estudo" className="mb-5 !aspect-[2.3] rounded-lg" sizes="(max-width: 767px) 85vw, 40vw"/>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white">Mentoria Tech 9 Meses</h3>
                    <p className="mt-1 text-sm text-[#b3c8ca]">Estrutura de longo prazo para quem está começando.</p>
                  </div>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[.08] px-3 py-1 text-xs font-bold text-cyan-200">Iniciante</span>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {["Lógica e desenvolvimento web", "Banco de dados", "Prática orientada", "Preparação para o mercado"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-[#b3c8ca]">
                      <Check className="size-3.5 shrink-0 text-cyan-300" /> {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-5"><OrbitPhoto kind="equipe" className="mb-5 !aspect-[2.3] rounded-lg" sizes="(max-width: 767px) 85vw, 40vw"/>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white">Programa Quebrada Dev</h3>
                    <p className="mt-1 text-sm text-[#b3c8ca]">Prática e projetos para quem já possui uma base.</p>
                  </div>
                  <span className="rounded-full border border-violet-300/20 bg-violet-300/[.08] px-3 py-1 text-xs font-bold text-violet-200">Intermediário</span>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {["Projetos da vida real", "Revisão técnica", "Portfólio guiado", "Oportunidades conforme desempenho"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-[#b3c8ca]">
                      <Check className="size-3.5 shrink-0 text-violet-300" /> {item}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#b3c8ca]">
              A participação, disponibilidade e formato são confirmados diretamente com o time. A página não presume vaga ou sessão agendada.
            </p>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-[#080a0f] p-5 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-300">
              <BookOpenCheck className="size-4" /> Antes de solicitar
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">Sobre o que vamos conversar?</h2>
            <p className="mt-2 text-sm leading-6 text-[#b3c8ca]">Estas perguntas ajudam a contar seu momento.</p>
            <ol className="mt-6 space-y-3">
              {[
                "Qual é seu objetivo nos próximos três meses?",
                "O que você já estudou ou construiu?",
                "Qual dificuldade está impedindo seu avanço?",
                "Quanto tempo real você consegue dedicar por semana?",
              ].map((item, index) => (
                <li key={item} className="flex gap-3 rounded-xl bg-white/[.035] p-3 text-sm leading-5 text-[#cfddda]">
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
              <h2 className="mt-2 text-2xl font-black text-white">Enquanto isso, faça uma tentativa sua.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-5 text-[#b3c8ca]">Escolha uma aula ou volte ao código.</p>
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
