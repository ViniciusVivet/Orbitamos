"use client";

import { useEffect, useState } from "react";
import { Lightbulb, ArrowRight } from "lucide-react";
import { readPracticeAnswer, type PracticeCheck as Check } from "@/lib/practiceExperience";
import s from "./PracticeCheck.module.css";

export default function PracticeCheck({ check, userId, onPractice }: { check: Check; userId: string | number | null; onPractice: () => void }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [ready, setReady] = useState(false);
  const key = userId === null ? null : `orbitamos-practice-check-v1-${userId}-${check.id}`;
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { setAnswer(readPracticeAnswer(key ? localStorage.getItem(key) : null, check)); } catch { setStorageError(true); }
      setReady(true);
    });
    return () => { active = false; };
  }, [check, key]);
  function select(value: number) {
    setAnswer(value);
    if (key) try { localStorage.setItem(key, JSON.stringify({ id: check.id, answer: value })); } catch { setStorageError(true); }
  }
  if (!ready) return null;
  return <section id="practice-check" className={s.check} aria-label="Conferir entendimento" data-practice-check>
    <div className={s.heading}><Lightbulb size={20}/><div><span>DO EXEMPLO PARA UMA NOVA SITUAÇÃO</span><h2>Você consegue prever?</h2></div></div>
    <p>Seu código já passou. Esta pergunta extra ajuda a aplicar a ideia; não muda a conclusão do desafio.</p>
    <pre>{check.code}</pre>
    <fieldset><legend>{check.prompt}</legend>{check.options.map((option, index) => <label key={option} data-selected={answer === index}><input type="radio" name={check.id} value={index} checked={answer === index} onChange={() => select(index)}/><span>{option}</span></label>)}</fieldset>
    <div className={s.response} data-correct={answer === check.answer} role="status">{answer === null ? "Escolha uma alternativa. Se errar, a explicação ajuda a tentar outra vez." : check.feedback[answer]}</div>
    {answer === check.answer && <div className={s.transfer}><strong>Agora, experimente de verdade.</strong><p>{check.experiment}</p><button onClick={onPractice}>Experimentar no modo livre<ArrowRight size={16}/></button><small>Abre seu rascunho separado do modo livre, sem substituir o código desta prática.</small></div>}
    {storageError && <p role="alert">A resposta não pôde ser salva neste navegador. Você ainda pode praticar normalmente.</p>}
  </section>;
}
