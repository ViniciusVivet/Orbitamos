"use client";

import { useEffect, useRef } from "react";

const SERVICOS = [
  {
    num: "01",
    title: "Landing Page",
    desc: "Página pensada para campanha, captura e conversão.",
    chips: ["Conversão", "Campanha", "WhatsApp"],
    glow: "rgba(0,212,255,0.12)",
    border: "rgba(0,212,255,0.18)",
    accentColor: "#00D4FF",
    shape: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Browser chrome */}
        <rect x="18" y="12" width="164" height="96" rx="6" stroke="#00D4FF" strokeWidth="1.2" opacity="0.18"/>
        <rect x="18" y="12" width="164" height="18" rx="6" fill="#00D4FF" opacity="0.08"/>
        <circle cx="28" cy="21" r="2" fill="#00D4FF" opacity="0.4"/>
        <circle cx="36" cy="21" r="2" fill="#00D4FF" opacity="0.4"/>
        <circle cx="44" cy="21" r="2" fill="#00D4FF" opacity="0.4"/>
        {/* Hero headline */}
        <rect x="30" y="38" width="90" height="7" rx="2" fill="#00D4FF" opacity="0.22"/>
        <rect x="30" y="49" width="70" height="5" rx="2" fill="#00D4FF" opacity="0.13"/>
        {/* CTA button */}
        <rect x="30" y="62" width="52" height="16" rx="4" fill="#00D4FF" opacity="0.22"/>
        <rect x="30" y="62" width="52" height="16" rx="4" stroke="#00D4FF" strokeWidth="1" opacity="0.4"/>
        {/* Hero image placeholder */}
        <rect x="110" y="36" width="62" height="46" rx="4" stroke="#00D4FF" strokeWidth="1" opacity="0.2"/>
        <path d="M124 55 l10-10 8 8 6-6 10 12" stroke="#00D4FF" strokeWidth="1" opacity="0.25" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Funnel hint */}
        <path d="M42 84 l6 10 h-12 z" fill="#00D4FF" opacity="0.18"/>
        <path d="M52 84 l6 10 h-12 z" fill="#00D4FF" opacity="0.12"/>
        <path d="M62 84 l6 10 h-12 z" fill="#00D4FF" opacity="0.07"/>
      </svg>
    ),
  },
  {
    num: "02",
    title: "Site Institucional",
    desc: "Presença digital profissional que passa confiança e fecha contato.",
    chips: ["Institucional", "SEO", "Credibilidade"],
    glow: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.20)",
    accentColor: "#8B5CF6",
    shape: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Navbar */}
        <rect x="16" y="12" width="168" height="16" rx="4" fill="#8B5CF6" opacity="0.12"/>
        <rect x="24" y="17" width="28" height="6" rx="2" fill="#8B5CF6" opacity="0.35"/>
        <rect x="114" y="17" width="16" height="6" rx="2" fill="#8B5CF6" opacity="0.2"/>
        <rect x="134" y="17" width="16" height="6" rx="2" fill="#8B5CF6" opacity="0.2"/>
        <rect x="154" y="15" width="24" height="10" rx="3" fill="#8B5CF6" opacity="0.3"/>
        {/* Hero */}
        <rect x="16" y="32" width="168" height="36" rx="4" stroke="#8B5CF6" strokeWidth="1" opacity="0.18"/>
        <rect x="30" y="40" width="72" height="8" rx="2" fill="#8B5CF6" opacity="0.22"/>
        <rect x="30" y="52" width="50" height="5" rx="2" fill="#8B5CF6" opacity="0.13"/>
        {/* 3 cards below */}
        <rect x="16" y="74" width="50" height="34" rx="4" stroke="#8B5CF6" strokeWidth="1" opacity="0.2"/>
        <rect x="75" y="74" width="50" height="34" rx="4" stroke="#8B5CF6" strokeWidth="1" opacity="0.2"/>
        <rect x="134" y="74" width="50" height="34" rx="4" stroke="#8B5CF6" strokeWidth="1" opacity="0.2"/>
        <rect x="24" y="82" width="34" height="5" rx="2" fill="#8B5CF6" opacity="0.18"/>
        <rect x="83" y="82" width="34" height="5" rx="2" fill="#8B5CF6" opacity="0.18"/>
        <rect x="142" y="82" width="34" height="5" rx="2" fill="#8B5CF6" opacity="0.18"/>
        <rect x="24" y="91" width="26" height="4" rx="2" fill="#8B5CF6" opacity="0.1"/>
        <rect x="83" y="91" width="26" height="4" rx="2" fill="#8B5CF6" opacity="0.1"/>
        <rect x="142" y="91" width="26" height="4" rx="2" fill="#8B5CF6" opacity="0.1"/>
      </svg>
    ),
  },
  {
    num: "03",
    title: "E-commerce",
    desc: "Catálogo, jornada de compra e experiência de marca em um só lugar.",
    chips: ["Vitrine", "Checkout", "Mobile-first"],
    glow: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.20)",
    accentColor: "#10B981",
    shape: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* 3 product cards */}
        <rect x="14" y="14" width="50" height="62" rx="4" stroke="#10B981" strokeWidth="1.2" opacity="0.22"/>
        <rect x="75" y="14" width="50" height="62" rx="4" stroke="#10B981" strokeWidth="1.2" opacity="0.22"/>
        <rect x="136" y="14" width="50" height="62" rx="4" stroke="#10B981" strokeWidth="1.2" opacity="0.22"/>
        {/* Image areas */}
        <rect x="14" y="14" width="50" height="36" rx="4" fill="#10B981" opacity="0.1"/>
        <rect x="75" y="14" width="50" height="36" rx="4" fill="#10B981" opacity="0.1"/>
        <rect x="136" y="14" width="50" height="36" rx="4" fill="#10B981" opacity="0.1"/>
        {/* Price + title */}
        <rect x="20" y="56" width="32" height="5" rx="2" fill="#10B981" opacity="0.25"/>
        <rect x="81" y="56" width="32" height="5" rx="2" fill="#10B981" opacity="0.25"/>
        <rect x="142" y="56" width="32" height="5" rx="2" fill="#10B981" opacity="0.25"/>
        <rect x="20" y="65" width="24" height="4" rx="2" fill="#10B981" opacity="0.15"/>
        <rect x="81" y="65" width="24" height="4" rx="2" fill="#10B981" opacity="0.15"/>
        <rect x="142" y="65" width="24" height="4" rx="2" fill="#10B981" opacity="0.15"/>
        {/* Checkout bar */}
        <rect x="14" y="84" width="172" height="24" rx="4" fill="#10B981" opacity="0.1"/>
        <rect x="14" y="84" width="172" height="24" rx="4" stroke="#10B981" strokeWidth="1" opacity="0.25"/>
        <rect x="100" y="89" width="72" height="14" rx="3" fill="#10B981" opacity="0.22"/>
        <rect x="22" y="91" width="40" height="5" rx="2" fill="#10B981" opacity="0.18"/>
        <rect x="22" y="99" width="28" height="4" rx="2" fill="#10B981" opacity="0.12"/>
      </svg>
    ),
  },
  {
    num: "04",
    title: "Sistema Web / MVP",
    desc: "Fluxo funcional para validar ideia ou operação sem enrolação.",
    chips: ["MVP", "Fluxo", "Escalável"],
    glow: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.18)",
    accentColor: "#FBBF24",
    shape: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Node 1 — Login */}
        <rect x="14" y="44" width="36" height="28" rx="5" fill="#FBBF24" opacity="0.1"/>
        <rect x="14" y="44" width="36" height="28" rx="5" stroke="#FBBF24" strokeWidth="1.3" opacity="0.35"/>
        <rect x="20" y="52" width="24" height="4" rx="2" fill="#FBBF24" opacity="0.3"/>
        <rect x="20" y="60" width="16" height="4" rx="2" fill="#FBBF24" opacity="0.18"/>
        {/* Arrow 1 */}
        <line x1="50" y1="58" x2="70" y2="58" stroke="#FBBF24" strokeWidth="1.2" opacity="0.35"/>
        <path d="M66 54 l4 4 -4 4" stroke="#FBBF24" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Node 2 — Dashboard */}
        <rect x="70" y="34" width="60" height="48" rx="5" fill="#FBBF24" opacity="0.08"/>
        <rect x="70" y="34" width="60" height="48" rx="5" stroke="#FBBF24" strokeWidth="1.3" opacity="0.35"/>
        <rect x="78" y="44" width="44" height="6" rx="2" fill="#FBBF24" opacity="0.22"/>
        <rect x="78" y="54" width="18" height="16" rx="3" stroke="#FBBF24" strokeWidth="1" opacity="0.25"/>
        <rect x="100" y="54" width="22" height="16" rx="3" stroke="#FBBF24" strokeWidth="1" opacity="0.25"/>
        <rect x="78" y="72" width="44" height="4" rx="2" fill="#FBBF24" opacity="0.12"/>
        {/* Arrow 2 */}
        <line x1="130" y1="58" x2="150" y2="58" stroke="#FBBF24" strokeWidth="1.2" opacity="0.35"/>
        <path d="M146 54 l4 4 -4 4" stroke="#FBBF24" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Node 3 — Output */}
        <rect x="150" y="44" width="36" height="28" rx="5" fill="#FBBF24" opacity="0.1"/>
        <rect x="150" y="44" width="36" height="28" rx="5" stroke="#FBBF24" strokeWidth="1.3" opacity="0.35"/>
        <rect x="156" y="52" width="20" height="4" rx="2" fill="#FBBF24" opacity="0.3"/>
        <rect x="156" y="60" width="14" height="4" rx="2" fill="#FBBF24" opacity="0.18"/>
        {/* Step labels */}
        <rect x="16" y="78" width="32" height="3" rx="1.5" fill="#FBBF24" opacity="0.15"/>
        <rect x="152" y="78" width="32" height="3" rx="1.5" fill="#FBBF24" opacity="0.15"/>
      </svg>
    ),
  },
  {
    num: "05",
    title: "Dashboard & Painel",
    desc: "Visualização clara para acompanhar números e tomar decisão.",
    chips: ["Analytics", "Tempo real", "Gestão"],
    glow: "rgba(0,212,255,0.10)",
    border: "rgba(0,212,255,0.18)",
    accentColor: "#00D4FF",
    shape: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* KPI cards row */}
        <rect x="14" y="12" width="50" height="28" rx="4" fill="#00D4FF" opacity="0.08"/>
        <rect x="14" y="12" width="50" height="28" rx="4" stroke="#00D4FF" strokeWidth="1" opacity="0.22"/>
        <rect x="75" y="12" width="50" height="28" rx="4" fill="#00D4FF" opacity="0.08"/>
        <rect x="75" y="12" width="50" height="28" rx="4" stroke="#00D4FF" strokeWidth="1" opacity="0.22"/>
        <rect x="136" y="12" width="50" height="28" rx="4" fill="#00D4FF" opacity="0.08"/>
        <rect x="136" y="12" width="50" height="28" rx="4" stroke="#00D4FF" strokeWidth="1" opacity="0.22"/>
        {/* KPI values */}
        <rect x="22" y="19" width="28" height="8" rx="2" fill="#00D4FF" opacity="0.3"/>
        <rect x="83" y="19" width="28" height="8" rx="2" fill="#00D4FF" opacity="0.3"/>
        <rect x="144" y="19" width="28" height="8" rx="2" fill="#00D4FF" opacity="0.3"/>
        <rect x="22" y="31" width="18" height="4" rx="2" fill="#00D4FF" opacity="0.15"/>
        <rect x="83" y="31" width="18" height="4" rx="2" fill="#00D4FF" opacity="0.15"/>
        <rect x="144" y="31" width="18" height="4" rx="2" fill="#00D4FF" opacity="0.15"/>
        {/* Line chart */}
        <rect x="14" y="46" width="172" height="44" rx="4" stroke="#00D4FF" strokeWidth="1" opacity="0.2"/>
        <rect x="14" y="46" width="172" height="44" rx="4" fill="#00D4FF" opacity="0.04"/>
        <polyline points="22,80 46,66 70,72 94,58 118,64 142,52 166,56 180,50" stroke="#00D4FF" strokeWidth="1.5" fill="none" opacity="0.45" strokeLinejoin="round"/>
        <path d="M22 80 46 66 70 72 94 58 118 64 142 52 166 56 180 50 180 90 22 90 z" fill="#00D4FF" opacity="0.05"/>
        {/* Axis lines */}
        <line x1="22" y1="88" x2="180" y2="88" stroke="#00D4FF" strokeWidth="0.8" opacity="0.18"/>
        <line x1="22" y1="88" x2="22" y2="50" stroke="#00D4FF" strokeWidth="0.8" opacity="0.18"/>
        {/* Bottom bar */}
        <rect x="14" y="96" width="172" height="14" rx="4" stroke="#00D4FF" strokeWidth="1" opacity="0.15"/>
        <rect x="20" y="100" width="30" height="4" rx="2" fill="#00D4FF" opacity="0.2"/>
        <rect x="56" y="100" width="30" height="4" rx="2" fill="#00D4FF" opacity="0.12"/>
      </svg>
    ),
  },
  {
    num: "06",
    title: "Automação",
    desc: "Menos trabalho manual, mais processo rodando sozinho.",
    chips: ["Integração", "Webhooks", "Eficiência"],
    glow: "rgba(139,92,246,0.10)",
    border: "rgba(139,92,246,0.18)",
    accentColor: "#8B5CF6",
    shape: (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Central hub */}
        <circle cx="100" cy="60" r="18" fill="#8B5CF6" opacity="0.1"/>
        <circle cx="100" cy="60" r="18" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.35"/>
        <circle cx="100" cy="60" r="8" fill="#8B5CF6" opacity="0.22"/>
        {/* Spoke lines */}
        <line x1="82" y1="60" x2="52" y2="60" stroke="#8B5CF6" strokeWidth="1.1" opacity="0.3"/>
        <line x1="118" y1="60" x2="148" y2="60" stroke="#8B5CF6" strokeWidth="1.1" opacity="0.3"/>
        <line x1="100" y1="42" x2="100" y2="22" stroke="#8B5CF6" strokeWidth="1.1" opacity="0.3"/>
        <line x1="100" y1="78" x2="100" y2="98" stroke="#8B5CF6" strokeWidth="1.1" opacity="0.3"/>
        {/* Peripheral nodes */}
        <rect x="26" y="48" width="26" height="24" rx="5" fill="#8B5CF6" opacity="0.1"/>
        <rect x="26" y="48" width="26" height="24" rx="5" stroke="#8B5CF6" strokeWidth="1.2" opacity="0.3"/>
        <rect x="148" y="48" width="26" height="24" rx="5" fill="#8B5CF6" opacity="0.1"/>
        <rect x="148" y="48" width="26" height="24" rx="5" stroke="#8B5CF6" strokeWidth="1.2" opacity="0.3"/>
        <rect x="82" y="12" width="36" height="22" rx="5" fill="#8B5CF6" opacity="0.1"/>
        <rect x="82" y="12" width="36" height="22" rx="5" stroke="#8B5CF6" strokeWidth="1.2" opacity="0.3"/>
        <rect x="82" y="90" width="36" height="20" rx="5" fill="#8B5CF6" opacity="0.1"/>
        <rect x="82" y="90" width="36" height="20" rx="5" stroke="#8B5CF6" strokeWidth="1.2" opacity="0.3"/>
        {/* Node icons */}
        <rect x="32" y="56" width="14" height="3" rx="1.5" fill="#8B5CF6" opacity="0.35"/>
        <rect x="32" y="62" width="10" height="3" rx="1.5" fill="#8B5CF6" opacity="0.22"/>
        <rect x="154" y="56" width="14" height="3" rx="1.5" fill="#8B5CF6" opacity="0.35"/>
        <rect x="154" y="62" width="10" height="3" rx="1.5" fill="#8B5CF6" opacity="0.22"/>
        <rect x="88" y="18" width="20" height="3" rx="1.5" fill="#8B5CF6" opacity="0.35"/>
        <rect x="88" y="94" width="20" height="3" rx="1.5" fill="#8B5CF6" opacity="0.35"/>
        {/* Flow dots on spokes */}
        <circle cx="67" cy="60" r="2" fill="#8B5CF6" opacity="0.45"/>
        <circle cx="133" cy="60" r="2" fill="#8B5CF6" opacity="0.45"/>
        <circle cx="100" cy="31" r="2" fill="#8B5CF6" opacity="0.45"/>
        <circle cx="100" cy="89" r="2" fill="#8B5CF6" opacity="0.45"/>
      </svg>
    ),
  },
];

