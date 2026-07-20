"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Eraser,
  Lightbulb,
  Play,
  RotateCcw,
  RotateCw,
  Star,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  calcularEstrelas,
  executarPrograma,
  getNivelGuiaOrbi,
  getProximoNivel,
  lerProgressoNivel,
  niveisGuiaOrbi,
  salvarProgressoNivel,
  type NivelGuiaOrbi,
  type OrbiCmd,
  type OrbiFrame,
  type OrbiResultado,
  type OrbiTrack,
} from "@/lib/jogoGuiaOrbi";

const STEP_MS = 420;

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const BOARD_STARS = (() => {
  const rng = seededRng(7);
  return Array.from({ length: 42 }, (_, index) => ({
    left: `${(rng() * 100).toFixed(1)}%`,
    top: `${(rng() * 100).toFixed(1)}%`,
    size: rng() * 2 + 1,
    delay: `${(index % 7) * 0.45}s`,
  }));
})();

const CMD_META: Record<OrbiCmd, { label: string; icon: typeof ArrowUp | null }> = {
  avancar: { label: "Avançar", icon: ArrowUp },
  esquerda: { label: "Girar à esquerda", icon: RotateCcw },
  direita: { label: "Girar à direita", icon: RotateCw },
  funcao: { label: "Chamar F", icon: null },
};

function CmdIcon({ cmd, className }: { cmd: OrbiCmd; className?: string }) {
  const Icon = CMD_META[cmd].icon;
  if (Icon) return <Icon className={className} />;
  return <span className="font-mono text-xs font-black">F</span>;
}

function cellCenter(value: number, count: number) {
  return `${(((value + 0.5) / count) * 100).toFixed(2)}%`;
}

type ViewState = {
  x: number;
  y: number;
  dir: number;
  rot: number;
  crashed: boolean;
  arrived: boolean;
};

