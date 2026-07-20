"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Play, Rocket, Star, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  lerProgressoNivel,
  niveisGuiaOrbi,
  type NivelGuiaOrbi,
  type NivelProgresso,
} from "@/lib/jogoGuiaOrbi";

function MiniMapa({ nivel }: { nivel: NivelGuiaOrbi }) {
  const cells = Array.from({ length: nivel.rows * nivel.cols }, (_, index) => {
    const x = index % nivel.cols;
    const y = Math.floor(index / nivel.cols);
    if (nivel.portal.x === x && nivel.portal.y === y) return "portal";
    if (nivel.inicio.x === x && nivel.inicio.y === y) return "inicio";
    if (nivel.asteroides.some((a) => a.x === x && a.y === y)) return "asteroide";
    return "vazio";
  });
  return (
    <div
      aria-hidden="true"
      className="grid gap-[3px] rounded-xl bg-black/40 p-2"
      style={{ gridTemplateColumns: `repeat(${nivel.cols}, minmax(0, 1fr))` }}
    >
      {cells.map((cell, index) => (
        <span
          key={index}
          className={`aspect-square rounded-[3px] ${
            cell === "portal"
              ? "bg-orbit-electric shadow-[0_0_6px_rgba(0,212,255,.8)]"
              : cell === "inicio"
                ? "bg-orbit-purple shadow-[0_0_6px_rgba(139,92,246,.8)]"
                : cell === "asteroide"
                  ? "bg-orange-400/60"
                  : "bg-white/[0.05]"
          }`}
        />
      ))}
    </div>
  );
}

export default function GuiaOrbiMapa() {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : undefined;
  const [progresso, setProgresso] = useState<Record<string, NivelProgresso>>({});

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const next: Record<string, NivelProgresso> = {};
      niveisGuiaOrbi.forEach((nivel) => {
        next[nivel.slug] = lerProgressoNivel(userId, nivel.slug);
      });
      setProgresso(next);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const concluidos = niveisGuiaOrbi.filter((nivel) => progresso[nivel.slug]?.concluido).length;
  const totalEstrelas = niveisGuiaOrbi.reduce((soma, nivel) => soma + (progresso[nivel.slug]?.estrelas ?? 0), 0);
  const proximoNivel = niveisGuiaOrbi.find((nivel) => !progresso[nivel.slug]?.concluido) ?? niveisGuiaOrbi[0];

  return (
    <div className="-mx-4 -mt-4 min-h-screen pb-14 sm:-mt-6 lg:-mx-6 lg:-mt-8">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-10 pt-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 -z-20 bg-[#03050a]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_95%_at_80%_0%,rgba(0,212,255,.2),transparent_60%),radial-gradient(ellipse_55%_80%_at_10%_70%,rgba(139,92,246,.22),transparent_68%)]" />
        <div className="mx-auto max-w-7xl">
          <Link href="/estudante/jogos" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/45 transition hover:text-white">
            <ArrowLeft className="size-3.5" /> Todos os jogos
          </Link>
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src="/orbi-tech.png"
              alt="Orbi, o mascote da Orbitamos"
              className="w-28 shrink-0 sm:w-36"
              style={{ animation: "orbi-game-hover 3.5s ease-in-out infinite" }}
            />
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">
                <Rocket className="size-4" /> Guia o Orbi
              </div>
              <h1 className="mt-2 max-w-3xl text-2xl font-black tracking-tight text-white sm:text-4xl">
                Programe o voo do Orbi{" "}
                <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
                  comando por comando.
                </span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                Monte a sequência, aperte play e veja o mascote atravessar o campo de asteroides até o portal.
                Dos primeiros passos até funções e recursão — sem escrever uma linha de código.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-white/55">
                  <strong className="text-white">{concluidos}</strong>/{niveisGuiaOrbi.length} níveis
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/[.07] px-4 py-2 text-xs text-amber-200">
                  <Star className="size-3.5 fill-amber-300 text-amber-300" />
                  <strong>{totalEstrelas}</strong>/{niveisGuiaOrbi.length * 3} estrelas
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 lg:px-10">
        {/* Continue */}
        <Link
          href={`/estudante/jogos/orbi/${proximoNivel.slug}`}
          className="mb-7 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-orbit-electric/[.13] via-white/[.035] to-orbit-purple/[.13] p-4 transition hover:from-orbit-electric/[.18] hover:to-orbit-purple/[.18] sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-orbit-electric">
              {concluidos === 0 ? "Comece a missão" : concluidos === niveisGuiaOrbi.length ? "Jogo zerado — cace as 3 estrelas" : "Continue a missão"}
            </p>
            <h2 className="mt-1 truncate text-base font-black text-white">{proximoNivel.titulo}</h2>
            <p className="mt-1 text-xs text-white/45">{proximoNivel.descricao}</p>
          </div>
          <span className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-black">
            <Play className="size-3.5" /> Jogar
          </span>
        </Link>

        {/* Grid de níveis */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {niveisGuiaOrbi.map((nivel, index) => {
            const dados = progresso[nivel.slug];
            const done = dados?.concluido ?? false;
            return (
              <Link
                key={nivel.slug}
                href={`/estudante/jogos/orbi/${nivel.slug}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] p-4 transition duration-300 hover:-translate-y-1 hover:border-orbit-electric/40 hover:shadow-[0_18px_55px_rgba(0,212,255,.1)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-white/[0.05] font-mono text-xs font-black text-white/50">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`size-3.5 ${star <= (dados?.estrelas ?? 0) ? "fill-amber-300 text-amber-300" : "text-white/15"}`}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="mt-3 text-base font-black text-white group-hover:text-orbit-electric">{nivel.titulo}</h3>
                <div className="mt-3">
                  <MiniMapa nivel={nivel} />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className={`font-bold uppercase tracking-wide ${done ? "text-emerald-300" : nivel.slotsFuncao ? "text-orbit-purple" : "text-white/35"}`}>
                    {done ? "Concluído" : nivel.slotsFuncao ? "Usa Função F" : "Sequência"}
                  </span>
                  <ArrowRight className="size-3.5 text-white/25 transition group-hover:translate-x-1 group-hover:text-orbit-electric" />
                </div>
              </Link>
            );
          })}
        </div>

        {concluidos === niveisGuiaOrbi.length && (
          <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-400/[.06] p-6 text-center">
            <Trophy className="mx-auto size-8 text-amber-300" />
            <h2 className="mt-2 text-xl font-black text-white">Missão completa, comandante!</h2>
            <p className="mx-auto mt-1 max-w-xl text-sm text-white/50">
              Você guiou o Orbi por todos os campos de asteroides. Que tal caçar as 3 estrelas em cada nível — ou partir para escrever código de verdade no laboratório?
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
