"use client";
import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Compass, Gamepad2 } from "lucide-react";
import { useAcademyActivity } from "./useAcademyActivity";
import { academyPreviewHref } from "@/lib/portalNavigation";
import s from "./AcademyContinue.module.css";

export default function AcademyContinue({ userId, nextLessonHref, nextLessonTitle, loading = false, preview = false }: { userId?: string | number | null; nextLessonHref?: string; nextLessonTitle?: string; loading?: boolean; preview?: boolean }) {
  const { data, ready, unavailable } = useAcademyActivity(userId);
  const item = data?.continueItem;
  const pending = item && item.status !== "completed";
  const title = pending ? item.title : item ? item.nextLabel : nextLessonTitle || "Sua primeira linha de código.";
  const href = pending ? item.href : item ? item.nextHref : nextLessonHref || "/estudante/pratica/variaveis-js";
  const link = (target: string) => preview ? academyPreviewHref(target) : target;
  return <section className={s.continue} data-academy-continue aria-label="Seu próximo passo" aria-busy={!ready}>
    <div className={s.lead}><span className={s.eyebrow}>{!ready || loading ? "PREPARANDO SEU ESPAÇO" : pending ? "CONTINUAR DE ONDE PAREI" : item ? "DA DESCOBERTA À APLICAÇÃO" : nextLessonTitle ? "SUA PRÓXIMA AULA" : "NUNCA PROGRAMOU? COMECE AQUI"}</span>
      <h1>{!ready ? "Encontrando seu próximo passo…" : title}</h1>
      <p>{pending ? item.detail : item ? "Você concluiu uma atividade. Agora use a mesma ideia em outro contexto, sem perder o que já fez." : nextLessonTitle ? "Sua sequência de aulas continua aqui. Você também pode experimentar um formato de prática abaixo." : "Leia uma orientação curta, escreva e veja o resultado. Funciona no celular e no computador, sem instalar nada."}</p>
      {ready ? <Link className={s.primary} href={link(href)}>{pending ? "Retomar atividade" : item ? "Dar o próximo passo" : nextLessonTitle ? "Continuar aula" : "Escrever minha primeira linha"}<ArrowRight size={18}/></Link> : <p role="status">Seu próximo passo está sendo preparado.</p>}
      {item && <small>{item.lastAt ? "Retomada sugerida pelo registro disponível neste navegador." : "Atividade salva sem horário de edição. Esta é uma sugestão de retomada, não um histórico cronológico."}</small>}
      {unavailable && <small role="status">O histórico local não está disponível. Você pode continuar estudando normalmente.</small>}
    </div>
    <aside className={s.choices}><p>SEU ESPAÇO DE ESTUDO</p><Link href={link("/estudante/trilhas")}><Compass size={20}/><span><strong>Meu caminho</strong><small>Veja o mapa e escolha sua direção.</small></span><ArrowRight size={15}/></Link><Link href={link("/estudante/pratica")}><Code2 size={20}/><span><strong>Laboratório de código</strong><small>Orientação e editor para praticar.</small></span><ArrowRight size={15}/></Link><Link href={link("/estudante/jogos")}><Gamepad2 size={20}/><span><strong>Jogos e descobertas</strong><small>Lógica, dados, inglês e revisão.</small></span><ArrowRight size={15}/></Link><Link href={link("/estudante/aulas")}><BookOpen size={20}/><span><strong>Biblioteca de aulas</strong><small>Consulte os conteúdos no seu ritmo.</small></span><ArrowRight size={15}/></Link></aside>
  </section>;
}