export default function GuiaOrbiPage() {
  const params = useParams();
  const slugNivel = params.nivel as string;
  const nivel = getNivelGuiaOrbi(slugNivel);
  const proximo = getProximoNivel(slugNivel);
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : undefined;

  const [principal, setPrincipal] = useState<OrbiCmd[]>([]);
  const [funcao, setFuncao] = useState<OrbiCmd[]>([]);
  const [activeTrack, setActiveTrack] = useState<OrbiTrack>("principal");
  const [running, setRunning] = useState(false);
  const [activeChip, setActiveChip] = useState<{ track: OrbiTrack; index: number } | null>(null);
  const [view, setView] = useState<ViewState | null>(null);
  const [resultado, setResultado] = useState<OrbiResultado | null>(null);
  const [estrelas, setEstrelas] = useState<0 | 1 | 2 | 3>(0);
  const [tentativas, setTentativas] = useState(0);
  const [showDica, setShowDica] = useState(false);

  const timeoutsRef = useRef<number[]>([]);
  const prevDirRef = useRef(0);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const resetView = useCallback((alvo: NivelGuiaOrbi) => {
    prevDirRef.current = alvo.inicio.dir;
    setView({ x: alvo.inicio.x, y: alvo.inicio.y, dir: alvo.inicio.dir, rot: alvo.inicio.dir * 90, crashed: false, arrived: false });
  }, []);

  useEffect(() => {
    if (!nivel) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setPrincipal([]);
      setFuncao([]);
      setActiveTrack("principal");
      setResultado(null);
      setEstrelas(0);
      setTentativas(0);
      setShowDica(false);
      setActiveChip(null);
      resetView(nivel);
    });
    return () => {
      active = false;
      clearTimeouts();
    };
  }, [nivel, resetView, clearTimeouts]);

  const schedule = (delay: number, fn: () => void) => {
    timeoutsRef.current.push(window.setTimeout(fn, delay));
  };

  const addCmd = (cmd: OrbiCmd) => {
    if (!nivel || running) return;
    if (activeTrack === "principal") {
      if (principal.length >= nivel.slotsPrincipal) return;
      setPrincipal((current) => [...current, cmd]);
    } else {
      if (funcao.length >= (nivel.slotsFuncao ?? 0)) return;
      setFuncao((current) => [...current, cmd]);
    }
    setResultado(null);
  };

  const removeCmd = (track: OrbiTrack, index: number) => {
    if (running) return;
    if (track === "principal") setPrincipal((current) => current.filter((_, i) => i !== index));
    else setFuncao((current) => current.filter((_, i) => i !== index));
    setResultado(null);
  };

  const limpar = () => {
    if (running || !nivel) return;
    setPrincipal([]);
    setFuncao([]);
    setResultado(null);
    resetView(nivel);
  };

  const aplicarFrame = (frame: OrbiFrame) => {
    const diff = (frame.dir - prevDirRef.current + 4) % 4;
    const delta = diff === 1 ? 90 : diff === 3 ? -90 : diff === 2 ? 180 : 0;
    prevDirRef.current = frame.dir;
    setActiveChip(frame.track && frame.index !== null ? { track: frame.track, index: frame.index } : null);
    setView((current) =>
      current
        ? {
            x: frame.x,
            y: frame.y,
            dir: frame.dir,
            rot: current.rot + delta,
            crashed: frame.evento === "crash",
            arrived: frame.evento === "portal",
          }
        : current
    );
  };

  const executar = () => {
    if (!nivel || running || principal.length === 0) return;
    clearTimeouts();
    setResultado(null);
    setShowDica(false);
    resetView(nivel);
    setRunning(true);
    const proximaTentativa = tentativas + 1;
    setTentativas(proximaTentativa);

    const { frames, resultado: fim } = executarPrograma(nivel, principal, funcao);
    frames.forEach((frame, index) => {
      schedule((index + 1) * STEP_MS, () => aplicarFrame(frame));
    });
    schedule((frames.length + 1) * STEP_MS, () => {
      setRunning(false);
      setActiveChip(null);
      setResultado(fim);
      if (fim === "portal") {
        const usados = principal.length + funcao.length;
        const novas = calcularEstrelas(nivel, usados);
        setEstrelas(novas);
        const anterior = lerProgressoNivel(userId, nivel.slug);
        salvarProgressoNivel(userId, nivel.slug, {
          concluido: true,
          estrelas: Math.max(anterior.estrelas, novas) as 0 | 1 | 2 | 3,
          tentativas: anterior.concluido ? anterior.tentativas : proximaTentativa,
        });
      }
    });
  };

  if (!nivel) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <p className="text-white/60">Nível não encontrado.</p>
          <Link href="/estudante/jogos/orbi" className="mt-3 inline-flex text-sm font-bold text-orbit-electric">
            Voltar para o mapa
          </Link>
        </div>
      </div>
    );
  }

  const nivelIndex = niveisGuiaOrbi.findIndex((item) => item.slug === nivel.slug);
  const comandosUsados = principal.length + funcao.length;
  const paleta: OrbiCmd[] = nivel.slotsFuncao
    ? ["avancar", "esquerda", "direita", "funcao"]
    : ["avancar", "esquerda", "direita"];

  const crashTarget = view?.crashed
    ? {
        x: view.x + (view.dir === 1 ? 0.7 : view.dir === 3 ? -0.7 : 0),
        y: view.y + (view.dir === 2 ? 0.7 : view.dir === 0 ? -0.7 : 0),
      }
    : null;

  const renderTrack = (track: OrbiTrack, cmds: OrbiCmd[], slots: number) => (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setActiveTrack(track)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") setActiveTrack(track);
      }}
      className={`rounded-2xl border p-3 transition ${
        activeTrack === track
          ? track === "principal"
            ? "border-orbit-electric/50 bg-orbit-electric/[.05]"
            : "border-orbit-purple/50 bg-orbit-purple/[.07]"
          : "border-white/10 bg-white/[0.02] hover:border-white/25"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`text-[10px] font-bold uppercase tracking-[.16em] ${track === "principal" ? "text-orbit-electric" : "text-orbit-purple"}`}>
          {track === "principal" ? "Programa principal" : "Função F"}
        </p>
        <span className="text-[10px] text-white/30">{cmds.length}/{slots}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {Array.from({ length: slots }, (_, index) => {
          const cmd = cmds[index];
          const isActive = activeChip?.track === track && activeChip.index === index;
          if (!cmd) {
            return (
              <span
                key={index}
                className="grid size-10 place-items-center rounded-xl border border-dashed border-white/15 text-[10px] text-white/20"
              >
                {index + 1}
              </span>
            );
          }
          return (
            <button
              key={index}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                removeCmd(track, index);
              }}
              aria-label={`Remover ${CMD_META[cmd].label}`}
              className={`grid size-10 place-items-center rounded-xl border transition touch-manipulation ${
                isActive
                  ? "scale-110 border-amber-300 bg-amber-300/20 text-amber-200 shadow-[0_0_18px_rgba(252,211,77,.35)]"
                  : cmd === "funcao"
                    ? "border-orbit-purple/40 bg-orbit-purple/15 text-orbit-purple hover:border-red-400/50"
                    : "border-white/15 bg-white/[0.06] text-white/80 hover:border-red-400/50"
              }`}
            >
              <CmdIcon cmd={cmd} className="size-4" />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link
          href="/estudante/jogos/orbi"
          className="grid size-10 shrink-0 place-items-center rounded-xl text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          aria-label="Voltar para o mapa de níveis"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-orbit-purple/80">
            Guia o Orbi · Nível {nivelIndex + 1} de {niveisGuiaOrbi.length}
          </p>
          <h1 className="mt-0.5 truncate text-lg font-black text-white sm:text-xl">{nivel.titulo}</h1>
        </div>
        {tentativas > 0 && (
          <span className="shrink-0 text-[10px] text-white/35">{tentativas} tentativa{tentativas === 1 ? "" : "s"}</span>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-white/60">{nivel.descricao}</p>

      {/* ── Tabuleiro ── */}
      <div className="relative mx-auto mt-5 w-full max-w-[420px]">
        <div
          className="relative aspect-square overflow-hidden rounded-3xl border border-white/15 shadow-[0_30px_80px_rgba(0,0,0,.5),inset_0_0_60px_rgba(0,212,255,.04)]"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(139,92,246,.16), transparent 55%), radial-gradient(ellipse 70% 60% at 85% 80%, rgba(0,212,255,.12), transparent 55%), #05070d",
          }}
        >
          {/* Starfield */}
          {BOARD_STARS.map((star, index) => (
            <span
              key={index}
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full bg-white"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animation: `orbi-game-twinkle 3.2s ease-in-out infinite`,
                animationDelay: star.delay,
              }}
            />
          ))}

          {/* Grade */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
              backgroundSize: `${100 / nivel.cols}% ${100 / nivel.rows}%`,
            }}
          />

          {/* Asteroides */}
          {nivel.asteroides.map((asteroide) => (
            <span
              key={`${asteroide.x}-${asteroide.y}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[7.5vw] drop-shadow-[0_0_12px_rgba(255,120,50,.25)] sm:text-3xl"
              style={{
                left: cellCenter(asteroide.x, nivel.cols),
                top: cellCenter(asteroide.y, nivel.rows),
                animation: "orbi-game-hover 4s ease-in-out infinite",
                animationDelay: `${(asteroide.x + asteroide.y) * 0.3}s`,
              }}
            >
              ☄️
            </span>
          ))}

          {/* Portal */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: cellCenter(nivel.portal.x, nivel.cols), top: cellCenter(nivel.portal.y, nivel.rows) }}
          >
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orbit-electric/70"
              style={{ animation: "orbi-game-portal 1.8s ease-out infinite" }}
            />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orbit-purple/70"
              style={{ animation: "orbi-game-portal 1.8s ease-out infinite", animationDelay: "0.9s" }}
            />
            <span
              className="relative block text-[7.5vw] drop-shadow-[0_0_18px_rgba(0,212,255,.5)] sm:text-3xl"
              style={{ animation: "orbi-game-hover 3s ease-in-out infinite" }}
            >
              🪐
            </span>
          </div>

          {/* Explosão */}
          {crashTarget && (
            <span
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl"
              style={{
                left: cellCenter(crashTarget.x, nivel.cols),
                top: cellCenter(crashTarget.y, nivel.rows),
                animation: "orbi-game-pop 0.4s ease-out both",
              }}
            >
              💥
            </span>
          )}

          {/* Orbi */}
          {view && (
            <div
              className="absolute z-10 w-[16%]"
              style={{
                left: cellCenter(view.x, nivel.cols),
                top: cellCenter(view.y, nivel.rows),
                transform: `translate(-50%, -50%) rotate(${view.rot}deg)`,
                transition: `left ${STEP_MS - 60}ms ease-in-out, top ${STEP_MS - 60}ms ease-in-out, transform ${STEP_MS - 60}ms ease-in-out`,
                filter: view.arrived
                  ? "drop-shadow(0 0 22px rgba(0,212,255,.9))"
                  : "drop-shadow(0 0 10px rgba(0,212,255,.35))",
              }}
            >
              <span
                aria-hidden="true"
                className="absolute -top-2 left-1/2 -translate-x-1/2 border-x-[6px] border-b-[8px] border-x-transparent border-b-orbit-electric/90"
              />
              <img
                src={view.crashed ? "/orbi-lost.png" : "/orbi-tech.png"}
                alt="Orbi, o mascote"
                className="w-full"
                style={view.crashed ? { animation: "orbi-game-shake 0.5s ease-in-out 2" } : undefined}
              />
            </div>
          )}

          {/* Overlay de vitória */}
          {resultado === "portal" && (
            <div className="absolute inset-0 z-30 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-xs rounded-2xl border border-orbit-electric/30 bg-[#080b14]/95 p-5 text-center" style={{ animation: "orbi-game-pop 0.45s ease-out both" }}>
                <Trophy className="mx-auto size-9 text-amber-300" />
                <h2 className="mt-2 text-lg font-black text-white">Portal alcançado!</h2>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={`size-6 ${star <= estrelas ? "fill-amber-300 text-amber-300" : "text-white/20"}`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/35">
                  {comandosUsados} comandos · 3 estrelas com até {nivel.par}
                </p>
                <p className="mt-3 text-xs leading-5 text-white/60">{nivel.explicacao}</p>
                <div className="mt-4 flex flex-col gap-2">
                  {proximo ? (
                    <Link
                      href={`/estudante/jogos/orbi/${proximo.slug}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 text-xs font-black text-black"
                    >
                      Próximo nível: {proximo.titulo}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/estudante/jogos/orbi"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 text-xs font-black text-black"
                    >
                      Você zerou o Guia o Orbi!
                      <Trophy className="size-3.5" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setResultado(null);
                      resetView(nivel);
                    }}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-xs font-bold text-white"
                  >
                    <RotateCcw className="size-3.5" />
                    Tentar com menos comandos
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mensagens de falha */}
      {resultado && resultado !== "portal" && (
        <div className="mt-3 rounded-xl border border-red-400/25 bg-red-400/[.07] px-4 py-3 text-xs leading-5 text-red-200" role="status">
          {resultado === "crash" && "💥 O Orbi bateu! Reveja a sequência: em que passo ele saiu da rota?"}
          {resultado === "perdido" && "🛰️ O programa terminou, mas o Orbi não chegou ao portal. Faltou algum comando?"}
          {resultado === "limite" && "♾️ Passos demais! Parece um loop sem fim — garanta que o caminho leva ao portal."}
        </div>
      )}

      {/* ── Programa ── */}
      <div className="mt-5 space-y-3">
        {renderTrack("principal", principal, nivel.slotsPrincipal)}
        {nivel.slotsFuncao ? renderTrack("funcao", funcao, nivel.slotsFuncao) : null}
        {nivel.slotsFuncao ? (
          <p className="text-[10px] leading-4 text-white/30">
            Toque em uma trilha para escolher onde os próximos comandos entram. Toque em um comando para removê-lo.
          </p>
        ) : (
          <p className="text-[10px] leading-4 text-white/30">Toque em um comando posicionado para removê-lo.</p>
        )}
      </div>

      {/* ── Paleta ── */}
      <div className={`mt-4 grid gap-2 ${paleta.length === 4 ? "grid-cols-4" : "grid-cols-3"} ${running ? "pointer-events-none opacity-40" : ""}`}>
        {paleta.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => addCmd(cmd)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border transition touch-manipulation ${
              cmd === "funcao"
                ? "border-orbit-purple/40 bg-orbit-purple/10 text-orbit-purple hover:bg-orbit-purple/20"
                : "border-white/12 bg-white/[0.05] text-white/80 hover:border-orbit-electric/40 hover:bg-orbit-electric/[.08]"
            }`}
          >
            <CmdIcon cmd={cmd} className="size-5" />
            <span className="text-[9px] font-bold uppercase tracking-wide">{CMD_META[cmd].label}</span>
          </button>
        ))}
      </div>

      {/* ── Ações ── */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={executar}
          disabled={running || principal.length === 0}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/90 px-5 text-sm font-black text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play className="size-4" />
          {running ? "Orbi em voo..." : "Executar programa"}
        </button>
        <button
          type="button"
          onClick={() => setShowDica((value) => !value)}
          disabled={running}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 text-sm font-bold text-amber-300 transition hover:bg-amber-500/10 disabled:opacity-40"
        >
          <Lightbulb className="size-4" />
          {showDica ? "Esconder dica" : "Dica"}
        </button>
        <button
          type="button"
          onClick={limpar}
          disabled={running || comandosUsados === 0}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <Eraser className="size-4" />
          Limpar
        </button>
      </div>

      {showDica && (
        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[.07] px-4 py-3 text-xs leading-5 text-amber-200">
          <Lightbulb className="mr-1.5 inline size-3.5" />
          {nivel.dica}
        </div>
      )}
    </div>
  );
}
