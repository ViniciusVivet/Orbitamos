"use client";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import studyCover from "../../../public/images/academy/codigo-no-celular-v1.webp";
import { ArrowRight, BookOpen, Code2, Compass, Gamepad2 } from "lucide-react";
import { useAcademyActivity } from "./useAcademyActivity";
import { academyPreviewHref } from "@/lib/portalNavigation";
import { getStudyPathStep } from "@/lib/academyStudyPath";
import { useAcademyStudyPath } from "./useAcademyStudyPath";
import AcademyStudyPathPicker from "./AcademyStudyPathPicker";
import s from "./AcademyContinue.module.css";

export default function AcademyContinue({ userId, nextLessonHref, nextLessonTitle, progressSummary, loading = false, preview = false }: { userId?: string | number | null; nextLessonHref?: string; nextLessonTitle?: string; progressSummary?: ReactNode; loading?: boolean; preview?: boolean }) {
  const activity = useAcademyActivity(userId);
  const study = useAcademyStudyPath(userId ?? (preview ? "academy-preview" : null));
  const { data, unavailable } = activity;
  const ready = activity.ready && study.ready;
  const item = data?.continueItem;
  const pending = item && item.status !== "completed";
  const chosenStep = study.choice ? getStudyPathStep(study.choice, data) : null;
  const title = chosenStep?.title ?? (pending ? item.title : item ? item.nextLabel : nextLessonTitle || "Sua primeira linha de código.");
  const href = chosenStep?.href ?? (pending ? item.href : item ? item.nextHref : nextLessonHref || "/estudante/pratica/variaveis-js");
  const link = (target: string) => preview ? academyPreviewHref(target) : target;
  return <section className={s.continue} data-academy-continue aria-label="Seu próximo passo" aria-busy={!ready}>
    <div className={s.intro}><span className={s.eyebrow}>{!ready || loading ? "PREPARANDO SEU ESPAÇO" : chosenStep ? "MINHA TRILHA PRINCIPAL" : pending ? "CONTINUAR DE ONDE PAREI" : item ? "SEU PRÓXIMO PASSO" : nextLessonTitle ? "SUA PRÓXIMA AULA" : "COMECE POR AQUI"}</span>
      <h1>{!ready ? "Encontrando seu próximo passo…" : title}</h1>
    </div>
    <aside className={s.homeScene}><Image src={studyCover} alt="" fill priority placeholder="blur" sizes="(max-width: 480px) 110px, (max-width: 767px) 145px, 35vw"/></aside>
    <div className={s.lead}>
      <p>{chosenStep?.detail ?? (pending ? item.detail : item ? "Você concluiu uma atividade. Agora use a mesma ideia em outro contexto, sem perder o que já fez." : nextLessonTitle ? "Sua sequência de aulas continua aqui. Você também pode experimentar um formato de prática abaixo." : "Leia uma orientação curta, escreva e veja o resultado. Funciona no celular e no computador, sem instalar nada.")}</p>
      {ready ? <Link className={s.primary} href={link(href)}>{chosenStep?.action ?? (pending ? "Retomar atividade" : item ? "Dar o próximo passo" : nextLessonTitle ? "Continuar aula" : "Escrever minha primeira linha")}<ArrowRight size={18}/></Link> : <p role="status">Seu próximo passo está sendo preparado.</p>}
      {unavailable && <small role="status">O histórico local não está disponível. Você pode continuar estudando normalmente.</small>}
    </div>
    {progressSummary && <div className={s.summary}>{progressSummary}</div>}
    <div className={s.explore}>
      <nav className={s.sceneLinks} aria-label="Outras formas de estudar"><Link href={link("/estudante/trilhas")}><Compass size={17}/>Trilhas</Link><Link href={link("/estudante/pratica")}><Code2 size={17}/>Praticar</Link><Link href={link("/estudante/jogos")}><Gamepad2 size={17}/>Jogar</Link><Link href={link("/estudante/aulas")}><BookOpen size={17}/>Aulas</Link></nav>
      <div className={s.preferences}><AcademyStudyPathPicker userId={userId} preview={preview} compact/></div>
      {chosenStep && item && item.href !== chosenStep.href && <details className={s.history}><summary>Última atividade</summary><Link className={s.recent} href={link(item.href)}>{pending ? "Retomar" : "Revisitar"}: {item.title}<ArrowRight size={15}/></Link></details>}
      {!chosenStep && item && !item.lastAt && <p className={s.history}>Sugestão baseada no rascunho deste navegador.</p>}
    </div>
  </section>;
}
