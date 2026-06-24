"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Layers3,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { Button } from "@/components/ui/button";

const WHATSAPP_URL =
  "https://wa.me/5511949138973?text=Ol%C3%A1%2C+vim+pelo+site+da+Orbitamos+e+quero+fazer+um+or%C3%A7amento";

const stats = [
  { value: "7+", label: "projetos entregues" },
  { value: "até 7 dias", label: "landing pages" },
  { value: "100%", label: "mobile-first" },
  { value: "IA", label: "automações e integrações" },
];

const heroCases = [
  {
    name: "Sabrina Lashes",
    type: "Site institucional",
    result: "Agendamento e WhatsApp",
    href: "/projetos?case=sabrina-lashes",
    image: "/case-sabrina-lashes.png",
    accent: "from-emerald-300 to-cyan-300",
    className: "md:translate-x-5 md:-rotate-2",
  },
  {
    name: "YUME",
    type: "Moda autoral",
    result: "Catálogo premium",
    href: "/projetos?case=yume-moda-disruptiva",
    image: "/case-yume.png",
    accent: "from-violet-300 to-fuchsia-300",
    className: "md:-translate-x-8 md:rotate-2",
  },
  {
    name: "Destaque Multimarcas",
    type: "Estoque digital",
    result: "Filtros e leads",
    href: "/projetos?case=destaque-multimarcas",
    image: "/case-destaque-multimarcas.png",
    accent: "from-amber-200 to-orange-300",
    className: "md:translate-x-8 md:-rotate-1",
  },
];

const services = [
  {
    icon: BarChart3,
    title: "Landing pages",
    text: "Páginas rápidas para campanhas, captação de leads e vendas pelo WhatsApp.",
    points: ["Copy orientada a conversão", "CTA e formulário", "SEO e performance"],
  },
  {
    icon: ShieldCheck,
    title: "Sites profissionais",
    text: "Presença digital profissional para negócios que precisam passar confiança.",
    points: ["Identidade visual", "Serviços claros", "Credibilidade"],
  },
  {
    icon: Layers3,
    title: "Loja digital / E-commerce",
    text: "Vitrine ou catálogo digital para vender melhor e organizar produtos.",
    points: ["Catálogo filtrável", "WhatsApp direto", "Experiência mobile"],
  },
  {
    icon: Code2,
    title: "Sistemas web e MVPs",
    text: "Produtos sob medida para organizar operações, usuários, dados e processos.",
    points: ["Login e dashboards", "Banco de dados", "APIs"],
  },
  {
    icon: Bot,
    title: "Automações, IA e integrações",
    text: "Fluxos inteligentes para reduzir trabalho manual e conectar ferramentas.",
    points: ["IA aplicada", "Integrações", "Processos automáticos"],
  },
  {
    icon: Sparkles,
    title: "Projetos especiais",
    text: "Soluções digitais sob medida quando o projeto não cabe em uma caixinha.",
    points: ["Discovery técnico", "Arquitetura", "Entrega incremental"],
  },
];

const featuredProjects = [
  {
    name: "Sabrina Lashes",
    category: "Beleza e atendimento",
    href: "/projetos?case=sabrina-lashes",
    image: "/case-sabrina-lashes.png",
    description:
      "Site profissional para apresentar serviços, reforçar confiança e levar clientes direto ao agendamento.",
    outcomes: ["WhatsApp direto", "Serviços organizados", "Presença profissional"],
  },
  {
    name: "YUME",
    category: "Marca autoral",
    href: "/projetos?case=yume-moda-disruptiva",
    image: "/case-yume.png",
    description:
      "Vitrine digital com identidade forte para apresentar coleções, editoriais e evoluir para vendas.",
    outcomes: ["Catálogo visual", "Branding premium", "Mobile-first"],
  },
  {
    name: "MB Multimarcas Infantil",
    category: "Moda infantil",
    href: "/projetos?case=mb-multimarcas-infantil",
    image: "/case-mb-multimarcas-infantil.png",
    description:
      "Catalogo digital com produtos filtraveis e atendimento direto pelo WhatsApp.",
    outcomes: ["Catalogo filtravel", "WhatsApp direto", "Mobile-first"],
  },
];

const process = [
  {
    title: "Diagnóstico",
    text: "Entendemos objetivo, público, oferta e o que precisa acontecer para o projeto vender.",
  },
  {
    title: "Arquitetura",
    text: "Definimos páginas, seções, integrações, conteúdo e caminho de conversão.",
  },
  {
    title: "Construção",
    text: "Construímos a experiência com responsividade, performance e acabamento visual.",
  },
  {
    title: "Lançamento",
    text: "Colocamos no ar, revisamos detalhes e deixamos o projeto pronto para campanhas.",
  },
];

