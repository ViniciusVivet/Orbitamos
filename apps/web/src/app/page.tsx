"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Code2,
  ExternalLink,
  Layers3,
  MessageCircle,
  Plus,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import TextReveal from "@/components/TextReveal";
import CountUp from "@/components/CountUp";
import MagneticButton from "@/components/MagneticButton";
import useHeroScene from "@/components/three/HeroScene";
import useTechOrbitScene from "@/components/three/TechOrbitScene";
import useWarpCTAScene from "@/components/three/WarpCTAScene";

const SpaceCanvas = dynamic(() => import("@/components/three/SpaceCanvas"), { ssr: false });

const WHATSAPP_URL =
  "https://wa.me/5511949138973?text=Ol%C3%A1%2C+vim+pelo+site+da+Orbitamos+e+quero+fazer+um+or%C3%A7amento";

const stats = [
  { value: "7+", label: "projetos entregues", icon: Layers3 },
  { value: "24h", label: "primeiro contato", icon: Zap },
  { value: "100%", label: "mobile-first", icon: Smartphone },
  { value: "IA", label: "automações sob medida", icon: Bot },
];

const heroCases = [
  {
    name: "Sabrina Lashes",
    type: "Site institucional",
    result: "Agendamento e WhatsApp",
    href: "/projetos/sabrina-lashes",
    image: "/case-sabrina-lashes.png",
    accent: "from-emerald-300 to-cyan-300",
  },
  {
    name: "YUME",
    type: "Moda autoral",
    result: "Catálogo premium",
    href: "/projetos/yume-moda-disruptiva",
    image: "/case-yume.png",
    accent: "from-violet-300 to-fuchsia-300",
  },
  {
    name: "Destaque Multimarcas",
    type: "Estoque digital",
    result: "Filtros e leads",
    href: "/projetos/destaque-multimarcas",
    image: "/case-destaque-multimarcas.png",
    accent: "from-amber-200 to-orange-300",
  },
];

const services = [
  {
    icon: BarChart3,
    title: "Landing pages",
    href: "/servicos/landing-page",
    text: "Páginas rápidas para campanhas, captação de leads e vendas pelo WhatsApp.",
    points: ["Copy orientada a conversão", "CTA e formulário", "SEO e performance"],
  },
  {
    icon: ShieldCheck,
    title: "Sites profissionais",
    href: "/servicos/site-institucional",
    text: "Presença digital profissional para negócios que precisam passar confiança.",
    points: ["Identidade visual", "Serviços claros", "Credibilidade"],
  },
  {
    icon: Layers3,
    title: "Loja digital / E-commerce",
    href: "/servicos/catalogo-digital",
    text: "Vitrine ou catálogo digital para vender melhor e organizar produtos.",
    points: ["Catálogo filtrável", "WhatsApp direto", "Experiência mobile"],
  },
  {
    icon: Code2,
    title: "Sistemas web e MVPs",
    href: "/servicos/sistema-web",
    text: "Produtos sob medida para organizar operações, usuários, dados e processos.",
    points: ["Login e dashboards", "Banco de dados", "APIs"],
  },
  {
    icon: Bot,
    title: "Automações, IA e integrações",
    href: "/servicos/automacoes",
    text: "Fluxos inteligentes para reduzir trabalho manual e conectar ferramentas.",
    points: ["IA aplicada", "Integrações", "Processos automáticos"],
  },
  {
    icon: Sparkles,
    title: "Projetos especiais",
    href: "/servicos/dashboard",
    text: "Soluções digitais sob medida quando o projeto não cabe em uma caixinha.",
    points: ["Discovery técnico", "Arquitetura", "Entrega incremental"],
  },
];

