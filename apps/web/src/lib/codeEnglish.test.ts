import { describe, expect, it } from "vitest";
import { englishLessons, englishStorageKey, evaluateEnglish, readEnglishSave } from "./codeEnglish";

describe("Inglês em cena", () => {
  it("exercises vocabulary, interpreting an error, recall, and code transfer", () => {
    expect(englishLessons).toHaveLength(8);
    expect(new Set(englishLessons.map(lesson => lesson.id)).size).toBe(8);
    for (const lesson of englishLessons) {
      expect(evaluateEnglish(lesson, lesson.answer).ok).toBe(true);
      expect(evaluateEnglish(lesson, "").ok).toBe(false);
      if (lesson.kind === "choice") for (const choice of lesson.choices) {
        const result = evaluateEnglish(lesson, choice.value);
        expect(result.ok).toBe(choice.value === lesson.answer);
        expect(result.message.length).toBeGreaterThan(20);
      }
    }
    expect(evaluateEnglish(englishLessons[6], "print").message).toContain("não imprime sozinho");
    expect(evaluateEnglish(englishLessons[7], "none").message).toContain("console.log");
  });
  it("accepts a recalled word with ordinary typing differences without accepting a whole copied phrase", () => {
    expect(evaluateEnglish(englishLessons[5], "  FOUND ").ok).toBe(true);
    expect(evaluateEnglish(englishLessons[5], "File not found").ok).toBe(false);
    expect(evaluateEnglish(englishLessons[5], "found!").ok).toBe(false);
    expect(evaluateEnglish(englishLessons[5], "fount").ok).toBe(false);
  });
  it("rejects broken saves and never unlocks gaps or trusts a forged finish", () => {
    for (const raw of [null, "oops", "null", "[]", '{"version":2}', '{"version":1,"completed":null}']) {
      expect(readEnglishSave(raw)).toEqual({ version: 1, current: 0, completed: [], finished: false, draft: "" });
    }
    expect(readEnglishSave(JSON.stringify({ version: 1, completed: ["folder", "folder", "button", "fake"], current: 7, finished: true }))).toEqual({ version: 1, completed: ["folder"], current: 1, finished: false, draft: "" });
    expect(readEnglishSave(JSON.stringify({ version: 1, completed: englishLessons.map(lesson => lesson.id), current: 100, finished: true }))).toEqual({ version: 1, completed: englishLessons.map(lesson => lesson.id), current: 7, finished: true, draft: "" });
    expect(englishStorageKey("a")).not.toBe(englishStorageKey("b"));
  });
  it("recovers only the bounded draft belonging to the writing scene", () => {
    const completed = englishLessons.slice(0, 5).map(lesson => lesson.id);
    expect(readEnglishSave(JSON.stringify({ version: 1, current: 5, completed, draft: "fou" })).draft).toBe("fou");
    expect(readEnglishSave(JSON.stringify({ version: 1, current: 5, completed, draft: "a".repeat(100) })).draft).toHaveLength(40);
    expect(readEnglishSave(JSON.stringify({ version: 1, current: 5, completed, draft: {} })).draft).toBe("");
    expect(readEnglishSave(JSON.stringify({ version: 1, current: 0, completed: [], draft: "found" })).draft).toBe("");
  });
});