export default function WhatWeBuild() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Vídeo de fundo — terra girando */}
      <video
        ref={videoRef}
        src="/terra-real.mp4"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover opacity-30 [&::-webkit-media-controls]:hidden"
        style={{ objectPosition: "75% center" }}
      />
      {/* Overlay escuro para manter legibilidade */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.55) 70%, #000 100%)",
        }}
      />
      <div className="relative z-10 container mx-auto max-w-5xl px-6">

        <div className="mb-12 text-center">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-orbit-electric">
            Capacidade técnica
          </p>
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            O que entregamos
          </h2>
          <p className="mt-3 text-sm text-white/50">Do briefing ao ar. Sem enrolação.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICOS.map((s) => (
            <div
              key={s.num}
              className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: `radial-gradient(ellipse at top left, ${s.glow} 0%, rgba(255,255,255,0.02) 70%)`,
                border: `1px solid ${s.border}`,
              }}
            >
              {/* Mini visual SVG */}
              {s.shape}

              {/* Conteúdo */}
              <div className="relative">
                <span className="text-[10px] font-black tabular-nums" style={{ color: s.accentColor, opacity: 0.7 }}>
                  {s.num}
                </span>
                <h3 className="mt-1 text-base font-bold text-white">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/60">{s.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: s.glow,
                        border: `1px solid ${s.border}`,
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

