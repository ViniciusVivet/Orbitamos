"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Tilt from "@/components/Tilt";
import Magnetic from "@/components/Magnetic";

const SpaceShipsOverlay = dynamic(() => import("@/components/SpaceShipsOverlay"), { ssr: false, loading: () => null });

const WHATSAPP_URL = "https://wa.me/5511949138973?text=Ol%C3%A1%2C+vim+pelo+site+da+Orbitamos+e+quero+fazer+um+or%C3%A7amento";

const SERVICES = [
  {
    icon: "🎯",
    title: "Landing Page",
    desc: "Página focada em conversão. Ideal pra campanhas, captação de leads e vender um produto ou serviço específico.",
    color: "orbit-electric",
    border: "hover:border-orbit-electric/50",
    glow: "rgba(0,212,255,0.15)",
  },
  {
    icon: "🏢",
    title: "Site Institucional",
    desc: "Presença digital completa para seu negócio. Apresentação profissional, serviços, contato e integração com WhatsApp.",
    color: "orbit-purple",
    border: "hover:border-orbit-purple/50",
    glow: "rgba(139,92,246,0.15)",
  },
  {
    icon: "⚙️",
    title: "Sistema Web / MVP",
    desc: "Plataformas com login, dashboard, automações e integrações. Da ideia ao produto funcional com rapidez.",
    color: "orbit-electric",
    border: "hover:border-orbit-electric/50",
    glow: "rgba(0,212,255,0.15)",
  },
];

