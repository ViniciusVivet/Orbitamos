"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Gamepad2,
  Lightbulb,
  Play,
  RotateCcw,
  Shuffle,
  Trophy,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fasesMonteCodigo,
  getFaseMonteCodigo,
  getProximaFase,
  lerProgressoFase,
  salvarProgressoFase,
} from "@/lib/jogoMonteCodigo";

function shuffle(ids: number[]): number[] {
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  // Embaralhar não pode entregar a resposta pronta
  if (result.length > 2 && result.every((id, index) => id === index)) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
}

export default function MonteCodigoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const fase = getFaseMonteCodigo(slug);
  const proxima = getProximaFase(slug);
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : undefined;

  const [pool, setPool] = useState<number[]>([]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);
  const [showDica, setShowDica] = useState(false);

  const resetBoard = useCallback(() => {
    if (!fase) return;
    setPool(shuffle(fase.linhas.map((_, index) => index)));
    setPlaced([]);
    setChecked(false);
    setWon(false);
    setShowDica(false);
  }, [fase]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      resetBoard();
      setAttempts(0);
    });
    return () => {
      active = false;
    };
  }, [resetBoard]);

  const place = (id: number) => {
    setPool((current) => current.filter((item) => item !== id));
    setPlaced((current) => [...current, id]);
    setChecked(false);
  };

  const removePlaced = (id: number) => {
    setPlaced((current) => current.filter((item) => item !== id));
    setPool((current) => [...current, id]);
    setChecked(false);
  };

  const move = (id: number, direction: -1 | 1) => {
    setPlaced((current) => {
      const index = current.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setChecked(false);
  };

  const verificar = () => {
    if (!fase || pool.length > 0) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    const acertou = placed.every((id, index) => id === index);
    if (acertou) {
      setWon(true);
      const anterior = lerProgressoFase(userId, fase.slug);
      salvarProgressoFase(userId, fase.slug, {
        concluido: true,
        tentativas: anterior.concluido ? anterior.tentativas : nextAttempts,
      });
    } else {
      setChecked(true);
    }
  };

  if (!fase) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <Gamepad2 className="mx-auto size-10 text-white/25" />
          <p className="mt-3 text-white/60">Fase não encontrada.</p>
          <Link href="/estudante/jogos" className="mt-3 inline-flex text-sm font-bold text-orbit-electric">
            Voltar para os jogos
          </Link>
        </div>
      </div>
    );
  }

  const faseIndex = fasesMonteCodigo.findIndex((item) => item.slug === fase.slug);

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link
          href="/estudante/jogos"
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          aria-label="Voltar para os jogos"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-orbit-electric/70">
            Monte o Código · Fase {faseIndex + 1} de {fasesMonteCodigo.length}
          </p>
          <h1 className="mt-0.5 truncate text-lg font-black text-white sm:text-xl">{fase.titulo}</h1>
        </div>
        <span className="shrink-0 rounded-full bg-orbit-electric/15 px-2.5 py-1 text-[10px] font-bold uppercase text-orbit-electric">
          {fase.linguagem}
        </span>
      </div>

      {/* Objetivo */}
      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/35">Missão</p>
        <p className="mt-2 text-sm leading-6 text-white/75">{fase.descricao}</p>
        <div className="mt-3 rounded-xl bg-black/45 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">Saída esperada</p>
          <pre className="mt-1.5 whitespace-pre-wrap font-mono text-xs leading-5 text-emerald-300/90">{fase.saidaEsperada}</pre>
        </div>
      </section>

      {won ? (
        /* ── Vitória ── */
        <section className="mt-5 overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/[.09] via-white/[0.02] to-orbit-electric/[.08] p-5 text-center sm:p-7">
          <Trophy className="mx-auto size-10 text-amber-300" />
          <h2 className="mt-3 text-xl font-black text-white">Código montado!</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
            {attempts === 1 ? "De primeira!" : `Em ${attempts} tentativas`}
          </p>
          <div className="mx-auto mt-4 max-w-lg rounded-xl bg-black/40 p-3 text-left">
            {fase.linhas.map((linha, index) => (
              <pre key={index} className="whitespace-pre font-mono text-xs leading-6 text-emerald-200/90">
                <span className="mr-3 inline-block w-4 text-right text-white/25">{index + 1}</span>
                {linha}
              </pre>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/60">{fase.explicacao}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {proxima ? (
              <Link
                href={`/estudante/jogos/${proxima.slug}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-5 text-sm font-black text-black transition hover:opacity-90"
              >
                Próxima fase: {proxima.titulo}
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link
                href="/estudante/jogos"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-5 text-sm font-black text-black transition hover:opacity-90"
              >
                Você zerou o jogo! Ver todas as fases
                <Trophy className="size-4" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                resetBoard();
                setAttempts(0);
              }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <RotateCcw className="size-4" />
              Jogar de novo
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* ── Seu programa ── */}
          <section className="mt-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-black text-white">Seu programa</h2>
              {attempts > 0 && <span className="text-[10px] text-white/35">{attempts} tentativa{attempts === 1 ? "" : "s"}</span>}
            </div>
            <div
              className={`mt-2 rounded-2xl border p-2 ${
                placed.length === 0 ? "border-dashed border-white/15 bg-white/[0.02]" : "border-white/10 bg-[#0d1117]"
              }`}
            >
              {placed.length === 0 && (
                <p className="px-3 py-6 text-center text-xs text-white/30">
                  Toque nos blocos abaixo para montar o programa, linha por linha.
                </p>
              )}
              {placed.map((id, index) => {
                const status = checked ? (id === index ? "certa" : "errada") : "neutra";
                return (
                  <div
                    key={id}
                    className={`mb-1.5 flex items-center gap-1.5 rounded-xl border px-2 py-1.5 last:mb-0 ${
                      status === "certa"
                        ? "border-emerald-400/40 bg-emerald-400/[.07]"
                        : status === "errada"
                          ? "border-red-400/40 bg-red-400/[.06]"
                          : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <span className="w-5 shrink-0 text-center font-mono text-[10px] text-white/30">{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePlaced(id)}
                      className="min-w-0 flex-1 overflow-x-auto text-left touch-manipulation"
                      aria-label={`Remover linha ${index + 1}`}
                    >
                      <pre className="whitespace-pre font-mono text-xs leading-6 text-slate-100">{fase.linhas[id]}</pre>
                    </button>
                    <div className="flex shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => move(id, -1)}
                        disabled={index === 0}
                        aria-label="Mover para cima"
                        className="grid size-8 place-items-center rounded-lg text-white/35 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-20 touch-manipulation"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(id, 1)}
                        disabled={index === placed.length - 1}
                        aria-label="Mover para baixo"
                        className="grid size-8 place-items-center rounded-lg text-white/35 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-20 touch-manipulation"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePlaced(id)}
                        aria-label="Devolver bloco"
                        className="grid size-8 place-items-center rounded-lg text-white/35 transition hover:bg-red-400/10 hover:text-red-300 touch-manipulation"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {checked && (
              <p className="mt-2 rounded-xl border border-amber-400/20 bg-amber-400/[.06] px-3 py-2 text-xs leading-5 text-amber-200">
                As linhas em vermelho estão na posição errada. Toque no ✕ para devolver um bloco ou use as setas para reordenar.
              </p>
            )}
          </section>

          {/* ── Blocos disponíveis ── */}
          <section className="mt-5">
            <h2 className="text-sm font-black text-white">Blocos disponíveis</h2>
            <div className="mt-2 space-y-1.5">
              {pool.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-3 py-4 text-center text-xs text-white/30">
                  Todos os blocos posicionados. Hora de verificar!
                </p>
              ) : (
                pool.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => place(id)}
                    className="block w-full overflow-x-auto rounded-xl border border-white/10 bg-[#0d1117] px-3 py-2.5 text-left transition hover:border-orbit-electric/40 hover:bg-orbit-electric/[.05] touch-manipulation"
                  >
                    <pre className="whitespace-pre font-mono text-xs leading-6 text-slate-100">{fase.linhas[id]}</pre>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* ── Ações ── */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={verificar}
              disabled={pool.length > 0}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/90 px-5 text-sm font-black text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="size-4" />
              Verificar programa
            </button>
            <button
              type="button"
              onClick={() => setShowDica((value) => !value)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 text-sm font-bold text-amber-300 transition hover:bg-amber-500/10"
            >
              <Lightbulb className="size-4" />
              {showDica ? "Esconder dica" : "Dica"}
            </button>
            <button
              type="button"
              onClick={resetBoard}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Shuffle className="size-4" />
              Embaralhar
            </button>
          </div>

          {showDica && (
            <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[.07] px-4 py-3 text-xs leading-5 text-amber-200">
              <Lightbulb className="mr-1.5 inline size-3.5" />
              {fase.dica}
            </div>
          )}

          {placed.length > 0 && placed.length === fase.linhas.length && !checked && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-white/35">
              <Check className="size-3.5 text-emerald-400" />
              Programa completo — confira a ordem e toque em Verificar.
            </p>
          )}
        </>
      )}
    </div>
  );
}
