import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import type { Desafio } from "@/lib/desafios";
import { beginnerJavaScriptPath, practiceJourney } from "@/lib/practiceExperience";
import { academyPreviewHref } from "@/lib/portalNavigation";
import s from "./PracticeJourney.module.css";

export default function PracticeJourney({ challenge, preview = false }: { challenge: Desafio; preview?: boolean }) {
  const link = (href: string) => preview ? academyPreviewHref(href) : href;
  const journey = practiceJourney(challenge);
  if (journey.index < 0) return null;
  const firstIndex = beginnerJavaScriptPath.findIndex(item => item.slug === challenge.slug);
  const items = firstIndex < 0 ? journey.items : beginnerJavaScriptPath.flatMap(step => journey.items.find(item => item.slug === step.slug) ?? []);
  const index = firstIndex < 0 ? journey.index : firstIndex;
  const language = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", csharp: "C#" }[challenge.linguagem];
  return <details className={s.map} data-practice-map>
    <summary><Map size={18}/><span><small>{firstIndex < 0 ? `${language} / DESAFIO ${index + 1} DE ${items.length}` : `PRIMEIROS PASSOS / ENTREGA ${index + 1} DE ${items.length}`}</small><strong>Agora: {challenge.habilidade ?? challenge.categoria}</strong></span><span className={s.openLabel}>Ver caminho</span></summary>
    <div className={s.content}><p>{firstIndex < 0 ? "Esta é sua posição na sequência sugerida do laboratório, não uma porcentagem da formação. Você pode explorar sem bloquear etapas." : "Quatro entregas até seu primeiro orçamento. Em cada uma: construa com ajuda, faça uma mudança e resolva uma nova situação por conta própria. Você pode consultar o mapa e explorar outras etapas."}</p><ol>{items.map((item, position) => <li key={item.slug}>{item.slug === challenge.slug ? <span aria-current="step"><b>{String(position + 1).padStart(2, "0")}</b><span>{item.titulo}<small>Você está aqui</small></span></span> : <Link href={link(`/estudante/pratica/${item.slug}`)}><b>{String(position + 1).padStart(2, "0")}</b><span>{item.titulo}<small>{item.habilidade}</small></span><ArrowRight size={14}/></Link>}</li>)}</ol><Link className={s.catalog} href={link(`/estudante/pratica?linguagem=${challenge.linguagem}#experimentos`)}>Explorar o catálogo de {language}<ArrowRight size={15}/></Link></div>
  </details>;
}
