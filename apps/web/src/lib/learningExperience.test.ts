import { describe, expect, it } from "vitest";

import { cursos } from "./cursos";
import {
  flattenAllLessons,
  flattenCourseLessons,
  getLessonGuide,
  getLessonQuiz,
  isLessonQuizComplete,
  getLessonKind,
  getNextIncompleteLesson,
  lessonKindLabels,
} from "./learningExperience";

describe("learning experience", () => {
  it("flattens courses while preserving order and context", () => {
    for (const curso of cursos) {
      const flattened = flattenCourseLessons(curso);
      const expected = curso.modulos.flatMap((modulo) =>
        modulo.aulas.map((aula) => ({ moduloTitulo: modulo.titulo, aula }))
      );

      expect(flattened).toHaveLength(expected.length);
      flattened.forEach((item, index) => {
        expect(item.curso).toBe(curso);
        expect(item.aula).toBe(expected[index].aula);
        expect(item.moduloTitulo).toBe(expected[index].moduloTitulo);
        expect(item.index).toBe(index);
        expect(item.total).toBe(expected.length);
      });
    }
    expect(flattenAllLessons(cursos)).toHaveLength(
      cursos.reduce((total, curso) => total + flattenCourseLessons(curso).length, 0)
    );
  });

  it("selects the first incomplete lesson and has a stable completed fallback", () => {
    const lessons = flattenAllLessons(cursos);
    expect(lessons.length).toBeGreaterThan(1);
    expect(getNextIncompleteLesson(cursos, new Set())).toStrictEqual(lessons[0]);
    expect(getNextIncompleteLesson(cursos, new Set([lessons[0].aula.id]))).toStrictEqual(lessons[1]);
    expect(getNextIncompleteLesson(cursos, new Set(lessons.map((item) => item.aula.id)))).toStrictEqual(
      lessons[0]
    );
    expect(getNextIncompleteLesson([], new Set())).toBeNull();
  });

  it("distinguishes authored guidance from general study without manufacturing assessments", () => {
    for (const curso of cursos) {
      flattenCourseLessons(curso).forEach(({ aula }, index) => {
        const guide = getLessonGuide(curso, aula, index);
        expect(lessonKindLabels[guide.kind]).toBeTruthy();
        expect(guide.objectives.length).toBeGreaterThan(0);
        if (guide.origin === "authored") {
          expect(guide.estimatedMinutes).toBeGreaterThan(0);
          expect(guide.checklist.length).toBeGreaterThan(0);
          expect(guide.practice?.title.trim()).toBeTruthy();
          expect(guide.practice?.description.trim()).toBeTruthy();
          expect(guide.practice?.deliverable.trim()).toBeTruthy();
          expect(guide.quiz.length).toBeGreaterThan(0);
        } else {
          expect(guide.origin).toBe("general");
          expect(guide.estimatedMinutes).toBeNull();
          expect(guide.practice).toBeNull();
          expect(guide.quiz).toEqual([]);
          expect(guide.checklist).toEqual([]);
        }
        for (const question of guide.quiz) {
          expect(question.options).toContain(question.answer);
        }
      });
    }
  });

  it("honors explicit lesson types before inference", () => {
    const lesson = flattenAllLessons(cursos)[0].aula;
    expect(getLessonKind({ ...lesson, tipo: "projeto" })).toBe("projeto");
  });

  it("links the conditions lesson to its authored C# module regardless of its catalog position", () => {
    const course = cursos.find(item => item.slug === "csharp-fundamentos")!;
    const lesson = course.modulos.flatMap(item => item.aulas).find(item => item.id === "csharp-a6")!;
    const original = getLessonGuide(course, lesson, 2);
    expect(original.origin).toBe("authored");
    expect(original.practice?.href).toBe("/estudante/trilhas/csharp?module=conditions");
    expect(original.objectives.join(" ")).toContain("if/else");
    expect(original.quiz[1].answer).toBe("valorPedido >= 100");
    expect(getLessonGuide(course, lesson, 99)).toEqual(original);
    expect(getLessonGuide(course, { ...lesson, id: "database-uuid", slug: "csharp-a6", titulo: "Título editado" }, 0)).toEqual(original);
  });

  it("does not infer the authored pilot from a title or an unrelated course", () => {
    const course = cursos.find(item => item.slug === "csharp-fundamentos")!;
    const lesson = course.modulos.flatMap(item => item.aulas).find(item => item.id === "csharp-a6")!;
    expect(getLessonGuide(course, { ...lesson, id: "unreviewed-lesson" }).practice).toBeNull();
    expect(getLessonGuide({ ...course, slug: "another-course" }, lesson).practice).toBeNull();
  });

  it("never sends CSS Grid to a JavaScript function exercise because of its position", () => {
    const course = cursos.find(item => item.slug === "html-css-js")!;
    const lesson = course.modulos.flatMap(item => item.aulas).find(item => item.id === "html-css-js-a9")!;
    expect(lesson.titulo).toContain("Grid");
    const before = JSON.stringify({ course, lesson });
    const original = getLessonGuide(course, lesson, 6);
    expect(original).toMatchObject({ origin: "general", practice: null, quiz: [], estimatedMinutes: null });
    for (const position of [0, 2, 6, 99, -1]) expect(getLessonGuide(course, lesson, position)).toEqual(original);
    expect(JSON.stringify({ course, lesson })).toBe(before);
  });

  it("preserves explicitly supplied lesson questions without inventing a related practice", () => {
    const course = cursos.find(item => item.slug === "html-css-js")!;
    const base = course.modulos[0].aulas[0];
    const quiz = [{ question: "Qual elemento é um título?", options: ["h1", "span"], answer: "h1" }];
    const lesson = { ...base, quiz };
    const guide = getLessonGuide(course, lesson, 9);
    expect(getLessonQuiz(lesson, guide)).toEqual(quiz);
    expect(guide.practice).toBeNull();
    expect(getLessonQuiz({ ...lesson, quiz: [] }, guide)).toEqual([]);
  });

  it("uses the authored questions only when the catalog does not supply its own", () => {
    const course = cursos.find(item => item.slug === "csharp-fundamentos")!;
    const lesson = course.modulos.flatMap(item => item.aulas).find(item => item.id === "csharp-a6")!;
    const guide = getLessonGuide(course, lesson);
    expect(getLessonQuiz({ ...lesson, quiz: [] }, guide)).toEqual(guide.quiz);
    const quiz = [{ question: "Qual condição inclui100?", options: [">", ">="], answer: ">=" }];
    expect(getLessonQuiz({ ...lesson, quiz }, guide)).toEqual(quiz);
    expect(guide.quiz).toHaveLength(3);
  });

  it("does not carry a perfect score into another lesson or approve an absent assessment", () => {
    const questions = [{ question: "Qual é o título?", options: ["h1", "span"], answer: "h1" }];
    const previous = { lessonId: "previous", correct: 1, total: 1 };
    expect(isLessonQuizComplete("current", questions, previous)).toBe(false);
    expect(isLessonQuizComplete("previous", [], previous)).toBe(false);
    expect(isLessonQuizComplete("current", [], { lessonId: "current", correct: 0, total: 0 })).toBe(false);
    expect(isLessonQuizComplete("current", questions, { lessonId: "current", correct: 1, total: 2 })).toBe(false);
    expect(isLessonQuizComplete("current", questions, { lessonId: "current", correct: 0, total: 1 })).toBe(false);
    expect(isLessonQuizComplete("current", questions, { lessonId: "current", correct: 1, total: 1 })).toBe(true);
  });
});
