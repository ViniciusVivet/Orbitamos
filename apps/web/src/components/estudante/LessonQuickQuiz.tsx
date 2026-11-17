"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { LessonGuide } from "@/lib/learningExperience";

type QuizQuestion = LessonGuide["quiz"][number];

export default function LessonQuickQuiz({ questions, storageKey, onScoreChange }: {
  questions: QuizQuestion[];
  storageKey: string | null;
  onScoreChange?: (correct: number, total: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    if (!storageKey || typeof window === "undefined") return {};
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch { return {}; }
  });
  const [navigation, setNavigation] = useState(() => {
    const pending = questions.findIndex((question, index) => answers[index] !== question.answer);
    return { index: pending >= 0 ? pending : Math.max(0, questions.length - 1), focus: false };
  });
  const root = useRef<HTMLDivElement>(null);
  const legend = useRef<HTMLLegendElement>(null);
  const callback = useRef(onScoreChange);
  useEffect(() => { callback.current = onScoreChange; }, [onScoreChange]);
  const correct = questions.filter((question, index) => answers[index] === question.answer).length;
  const answered = questions.filter((_, index) => Object.prototype.hasOwnProperty.call(answers, index)).length;
  useEffect(() => { callback.current?.(correct, questions.length); }, [correct, questions.length]);
  useLayoutEffect(() => {
    if (!navigation.focus) return;
    legend.current?.focus({ preventScroll: true });
    root.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [navigation]);

  const index = Math.min(navigation.index, Math.max(0, questions.length - 1));
  const question = questions[index];
  if (!question) return null;
  const selected = answers[index];
  const selectedIsCorrect = selected === question.answer;
  const complete = correct === questions.length;
  const nextPending = questions.findIndex((item, at) => at > index && answers[at] !== item.answer);
  const anyPending = questions.findIndex((item, at) => answers[at] !== item.answer);
  const nextIndex = nextPending >= 0 ? nextPending : anyPending;
  const move = (next: number) => setNavigation({ index: next, focus: true });
  const select = (option: string) => {
    if (selectedIsCorrect) return;
    const next = { ...answers, [index]: option };
    setAnswers(next);
    if (storageKey) { try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep the current review usable when storage is unavailable. */ } }
  };
  const reset = () => {
    setAnswers({}); move(0);
    if (storageKey) { try { localStorage.removeItem(storageKey); } catch { /* In-memory reset remains available. */ } }
  };
  return <div ref={root} className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5" data-lesson-quiz>
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-bold text-white/75">Pergunta {index + 1} de {questions.length}</p>
      {answered > 0 && <button type="button" onClick={reset} className="flex min-h-11 items-center gap-1.5 rounded-full border border-white/15 px-3 text-xs font-bold text-white/70 hover:bg-white/5"><RotateCcw className="size-3"/>Refazer</button>}
    </div>
    <nav className="my-4 flex gap-2 overflow-x-auto pb-1" aria-label="Perguntas do quiz">{questions.map((item, at) => <button key={at} type="button" onClick={() => move(at)} aria-label={`Pergunta ${at + 1}`} aria-current={at === index ? "step" : undefined} className={`grid min-h-11 min-w-11 shrink-0 place-items-center rounded-xl border text-sm font-bold ${answers[at] === item.answer ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-200" : at === index ? "border-orbit-electric bg-orbit-electric/10 text-white" : "border-white/20 text-white/70"}`}>{at + 1}</button>)}</nav>
    <fieldset>
      <legend ref={legend} tabIndex={-1} className="text-sm font-bold leading-6 text-white/90 focus:outline-none">{question.question}</legend>
      {question.code && <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-black/35 p-3 text-sm leading-6 text-white/85"><code>{question.code}</code></pre>}
      <div className="mt-3 space-y-2">{question.options.map((option, optionIndex) => {
        const isSelected = selected === option;
        const revealed = selectedIsCorrect && isSelected;
        return <button key={option} type="button" disabled={selectedIsCorrect} onClick={() => select(option)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${revealed ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100" : isSelected ? "border-red-400/50 bg-red-400/10 text-red-100" : "border-white/15 bg-black/25 text-white/75 hover:border-orbit-electric/35 disabled:cursor-default"}`}>
          <span className={`grid size-7 shrink-0 place-items-center rounded-lg border text-xs font-black ${revealed ? "border-emerald-300 bg-emerald-300 text-black" : isSelected ? "border-red-300 bg-red-300 text-black" : "border-white/20 bg-white/5 text-white/70"}`}>{["A", "B", "C", "D"][optionIndex] ?? optionIndex + 1}</span>
          <span className="flex-1">{option}</span>
          {revealed && <CheckCircle2 className="size-5 shrink-0 text-emerald-300" aria-label="Resposta correta"/>}
          {isSelected && !selectedIsCorrect && <XCircle className="size-5 shrink-0 text-red-300" aria-label="Resposta incorreta"/>}
        </button>;
      })}</div>
      {selected && <div role="status" className={`mt-3 rounded-xl border p-3 text-sm leading-6 ${selectedIsCorrect ? "border-emerald-400/20 bg-emerald-400/[.07] text-emerald-100/85" : "border-amber-400/20 bg-amber-400/[.07] text-amber-100/85"}`}>
        <strong className="text-white">{selectedIsCorrect ? "Correto." : "Ainda não."}</strong>{" "}{selectedIsCorrect ? question.explanation ?? `“${question.answer}” responde ao pedido desta questão.` : question.hint ?? "Releia o pedido e compare as opções. Se precisar, consulte o material e tente novamente."}
      </div>}
    </fieldset>
    {selectedIsCorrect && !complete && nextIndex >= 0 && <button type="button" onClick={() => move(nextIndex)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black">Próxima pergunta<ArrowRight className="size-4"/></button>}
    {complete && <div className="mt-5 rounded-xl border border-emerald-400/25 bg-emerald-400/[.07] p-3 text-sm text-emerald-100" data-quiz-complete>
      <p className="font-bold">Revisão completa</p><p className="mt-1">{correct} de {questions.length} corretas. Agora leve a ideia ao código.</p>
      <a href="#secao-pratica" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-black">Ir para a prática<ArrowRight className="size-4"/></a>
    </div>}
  </div>;
}
