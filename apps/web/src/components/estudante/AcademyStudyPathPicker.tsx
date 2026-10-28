"use client";
import { academyStudyPaths } from "@/lib/academyStudyPath";
import { useAcademyStudyPath } from "./useAcademyStudyPath";
import s from "./AcademyStudyPathPicker.module.css";

export default function AcademyStudyPathPicker({ userId, preview = false, compact = false }: { userId?: string | number | null; preview?: boolean; compact?: boolean }) {
  const { choice, ready, unavailable, choose, canChoose } = useAcademyStudyPath(userId ?? (preview ? "academy-preview" : null));
  if (!canChoose) return null;
  const selected = academyStudyPaths.find(path => path.id === choice);
  const controls = <><p>Sua escolha deixa um atalho na página inicial. Você pode trocar quando quiser.</p><fieldset disabled={!ready}><legend>Qual é sua trilha principal?</legend><div className={s.options}>{academyStudyPaths.map(path => <button key={path.id} type="button" aria-pressed={choice === path.id} onClick={() => choose(path.id)}><strong>{path.title}</strong>{!compact && <span>{path.description}</span>}</button>)}</div></fieldset>{choice && <button type="button" className={s.clear} onClick={() => choose(null)}>Explorar sem uma trilha principal</button>}<small role="status">{unavailable ? "Não foi possível guardar esta escolha. Ela pode ser perdida ao sair desta página." : selected ? `Sua trilha principal: ${selected.title}. Salva neste navegador.` : "Escolha opcional, salva neste navegador."}</small></>;
  return compact ? <details className={`${s.picker} ${s.compact}`} data-study-path-picker><summary>{selected ? `Minha trilha: ${selected.title}` : "Escolher minha trilha principal"}</summary>{controls}</details> : <section className={s.picker} data-study-path-picker aria-label="Sua trilha principal"><h2>Continue por um caminho.</h2>{controls}</section>;
}
