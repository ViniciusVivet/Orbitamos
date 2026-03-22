"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { Projeto } from "@/types/projeto";
import { CATEGORIAS, STATUS_LABELS } from "@/types/projeto";

interface HologramModalProps {
  projeto: Projeto;
  projetos: Projeto[];
  onClose: () => void;
}

function getCategoriaLabel(slug: string) {
  return CATEGORIAS.find((c) => c.slug === slug)?.label ?? slug;
}

type SlidePhase = "idle" | "exit" | "enter";
type SlideDir = "left" | "right";

export default function HologramModal({ projeto, projetos, onClose }: HologramModalProps) {
  const initialIdx = projetos.findIndex((p) => p.slug === projeto.slug);
  const [currentIdx, setCurrentIdx] = useState(initialIdx < 0 ? 0 : initialIdx);
  const [phase, setPhase] = useState<SlidePhase>("idle");
  const [dir, setDir] = useState<SlideDir>("right");
  const [nextIdx, setNextIdx] = useState<number | null>(null);
  const isAnimating = useRef(false);

  const current = projetos[currentIdx];
  const isLive = current.status === "publicado";

  const navigate = useCallback((direction: SlideDir) => {
    if (isAnimating.current) return;
    const delta = direction === "right" ? 1 : -1;
    const target = (currentIdx + delta + projetos.length) % projetos.length;
    isAnimating.current = true;
    setDir(direction);
    setNextIdx(target);
    setPhase("exit");

    setTimeout(() => {
      setCurrentIdx(target);
      setPhase("enter");
      setTimeout(() => {
        setPhase("idle");
        setNextIdx(null);
        isAnimating.current = false;
      }, 180);
    }, 180);
  }, [currentIdx, projetos.length]);

  // Teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight") navigate("right");
      if (e.key === "ArrowLeft") navigate("left");
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, navigate]);

  // Estilo de transição do conteúdo
  const contentStyle = (): React.CSSProperties => {
    if (phase === "exit") {
      return {
        opacity: 0,
        transform: `translateX(${dir === "right" ? "-5%" : "5%"})`,
        transition: "opacity 0.18s ease-in, transform 0.18s ease-in",
      };
    }
    if (phase === "enter") {
      return {
        opacity: 0,
        transform: `translateX(${dir === "right" ? "5%" : "-5%"})`,
        transition: "none",
      };
    }
    return {
      opacity: 1,
      transform: "translateX(0)",
      transition: "opacity 0.22s ease-out, transform 0.22s ease-out",
    };
  };

  // ── Mouse tracking ──
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setGlowPos({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    });
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (mx >= 0 && my >= 0 && mx <= rect.width && my <= rect.height) {
        const px = (mx / rect.width - 0.5) * 2;
        const py = (my / rect.height - 0.5) * 2;
        setTilt({ x: py * -7, y: px * 7 });
      } else {
        setTilt({ x: 0, y: 0 });
      }
    }
  }, []);

  const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return createPortal(
    <div
      className="animate-holo-backdrop fixed inset-0 z-[999] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow que segue o mouse */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 40% 35% at ${glowPos.x}% ${glowPos.y}%, rgba(0,212,255,0.07) 0%, transparent 70%)`,
          transition: "background 0.1s",
        }}
      />

      {/* Container */}
      <div
        className="animate-holo-enter relative w-full max-w-6xl"
        style={{ maxHeight: "calc(100vh - 3rem)" }}
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scan line */}
        <div
          className="animate-scanline pointer-events-none absolute inset-x-0 top-0 h-[1px] z-20"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.0) 10%, rgba(0,212,255,0.8) 50%, rgba(0,212,255,0.0) 90%, transparent 100%)" }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span
              className="animate-hud-pulse h-2 w-2 rounded-full"
              style={{ background: "#00D4FF", boxShadow: "0 0 10px rgba(0,212,255,0.9)" }}
            />
            <span className="text-xs font-bold uppercase tracking-[0.35em]" style={{ color: "rgba(0,212,255,0.5)" }}>
              Orbitamos Studio · Case
            </span>
          </div>

          {/* Navegação + contador + fechar */}
          <div className="flex items-center gap-3">
            {/* Setas de navegação */}
            <div className="flex items-center gap-1.5">
              <NavArrow direction="left" onClick={() => navigate("left")} />
              <span className="text-[11px] font-mono tabular-nums" style={{ color: "rgba(0,212,255,0.35)" }}>
                {String(currentIdx + 1).padStart(2, "0")} / {String(projetos.length).padStart(2, "0")}
              </span>
              <NavArrow direction="right" onClick={() => navigate("right")} />
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150 hover:opacity-60"
              style={{ border: "1px solid rgba(0,212,255,0.2)", color: "rgba(255,255,255,0.4)", background: "transparent" }}
              aria-label="Fechar"
            >
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conteúdo com transição */}
        <div style={contentStyle()}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-7">

            {/* Imagem holográfica */}
            <div className="relative w-full lg:w-[55%] shrink-0" ref={imageRef}>
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  border: "1px solid rgba(0,212,255,0.2)",
                  boxShadow: "0 0 0 1px rgba(0,212,255,0.04), 0 0 50px rgba(0,212,255,0.1), 0 0 100px rgba(0,212,255,0.04)",
                  transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transition: "transform 0.12s ease-out",
                  willChange: "transform",
                }}
              >
                <div className="relative aspect-video w-full">
                  <Image
                    src={current.imagemPrincipal}
                    alt={current.nome}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: "linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)",
                      backgroundSize: "50px 50px",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.65) 100%)" }}
                  />
                  <div className="absolute bottom-0 inset-x-0 px-5 py-4 flex items-end justify-between">
                    <div>
                      <p className="text-xl font-black tracking-tight leading-none" style={{ textShadow: "0 0 24px rgba(0,212,255,0.6)", color: "#fff" }}>
                        {current.nome}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "rgba(0,212,255,0.75)" }}>
                        {getCategoriaLabel(current.categoria)}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-2 rounded-full px-3 py-1.5"
                      style={{
                        background: isLive ? "rgba(16,185,129,0.15)" : "rgba(0,0,0,0.4)",
                        border: isLive ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(255,255,255,0.12)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {isLive && <span className="h-2 w-2 rounded-full" style={{ background: "#34D399", boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />}
                      <span className="text-xs font-semibold" style={{ color: isLive ? "#34D399" : "rgba(255,255,255,0.5)" }}>
                        {STATUS_LABELS[current.status]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cantos HUD */}
              <div className="animate-hud-pulse absolute -top-1.5 -left-1.5 h-5 w-5" style={{ borderTop: "2px solid rgba(0,212,255,0.6)", borderLeft: "2px solid rgba(0,212,255,0.6)" }} />
              <div className="animate-hud-pulse absolute -top-1.5 -right-1.5 h-5 w-5" style={{ borderTop: "2px solid rgba(0,212,255,0.6)", borderRight: "2px solid rgba(0,212,255,0.6)" }} />
              <div className="animate-hud-pulse absolute -bottom-1.5 -left-1.5 h-5 w-5" style={{ borderBottom: "2px solid rgba(0,212,255,0.6)", borderLeft: "2px solid rgba(0,212,255,0.6)" }} />
              <div className="animate-hud-pulse absolute -bottom-1.5 -right-1.5 h-5 w-5" style={{ borderBottom: "2px solid rgba(0,212,255,0.6)", borderRight: "2px solid rgba(0,212,255,0.6)" }} />

              {/* CTAs */}
              <div className="mt-4 flex flex-wrap gap-3">
                {current.link && (
                  <a
                    href={current.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-150 hover:brightness-125"
                    style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.3)", color: "#00D4FF", boxShadow: "0 0 24px rgba(0,212,255,0.08)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 11 11" fill="none">
                      <path d="M1 5.5h9M6 1l4 4.5L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Ver projeto
                  </a>
                )}
                <a
                  href="https://wa.me/5511949138973?text=Ol%C3%A1%2C+vi+o+portf%C3%B3lio+da+Orbitamos+e+quero+fazer+um+or%C3%A7amento"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-150 hover:brightness-125"
                  style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.35)", color: "#25D366", boxShadow: "0 0 24px rgba(37,211,102,0.06)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.86L.054 23.25a.75.75 0 00.916.916l5.39-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.656-.52-5.17-1.426l-.37-.22-3.838 1.052 1.052-3.837-.22-.371A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Pedir orçamento
                </a>
              </div>
            </div>

            {/* Info flutuante */}
            <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 12rem)", scrollbarWidth: "none" }}>

              <FloatPanel>
                <p className="text-base font-bold leading-snug" style={{ color: "rgba(255,255,255,0.95)", textShadow: "0 0 18px rgba(0,212,255,0.2)" }}>
                  {current.resumo}
                </p>
              </FloatPanel>

              <FloatPanel accent="purple">
                <HoloLabel>Problema</HoloLabel>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>{current.problema}</p>
                <div className="my-3" style={{ height: "1px", background: "rgba(139,92,246,0.12)" }} />
                <HoloLabel>Solução</HoloLabel>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>{current.solucao}</p>
              </FloatPanel>

              <FloatPanel>
                <HoloLabel>Resultado</HoloLabel>
                <p className="mt-1.5 text-sm leading-relaxed font-semibold" style={{ color: "rgba(0,212,255,1)", textShadow: "0 0 16px rgba(0,212,255,0.5)" }}>
                  {current.resultado}
                </p>
              </FloatPanel>

              <div className="flex gap-3.5">
                <FloatPanel className="flex-1">
                  <HoloLabel>Stack</HoloLabel>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {current.stack.map((tech) => (
                      <span key={tech} className="rounded-md px-2 py-0.5 text-xs font-semibold"
                        style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", color: "rgba(196,181,253,1)" }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </FloatPanel>

                <FloatPanel className="flex-1">
                  <HoloLabel>Destaques</HoloLabel>
                  <ul className="mt-2 space-y-1.5">
                    {current.destaques.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgba(255,255,255,0.82)" }}>
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "rgba(0,212,255,0.8)", boxShadow: "0 0 4px rgba(0,212,255,0.6)" }} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </FloatPanel>
              </div>

            </div>
          </div>
        </div>

        {/* Hint de teclado */}
        <div className="mt-4 flex justify-center">
          <span className="text-[10px]" style={{ color: "rgba(0,212,255,0.2)" }}>
            ← → para navegar entre projetos · ESC para fechar
          </span>
        </div>

      </div>
    </div>,
    document.body
  );
}

/* ── NavArrow ── */
function NavArrow({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 hover:opacity-80"
      style={{ border: "1px solid rgba(0,212,255,0.2)", color: "rgba(0,212,255,0.5)", background: "rgba(0,212,255,0.04)" }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        {direction === "left"
          ? <path d="M7 1L3 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </button>
  );
}

/* ── FloatPanel ── */
function FloatPanel({ children, accent = "cyan", className = "" }: {
  children: React.ReactNode;
  accent?: "cyan" | "purple";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 8 });
  };

  return (
    <div
      ref={ref}
      className={`rounded-xl p-4 ${className}`}
      style={{
        background: accent === "cyan" ? "rgba(0,212,255,0.03)" : "rgba(139,92,246,0.04)",
        border: `1px solid ${accent === "cyan" ? "rgba(0,212,255,0.12)" : "rgba(139,92,246,0.15)"}`,
        backdropFilter: "blur(4px)",
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.1s ease-out",
        willChange: "transform",
      }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {children}
    </div>
  );
}

/* ── HoloLabel ── */
function HoloLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(0,212,255,0.45)" }}>
      {children}
    </p>
  );
}
