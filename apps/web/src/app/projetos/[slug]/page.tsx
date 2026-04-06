import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjetoBySlug } from "@/data/projetos";
import CaseHeader from "@/components/projetos/CaseHeader";
import CaseSection from "@/components/projetos/CaseSection";
import ProjetosCTA from "@/components/projetos/ProjetosCTA";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const projeto = getProjetoBySlug(slug);
  if (!projeto) return { title: "Projeto não encontrado | Orbitamos" };
  return {
    title: `${projeto.nome} | Orbitamos`,
    description: projeto.contexto ?? `Conheça o case ${projeto.nome} desenvolvido pela Orbitamos.`,
  };
}

export default async function ProjetoCasePage({ params }: PageProps) {
  const { slug } = await params;
  const projeto = getProjetoBySlug(slug);
  if (!projeto) notFound();

  return (
    <div className="min-h-screen bg-black text-white">
      <CaseHeader projeto={projeto} />
      <CaseSection title="Contexto do projeto">
        <p>{projeto.contexto}</p>
      </CaseSection>
      <CaseSection title="Problema a ser resolvido">
        <p>{projeto.problema}</p>
      </CaseSection>
      <CaseSection title="Solução construída pela Orbitamos">
        <p>{projeto.solucao}</p>
      </CaseSection>
      <CaseSection title="Destaques do projeto">
        <ul>
          {projeto.destaques.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </CaseSection>
      <CaseSection title="Stack usada">
        <p className="flex flex-wrap gap-2">
          {projeto.stack.map((s) => (
            <span
              key={s}
              className="rounded bg-white/10 px-2.5 py-1 text-sm text-white/90"
            >
              {s}
            </span>
          ))}
        </p>
      </CaseSection>
      <CaseSection title="Resultado / impacto">
        <p>{projeto.resultado}</p>
      </CaseSection>
      <section className="border-b border-white/10 py-10 md:py-14">
        <div className="container mx-auto px-4 flex flex-wrap items-center gap-4">
          {projeto.link && (
            <Button
              asChild
              className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:from-orbit-purple hover:to-orbit-electric"
            >
              <a href={projeto.link} target="_blank" rel="noreferrer">
                Visitar projeto
              </a>
            </Button>
          )}
          {projeto.github && (
            <Button asChild variant="outline" className="border-white/25 text-white hover:bg-white/10">
              <a href={projeto.github} target="_blank" rel="noreferrer">
                Ver no GitHub
              </a>
            </Button>
          )}
          <ProjetosCTA variant="inline" />
        </div>
      </section>
      <div className="py-6 text-center">
        <Button asChild variant="ghost" className="text-white/70 hover:text-white">
          <Link href="/projetos">← Voltar para projetos</Link>
        </Button>
      </div>
      <ProjetosCTA />
    </div>
  );
}
