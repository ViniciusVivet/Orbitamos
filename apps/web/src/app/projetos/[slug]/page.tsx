import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjetoBySlug, projetos } from "@/data/projetos";
import ImmersiveCaseStudy from "@/components/projetos/ImmersiveCaseStudy";
import ProjetosCTA from "@/components/projetos/ProjetosCTA";

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
  const currentIndex = projetos.findIndex((item) => item.slug === projeto.slug);
  const nextProjeto = projetos[(currentIndex + 1) % projetos.length];

  return (
    <div className="min-h-screen bg-[#020307] text-white">
      <ImmersiveCaseStudy projeto={projeto} nextProjeto={nextProjeto} />
      <ProjetosCTA />
    </div>
  );
}
