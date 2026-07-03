import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProjetoBySlug } from "@/data/projetos";
import { getServicoBySlug, servicos } from "@/data/servicos";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const WHATSAPP_BASE = "https://wa.me/5511949138973";

function whatsappUrl(text: string) {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(text)}`;
}

export function generateStaticParams() {
  return servicos.map((servico) => ({
    slug: servico.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const servico = getServicoBySlug(slug);
  if (!servico) return { title: "Serviço não encontrado | Orbitamos" };

  return {
    title: servico.metaTitle,
    description: servico.metaDescription,
    alternates: {
      canonical: `/servicos/${servico.slug}`,
    },
    openGraph: {
      title: servico.metaTitle,
      description: servico.metaDescription,
      url: `https://www.orbitamosbr.com/servicos/${servico.slug}`,
      type: "website",
      locale: "pt_BR",
      siteName: "Orbitamos",
    },
  };
}

export default async function ServicoPage({ params }: PageProps) {
  const { slug } = await params;
  const servico = getServicoBySlug(slug);
  if (!servico) notFound();

  const relatedProjects = servico.relatedProjects
    .map(getProjetoBySlug)
    .filter(Boolean);
  const wa = whatsappUrl(servico.whatsappText);

  return (
    <main className="min-h-screen bg-[#03050a] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(0,212,255,0.18),transparent_32%),radial-gradient(circle_at_18%_70%,rgba(139,92,246,0.16),transparent_30%),linear-gradient(180deg,#050812_0%,#03050a_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-20">
          <div>
            <Link href="/" className="text-sm font-semibold text-white/45 transition-colors hover:text-white">
              Orbitamos Studio
            </Link>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
              {servico.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              {servico.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
              {servico.subheadline}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={wa} target="_blank" rel="noreferrer">
                <Button size="lg" className="h-12 w-full rounded-md bg-white px-6 font-bold text-black hover:bg-orbit-electric sm:w-auto">
                  <MessageCircle className="size-4" />
                  Pedir orçamento agora
                </Button>
              </a>
              <Link href="/projetos">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-md border-white/15 bg-white/[0.03] px-6 font-bold text-white hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  Ver projetos reais
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>

          <aside className="relative border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orbit-electric to-orbit-purple" />
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/38">
              Oferta sem enrolação
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">{servico.nome}</h2>
            <p className="mt-4 text-sm leading-7 text-white/58">{servico.promessa}</p>
            <div className="mt-6 grid gap-3">
              {servico.resultados.map((item) => (
                <div key={item} className="flex gap-3 border border-white/10 bg-black/20 p-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-orbit-electric" />
                  <span className="text-sm leading-6 text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
            O problema
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
            Por que isso trava venda?
          </h2>
          <p className="mt-5 text-base leading-8 text-white/62">{servico.dor}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {servico.idealPara.map((item) => (
            <div key={item} className="border border-white/10 bg-white/[0.035] p-5">
              <Target className="size-5 text-orbit-electric" />
              <p className="mt-4 text-sm leading-6 text-white/70">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
                O que entra na entrega
              </p>
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                Escopo claro para sair do improviso.
              </h2>
            </div>
            <a href={wa} target="_blank" rel="noreferrer" className="text-sm font-bold text-orbit-electric hover:text-white">
              Quero esse escopo →
            </a>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {servico.entregaveis.map((item) => (
              <div key={item} className="flex gap-3 border border-white/10 bg-[#070a12] p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-orbit-electric" />
                <p className="text-sm leading-6 text-white/68">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
              Processo
            </p>
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
              Direto para vender, sem teatro de agência.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {servico.processo.map((step, index) => (
              <article key={step.titulo} className="border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-orbit-electric">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Clock3 className="size-4 text-white/30" />
                </div>
                <h3 className="mt-7 text-xl font-black text-white">{step.titulo}</h3>
                <p className="mt-3 text-sm leading-6 text-white/56">{step.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {relatedProjects.length > 0 && (
        <section className="bg-white/[0.025]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-orbit-electric/80">
                  Prova real
                </p>
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                  Projetos nessa linha.
                </h2>
              </div>
              <Link href="/projetos" className="text-sm font-bold text-orbit-electric hover:text-white">
                Ver portfólio completo →
              </Link>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {relatedProjects.map((projeto) => (
                <Link
                  key={projeto!.slug}
                  href={`/projetos/${projeto!.slug}`}
                  className="group overflow-hidden border border-white/10 bg-[#070a12] transition duration-300 hover:-translate-y-1 hover:border-orbit-electric/30"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-white/[0.04]">
                    <img
                      src={projeto!.thumbnail}
                      alt={`Case ${projeto!.nome}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/34">
                      Case Orbitamos
                    </p>
                    <h3 className="mt-2 text-xl font-black text-white">{projeto!.nome}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/54">{projeto!.resumo}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="text-center">
          <Sparkles className="mx-auto mb-4 size-6 text-orbit-electric" />
          <h2 className="text-3xl font-black text-white sm:text-4xl">Perguntas antes de chamar</h2>
        </div>
        <div className="mt-8 grid gap-3">
          {servico.faq.map((item) => (
            <details key={item.pergunta} className="group border border-white/10 bg-white/[0.035] p-5">
              <summary className="cursor-pointer list-none text-base font-bold text-white">
                {item.pergunta}
              </summary>
              <p className="mt-3 text-sm leading-7 text-white/58">{item.resposta}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.16),transparent_36%),linear-gradient(180deg,#070a12_0%,#03050a_100%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 py-16 text-center sm:px-8">
          <h2 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
            Se isso resolve seu problema, vamos falar de prazo e escopo.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/58">
            Me chama no WhatsApp com o tipo de projeto. Eu te respondo com as perguntas certas para chegar em uma proposta enxuta.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={wa} target="_blank" rel="noreferrer">
              <Button size="lg" className="h-12 rounded-md bg-white px-6 font-bold text-black hover:bg-orbit-electric">
                <MessageCircle className="size-4" />
                Pedir orçamento no WhatsApp
              </Button>
            </a>
            <Link href="/contato">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-md border-white/15 bg-white/[0.03] px-6 font-bold text-white hover:bg-white/10 hover:text-white"
              >
                Preencher formulário
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