const featuredProjects = [
  {
    name: "Sabrina Lashes",
    category: "Beleza e atendimento",
    href: "/projetos/sabrina-lashes",
    image: "/case-sabrina-lashes.png",
    description:
      "Site profissional para apresentar serviços, reforçar confiança e levar clientes direto ao agendamento.",
    outcomes: ["WhatsApp direto", "Serviços organizados", "Presença profissional"],
  },
  {
    name: "YUME",
    category: "Marca autoral",
    href: "/projetos/yume-moda-disruptiva",
    image: "/case-yume.png",
    description:
      "Vitrine digital com identidade forte para apresentar coleções, editoriais e evoluir para vendas.",
    outcomes: ["Catálogo visual", "Branding premium", "Mobile-first"],
  },
  {
    name: "MB Multimarcas Infantil",
    category: "Moda infantil",
    href: "/projetos/mb-multimarcas-infantil",
    image: "/case-mb-multimarcas-infantil.png",
    description:
      "Catálogo digital com produtos filtráveis e atendimento direto pelo WhatsApp.",
    outcomes: ["Catálogo filtrável", "WhatsApp direto", "Mobile-first"],
  },
];

const processSteps = [
  { title: "Diagnóstico", image: "/card-diagnostico.png" },
  { title: "Arquitetura", image: "/card-arquitetura.png" },
  { title: "Construção", image: "/card-construcao.png" },
  { title: "Lançamento", image: "/card-lancamento.png" },
];

