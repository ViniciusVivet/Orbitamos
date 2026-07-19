import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjetoBySlug, projetos } from "@/data/projetos";
import CaseHeader from "@/components/projetos/CaseHeader";
import CaseSection from "@/components/projetos/CaseSection";
import ProjetosCTA from "@/components/projetos/ProjetosCTA";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projetos.map((projeto) => ({
    slug: projeto.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const projeto = getProjetoBySlug(slug);
  if (!projeto) return { title: "Projeto não encontrado | Orbitamos" };
  return {
    title: `${projeto.nome} | Case Orbitamos`,
    description: projeto.resumo,
    openGraph: {
      title: `${projeto.nome} | Case Orbitamos`,
      description: projeto.resumo,
      images: [projeto.imagemPrincipal],
    },
  };
}

export default async function ProjetoCasePage({ params }: PageProps) {
  const { slug } = await params;
  const projeto = getProjetoBySlug(slug);
  if (!projeto) notFound();

  return (
    <div className="min-h-screen bg-[#03050a] text-white">
      <CaseHeader projeto={projeto} />

      <div className="border-b border-white/10 bg-[#050812]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm sm:px-8 lg:px-10">
          <Link href="/projetos" className="text-white/55 transition-colors hover:text-white">
            Voltar para projetos
          </Link>
          <div className="flex flex-wrap gap-2">
            {projeto.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="py-12">
        <CaseSection eyebrow="01 / Contexto" title="O ponto de partida" tone="cyan">
          <p>{projeto.contexto}</p>
        </CaseSection>

        <CaseSection eyebrow="02 / Problema" title="O que precisava ser resolvido" tone="neutral">
          <p>{projeto.problema}</p>
        </CaseSection>

        <CaseSection eyebrow="03 / Solução" title="Como a Orbitamos estruturou a entrega" tone="purple">
          <p>{projeto.solucao}</p>
        </CaseSection>

        <section className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orbit-electric/80">
                04 / Resultado
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-white">
                Impacto entregue
              </h2>
              <p className="mt-5 text-base leading-8 text-white/72">{projeto.resultado}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {projeto.destaques.map((destaque, index) => (
                <div key={destaque} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <span className="text-sm font-black text-orbit-electric">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-4 text-sm leading-7 text-white/72">{destaque}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="rounded-2xl border border-white/10 bg-[#070a12] p-6 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orbit-electric/80">
                  05 / Stack
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">Tecnologia usada no projeto</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {projeto.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white/70"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-orbit-electric/20 bg-orbit-electric/[0.05] p-6 sm:p-7 lg:flex-row lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orbit-electric/80">
                Próximo passo
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">Quer uma entrega nessa linha?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
                A Orbitamos cria sites, sistemas e automações sob medida para negócios que precisam vender, organizar e escalar.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {projeto.link && (
                <Button asChild className="rounded-md bg-white px-5 font-bold text-black hover:bg-orbit-electric gap-2">
                  <a href={projeto.link} target="_blank" rel="noreferrer">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Ir para o site
                    <ExternalLink className="size-3.5 opacity-60" />
                  </a>
                </Button>
              )}
              {projeto.github && (
                <Button asChild variant="outline" className="rounded-md border-white/20 text-white hover:bg-white/10">
                  <a href={projeto.github} target="_blank" rel="noreferrer">
                    Ver GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <ProjetosCTA />
    </div>
  );
}
