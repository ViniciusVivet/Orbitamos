import Image from "next/image";
import { ArrowRight, Flag } from "lucide-react";
import type { Desafio } from "@/lib/desafios";
import { practiceStory } from "@/lib/practiceNarrative";
import { getLaboratoryCover } from "./laboratoryCovers";
import s from "./PracticeBrief.module.css";

export default function PracticeBrief({ challenge, compact = false, onStart, onReview }: { challenge: Desafio; compact?: boolean; onStart?: () => void; onReview?: () => void }) {
  const story = practiceStory(challenge);
  const cover = getLaboratoryCover(challenge.categoria);
  const language = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", csharp: "C#" }[challenge.linguagem];
  return <section className={compact ? s.reminder : s.brief} aria-label={compact ? "Seu objetivo neste desafio" : "Antes de começar"}>
    <div className={s.scene}>
      <div className={s.photo}><Image src={cover.image} alt="" fill sizes={compact ? "110px" : "(max-width: 767px) 100vw, 280px"} placeholder="blur" style={{ objectPosition: cover.position }}/></div>
      <div className={s.copy}><span><Flag size={13}/>{language} / {compact ? "SEU OBJETIVO" : "ANTES DO CÓDIGO"}</span><h2>{story.goal}</h2>{!compact && <p>{story.scene}</p>}{compact && onReview && <button onClick={onReview}>Rever a história da missão</button>}</div>
    </div>
    {!compact && <><ol className={s.flow} aria-label="O que seu programa vai fazer"><li><span>01 / RECEBE</span><strong>{story.input}</strong></li><li><span>02 / FAZ</span><strong>{story.action}</strong></li><li><span>03 / ENTREGA</span><strong>{story.outcome}</strong></li></ol><div className={s.start}><p><strong>Como vamos fazer:</strong> você escreve uma linha, entende o papel dela e segue. O guia muda quando a linha está pronta; a execução continua sendo sua escolha.</p><button onClick={onStart}>Entendi, vamos construir<ArrowRight size={18}/></button></div></>}
  </section>;
}