const stackTags = ["Next.js", "TypeScript", "APIs", "PostgreSQL", "Supabase", "Cloudinary", "IA", "Automações"];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const heroSetup = useHeroScene();
  const techSetup = useTechOrbitScene();
  const warpSetup = useWarpCTAScene();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setActive(true);
    setMouse({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActive(false);
    setMouse({ x: 0, y: 0 });
  }, []);

  return (
    <main className="-mt-16 min-h-screen overflow-hidden bg-[#03050a] text-white">
      {/* ═══ HERO ═══ */}
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-[100svh] overflow-hidden"
      >
        {/* Video background */}
        <video
          src="/hero-globe.mp4"
          poster="/hero-poster.jpg"
          preload="auto"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover [&::-webkit-media-controls-start-playback-button]:hidden [&::-webkit-media-controls]:hidden"
          style={{
            opacity: isMobile ? 0.6 : 0.45,
            transform: `scale(1.25) translate(${mouse.x * -8}%, ${mouse.y * -6}%)`,
            transition: active ? "transform 0.12s ease-out" : "transform 0.9s ease-out",
            willChange: "transform",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_34%,rgba(0,212,255,0.22),transparent_34%),radial-gradient(circle_at_88%_56%,rgba(139,92,246,0.18),transparent_28%),linear-gradient(90deg,#03050a_0%,rgba(3,5,10,0.94)_38%,rgba(3,5,10,0.5)_100%)]" />
        <div className="orbit-aurora pointer-events-none absolute inset-0 opacity-40" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03050a] to-transparent" />

        <div className="relative z-10 mx-auto grid h-full w-full max-w-7xl items-center gap-6 px-5 pb-6 pt-20 sm:px-8 lg:grid-cols-[0.52fr_0.48fr] lg:px-10">
          {/* ── Left: copy ── */}
          <div className="flex flex-col justify-center">
            <div className="orbit-glass-badge mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-orbit-electric shadow-[0_0_18px_rgba(0,212,255,0.9)]" />
              Tecnologia sob medida para o seu negócio
            </div>

            <h1 className="max-w-xl font-display text-[1.75rem] font-bold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.65rem] xl:text-[3rem]">
              Sites, sistemas e automações para negócios que querem{" "}
              <span className="bg-gradient-to-r from-orbit-electric via-sky-400 to-orbit-purple bg-clip-text text-transparent">
                vender, organizar e escalar.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">
              Criamos soluções digitais sob medida com design premium, estratégia e tecnologia
              aplicada para transformar presença online em crescimento previsível.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagneticButton strength={0.25}>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="chat-bubble relative inline-flex h-12 items-center gap-2.5 rounded-2xl rounded-bl-sm px-6 font-display text-sm font-semibold text-black transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)", boxShadow: "0 16px 40px rgba(0,212,255,0.22)" }}
                >
                  Solicitar orçamento
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0066FF]">
                    <Plus className="size-3 text-white" strokeWidth={3} />
                  </span>
                </a>
              </MagneticButton>
              <MagneticButton strength={0.25}>
                <Link
                  href="/projetos"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 font-display text-sm font-semibold text-white backdrop-blur-xl transition-colors hover:bg-white/10 sm:w-auto"
                >
                  Ver projetos
                  <ArrowRight className="size-4" />
                </Link>
              </MagneticButton>
            </div>

            <div className="mt-8 flex items-stretch">
              {stats.map((item, i) => (
                <div key={item.label} className={`flex-1 px-4 py-2 ${i > 0 ? "border-l border-white/[0.1]" : ""}`}>
                  <item.icon className="mb-2 size-4 text-orbit-electric/70" strokeWidth={1.5} />
                  <p className="font-display text-lg font-bold text-white">
                    <CountUp value={item.value} />
                  </p>
                  <p className="mt-0.5 text-[11px] leading-tight text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: globe + case cards ── */}
          <div
            className="relative hidden h-full w-full lg:block"
            style={{
              transform: `perspective(1200px) rotateX(${mouse.y * -3}deg) rotateY(${mouse.x * 4}deg)`,
              transition: active ? "transform 0.1s ease-out" : "transform 0.8s ease-out",
              willChange: "transform",
            }}
          >
            {/* Case cards */}
            <div className="relative z-10 h-full">
              {heroCases.map((project, index) => (
                <Link
                  key={project.name}
                  href={project.href}
                  className={`hero-case-card hero-case-card-${index + 1} orbit-tilt-card group block overflow-hidden rounded-2xl border border-white/12 bg-[#07101f]/72 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1.5 hover:border-orbit-electric/35 hover:shadow-[0_28px_90px_rgba(0,0,0,0.5),0_0_30px_rgba(0,212,255,0.12)]`}
                >
                  <span className="orbit-sweep absolute inset-y-0 -left-1/2 z-10 w-1/2 opacity-0 group-hover:opacity-100" />
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${project.accent}`} />
                  <div className="flex items-center gap-5 p-5">
                    <div className="relative aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-xl">
                      <img
                        src={project.image}
                        alt={`Projeto ${project.name}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <h2 className="truncate font-display text-lg font-bold text-white">
                        {project.name}
                      </h2>
                      <p className="mt-0.5 text-sm text-white/48">{project.type}</p>
                      <div className="mt-2.5 flex items-center gap-2 text-sm font-semibold text-white/70">
                        <CheckCircle2 className="size-4 shrink-0 text-orbit-electric" />
                        {project.result}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile: case cards stacked */}
          <div className="flex flex-col gap-3 lg:hidden">
            {heroCases.map((project) => (
              <Link
                key={project.name}
                href={project.href}
                className="group block overflow-hidden rounded-xl border border-white/12 bg-[#07101f]/72 backdrop-blur-2xl transition duration-300 hover:border-orbit-electric/35"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl">
                    <img src={project.image} alt={`Projeto ${project.name}`} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <h2 className="truncate font-display text-base font-bold text-white">{project.name}</h2>
                    <p className="mt-0.5 text-sm text-white/48">{project.type}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/70">
                      <CheckCircle2 className="size-4 shrink-0 text-orbit-electric" />
                      {project.result}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES STRIP ═══ */}
      <ScrollReveal from={{ opacity: 0, y: 15 }} to={{ duration: 0.5 }}>
        <section className="border-y border-white/[0.08] bg-[#070a12]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-5 sm:px-8 lg:grid-cols-4 lg:gap-4 lg:px-10">
            {[
              { icon: Rocket, text: "Velocidade de startup" },
              { icon: Zap, text: "Layout para conversão" },
              { icon: Bot, text: "Automações e IA" },
              { icon: Code2, text: "Pronto para escalar" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5 text-xs text-white/58 sm:text-sm sm:gap-3">
                <item.icon className="size-4 shrink-0 text-orbit-electric" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ SERVICES ═══ */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <ScrollReveal from={{ opacity: 0, y: 20 }} to={{ duration: 0.7 }}>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
                O que fazemos
              </p>
            </ScrollReveal>
            <TextReveal
              as="h2"
              className="mt-4 max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl"
            >
              Empresas não precisam de páginas bonitas. Precisam de resultado.
            </TextReveal>
            <ScrollReveal from={{ opacity: 0, y: 20 }} to={{ duration: 0.6, delay: 0.3 }}>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/50">
                A entrega combina design, código e estratégia para transformar visitantes em contatos,
                clientes e processos funcionando.
              </p>
            </ScrollReveal>

            <ScrollReveal from={{ opacity: 0, y: 30, scale: 0.9 }} to={{ duration: 0.8, delay: 0.5 }}>
              <img
                src="/orbi-tech.png"
                alt="Orbi apresentando servicos"
                className="mx-auto mt-8 hidden w-56 drop-shadow-[0_0_30px_rgba(0,212,255,0.2)] lg:block xl:w-64"
              />
            </ScrollReveal>
          </div>

          <ScrollReveal selectChildren stagger={0.1} from={{ opacity: 0, y: 40, rotateX: 8 }}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <MagneticButton key={service.title} strength={0.12}>
                  <Link
                    href={service.href}
                    className="orbit-tilt-card group relative block overflow-hidden border border-white/[0.08] bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1.5 hover:border-orbit-electric/30 hover:bg-white/[0.065]"
                  >
                    <span className="orbit-sweep absolute inset-y-0 -left-1/2 w-1/2 opacity-0 group-hover:opacity-100" />
                    <service.icon className="relative size-6 text-orbit-electric transition-transform duration-300 group-hover:scale-110" />
                    <h3 className="mt-5 text-xl font-black text-white">{service.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/50">{service.text}</p>
                    <div className="mt-5 space-y-2">
                      {service.points.map((point) => (
                        <div key={point} className="flex items-center gap-2 text-xs text-white/48">
                          <span className="h-1 w-1 rounded-full bg-white/35" />
                          {point}
                        </div>
                      ))}
                    </div>
                    <div className="relative mt-5 text-sm font-bold text-orbit-electric opacity-80 transition-opacity group-hover:opacity-100">
                      Ver solução
                    </div>
                  </Link>
                </MagneticButton>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ FEATURED PROJECTS ═══ */}
      <section className="bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <ScrollReveal from={{ opacity: 0, y: 20 }} to={{ duration: 0.6 }}>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
                  Projetos em destaque
                </p>
              </ScrollReveal>
              <TextReveal
                as="h2"
                className="mt-4 max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl"
              >
                Cases reais para mostrar o que você pode vender melhor.
              </TextReveal>
            </div>
            <ScrollReveal from={{ opacity: 0, x: 20 }} to={{ duration: 0.5 }}>
              <MagneticButton strength={0.2}>
                <Link href="/projetos">
                  <Button
                    variant="outline"
                    className="rounded-md border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    Ver portfólio completo
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </MagneticButton>
            </ScrollReveal>
          </div>

          <ScrollReveal selectChildren stagger={0.15} from={{ opacity: 0, y: 60, scale: 0.93 }}>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <article
                  key={project.name}
                  className="orbit-tilt-card group overflow-hidden border border-white/[0.08] bg-[#070a12] transition duration-300 hover:-translate-y-2 hover:border-orbit-electric/25"
                >
                  <Link href={project.href} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.04]">
                      <img
                        src={project.image}
                        alt={`Case ${project.name}`}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-transparent to-transparent" />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/34">
                        {project.category}
                      </p>
                      <h3 className="mt-2 text-2xl font-black text-white">{project.name}</h3>
                      <p className="mt-3 text-sm leading-6 text-white/52">{project.description}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.outcomes.map((outcome) => (
                          <span
                            key={outcome}
                            className="border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-white/52"
                          >
                            {outcome}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-sm font-bold text-orbit-electric">
                        Ver case
                        <ExternalLink className="size-4" />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
        <div>
          <ScrollReveal from={{ opacity: 0, y: 20 }} to={{ duration: 0.7 }}>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
              Como funciona
            </p>
          </ScrollReveal>
          <TextReveal
            as="h2"
            className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl"
          >
            Um processo direto para sair da ideia e ir para o ar.
          </TextReveal>
          <ScrollReveal from={{ opacity: 0, y: 20 }} to={{ duration: 0.6, delay: 0.3 }}>
            <p className="mt-5 text-base leading-7 text-white/50">
              Você acompanha as decisões importantes sem precisar entender de código, hospedagem ou
              stack técnica.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal selectChildren stagger={0.12} from={{ opacity: 0, y: 50, scale: 0.9 }}>
          <div className="grid gap-4 sm:grid-cols-2">
            {processSteps.map((step) => (
              <article key={step.title} className="group overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-auto rounded-2xl"
                  loading="lazy"
                />
              </article>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ TECH STACK - 3D ═══ */}
      <section className="relative overflow-hidden border-y border-white/[0.08] bg-[#070a12]">
        <div className="orbit-aurora pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
          <div className="max-w-xl">
            <ScrollReveal from={{ opacity: 0, y: 20 }} to={{ duration: 0.7 }}>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
                Engenharia por trás
              </p>
            </ScrollReveal>
            <TextReveal
              as="h2"
              className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl"
            >
              Tecnologia moderna por trás. Simples para o cliente usar.
            </TextReveal>
            <ScrollReveal from={{ opacity: 0, y: 20 }} to={{ duration: 0.6, delay: 0.3 }}>
              <p className="mt-5 text-base leading-7 text-white/55">
                A estrutura combina interface, autenticação, banco de dados e integrações para o cliente operar sem precisar entender a complexidade técnica por baixo.
              </p>
            </ScrollReveal>
          </div>

          {/* 3D Orbit Visualization */}
          <ScrollReveal from={{ opacity: 0, scale: 0.85 }} to={{ duration: 1, delay: 0.2 }}>
            <div className="relative min-h-[500px] overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:min-h-[440px]">
              {!isMobile ? (
                <SpaceCanvas setup={techSetup} />
              ) : (
                /* Mobile fallback: CSS orbit */
                <div className="relative h-full w-full p-5">
                  <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orbit-electric/20 bg-orbit-electric/[0.025] animate-orbit-pulse" />
                  <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orbit-purple/15 animate-orbit-pulse [animation-delay:1.2s]" />
                  <div className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06] animate-orbit-pulse [animation-delay:2.1s]" />
                  <div className="absolute left-1/2 top-1/2 z-10 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/15 bg-[#080b14]/90 text-center shadow-[0_0_70px_rgba(0,212,255,0.16)] backdrop-blur-xl">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orbit-electric/80">Orbitamos</span>
                    <span className="mt-1 text-lg font-black text-white">Core</span>
                    <span className="mt-1 text-[11px] text-white/45">design + código</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-5 left-5 right-5 z-30 flex flex-wrap gap-2">
                {stackTags.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/[0.09] bg-black/35 px-3 py-1.5 text-xs font-semibold text-white/62 backdrop-blur-xl"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ CTA HERO - WARP SPEED ═══ */}
      <section className="relative overflow-hidden">
        {/* 3D warp on desktop, video on mobile */}
        {!isMobile && (
          <div className="absolute inset-0 z-0">
            <SpaceCanvas setup={warpSetup} />
          </div>
        )}
        <video
          src="/cosmos.mp4"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: isMobile ? 0.45 : 0.15 }}
        />
        <div className="absolute inset-0 bg-[#03050a]/65" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 py-24 text-center sm:px-8">
          <ScrollReveal from={{ opacity: 0, scale: 0.7, rotate: 15 }} to={{ duration: 0.8 }}>
            <Sparkles className="mb-5 size-7 text-orbit-electric" />
          </ScrollReveal>
          <TextReveal
            as="h2"
            className="max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl"
          >
            Seu próximo projeto pode estar no ar mais rápido do que você imagina.
          </TextReveal>
          <ScrollReveal from={{ opacity: 0, y: 30 }} to={{ duration: 0.7, delay: 0.5 }}>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/55">
              Landing pages, sites, sistemas e automações sob medida para o seu negócio.
            </p>
          </ScrollReveal>
          <ScrollReveal from={{ opacity: 0, y: 20 }} to={{ duration: 0.6, delay: 0.7 }}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <MagneticButton strength={0.3}>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                  <Button size="lg" className="h-12 rounded-md bg-white px-6 font-bold text-black hover:bg-orbit-electric">
                    <MessageCircle className="size-4" />
                    Solicitar orçamento no WhatsApp
                  </Button>
                </a>
              </MagneticButton>
              <MagneticButton strength={0.3}>
                <Link href="/projetos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-md border-white/15 bg-white/[0.03] px-6 font-bold text-white hover:bg-white/10 hover:text-white"
                  >
                    Ver projetos
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <FloatingWhatsApp page="home" />
    </main>
  );
}
