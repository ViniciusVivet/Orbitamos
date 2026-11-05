"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { CATEGORIAS, STATUS_LABELS, type Projeto } from "@/types/projeto";
import s from "./ProjectCatalog.module.css";

export default function ProjectCard({ projeto, featured = false }: { projeto: Projeto; featured?: boolean }) {
  const category = CATEGORIAS.find((item) => item.slug === projeto.categoria)?.label;
  const summaryId = `project-${projeto.slug}-summary`;

  return (
    <article className={`${s.card} ${featured ? s.featured : ""}`} data-project-card={projeto.slug}>
      <Link href={`/projetos/${projeto.slug}`} className={s.primary} aria-label={`Explorar case ${projeto.nome}`} aria-describedby={summaryId}>
        <div className={s.image}>
          <Image src={projeto.thumbnail} alt={`Prévia de ${projeto.nome}`} fill sizes={featured ? "(max-width: 639px) 100vw, (max-width: 1280px) 50vw, 610px" : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1280px) 33vw, 390px"} />
        </div>
        <div className={s.body}>
          <div className={s.meta}><span>{category}</span><span className={s.status} data-status={projeto.status}>{STATUS_LABELS[projeto.status]}</span></div>
          <h3 className={s.title}>{projeto.nome}<ArrowUpRight aria-hidden="true" /></h3>
          <p id={summaryId} className={s.summary}>{projeto.resumo}</p>
          <span className={s.caseLink}>Explorar case<ArrowRight aria-hidden="true" /></span>
        </div>
      </Link>
      {projeto.link && <div className={s.cardFooter}>
        <a href={projeto.link} target="_blank" rel="noreferrer" aria-label={`Visitar site de ${projeto.nome} (abre em outra aba)`}>Visitar site<ExternalLink aria-hidden="true" /></a>
      </div>}
    </article>
  );
}
