"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const WHATSAPP_URL = "https://wa.me/5511949138973?text=Ol%C3%A1%2C+vim+pelo+site+da+Orbitamos+e+quero+fazer+um+or%C3%A7amento";

export default function Home() {
  return (
    <div
      className="relative overflow-hidden bg-black text-white"
      style={{ height: "calc(100dvh - 4rem)" }}
    >

      {/* ── Vídeo full-bleed ── */}
      <video
        src="/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* ── Overlays ── */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

      {/* ── Conteúdo principal ── */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div
          className="flex w-full max-w-xl flex-col px-8 lg:px-16 xl:px-24"
          style={{ gap: "clamp(0.9rem, 2.8vh, 2.25rem)" }}
        >

          {/* Badge */}
          <div className="inline-flex items-center gap-2.5">
            <span className="size-1.5 animate-pulse rounded-full bg-orbit-electric" />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/35">
              Estúdio Digital · São Paulo
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black leading-[1.0] tracking-tight"
            style={{ fontSize: "clamp(2.6rem, 7vmin, 5rem)" }}
          >
            <span className="text-white">Sites e</span><br />
            <span className="text-white">sistemas que</span><br />
            <span className="bg-gradient-to-r from-orbit-electric via-sky-300 to-orbit-purple bg-clip-text text-transparent">
              fazem vender.
            </span>
          </h1>

          {/* Sub */}
          <p className="max-w-xs text-[0.9375rem] leading-relaxed text-white/35">
            Landing pages, sites e sistemas com foco em conversão. Do briefing ao ar em até 1 semana.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-5">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              <Button
                size="default"
                className="px-6 font-bold bg-gradient-to-r from-orbit-electric to-orbit-purple text-black shadow-[0_0_24px_rgba(0,212,255,0.3)] hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] hover:-translate-y-px transform-gpu transition-all duration-150"
              >
                💬 Pedir orçamento
              </Button>
            </a>
            <Link
              href="/projetos"
              className="text-sm font-medium text-white/35 underline underline-offset-4 decoration-white/15 hover:text-white/70 hover:decoration-white/40 transition-all duration-150"
            >
              Ver projetos →
            </Link>
          </div>

          {/* Service tags */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Landing Page", href: "/contato" },
              { label: "Site Institucional", href: "/contato" },
              { label: "Sistema Web / MVP", href: "/contato" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-white/30 transition-all duration-150 hover:border-orbit-electric/30 hover:bg-orbit-electric/[0.07] hover:text-white/60"
              >
                {s.label}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <Link href="/projetos" className="group inline-flex items-stretch divide-x divide-white/[0.08]">
            {[
              { value: "5+", label: "Projetos entregues" },
              { value: "1 sem", label: "Prazo médio" },
              { value: "100%", label: "Satisfação" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col gap-0.5 transition-opacity duration-150 group-hover:opacity-70 ${i === 0 ? "pr-5" : "px-5"} last:pr-0`}
              >
                <p className="text-lg font-extrabold text-white/80">{s.value}</p>
                <p className="text-[11px] text-white/22">{s.label}</p>
              </div>
            ))}
          </Link>

        </div>
      </div>

      {/* ── Bento cards: coluna direita ── */}
      <div
        className="absolute right-8 top-0 bottom-0 z-10 hidden md:flex flex-col items-end justify-center xl:right-14"
        style={{ width: "clamp(240px, 20vw, 300px)", gap: "clamp(0.5rem, 1.5vh, 0.75rem)" }}
      >

        {/* Card A: Prazo → WhatsApp */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="group w-full rounded-2xl border border-white/[0.07] bg-[#03050c]/82 px-5 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl transition-all duration-150 hover:border-orbit-electric/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_20px_rgba(0,212,255,0.06),inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <div className="mb-2 h-[2px] w-8 rounded-full bg-gradient-to-r from-orbit-electric to-transparent" />
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/22">Prazo médio</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-white">1 semana</p>
          <p className="mt-0.5 text-[11px] text-white/18 transition-colors duration-150 group-hover:text-orbit-electric/50">
            Solicitar orçamento →
          </p>
        </a>

        {/* Cards B+C: Landing Page + Sistema Web */}
        <div className="flex w-full gap-2">
          <Link
            href="/projetos"
            className="flex-1 rounded-2xl border border-white/[0.07] bg-[#03050c]/82 p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl transition-all duration-150 hover:border-white/[0.12] hover:bg-white/[0.05]"
          >
            <p className="mb-2 text-lg">📄</p>
            <p className="text-sm font-bold leading-snug text-white">Landing<br />Page</p>
            <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/20">Ver cases →</p>
          </Link>
          <Link
            href="/projetos"
            className="flex-1 rounded-2xl border border-white/[0.07] bg-[#03050c]/82 p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl transition-all duration-150 hover:border-white/[0.12] hover:bg-white/[0.05]"
          >
            <p className="mb-2 text-lg">⚙️</p>
            <p className="text-sm font-bold leading-snug text-white">Sistema<br />Web</p>
            <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/20">Ver cases →</p>
          </Link>
        </div>

        {/* Card D: Sabrina Lashes */}
        <Link
          href="/projetos?case=sabrina-lashes"
          className="group w-full rounded-2xl border border-white/[0.07] bg-[#03050c]/82 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl transition-all duration-150 hover:border-emerald-500/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_20px_rgba(16,185,129,0.06),inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orbit-electric to-orbit-purple text-[11px] font-black text-black">
                S
              </div>
              <div>
                <p className="text-[12px] font-bold leading-none text-white">Sabrina Lashes</p>
                <p className="mt-0.5 text-[10px] text-white/25 transition-colors duration-150 group-hover:text-white/40">
                  Ver case completo →
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1">
              <span className="size-1 rounded-full bg-emerald-400" />
              <span className="text-[9px] font-semibold text-emerald-400">Publicado</span>
            </div>
          </div>
        </Link>

      </div>

      {/* ── Rodapé: missão ── */}
      <Link
        href="/orbitacademy"
        className="absolute bottom-4 left-8 z-10 transition-opacity duration-150 hover:opacity-60 lg:left-16 xl:left-24"
      >
        <p className="text-[10px] text-white/15">
          Cada projeto entregue financia formação em TI para jovens da periferia. →
        </p>
      </Link>

    </div>
  );
}
