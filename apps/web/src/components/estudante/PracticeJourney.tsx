import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import type { Desafio } from "@/lib/desafios";
import { practiceJourney } from "@/lib/practiceExperience";
import s from "./PracticeJourney.module.css";

export default function PracticeJourney({ challenge }: { challenge: Desafio }) {
  const journey = practiceJourney(challenge);
  if (journey.index < 0) return null;
  const language = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", csharp: "C#" }[challenge.linguagem];
  return <details className={s.map} data-practice-map>
    <summary><Map size={18}/><span><small>{language} / DESAFIO {journey.index + 1} DE {journey.items.length}</small><strong>Agora: {challenge.habilidade ?? challenge.categoria}</strong></span><span className={s.openLabel}>Ver caminho</span></summary>
    <div className={s.content}><p>Esta é sua posição na sequência sugerida do laboratório, não uma porcentagem da formação. Você pode explorar sem bloquear etapas.</p><ol>{journey.items.map((item, index) => <li key={item.slug}>{item.slug === challenge.slug ? <span aria-current="step"><b>{String(index + 1).padStart(2, "0")}</b><span>{item.titulo}<small>Você está aqui</small></span></span> : <Link href={`/estudante/pratica/${item.slug}`}><b>{String(index + 1).padStart(2, "0")}</b><span>{item.titulo}<small>{item.habilidade}</small></span><ArrowRight size={14}/></Link>}</li>)}</ol><Link className={s.catalog} href={`/estudante/pratica?linguagem=${challenge.linguagem}#experimentos`}>Explorar o catálogo de {language}<ArrowRight size={15}/></Link></div>
  </details>;
}
