import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServicoBySlug, servicos } from "@/data/servicos";
import ServiceSalesPage from "@/components/services/ServiceSalesPage";

interface PageProps { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return servicos.map(service => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServicoBySlug(slug);
  if (!service) return { title: "Serviço não encontrado | Orbitamos" };
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/servicos/${service.slug}` },
    openGraph: {
      title: service.metaTitle, description: service.metaDescription,
      url: `https://www.orbitamosbr.com/servicos/${service.slug}`,
      type: "website", locale: "pt_BR", siteName: "Orbitamos",
    },
  };
}

export default async function ServicoPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getServicoBySlug(slug);
  if (!service) notFound();
  return <ServiceSalesPage service={service}/>;
}
