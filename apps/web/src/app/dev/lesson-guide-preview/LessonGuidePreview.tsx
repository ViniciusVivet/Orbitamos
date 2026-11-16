"use client";

import { useState } from "react";
import LessonStudyPanels from "@/components/estudante/LessonStudyPanels";
import { cursos } from "@/lib/cursos";
import { getLessonGuide, getLessonQuiz, isLessonQuizComplete, type LessonQuizScore } from "@/lib/learningExperience";

const scenarios = [
  { id: "grid", label: "CSS Grid sem vínculo", course: "html-css-js", lesson: "html-css-js-a9" },
  { id: "conditions", label: "Condições com prática", course: "csharp-fundamentos", lesson: "csharp-a6" },
  { id: "explicit", label: "Quiz fornecido", course: "html-css-js", lesson: "html-css-js-a9" },
];
const explicitQuiz = [{ question: "Qual elemento representa um título principal?", options: ["h1", "span", "br"], answer: "h1" }];

export default function LessonGuidePreview() {
  const [scenarioId, setScenarioId] = useState("grid");
  const [score, setScore] = useState<LessonQuizScore | null>(null);
  const scenario = scenarios.find(item => item.id === scenarioId)!;
  const course = cursos.find(item => item.slug === scenario.course)!;
  const original = course.modulos.flatMap(item => item.aulas).find(item => item.id === scenario.lesson)!;
  const lesson = scenarioId === "explicit" ? { ...original, id: "explicit-synthetic-quiz", quiz: explicitQuiz } : original;
  const guide = getLessonGuide(course, lesson, 6);
  const questions = getLessonQuiz(lesson, guide);
  return <div className="mx-auto max-w-5xl text-white" data-lesson-guide-preview data-scenario={scenarioId}>
    <p className="text-xs text-white/65">Prévia sintética: componentes usados na aula real. Sem sessão de aluno ou conclusão/XP.</p>
    <div className="my-5 flex flex-wrap gap-2" role="group" aria-label="Cenários da aula">{scenarios.map(item => <button key={item.id} onClick={() => setScenarioId(item.id)} aria-pressed={item.id === scenarioId} className="min-h-11 rounded-xl border border-white/25 px-3 py-2 text-sm aria-pressed:bg-white aria-pressed:text-black">{item.label}</button>)}</div>
    <h1 className="text-2xl font-bold">{lesson.titulo}</h1>
    <LessonStudyPanels key={lesson.id} guide={guide} questions={questions} lessonId={lesson.id} storageKey={`orbitamos-quiz-v2-lesson-guide-preview-${lesson.id}`} quizPerfect={isLessonQuizComplete(lesson.id, questions, score)} onScoreChange={(correct, total) => setScore({ lessonId: lesson.id, correct, total })} preview/>
  </div>;
}
