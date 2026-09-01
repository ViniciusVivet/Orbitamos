"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BrainCircuit, Bug, CheckCircle2, Code2, Gamepad2, Play, Puzzle, Smartphone, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fasesMonteCodigo, lerProgressoFase, type FaseProgresso } from "@/lib/jogoMonteCodigo";
import { lerProgressoNivel, niveisGuiaOrbi, type NivelProgresso } from "@/lib/jogoGuiaOrbi";

export default function JogosIndex() {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : undefined;
  const [progresso, setProgresso] = useState<Record<string, FaseProgresso>>({});
  const [progressoOrbi, setProgressoOrbi] = useState<Record<string, NivelProgresso>>({});

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const next: Record<string, FaseProgresso> = {};
      fasesMonteCodigo.forEach((fase) => {
        next[fase.slug] = lerProgressoFase(userId, fase.slug);
      });
      const nextOrbi: Record<string, NivelProgresso> = {};
      niveisGuiaOrbi.forEach((nivel) => {
        nextOrbi[nivel.slug] = lerProgressoNivel(userId, nivel.slug);
      });
      setProgresso(next);
      setProgressoOrbi(nextOrbi);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const concluidas = fasesMonteCodigo.filter((fase) => progresso[fase.slug]?.concluido).length;
  const proximaFase =
    fasesMonteCodigo.find((fase) => !progresso[fase.slug]?.concluido) ?? fasesMonteCodigo[0];
  const percent = Math.round((concluidas / fasesMonteCodigo.length) * 100);
  const orbiConcluidos = niveisGuiaOrbi.filter((nivel) => progressoOrbi[nivel.slug]?.concluido).length;
  const totalFases = fasesMonteCodigo.length + niveisGuiaOrbi.length;
  const totalConcluidas = concluidas + orbiConcluidos;
  const percentGeral = Math.round((totalConcluidas / totalFases) * 100);

  return (
    <div className="-mx-4 -mt-4 min-h-screen pb-14 sm:-mt-6 lg:-mx-6 lg:-mt-8">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
        <div className="absolute inset-0 -z-20 bg-[#03050a]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_120%_at_10%_0%,rgba(139,92,246,.18),transparent_60%),radial-gradient(ellipse_50%_100%_at_95%_100%,rgba(0,212,255,.14),transparent_68%)]" />
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.22em] text-orbit-purple">
              <Gamepad2 className="size-3.5" /> Jogos Orbitamos
            </div>
            <h1 className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl lg:text-3xl">
              Aprenda a pensar em código{" "}
              <span className="bg-gradient-to-r from-orbit-purple to-orbit-electric bg-clip-text text-transparent">jogando.</span>
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-white/50 sm:text-sm">
              Dois jogos, zero digitação: guie o Orbi pelo espaço com comandos ou monte programas com blocos. Funciona até no celular.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] text-white/60">
              <strong className="text-white">2</strong> jogos · <strong className="text-white">{totalFases}</strong> fases
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/[.07] px-3 py-1.5 text-[11px] text-emerald-200">
              <strong>{totalConcluidas}</strong> concluídas · {percentGeral}%
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] text-white/60">
              <Smartphone className="size-3.5" /> No celular
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 lg:px-10">
        <section className="mb-7 grid gap-2 sm:grid-cols-3" aria-label="Como os jogos ensinam programação">
          {[
            { icon: BrainCircuit, step: "1 · Planeje", text: "Leia a missão e construa uma hipótese antes de agir.", color: "text-orbit-purple bg-orbit-purple/10" },
            { icon: Code2, step: "2 · Execute", text: "Veja cada comando acontecer e acompanhe os valores.", color: "text-orbit-electric bg-orbit-electric/10" },
            { icon: Bug, step: "3 · Depure", text: "Descubra onde a lógica quebrou, ajuste e tente de novo.", color: "text-amber-300 bg-amber-300/10" },
          ].map(({ icon: Icon, step, text, color }) => (
            <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-3.5">
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${color}`}><Icon className="size-4" /></span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-white/75">{step}</p>
                <p className="mt-1 text-xs leading-5 text-white/40">{text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Destaque: Guia o Orbi */}
        <Link
          href="/estudante/jogos/orbi"
          className="group relative mb-7 block overflow-hidden rounded-3xl border border-orbit-electric/25 bg-gradient-to-br from-orbit-electric/[.12] via-[#080a12] to-orbit-purple/[.14] p-5 transition hover:border-orbit-electric/50 hover:shadow-[0_25px_70px_rgba(0,212,255,.12)] sm:p-7"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 50% 60% at 85% 20%, rgba(0,212,255,.14), transparent 60%), radial-gradient(ellipse 45% 60% at 10% 90%, rgba(139,92,246,.16), transparent 60%)",
            }}
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <img
              src="/orbi-tech.png"
              alt="Orbi, o mascote"
              className="w-24 shrink-0 sm:w-32"
              style={{ animation: "orbi-game-hover 3.5s ease-in-out infinite" }}
            />
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orbit-electric/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-orbit-electric">
                <Sparkles className="size-3" /> Novo jogo
              </span>
              <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Guia o Orbi</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-white/55">
                Programe o voo do mascote comando por comando e veja ele atravessar o campo de asteroides ao vivo.
                8 níveis: da primeira sequência até funções e recursão.
              </p>
              <div className="mt-3 max-w-md">
                <div className="flex items-center justify-between text-[10px] text-white/40">
                  <span>Progresso no Guia o Orbi</span>
                  <span>{orbiConcluidos}/{niveisGuiaOrbi.length}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple transition-all duration-500" style={{ width: `${Math.round((orbiConcluidos / niveisGuiaOrbi.length) * 100)}%` }} />
                </div>
              </div>
            </div>
            <span className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 text-sm font-black text-black transition group-hover:bg-orbit-electric sm:self-center">
              <Play className="size-4" /> Jogar agora
            </span>
          </div>
        </Link>

        {/* Monte o Código */}
        <h2 className="mb-4 text-xl font-black text-white">Monte o Código</h2>
        <Link
          href={`/estudante/jogos/${proximaFase.slug}`}
          className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-orbit-purple/[.14] via-white/[.035] to-orbit-electric/[.12] p-4 transition hover:from-orbit-purple/[.2] hover:to-orbit-electric/[.18] sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orbit-purple/20 text-orbit-purple">
              <Puzzle className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-orbit-purple">
                {concluidas === 0 ? "Comece por aqui" : concluidas === fasesMonteCodigo.length ? "Jogo zerado — jogue de novo" : "Continue jogando"}
              </p>
              <h2 className="mt-1 truncate text-base font-black text-white">{proximaFase.titulo}</h2>
              <p className="mt-1 text-xs text-white/45">
                {proximaFase.linguagem} · {proximaFase.dificuldade} · {proximaFase.linhas.length} blocos
              </p>
            </div>
          </div>
          <span className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-black">
            Jogar agora
            <ArrowRight className="size-3.5" />
          </span>
        </Link>

        {/* Progresso geral */}
        <div className="mb-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white/70">Progresso no Monte o Código</span>
            <span className="text-white/40">{concluidas}/{fasesMonteCodigo.length} · {percent}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orbit-purple to-orbit-electric transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Grid de fases */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {fasesMonteCodigo.map((fase, index) => {
            const done = progresso[fase.slug]?.concluido ?? false;
            const tentativas = progresso[fase.slug]?.tentativas ?? 0;
            return (
              <Link
                key={fase.slug}
                href={`/estudante/jogos/${fase.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] p-5 transition duration-300 hover:-translate-y-1 hover:border-orbit-purple/40 hover:shadow-[0_18px_55px_rgba(139,92,246,.12)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-white/[0.05] font-mono text-sm font-black text-white/50">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/65">
                      {fase.linguagem}
                    </span>
                    {done ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-300">
                        <CheckCircle2 className="size-3.5" /> Feito
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-orbit-electric">
                        <Sparkles className="size-3.5" /> Novo
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-black text-white group-hover:text-orbit-purple">{fase.titulo}</h3>
                <p className="mt-2 min-h-10 text-sm leading-5 text-white/45">{fase.descricao}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/[.06] pt-3">
                  <span className="flex items-center gap-1.5 text-xs text-white/40">
                    <Zap className="size-3.5" />
                    {fase.linhas.length} blocos · {fase.dificuldade}
                  </span>
                  {done && tentativas > 0 ? (
                    <span className="text-[10px] text-white/30">{tentativas === 1 ? "de primeira!" : `${tentativas} tentativas`}</span>
                  ) : (
                    <Play className="size-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-orbit-purple" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Ponte para o laboratório */}
        <section className="mt-9 rounded-3xl border border-orbit-electric/15 bg-orbit-electric/[.045] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-orbit-electric">Próximo nível</p>
              <h2 className="mt-2 text-xl font-black text-white">Pronto para digitar o código de verdade?</h2>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-white/45">
                Quando a ordem das linhas fizer sentido, o laboratório é o passo seguinte: escrever e executar seu próprio código com a IDE.
              </p>
            </div>
            <Link
              href="/estudante/pratica"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-black transition hover:bg-orbit-electric"
            >
              Ir para o laboratório
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
