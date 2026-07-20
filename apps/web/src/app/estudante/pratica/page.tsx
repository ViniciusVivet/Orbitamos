"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Play,
  Search,
  Sparkles,
  Target,
  TerminalSquare,
  Timer,
} from "lucide-react";
import { desafios } from "@/lib/desafios";
import { useAuth } from "@/contexts/AuthContext";

type ChallengeState = "novo" | "andamento" | "concluido";
type Filter = "todos" | ChallengeState;
type LanguageFilter = "todas" | "javascript" | "python";
type DifficultyFilter = "todas" | "iniciante" | "basico" | "intermediario";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function PraticaIndex() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [language, setLanguage] = useState<LanguageFilter>("todas");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("todas");
  const [states, setStates] = useState<Record<string, ChallengeState>>({});

  useEffect(() => {
    Promise.resolve().then(() => {
      const next: Record<string, ChallengeState> = {};
      desafios.forEach((challenge) => {
        if (!user?.id) {
          next[challenge.slug] = "novo";
          return;
        }
        try {
          const raw = localStorage.getItem(`orbitamos-pratica-${user.id}-${challenge.slug}`);
          if (!raw) {
            next[challenge.slug] = "novo";
            return;
          }
          const parsed = JSON.parse(raw) as { stepStatus?: string[] };
          next[challenge.slug] =
            parsed.stepStatus?.length === challenge.steps.length &&
            parsed.stepStatus.every((status) => status === "success")
              ? "concluido"
              : "andamento";
        } catch {
          next[challenge.slug] = "novo";
        }
      });
      setStates(next);
    });
  }, [user?.id]);

  const filteredChallenges = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return desafios.filter((challenge) => {
      const state = states[challenge.slug] ?? "novo";
      const matchesFilter = filter === "todos" || state === filter;
      const matchesLanguage = language === "todas" || challenge.linguagem === language;
      const matchesDifficulty = difficulty === "todas" || challenge.dificuldade === difficulty;
      const haystack = normalize(`${challenge.titulo} ${challenge.descricao} ${challenge.linguagem} ${challenge.categoria ?? ""} ${challenge.habilidade ?? ""}`);
      return matchesFilter && matchesLanguage && matchesDifficulty && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [difficulty, filter, language, query, states]);

  const completed = Object.values(states).filter((state) => state === "concluido").length;
  const inProgress = Object.values(states).filter((state) => state === "andamento").length;

  return (
    <div className="-mx-4 -mt-4 min-h-screen overflow-hidden pb-14 sm:-mt-6 lg:-mx-6 lg:-mt-8">
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-10 pt-10 sm:px-8 lg:px-10">
        <div className="absolute inset-0 -z-20 bg-[#03050a]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_95%_at_85%_8%,rgba(0,212,255,.22),transparent_60%),radial-gradient(ellipse_55%_80%_at_5%_60%,rgba(139,92,246,.2),transparent_68%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">
            <TerminalSquare className="size-4" /> Laboratório Orbitamos
          </div>
          <h1 className="mt-3 max-w-4xl text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Aprender código exige <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">escrever código.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
            Resolva missões curtas, execute com segurança no navegador e receba orientação por etapas sem entregar a resposta de primeira.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-white/55">
              <strong className="text-white">{desafios.length}</strong> desafios disponíveis
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/[.07] px-4 py-2 text-xs text-emerald-200">
              <strong>{completed}</strong> concluídos
            </div>
            <div className="rounded-full border border-amber-400/20 bg-amber-400/[.07] px-4 py-2 text-xs text-amber-200">
              <strong>{inProgress}</strong> em andamento
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 lg:px-10">
        <section className="rounded-3xl border border-white/10 bg-[#080a0f] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Busque por tema ou linguagem..."
                aria-label="Buscar desafios"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/35 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-orbit-electric/50 focus:ring-4 focus:ring-orbit-electric/10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {([
                ["todos", "Todos"],
                ["novo", "Novos"],
                ["andamento", "Em andamento"],
                ["concluido", "Concluídos"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition touch-manipulation min-h-[36px] ${
                    filter === value
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[.035] text-white/55 hover:bg-white/[.07] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-white/[.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {(["todas", "javascript", "python"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLanguage(value)}
                  className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase transition ${
                    language === value ? "bg-orbit-electric/15 text-orbit-electric" : "text-white/35 hover:text-white"
                  }`}
                >
                  {value === "todas" ? "Todas linguagens" : value}
                </button>
              ))}
            </div>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)}
              className="h-10 rounded-xl border border-white/10 bg-black/35 px-3 text-xs font-bold text-white/60 outline-none focus:border-orbit-electric/40"
              aria-label="Filtrar por dificuldade"
            >
              <option value="todas">Todas as dificuldades</option>
              <option value="iniciante">Iniciante</option>
              <option value="basico">Básico</option>
              <option value="intermediario">Intermediário</option>
            </select>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-300">Missões disponíveis</p>
              <h2 className="mt-1 text-2xl font-black text-white">{filteredChallenges.length} resultado{filteredChallenges.length === 1 ? "" : "s"}</h2>
            </div>
            <Link href="/estudante/aulas" className="hidden items-center gap-1 text-xs font-bold text-white/45 hover:text-orbit-electric sm:flex">
              Revisar conteúdo <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {filteredChallenges.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredChallenges.map((challenge, index) => {
                const state = states[challenge.slug] ?? "novo";
                return (
                  <Link
                    key={challenge.slug}
                    href={`/estudante/pratica/${challenge.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] transition duration-300 hover:-translate-y-1 hover:border-orbit-electric/40 hover:shadow-[0_18px_55px_rgba(0,212,255,.1)]"
                  >
                    <div className={`relative h-32 bg-gradient-to-br ${index % 3 === 0 ? "from-cyan-500/25 via-blue-950 to-black" : index % 3 === 1 ? "from-violet-500/25 via-purple-950 to-black" : "from-emerald-500/20 via-teal-950 to-black"}`}>
                      <div className="absolute -right-8 -top-10 size-32 rounded-full border border-white/10" />
                      <Code2 className="absolute bottom-4 left-5 size-8 text-white/70" />
                      <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/65">
                        {challenge.linguagem}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                          state === "concluido" ? "text-emerald-300" : state === "andamento" ? "text-amber-300" : "text-orbit-electric"
                        }`}>
                          {state === "concluido" ? <CheckCircle2 className="size-3.5" /> : state === "andamento" ? <Play className="size-3.5" /> : <Sparkles className="size-3.5" />}
                          {state === "concluido" ? "Concluído" : state === "andamento" ? "Continuar" : "Nova missão"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-white/30"><Timer className="size-3" /> ~{challenge.minutos ?? 5} min</span>
                      </div>
                      <h3 className="mt-3 text-lg font-black text-white group-hover:text-orbit-electric">{challenge.titulo}</h3>
                      <p className="mt-2 min-h-10 text-sm leading-5 text-white/45">{challenge.descricao}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {challenge.dificuldade && <span className="rounded-full bg-white/[.05] px-2 py-1 text-[9px] font-bold uppercase text-white/40">{challenge.dificuldade}</span>}
                        {challenge.categoria && <span className="rounded-full bg-orbit-purple/10 px-2 py-1 text-[9px] font-bold uppercase text-orbit-purple">{challenge.categoria}</span>}
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                        <span className="flex items-center gap-1.5 text-xs text-white/40"><Target className="size-3.5" /> {challenge.steps.length} etapas</span>
                        <ArrowRight className="size-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-orbit-electric" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.025] px-6 py-14 text-center">
              <Search className="mx-auto size-8 text-white/20" />
              <h3 className="mt-4 font-black text-white">Nenhuma missão encontrada</h3>
              <p className="mt-2 text-sm text-white/40">Limpe a busca ou escolha outro status para ver os desafios.</p>
              <button type="button" onClick={() => { setQuery(""); setFilter("todos"); setLanguage("todas"); setDifficulty("todas"); }} className="mt-4 text-xs font-bold text-orbit-electric">
                Mostrar todas
              </button>
            </div>
          )}
        </section>

        <section className="mt-9 rounded-3xl border border-amber-400/15 bg-amber-400/[.045] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">Como funciona</p>
              <h2 className="mt-2 text-xl font-black text-white">Seu código fica salvo neste dispositivo.</h2>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-white/45">A execução acontece em um ambiente temporário no navegador, com limite de tempo. Use “Reiniciar” somente quando quiser apagar o rascunho da missão.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
