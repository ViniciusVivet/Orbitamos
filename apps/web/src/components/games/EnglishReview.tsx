import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, RotateCcw } from "lucide-react";
import { getSpeakingLesson } from "@/lib/spokenEnglish";
import type { EnglishReviewSession } from "@/lib/englishReview";
import s from "./EnglishReview.module.css";

type Props = {
  session: EnglishReviewSession;
  storageError: boolean;
  onDraft: (value: string) => void;
  onModel: () => void;
  onSubmit: () => { ok: boolean; message: string };
  onNext: () => void;
  onClose: () => void;
  onAgain: () => void;
};

export default function EnglishReview({ session, storageError, onDraft, onModel, onSubmit, onNext, onClose, onAgain }: Props) {
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const finished = session.cursor === session.ids.length;
  const lesson = getSpeakingLesson(session.ids[Math.min(session.cursor, session.ids.length - 1)])!;
  const answered = !finished && session.results.length > session.cursor;
  const assisted = session.results.filter(result => result.helped).length;

  useEffect(() => {
    const frame = requestAnimationFrame(() => heading.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answered) {
      const result = onSubmit(); setFeedback(result);
      if (result.ok) input.current?.blur();
    }
  }
  function consult() { onModel(); requestAnimationFrame(() => input.current?.focus()); }

  return <section className={s.root} data-spoken-english data-english-review data-review-lesson-id={finished ? undefined : lesson.id} data-review-stage={finished ? "finished" : "question"}>
    <header className={s.header}><button data-review-close onClick={onClose}><ArrowLeft size={15}/> Voltar à fala</button><span>REVISÃO CURTA · {finished ? session.ids.length : session.cursor + 1}/{session.ids.length}</span></header>
    {finished ? <div className={s.finish} data-review-finished>
      <Image src="/orbi-tech.png" width={130} height={150} alt="Orbi acompanha a revisão"/>
      <p className={s.eyebrow}>UM POUCO DE CADA VEZ</p><h1 ref={heading} tabIndex={-1}>Revisão feita.</h1>
      <div className={s.results}><div data-review-without-model><strong>{session.results.length - assisted}</strong><span>sem abrir o modelo</span></div><div data-review-with-model><strong>{assisted}</strong><span>com apoio do modelo</span></div></div>
      <p>Esses registros descrevem esta revisão. Volte em outro momento para tentar lembrar de novo.</p>
      <div className={s.finishActions}><button className={s.primary} data-review-finish-close onClick={onClose}>Voltar à prática <ArrowRight size={17}/></button><button className={s.secondary} data-review-again onClick={onAgain}><RotateCcw size={16}/> Outra revisão curta</button></div>
    </div> : <>
      <div className={s.titleRow}><div><p className={s.eyebrow}>REVISÃO POR ESCRITA</p><h1 ref={heading} tabIndex={-1}>Você lembra?</h1></div><div className={s.steps} role="group" aria-label={`Item ${session.cursor + 1} de ${session.ids.length}`}>{session.ids.map((id, index) => <span key={id} data-state={index < session.results.length ? "done" : index === session.cursor ? "current" : "waiting"}>{index < session.results.length ? <Check size={12} aria-hidden="true"/> : index + 1}</span>)}</div></div>
      <div className={s.workspace}>
        <div className={s.cueCard}><span className={s.paperClip} aria-hidden="true"/><small>A PISTA EM PORTUGUÊS</small><strong data-review-cue>{lesson.pt}</strong><div className={s.coach}><Image src="/orbi-tech.png" width={92} height={108} alt=""/><p>{answered ? "Você trouxe a expressão de volta." : session.consulted ? "Use o modelo como apoio e escreva a expressão." : "Antes de abrir o modelo, veja o que consegue lembrar."}</p></div></div>
        <form className={s.answer} onSubmit={check}>
          <label htmlFor="english-review-answer">Escreva em inglês</label>
          {(session.consulted || answered) && <div className={s.model}><small>{session.consulted ? "MODELO CONSULTADO" : "EXPRESSÃO DA AULA"}</small><strong lang="en-US" data-review-expression>{lesson.en}</strong></div>}
          <input ref={input} id="english-review-answer" value={session.draft} onChange={event => { onDraft(event.target.value); setFeedback(null); }} readOnly={answered} maxLength={160} autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false} lang="en-US" enterKeyHint="done" placeholder="Tente lembrar…" aria-describedby="english-review-note"/>
          <div className={s.actions}>{answered ? <button className={s.primary} type="button" data-review-next onClick={onNext}>{session.cursor + 1 === session.ids.length ? "Ver como foi" : "Próxima expressão"}<ArrowRight size={17}/></button> : <button className={s.primary} data-review-submit type="submit" disabled={!session.draft.trim()}>Conferir <Check size={17}/></button>}{!answered && <button className={s.secondary} data-review-model type="button" disabled={session.consulted} onClick={consult}><Eye size={17}/>{session.consulted ? "Modelo aberto" : "Ver modelo"}</button>}</div>
          <p id="english-review-note" className={s.note}>A expressão da aula, com ou sem ponto final.</p>
          {(answered || feedback) && <div role="status" className={s.feedback} data-correct={answered || feedback?.ok}>{answered ? "Expressão recuperada. Siga quando quiser." : feedback?.message}</div>}
        </form>
      </div>
      <p className={s.footer}>Seu rascunho e o uso do modelo ficam neste navegador. Sua voz não está sendo gravada ou avaliada.</p>
    </>}
    {storageError && <p role="alert" className={s.storageWarning}>O navegador não conseguiu guardar esta revisão. Ela está apenas nesta tela.</p>}
  </section>;
}
