"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

type QuizQuestion = { question: string; options: string[]; answer: string };

export default function LessonQuickQuiz({
  questions,
  storageKey,
}: {
  questions: QuizQuestion[];
  storageKey: string | null;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    if (!storageKey || typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "{}") as Record<number, string>;
    } catch {
      return {};
    }
  });
  const letters = ["A", "B", "C", "D"];
  const answered = Object.keys(answers).length;
  const correct = questions.filter((question, index) => answers[index] === question.answer).length;

  const select = (index: number, option: string) => {
    if (answers[index] === questions[index]?.answer) return;
    const next = { ...answers, [index]: option };
    setAnswers(next);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const reset = () => {
    setAnswers({});
    if (storageKey) localStorage.removeItem(storageKey);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/38">Quiz rápido</p>
          <h2 className="mt-1 text-lg font-black text-white">Confira se a ideia ficou clara</h2>
        </div>
        {answered > 0 && (
          <button type="button" onClick={reset} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold text-white/45 hover:bg-white/5 hover:text-white">
            <RotateCcw className="size-3" /> Refazer
          </button>
        )}
      </div>

      <div className="mt-5 space-y-6">
        {questions.map((question, questionIndex) => {
          const selected = answers[questionIndex];
          const selectedIsCorrect = selected === question.answer;
          return (
            <fieldset key={question.question}>
              <legend className="text-sm font-bold leading-6 text-white/85">{question.question}</legend>
              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selected === option;
                  const revealedCorrect = selectedIsCorrect && option === question.answer;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={selectedIsCorrect}
                      onClick={() => select(questionIndex, option)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                        revealedCorrect
                          ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100"
                          : isSelected
                            ? "border-red-400/50 bg-red-400/10 text-red-100"
                            : "border-white/10 bg-black/25 text-white/65 hover:border-orbit-electric/35 hover:bg-white/5 disabled:cursor-default"
                      }`}
                    >
                      <span className={`grid size-7 shrink-0 place-items-center rounded-lg border text-xs font-black ${
                        revealedCorrect ? "border-emerald-300 bg-emerald-300 text-black" : isSelected ? "border-red-300 bg-red-300 text-black" : "border-white/15 bg-white/5 text-white/50"
                      }`}>
                        {letters[optionIndex] ?? optionIndex + 1}
                      </span>
                      <span className="flex-1">{option}</span>
                      {revealedCorrect && <CheckCircle2 className="size-5 shrink-0 text-emerald-300" aria-label="Resposta correta" />}
                      {isSelected && !selectedIsCorrect && <XCircle className="size-5 shrink-0 text-red-300" aria-label="Resposta incorreta" />}
                    </button>
                  );
                })}
              </div>
              {selected && (
                <div role="status" className={`mt-3 rounded-xl border p-3 text-xs leading-5 ${selectedIsCorrect ? "border-emerald-400/20 bg-emerald-400/[.07] text-emerald-100/80" : "border-amber-400/20 bg-amber-400/[.07] text-amber-100/80"}`}>
                  <strong className="text-white">{selectedIsCorrect ? "Correto." : "Ainda não."}</strong>{" "}
                  {selectedIsCorrect
                    ? `“${question.answer}” responde diretamente ao conceito central da pergunta.`
                    : `“${selected}” não representa a função principal pedida. Compare as opções, consulte o material se necessário e tente novamente.`}
                </div>
              )}
            </fieldset>
          );
        })}
      </div>

      {correct === questions.length && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-orbit-electric/20 bg-orbit-electric/[.06] p-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-orbit-electric">Resultado desta revisão</div>
            <div className="mt-1 text-sm font-black text-white">{correct} de {questions.length} corretas</div>
          </div>
          <span className="text-xs text-white/40">Salvo neste dispositivo</span>
        </div>
      )}
    </div>
  );
}