const stack = ["Next.js", "TypeScript", "APIs", "PostgreSQL", "Supabase", "Cloudinary", "IA", "Automações"];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
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
    <main className="min-h-screen overflow-hidden bg-[#03050a] text-white">
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[calc(100svh-4rem)] overflow-hidden"
      >
        <video
          ref={videoRef}
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover opacity-55 [&::-webkit-media-controls-start-playback-button]:hidden [&::-webkit-media-controls]:hidden"
          style={{
            transform: `scale(1.08) translate(${mouse.x * -4}%, ${mouse.y * -3}%)`,
            transition: active ? "transform 0.12s ease-out" : "transform 0.9s ease-out",
            willChange: "transform",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(0,212,255,0.20),transparent_34%),radial-gradient(circle_at_88%_76%,rgba(245,158,11,0.12),transparent_26%),linear-gradient(90deg,#03050a_0%,rgba(3,5,10,0.92)_42%,rgba(3,5,10,0.62)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#03050a] to-transparent" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-orbit-electric shadow-[0_0_18px_rgba(0,212,255,0.9)]" />
              Tecnologia sob medida para negócios digitais
            </div>

            <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Sites, sistemas e automações para negócios que querem vender, organizar e escalar.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/58 sm:text-lg">
              Criamos soluções digitais com design premium, estratégia e tecnologia aplicada para
              transformar presença online em resultado real.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-md bg-white px-6 font-bold text-black hover:bg-orbit-electric sm:w-auto"
                >
                  <MessageCircle className="size-4" />
                  Solicitar orçamento
                </Button>
              </a>
              <Link href="/projetos">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-md border-white/15 bg-white/[0.03] px-6 font-bold text-white hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  Ver projetos
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08] sm:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="bg-[#050812]/88 px-4 py-4 backdrop-blur-xl">
                  <p className="text-xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-white/42">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative mx-auto w-full max-w-xl lg:max-w-none"
            style={{
              transform: `perspective(1200px) rotateX(${mouse.y * -3}deg) rotateY(${mouse.x * 4}deg)`,
              transition: active ? "transform 0.1s ease-out" : "transform 0.8s ease-out",
              willChange: "transform",
            }}
          >
            <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orbit-electric/15 bg-orbit-electric/[0.03] blur-sm" />
            <div className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/15 bg-violet-400/[0.04]" />
            <div className="relative flex flex-col gap-4 py-4">
              {heroCases.map((project, index) => (
                <Link
                  key={project.name}
                  href={project.href}
                  className={`group relative overflow-hidden border border-white/10 bg-[#080b14]/86 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition duration-200 hover:-translate-y-1 hover:border-white/20 ${project.className}`}
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${project.accent}`} />
                  <div className="grid grid-cols-[1fr_128px] gap-4 p-4 sm:grid-cols-[1fr_174px]">
                    <div className="flex min-w-0 flex-col justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/34">
                          Case 0{index + 1}
                        </p>
                        <h2 className="mt-2 truncate text-xl font-black text-white sm:text-2xl">
                          {project.name}
                        </h2>
                        <p className="mt-1 text-sm text-white/48">{project.type}</p>
                      </div>
                      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-white/70">
                        <CheckCircle2 className="size-4 text-orbit-electric" />
                        {project.result}
                      </div>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.04]">
                      <img
                        src={project.image}
                        alt={`Projeto ${project.name}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#070a12]">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
          {[
            { icon: Rocket, text: "Projeto no ar com velocidade de startup" },
            { icon: Zap, text: "Layout pensado para conversão e clareza" },
            { icon: Bot, text: "Automações e IA sob medida" },
            { icon: Code2, text: "Estrutura pronta para escalar" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-sm text-white/58">
              <item.icon className="size-4 shrink-0 text-orbit-electric" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
              O que fazemos
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl">
              Empresas não precisam de páginas bonitas. Precisam de resultado.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/50">
              A entrega combina design, código e estratégia para transformar visitantes em contatos,
              clientes e processos funcionando.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="border border-white/[0.08] bg-white/[0.035] p-5 transition hover:border-orbit-electric/25 hover:bg-white/[0.055]"
              >
                <service.icon className="size-6 text-orbit-electric" />
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
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
                Projetos em destaque
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl">
                Cases reais para mostrar o que você pode vender melhor.
              </h2>
            </div>
            <Link href="/projetos">
              <Button
                variant="outline"
                className="rounded-md border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Ver portfolio completo
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <article
                key={project.name}
                className="group overflow-hidden border border-white/[0.08] bg-[#070a12] transition hover:-translate-y-1 hover:border-white/18"
              >
                <Link href={project.href} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.04]">
                    <img
                      src={project.image}
                      alt={`Case ${project.name}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
            Como funciona
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
            Um processo direto para sair da ideia e ir para o ar.
          </h2>
          <p className="mt-5 text-base leading-7 text-white/50">
            Você acompanha as decisões importantes sem precisar entender de código, hospedagem ou
            stack técnica.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {process.map((step, index) => (
            <article key={step.title} className="border border-white/[0.08] bg-white/[0.035] p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-orbit-electric">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Clock3 className="size-4 text-white/30" />
              </div>
              <h3 className="mt-8 text-xl font-black text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/50">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#070a12]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
              Engenharia por trás
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
              Tecnologia moderna por trás. Simples para o cliente usar.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {stack.map((item) => (
              <span
                key={item}
                className="border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/62"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <video
          src="/cosmos.mp4"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[#03050a]/78" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 py-24 text-center sm:px-8">
          <Sparkles className="mb-5 size-7 text-orbit-electric" />
          <h2 className="max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
            Seu próximo projeto pode estar no ar mais rápido do que você imagina.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/55">
            Landing pages, sites, sistemas e automações sob medida para o seu negócio.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              <Button size="lg" className="h-12 rounded-md bg-white px-6 font-bold text-black hover:bg-orbit-electric">
                <MessageCircle className="size-4" />
                Solicitar orçamento no WhatsApp
              </Button>
            </a>
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
          </div>
        </div>
      </section>

      <FloatingWhatsApp page="home" />
    </main>
  );
}
