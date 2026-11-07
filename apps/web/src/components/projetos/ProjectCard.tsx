"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CATEGORIAS, STATUS_LABELS, type Projeto } from "@/types/projeto";
import s from "./ProjectCatalog.module.css";

type ProjectVariant = "lead" | "feature" | "compact" | "home";

const selectedStories: Record<string, { label: string; summary: string; detail: string; shortName?: string }> = {
  "sabrina-lashes": {
    label: "Beleza e atendimento",
    summary: "Uma presença profissional para quem já tem clientes para atender.",
    detail: "Serviços bem apresentados, confiança e um caminho direto para o agendamento pelo WhatsApp.",
  },
  "radar-da-rima": {
    label: "Plataforma de cultura e eventos",
    summary: "Da descoberta de uma batalha à organização de cada edição.",
    detail: "Mapa, perfis de MCs e gestão de eventos conectados no mesmo produto.",
  },
  "yume-moda-disruptiva": {
    label: "Moda autoral",
    summary: "Uma vitrine com a mesma personalidade das peças.",
    detail: "Coleções em destaque, identidade de marca e uma estrutura para evoluir a experiência de compra.",
    shortName: "YUME",
  },
};

export default function ProjectCard({ projeto, variant = "compact" }: { projeto: Projeto; variant?: ProjectVariant }) {
  const category = CATEGORIAS.find((item) => item.slug === projeto.categoria)?.label;
  const summaryId = `project-${projeto.slug}-summary`;
  const story = variant === "compact" ? undefined : selectedStories[projeto.slug];
  const sizes = variant === "lead"
    ? "(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 56vw, 680px"
    : variant === "compact"
      ? "(max-width: 639px) 100px, 160px"
      : variant === "home"
        ? "(max-width: 639px) calc(100vw - 40px), (max-width: 1280px) 33vw, 390px"
        : "(max-width: 767px) calc(100vw - 40px), (max-width: 1280px) 50vw, 590px";

  return (
    <article className={`${s.card} ${s[variant]}`} data-project-card={projeto.slug} data-project-variant={variant}>
      <Link href={`/projetos/${projeto.slug}`} className={s.primary} aria-label={`Explorar case ${projeto.nome}`} aria-describedby={summaryId}>
        <div className={s.image}>
          <Image src={projeto.thumbnail} alt={`Prévia de ${projeto.nome}`} fill sizes={sizes} />
        </div>
        <div className={s.body}>
          <div className={s.meta}>
            <span>{story?.label ?? category}</span>
            {variant !== "home" && variant !== "compact" && <span className={s.status} data-status={projeto.status}>{STATUS_LABELS[projeto.status]}</span>}
          </div>
          <h3 className={s.title}>{variant === "home" ? story?.shortName ?? projeto.nome : projeto.nome}<ArrowUpRight aria-hidden="true" /></h3>
          <p id={summaryId} className={s.summary}>{story?.summary ?? projeto.resumo}</p>
          {story && variant !== "home" && <p className={s.detail}>{story.detail}</p>}
          <span className={s.caseLink}>Ver case<ArrowRight aria-hidden="true" /></span>
        </div>
      </Link>
    </article>
  );
}
