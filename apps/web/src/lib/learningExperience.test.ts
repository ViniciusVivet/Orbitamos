import { describe, expect, it } from "vitest";

import { cursos } from "./cursos";
import {
  flattenAllLessons,
  flattenCourseLessons,
  getLessonGuide,
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

  it("generates complete guides for every catalog lesson", () => {
    for (const curso of cursos) {
      flattenCourseLessons(curso).forEach(({ aula }, index) => {
        const guide = getLessonGuide(curso, aula, index);
        expect(lessonKindLabels[guide.kind]).toBeTruthy();
        expect(guide.estimatedMinutes).toBeGreaterThan(0);
        expect(guide.objectives.length).toBeGreaterThanOrEqual(3);
        expect(guide.checklist.length).toBeGreaterThan(0);
        expect(guide.practice.title.trim()).not.toBe("");
        expect(guide.practice.description.trim()).not.toBe("");
        expect(guide.practice.deliverable.trim()).not.toBe("");
        expect(guide.quiz).toHaveLength(3);
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
});