const PROJECTS = [
  {
    name: "Sabrina Lashes",
    type: "Site Institucional",
    desc: "Site para especialista em beleza com CTA direto para WhatsApp e foco em conversão local.",
    stack: ["Next.js", "Tailwind"],
    status: "Publicado",
    statusColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    name: "YUME – Moda Disrruptiva",
    type: "E-commerce",
    desc: "Vitrine digital para marca autoral de moda com storytelling e identidade visual forte.",
    stack: ["Next.js", "Tailwind"],
    status: "Em evolução",
    statusColor: "text-orbit-electric border-orbit-electric/30 bg-orbit-electric/10",
  },
  {
    name: "KitCerto",
    type: "E-commerce",
    desc: "Loja digital com catálogo de kits organizado, mobile-first e preparada para checkout.",
    stack: ["Next.js", "Tailwind"],
    status: "MVP",
    statusColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    name: "Orbitamos Portal Tech",
    type: "Sistema Web",
    desc: "Plataforma com autenticação, área do estudante, comunidade, mensagens e gamificação.",
    stack: ["Next.js", "Supabase", "WebSocket"],
    status: "Em evolução",
    statusColor: "text-orbit-electric border-orbit-electric/30 bg-orbit-electric/10",
  },
  {
    name: "Caixa Controladora – Sinuca & Fliperama",
    type: "Hardware + Sistema",
    desc: "Dispositivo IoT com Arduino que libera travas de mesa via pulso ao detectar moeda. Inclui sistema de gestão e firmware compilável.",
    stack: ["Arduino", "C++", "Next.js"],
    status: "Em desenvolvimento",
    statusColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen text-white">
      <SpaceShipsOverlay />

      {/* Fundo cósmico */}
      <div className="fixed inset-0 -z-10 bg-black" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,212,255,.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(139,92,246,.10),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_20%_80%,rgba(0,212,255,.07),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      <div className="relative z-[1]">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative min-h-screen overflow-hidden">
          {/* Glow de fundo */}
          <div className="pointer-events-none absolute -top-40 left-0 h-[600px] w-[600px] rounded-full blur-3xl opacity-20 bg-orbit-electric" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full blur-3xl opacity-15 bg-orbit-purple" />

          <div className="container mx-auto flex min-h-screen flex-col items-center gap-12 px-4 pt-24 pb-16 lg:flex-row lg:gap-0 lg:pt-0">

            {/* Esquerda: texto */}
            <div className="flex flex-1 flex-col justify-center gap-8 lg:pr-12">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-xl">
                <span className="size-2 animate-pulse rounded-full bg-orbit-electric" />
                <span className="text-xs tracking-widest text-white/70 uppercase">Estúdio Digital · São Paulo</span>
              </div>

              <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
                Seu negócio<br />
                merece um<br />
                <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
                  produto digital
                </span><br />
                de verdade.
              </h1>

              <p className="max-w-md text-base text-white/60 leading-relaxed">
                Sites, landing pages e sistemas que fazem seu negócio aparecer, vender e crescer. Entrega rápida. Resultado real.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Magnetic>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                    <Button
                      size="lg"
                      className="px-8 py-4 text-base font-bold bg-gradient-to-r from-orbit-electric to-orbit-purple text-black shadow-[0_0_40px_rgba(0,212,255,0.35)] hover:shadow-[0_0_60px_rgba(0,212,255,0.55)] hover:-translate-y-0.5 transform-gpu transition-all duration-150"
                    >
                      💬 Pedir orçamento
                    </Button>
                  </a>
                </Magnetic>
                <Magnetic>
                  <Link href="/projetos">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 py-4 text-base font-bold border-white/20 text-white bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-orbit-electric/40 transition-all duration-150"
                    >
                      Ver projetos →
                    </Button>
                  </Link>
                </Magnetic>
              </div>

              {/* Mini social proof */}
              <div className="flex items-center gap-6 pt-2">
                {[
                  { value: "5+", label: "Projetos entregues" },
                  { value: "2 sem", label: "Prazo médio" },
                  { value: "100%", label: "Satisfação" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-xl font-extrabold text-white">{s.value}</div>
                    <div className="text-xs text-white/40">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direita: vídeo */}
            <div className="relative flex w-full items-center justify-center lg:w-[52%]">
              {/* Glow atrás do vídeo */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orbit-electric/20 to-orbit-purple/20 blur-3xl" />
              <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_80px_rgba(0,212,255,0.15)]">
                <video
                  src="/hero.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full object-cover"
                  style={{ maxHeight: "80vh" }}
                />
                {/* Overlay sutil para integrar com o fundo */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/30" />
              </div>
            </div>

          </div>
        </section>

        {/* ── SERVIÇOS ─────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-orbit-electric/70">O que entregamos</p>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Soluções digitais <span className="gradient-text">sob medida</span>
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {SERVICES.map((s) => (
                <Tilt key={s.title} className="[transform-style:preserve-3d]">
                  <Card
                    className={`h-full bg-white/5 backdrop-blur-xl border-white/10 ${s.border} transition-all duration-300 [transform:translateZ(20px)]`}
                    style={{ boxShadow: `0 0 0 0 ${s.glow}` }}
                  >
                    <CardHeader>
                      <div className="mb-2 text-3xl">{s.icon}</div>
                      <CardTitle className={`text-${s.color} text-xl`}>{s.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/75 text-sm leading-relaxed">{s.desc}</p>
                    </CardContent>
                  </Card>
                </Tilt>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROJETOS ─────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-orbit-electric/70">Portfólio</p>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Projetos <span className="gradient-text">entregues</span>
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((p) => (
                <div
                  key={p.name}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-orbit-electric/30 hover:shadow-[0_0_30px_rgba(0,212,255,0.08)]"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{p.type}</p>
                      <h3 className="mt-0.5 text-base font-bold text-white">{p.name}</h3>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${p.statusColor}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-white/60 leading-relaxed">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.map((t) => (
                      <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-white/50 border border-white/10">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/projetos">
                <Button variant="outline" className="border-white/20 text-white/80 hover:border-orbit-electric/40 hover:text-white">
                  Ver todos os projetos →
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── POR QUE A ORBITAMOS ──────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl md:p-12">
              <div className="mb-10 text-center">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-orbit-electric/70">Diferenciais</p>
                <h2 className="text-3xl font-bold text-white md:text-4xl">
                  Por que contratar a <span className="gradient-text">Orbitamos</span>?
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  { icon: "⚡", title: "Entrega rápida", desc: "Landing pages em até 7 dias. Sites institucionais em até 2 semanas. Sem enrolação." },
                  { icon: "💰", title: "Preço justo", desc: "Produto digital de qualidade sem cobrar o preço de agência grande. Feito pra quem quer resultado." },
                  { icon: "🤝", title: "Suporte real", desc: "Você fala direto com quem desenvolveu. Sem intermediário, sem ticket, sem espera." },
                ].map((item) => (
                  <div key={item.title} className="text-center">
                    <div className="mb-3 text-4xl">{item.icon}</div>
                    <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl rounded-2xl border border-orbit-electric/20 bg-black/50 p-10 text-center shadow-[0_0_60px_rgba(0,212,255,0.12)] backdrop-blur-xl">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Pronto pra ter um produto digital <span className="gradient-text">de verdade</span>?
              </h2>
              <p className="mb-8 text-white/60">
                Manda mensagem agora. A gente responde rápido, entende seu negócio e te manda uma proposta sem enrolação.
              </p>
              <Magnetic>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  <Button
                    size="lg"
                    className="px-12 py-5 text-lg font-bold bg-gradient-to-r from-orbit-electric to-orbit-purple text-black shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_50px_rgba(0,212,255,0.55)] hover:-translate-y-0.5 transform-gpu transition-all duration-200"
                  >
                    💬 Falar no WhatsApp
                  </Button>
                </a>
              </Magnetic>
              <p className="mt-4 text-xs text-white/30">Cada projeto entregue financia formação em TI para jovens da periferia.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
