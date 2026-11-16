"use client";

import Link from "next/link";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import type { LessonGuide } from "@/lib/learningExperience";
import { academyPreviewHref } from "@/lib/portalNavigation";
import LessonQuickQuiz from "./LessonQuickQuiz";

export function LessonSectionHeading({ number, title, subtitle, done }: { number: number; title: string; subtitle: string; done?: boolean }) {
  return <div className="flex items-start gap-3">
    <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-sm font-black ${done ? "bg-emerald-400/15 text-emerald-300" : "bg-orbit-electric/10 text-orbit-electric"}`}>{done ? <Check className="size-4"/> : number}</span>
    <div><h2 className="text-lg font-black leading-tight text-white">{title}</h2><p className="mt-0.5 text-sm text-white/60">{subtitle}</p></div>
  </div>;
}

/** The production lesson and isolated QA preview render the same review/practice. */
export default function LessonStudyPanels({ guide, questions, lessonId, storageKey, quizPerfect, onScoreChange, preview = false }: {
  guide: LessonGuide;
  questions: LessonGuide["quiz"];
  lessonId: string;
  storageKey: string | null;
  quizPerfect: boolean;
  onScoreChange: (correct: number, total: number) => void;
  preview?: boolean;
}) {
  const href = guide.practice?.href;
  return <div data-lesson-study-panels data-guide-origin={guide.origin}>
    {questions.length > 0 && <section id="secao-revisao" className="scroll-mt-24 border-b border-white/[0.07] py-6 sm:py-8">
      <LessonSectionHeading number={2} title="Revise o que aprendeu" subtitle="Responda e confira. Se precisar, consulte o conteúdo e tente novamente." done={quizPerfect}/>
      <div className="mt-5 max-w-3xl"><LessonQuickQuiz key={lessonId} questions={questions} storageKey={storageKey} onScoreChange={onScoreChange}/></div>
    </section>}
    <section id="secao-pratica" className="scroll-mt-24 border-b border-white/[0.07] py-6 sm:py-8">
      <LessonSectionHeading number={questions.length > 0 ? 3 : 2} title={guide.practice ? "Coloque a ideia em prática" : "Continue explorando"} subtitle={guide.practice ? "Leia o pedido, experimente e compare o resultado." : "Esta aula ainda não tem uma prática específica vinculada."}/>
      {guide.practice ? <div className="mt-5 max-w-3xl rounded-2xl bg-orbit-purple/[0.08] p-5" data-authored-lesson-practice>
        <h3 className="text-lg font-black text-white">{guide.practice.title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/65">{guide.practice.description}</p>
        <ul className="mt-4 space-y-1.5">{guide.checklist.map(item => <li key={item} className="flex items-center gap-2 text-xs leading-5 text-white/65"><CheckCircle2 className="size-3.5 shrink-0 text-orbit-purple" aria-hidden="true"/>{item}</li>)}</ul>
        <p className="mt-4 rounded-xl bg-black/25 p-3 text-xs leading-5 text-white/65"><strong className="text-white/80">Entrega esperada:</strong> {guide.practice.deliverable}</p>
        {href && <Link href={preview ? academyPreviewHref(href) : href} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-orbit-electric">Abrir prática desta aula<ArrowRight className="size-3.5"/></Link>}
      </div> : <Link href={preview ? academyPreviewHref("/estudante/pratica") : "/estudante/pratica"} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10">Escolher uma atividade no laboratório<ArrowRight className="size-4"/></Link>}
    </section>
  </div>;
}
