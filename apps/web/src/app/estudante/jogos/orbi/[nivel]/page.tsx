"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Eraser,
  Gauge,
  Lightbulb,
  Play,
  Route,
  RotateCcw,
  RotateCw,
  Star,
  Trophy,
  Undo2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  calcularEstrelas,
  comandoDoFrameOrbi,
  executarPrograma,
  getNivelGuiaOrbi,
  getProximoNivel,
  lerProgressoNivel,
  niveisGuiaOrbi,
  rotuloFrameOrbi,
  salvarProgressoNivel,
  type NivelGuiaOrbi,
  type OrbiCmd,
  type OrbiFrame,
  type OrbiResultado,
  type OrbiTrack,
} from "@/lib/jogoGuiaOrbi";

const DEFAULT_STEP_MS = 420;

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

export function GuiaOrbiWorkspace({ previewUserId }: { previewUserId?: string }) {
  const params = useParams();
  const slugNivel = params.nivel as string;
  const nivel = getNivelGuiaOrbi(slugNivel);
  const proximo = getProximoNivel(slugNivel);
  const { user } = useAuth();
  const userId = previewUserId ?? (user?.id ? String(user.id) : undefined);

  const [principal, setPrincipal] = useState<OrbiCmd[]>([]);
  const [funcao, setFuncao] = useState<OrbiCmd[]>([]);
  const [activeTrack, setActiveTrack] = useState<OrbiTrack>("principal");
  const [running, setRunning] = useState(false);
  const [activeChip, setActiveChip] = useState<{ track: OrbiTrack; index: number } | null>(null);
  const [selectedChip, setSelectedChip] = useState<{ track: OrbiTrack; index: number } | null>(null);
  const [view, setView] = useState<ViewState | null>(null);
  const [resultado, setResultado] = useState<OrbiResultado | null>(null);
  const [estrelas, setEstrelas] = useState<0 | 1 | 2 | 3>(0);
  const [tentativas, setTentativas] = useState(0);
  const [showDica, setShowDica] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [stepMs, setStepMs] = useState(DEFAULT_STEP_MS);
  const [manualFrames, setManualFrames] = useState<OrbiFrame[]>([]);
  const [manualCursor, setManualCursor] = useState(0);
  const [manualAttempt, setManualAttempt] = useState(0);

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
      setShowRoute(false);
      setActiveChip(null);
      setSelectedChip(null);
      setManualFrames([]);
      setManualCursor(0);
      setManualAttempt(0);
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

  const invalidateExecution = () => {
    if (!nivel) return;
    setResultado(null);
    setActiveChip(null);
    setManualFrames([]);
    setManualCursor(0);
    setManualAttempt(0);
    resetView(nivel);
  };

  const addCmd = (cmd: OrbiCmd) => {
    if (!nivel || running) return;
    if (activeTrack === "principal") {
      if (principal.length >= nivel.slotsPrincipal) return;
      const insertAt = selectedChip?.track === "principal" ? selectedChip.index + 1 : principal.length;
      const next = [...principal];
      next.splice(insertAt, 0, cmd);
      setPrincipal(next);
      setSelectedChip({ track: "principal", index: insertAt });
    } else {
      if (funcao.length >= (nivel.slotsFuncao ?? 0)) return;
      const insertAt = selectedChip?.track === "funcao" ? selectedChip.index + 1 : funcao.length;
      const next = [...funcao];
      next.splice(insertAt, 0, cmd);
      setFuncao(next);
      setSelectedChip({ track: "funcao", index: insertAt });
    }
    invalidateExecution();
  };

  const removeCmd = (track: OrbiTrack, index: number) => {
    if (running) return;
    if (track === "principal") setPrincipal((current) => current.filter((_, i) => i !== index));
    else setFuncao((current) => current.filter((_, i) => i !== index));
    setSelectedChip(null);
    invalidateExecution();
  };

  const moveCmd = (track: OrbiTrack, index: number, direction: -1 | 1) => {
    if (running) return;
    const commands = track === "principal" ? principal : funcao;
    const target = index + direction;
    if (target < 0 || target >= commands.length) return;
    const next = [...commands];
    [next[index], next[target]] = [next[target], next[index]];
    if (track === "principal") setPrincipal(next);
    else setFuncao(next);
    setSelectedChip({ track, index: target });
    invalidateExecution();
  };

  const limpar = () => {
    if (running || !nivel) return;
    setPrincipal([]);
    setFuncao([]);
    setSelectedChip(null);
    invalidateExecution();
  };

  const desfazer = () => {
    if (running) return;
    if (activeTrack === "principal") setPrincipal((current) => current.slice(0, -1));
    else setFuncao((current) => current.slice(0, -1));
    setSelectedChip(null);
    invalidateExecution();
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

  const finalizarTentativa = (fim: OrbiResultado, tentativa: number) => {
    if (!nivel) return;
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
        tentativas: anterior.concluido ? anterior.tentativas : tentativa,
      });
    }
  };

  const executar = () => {
    if (!nivel || running || principal.length === 0) return;
    clearTimeouts();
    setResultado(null);
    setShowDica(false);
    setSelectedChip(null);
    setManualFrames([]);
    setManualCursor(0);
    setManualAttempt(0);
    resetView(nivel);
    setRunning(true);
    const proximaTentativa = tentativas + 1;
    setTentativas(proximaTentativa);

    const { frames, resultado: fim } = executarPrograma(nivel, principal, funcao);
    frames.forEach((frame, index) => {
      schedule((index + 1) * stepMs, () => aplicarFrame(frame));
    });
    schedule((frames.length + 1) * stepMs, () => finalizarTentativa(fim, proximaTentativa));
  };

  const executarPasso = () => {
    if (!nivel || running || principal.length === 0) return;
    let frames = manualFrames;
    let cursor = manualCursor;
    let tentativa = manualAttempt;
    if (frames.length === 0 || cursor >= frames.length) {
      const simulation = executarPrograma(nivel, principal, funcao);
      frames = simulation.frames.filter((frame) => frame.evento !== "inicio");
      cursor = 0;
      tentativa = tentativas + 1;
      setTentativas(tentativa);
      setManualFrames(frames);
      setManualAttempt(tentativa);
      setResultado(null);
      setShowDica(false);
      setShowRoute(true);
      setSelectedChip(null);
      resetView(nivel);
    }
    const frame = frames[cursor];
    if (!frame) return;
    aplicarFrame(frame);
    const nextCursor = cursor + 1;
    setManualCursor(nextCursor);
    if (nextCursor >= frames.length) {
      const fim = executarPrograma(nivel, principal, funcao).resultado;
      finalizarTentativa(fim, tentativa);
    }
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

  const simulation = principal.length > 0 ? executarPrograma(nivel, principal, funcao) : null;
  const routeFrames = simulation?.frames.filter((frame) => frame.evento === "passo" || frame.evento === "portal" || frame.evento === "crash").slice(0, 18) ?? [];
  const traceFrames = simulation?.frames.filter((frame) => frame.evento !== "inicio").slice(0, 24) ?? [];
  const lastSimulationFrame = simulation?.frames.at(-1);
  const failureCopy = resultado === "crash"
    ? `A rota quebrou no comando ${(lastSimulationFrame?.index ?? 0) + 1} da ${lastSimulationFrame?.track === "funcao" ? "Função F" : "trilha principal"}. Volte um passo e confira para onde o Orbi estava olhando.`
    : resultado === "perdido"
      ? "O programa terminou antes do portal. Compare o último ponto da rota com o destino e descubra qual movimento ainda falta."
      : resultado === "limite"
        ? "A Função F entrou em repetição sem alcançar o portal. O padrão precisa avançar em direção ao destino antes de chamar F novamente."
        : null;

  const renderTrack = (track: OrbiTrack, cmds: OrbiCmd[], slots: number) => (
    <div
      role="group"
      aria-label={track === "principal" ? "Programa principal" : "Função F"}
      className={`rounded-2xl border p-3 transition ${
        activeTrack === track
          ? track === "principal"
            ? "border-orbit-electric/50 bg-orbit-electric/[.05]"
            : "border-orbit-purple/50 bg-orbit-purple/[.07]"
          : "border-white/10 bg-white/[0.02] hover:border-white/25"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setActiveTrack(track)}
          aria-pressed={activeTrack === track}
          className={`min-h-8 rounded-lg px-2 text-left text-[10px] font-bold uppercase tracking-[.16em] transition hover:bg-white/[.06] ${track === "principal" ? "text-orbit-electric" : "text-orbit-purple"}`}
        >
          {track === "principal" ? "Programa principal" : "Função F"}
        </button>
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
              onClick={() => {
                setActiveTrack(track);
                setSelectedChip((current) => current?.track === track && current.index === index ? null : { track, index });
              }}
              aria-label={`Selecionar ${CMD_META[cmd].label}, posição ${index + 1}`}
              aria-pressed={selectedChip?.track === track && selectedChip.index === index}
              className={`grid size-10 place-items-center rounded-xl border transition touch-manipulation ${
                isActive
                  ? "scale-110 border-amber-300 bg-amber-300/20 text-amber-200 shadow-[0_0_18px_rgba(252,211,77,.35)]"
                  : selectedChip?.track === track && selectedChip.index === index
                    ? "border-orbit-electric bg-orbit-electric/15 text-orbit-electric ring-2 ring-orbit-electric/20"
                  : cmd === "funcao"
                    ? "border-orbit-purple/40 bg-orbit-purple/15 text-orbit-purple hover:border-orbit-electric/50"
                    : "border-white/15 bg-white/[0.06] text-white/80 hover:border-orbit-electric/50"
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
    <div className="mx-auto max-w-6xl pb-24 lg:pb-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[.055] via-[#080b13] to-orbit-purple/[.08] p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-orbit-electric/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
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
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] text-white/45">
              {tentativas || 0} tentativa{tentativas === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-amber-300/15 bg-amber-300/[.06] px-3 py-1.5 text-[10px] font-bold text-amber-200">
              <Gauge className="size-3" /> meta: {nivel.par} comandos
            </span>
          </div>
        </div>
        <div className="relative mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orbit-electric">Missão atual</p>
            <p className="mt-1 text-sm leading-6 text-white/70">{nivel.descricao}</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/40 sm:hidden">
            <span>{tentativas || 0} tentativa{tentativas === 1 ? "" : "s"}</span>
            <span>·</span>
            <span>3 estrelas em até {nivel.par}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,.88fr)] lg:items-start">
        <section aria-label="Simulador da rota" className="min-w-0">

      {/* ── Tabuleiro ── */}
      <div className="relative mx-auto w-full max-w-[540px]">
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

          <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 backdrop-blur-md">
            <Crosshair className="size-3 text-orbit-electric" />
            <span className="text-[9px] font-black uppercase tracking-[.15em] text-white/55">
              {showRoute ? "Prévia da rota" : "Área de simulação"}
            </span>
          </div>

          {showRoute && routeFrames.map((frame, index) => (
            <span
              key={`${frame.x}-${frame.y}-${index}`}
              aria-hidden="true"
              className={`absolute z-[5] grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-[8px] font-black shadow-[0_0_14px_rgba(0,212,255,.35)] ${frame.evento === "portal" ? "border-emerald-300 bg-emerald-300 text-black" : "border-orbit-electric/70 bg-[#06141b]/90 text-orbit-electric"}`}
              style={{ left: cellCenter(frame.x, nivel.cols), top: cellCenter(frame.y, nivel.rows) }}
            >
              {rotuloFrameOrbi(frame)}
            </span>
          ))}

          {/* Asteroides */}
          {nivel.asteroides.map((asteroide) => (
            <span
              key={`${asteroide.x}-${asteroide.y}`}
              aria-label="Asteroide"
              className="absolute grid size-[9%] min-h-7 min-w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[42%_58%_48%_52%] border border-orange-200/25 bg-[radial-gradient(circle_at_35%_30%,#fdba74_0%,#c2410c_34%,#431407_75%)] shadow-[0_0_18px_rgba(249,115,22,.25),inset_-4px_-5px_8px_rgba(0,0,0,.45)]"
              style={{
                left: cellCenter(asteroide.x, nivel.cols),
                top: cellCenter(asteroide.y, nivel.rows),
                animation: "orbi-game-hover 4s ease-in-out infinite",
                animationDelay: `${(asteroide.x + asteroide.y) * 0.3}s`,
              }}
            >
              <span className="size-[28%] rounded-full bg-black/25" />
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
            <span className="relative block size-8 rounded-full border-2 border-white/70 bg-[radial-gradient(circle_at_35%_30%,#a5f3fc,#0891b2_38%,#312e81_72%)] shadow-[0_0_22px_rgba(0,212,255,.65)] sm:size-10" style={{ animation: "orbi-game-hover 3s ease-in-out infinite" }}>
              <span className="absolute left-1/2 top-1/2 h-2 w-12 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border border-orbit-purple/80" />
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
                transition: `left ${Math.max(stepMs - 60, 120)}ms ease-in-out, top ${Math.max(stepMs - 60, 120)}ms ease-in-out, transform ${Math.max(stepMs - 60, 120)}ms ease-in-out`,
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

      {showRoute && traceFrames.length > 0 && (
        <div className="mx-auto mt-3 w-full max-w-[540px] rounded-2xl border border-orbit-electric/15 bg-orbit-electric/[.045] p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-orbit-electric">Rastro de execução</p>
            <span className="text-[9px] text-white/30">P = principal · F = função</span>
          </div>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {traceFrames.map((frame, index) => {
              const cmd = comandoDoFrameOrbi(frame, principal, funcao);
              const current = activeChip?.track === frame.track && activeChip.index === frame.index;
              return (
                <span key={`${frame.track}-${frame.index}-${index}`} className={`flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1.5 text-[9px] ${current ? "border-amber-300/60 bg-amber-300/10 text-amber-200" : "border-white/10 bg-black/25 text-white/50"}`}>
                  <b className="text-white/80">{index + 1}</b>
                  <span>{rotuloFrameOrbi(frame)}</span>
                  <span className="text-white/30">{cmd ? CMD_META[cmd].label : frame.evento}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Mensagens de falha */}
      {resultado && resultado !== "portal" && (
        <div className="mt-3 rounded-2xl border border-amber-300/25 bg-amber-300/[.07] p-4" role="status" aria-live="polite">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-amber-300">Debug da tentativa</p>
          <p className="mt-1 text-xs leading-5 text-amber-100">{failureCopy}</p>
          <button type="button" onClick={() => setShowRoute(true)} className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-amber-300/10 px-3 text-[11px] font-bold text-amber-200 hover:bg-amber-300/15">
            <Route className="size-3.5" /> Ver onde a rota parou
          </button>
        </div>
      )}

        </section>

        <section aria-label="Monte o programa" className="min-w-0 rounded-3xl border border-white/10 bg-[#0a0d14]/90 p-4 shadow-[0_24px_70px_rgba(0,0,0,.22)] sm:p-5 lg:sticky lg:top-20">

      {/* ── Programa ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-orbit-purple">Plano de voo</p>
          <h2 className="mt-1 text-lg font-black text-white">Programe, simule e ajuste</h2>
          <p className="mt-1 text-xs leading-5 text-white/40">Monte uma hipótese antes de apertar executar.</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${comandosUsados <= nivel.par ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-300/10 text-amber-200"}`}>
          {comandosUsados}/{nivel.par}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {renderTrack("principal", principal, nivel.slotsPrincipal)}
        {nivel.slotsFuncao ? renderTrack("funcao", funcao, nivel.slotsFuncao) : null}
        {selectedChip && (() => {
          const commands = selectedChip.track === "principal" ? principal : funcao;
          const selectedCommand = commands[selectedChip.index];
          if (!selectedCommand) return null;
          return (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-orbit-electric/20 bg-orbit-electric/[.05] p-2">
              <span className="mr-auto text-[10px] text-white/55">
                {selectedChip.track === "principal" ? "Principal" : "Função F"} {selectedChip.index + 1}: <b className="text-white">{CMD_META[selectedCommand].label}</b>
              </span>
              <button type="button" onClick={() => moveCmd(selectedChip.track, selectedChip.index, -1)} disabled={selectedChip.index === 0} aria-label="Mover comando para a esquerda" className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/60 hover:bg-white/[.07] disabled:opacity-25">
                <ChevronLeft className="size-4" />
              </button>
              <button type="button" onClick={() => moveCmd(selectedChip.track, selectedChip.index, 1)} disabled={selectedChip.index === commands.length - 1} aria-label="Mover comando para a direita" className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/60 hover:bg-white/[.07] disabled:opacity-25">
                <ChevronRight className="size-4" />
              </button>
              <button type="button" onClick={() => removeCmd(selectedChip.track, selectedChip.index)} className="min-h-9 rounded-lg border border-red-400/20 bg-red-400/[.06] px-3 text-[10px] font-bold text-red-200 hover:bg-red-400/10">
                Remover
              </button>
            </div>
          );
        })()}
        {nivel.slotsFuncao ? (
          <p className="text-[10px] leading-4 text-white/30">
            Selecione um bloco para mover, remover ou inserir o próximo comando logo depois dele.
          </p>
        ) : (
          <p className="text-[10px] leading-4 text-white/30">Selecione um bloco para mover, remover ou inserir o próximo comando logo depois dele.</p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">Velocidade do voo</span>
        <div className="flex gap-1" role="group" aria-label="Velocidade da animação">
          {([{ label: "Lenta", value: 650 }, { label: "Normal", value: 420 }, { label: "Rápida", value: 220 }] as const).map((speed) => (
            <button key={speed.value} type="button" onClick={() => setStepMs(speed.value)} aria-pressed={stepMs === speed.value} className={`min-h-8 rounded-lg px-2.5 text-[9px] font-bold transition ${stepMs === speed.value ? "bg-orbit-electric/15 text-orbit-electric" : "text-white/35 hover:bg-white/[.06] hover:text-white/60"}`}>
              {speed.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setShowRoute((value) => !value)}
          disabled={principal.length === 0 || running}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orbit-electric/25 bg-orbit-electric/[.06] px-3 text-xs font-bold text-orbit-electric transition hover:bg-orbit-electric/[.1] disabled:opacity-35"
        >
          <Route className="size-4" /> {showRoute ? "Ocultar rota" : "Simular rota"}
        </button>
        <button
          type="button"
          onClick={desfazer}
          disabled={running || (activeTrack === "principal" ? principal.length === 0 : funcao.length === 0)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[.04] px-3 text-xs font-bold text-white/65 transition hover:bg-white/[.08] disabled:opacity-35"
        >
          <Undo2 className="size-4" /> Desfazer
        </button>
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
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
          onClick={executarPasso}
          disabled={running || principal.length === 0}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orbit-electric/30 bg-orbit-electric/[.07] px-4 text-sm font-bold text-orbit-electric transition hover:bg-orbit-electric/[.12] disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
          {manualFrames.length > 0 && manualCursor < manualFrames.length ? `Próximo passo ${manualCursor + 1}/${manualFrames.length}` : "Passo a passo"}
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
        </section>
      </div>
    </div>
  );
}

export default function GuiaOrbiPage() {
  return <GuiaOrbiWorkspace />;
}
