import { describe, expect, it } from "vitest";
import {
  emptyEnglishUseSave,
  englishUseKey,
  englishUseQuestions,
  evaluateEnglishUse,
  getEnglishUseQuestion,
  mergeEnglishUseSave,
  readEnglishUseSave,
  recordEnglishUseAttempt,
  type EnglishUseSave,
} from "./englishUse";
import { englishSpeakingLessons, speakingSaveKey } from "./spokenEnglish";

describe("English in programming situations", () => {
  it("checks exactly the twelve existing speaking items with three stable choices each", () => {
    expect(englishUseQuestions.map(question => question.lessonId)).toEqual(englishSpeakingLessons.map(lesson => lesson.id));
    expect(new Set(englishUseQuestions.map(question => question.lessonId)).size).toBe(12);
    const correctPositions = new Set<number>();
    for (const lesson of englishSpeakingLessons) {
      const question = getEnglishUseQuestion(lesson.id)!;
      expect(question.target).toBe(lesson.en);
      expect(question.scene).toBe(lesson.scene);
      expect(question.context.trim().length).toBeGreaterThan(20);
      expect(question.prompt).toContain(lesson.en);
      expect(question.choices).toHaveLength(3);
      expect(new Set(question.choices.map(choice => choice.id)).size).toBe(3);
      expect(question.choices.filter(choice => choice.id === question.correctChoiceId)).toHaveLength(1);
      correctPositions.add(question.choices.findIndex(choice => choice.id === question.correctChoiceId));
      for (const choice of question.choices) {
        expect(choice.id.trim().length).toBeGreaterThan(0);
        expect(choice.text.trim().length).toBeGreaterThan(10);
        expect(choice.feedback.trim().length).toBeGreaterThan(20);
      }
    }
    expect([...correctPositions].sort()).toEqual([0, 1, 2]);
    expect(getEnglishUseQuestion("unknown")).toBeUndefined();
    expect(getEnglishUseQuestion("__proto__")).toBeUndefined();
  });

  it("returns distinct explanatory feedback for every real choice and rejects foreign choices", () => {
    for (const question of englishUseQuestions) {
      for (const choice of question.choices) {
        expect(evaluateEnglishUse(question, choice.id)).toEqual({
          ok: choice.id === question.correctChoiceId,
          message: choice.feedback,
        });
      }
      expect(evaluateEnglishUse(question, "unknown")).toEqual({
        ok: false,
        message: "Escolha uma das opções desta situação para conferir.",
      });
    }
    const first = englishUseQuestions[0];
    expect(evaluateEnglishUse(first, englishUseQuestions[1].correctChoiceId).ok).toBe(false);
  });

  it("isolates this save by account type and safely encoded id, away from participation", () => {
    const identifiers = ["42", 42, "a/b", "a%2Fb", "a-b", "a b", "a\"b", "á", "", 0];
    const keys = identifiers.map(englishUseKey);
    expect(new Set(keys).size).toBe(identifiers.length);
    expect(englishUseKey("42")).toBe("orbitamos-english-use-v1-s-%2242%22");
    expect(englishUseKey(42)).toBe("orbitamos-english-use-v1-n-42");
    expect(englishUseKey("a/b")).not.toContain("/");
    for (const id of identifiers) expect(englishUseKey(id)).not.toBe(speakingSaveKey(id));
    expect(() => englishUseKey(Number.NaN)).toThrow(TypeError);
    expect(() => englishUseKey(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    expect(() => englishUseKey({} as string)).toThrow(TypeError);
  });

  it("recovers malformed, foreign, and oversized saves with independent fresh defaults", () => {
    for (const raw of [null, "", "oops", "null", "[]", "true", "42", '{"version":2}', '{"completed":[]}', " ".repeat(32_769)]) {
      expect(readEnglishUseSave(raw)).toEqual(emptyEnglishUseSave());
    }
    expect(readEnglishUseSave(JSON.stringify({ version: 1, current: 7, completed: ["file", "folder"], draft: "found", finished: true })))
      .toEqual(emptyEnglishUseSave());
    const mutated = emptyEnglishUseSave();
    mutated.completed.push("word-file");
    mutated.attempts["word-file"] = 4;
    expect(emptyEnglishUseSave().completed).toEqual([]);
    expect(emptyEnglishUseSave().attempts).toEqual({});
    const valid = JSON.stringify({ version: 1, current: "word-save", completed: [], attempts: {} });
    expect(readEnglishUseSave(valid.padEnd(32_768, " ")).current).toBe("word-save");
    expect(readEnglishUseSave(valid.padEnd(32_769, " "))).toEqual(emptyEnglishUseSave());
  });

  it("keeps only known fields and ids, orders completions, and bounds positive integer attempts", () => {
    const recovered = readEnglishUseSave(JSON.stringify({
      version: 1,
      current: "phrase-run-the-code",
      completed: ["phrase-the-test-passed", "word-file", "word-file", "unknown", 1],
      attempts: { "word-file": 100_000, "word-folder": -2, "word-code": 1.5, "word-save": "3", "word-run": 0, "phrase-run-the-code": 2, unknown: 10 },
      selected: "execute",
      feedback: "stale",
      xp: 10_000,
      score: 100,
      mastery: true,
    }));
    expect(recovered).toEqual({
      version: 1,
      active: false,
      current: "phrase-run-the-code",
      completed: ["word-file", "phrase-the-test-passed"],
      attempts: { "word-file": 999, "phrase-run-the-code": 2 },
    });
    expect(readEnglishUseSave(JSON.stringify({ version: 1, current: "missing", completed: null, attempts: [] })))
      .toEqual(emptyEnglishUseSave());
    expect(readEnglishUseSave(JSON.stringify({ version: 1, current: "word-code", completed: {}, attempts: { "word-code": 2 } })))
      .toEqual({ version: 1, active: false, current: "word-code", completed: [], attempts: { "word-code": 2 } });
    expect(readEnglishUseSave(JSON.stringify(recovered))).toEqual(recovered);
  });

  it("ignores prototype keys and inherited data without leaking pollution into the save", () => {
    const recovered = readEnglishUseSave('{"version":1,"current":"__proto__","completed":["constructor","__proto__","word-file"],"attempts":{"__proto__":{"polluted":true},"constructor":999,"word-file":2}}');
    expect(recovered).toEqual({ version: 1, active: false, current: "word-file", completed: ["word-file"], attempts: { "word-file": 2 } });
    expect(Object.prototype.hasOwnProperty.call(recovered.attempts, "__proto__")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, "polluted")).toBe(false);
    const inherited = Object.create({ version: 1, current: "word-save", completed: ["word-save"], attempts: { "word-save": 9 } }) as EnglishUseSave;
    expect(mergeEnglishUseSave(inherited, emptyEnglishUseSave())).toEqual(emptyEnglishUseSave());
    const inheritedAttempts = Object.create({ "word-file": 99 });
    inheritedAttempts["word-save"] = 2;
    expect(mergeEnglishUseSave({ ...emptyEnglishUseSave(), attempts: inheritedAttempts }, emptyEnglishUseSave()).attempts)
      .toEqual({ "word-save": 2 });
  });

  it("counts wrong selections without completion, then completes only after a correct choice", () => {
    for (const question of englishUseQuestions) {
      const original = emptyEnglishUseSave();
      const wrongId = question.choices.find(choice => choice.id !== question.correctChoiceId)!.id;
      const wrong = recordEnglishUseAttempt(original, question.lessonId, wrongId);
      expect(wrong.current).toBe(question.lessonId);
      expect(wrong.completed).toEqual([]);
      expect(wrong.attempts).toEqual({ [question.lessonId]: 1 });
      const correct = recordEnglishUseAttempt(wrong, question.lessonId, question.correctChoiceId);
      expect(correct.completed).toEqual([question.lessonId]);
      expect(correct.attempts).toEqual({ [question.lessonId]: 2 });
      expect(original).toEqual(emptyEnglishUseSave());
    }
  });

  it("retains previous correct selections on errors, rejects unknown attempts, and caps retries", () => {
    const first = englishUseQuestions[0];
    const second = englishUseQuestions[1];
    const wrongId = first.choices.find(choice => choice.id !== first.correctChoiceId)!.id;
    const completed = recordEnglishUseAttempt(emptyEnglishUseSave(), first.lessonId, first.correctChoiceId);
    const repeated = recordEnglishUseAttempt(completed, first.lessonId, wrongId);
    expect(repeated.completed).toEqual([first.lessonId]);
    expect(repeated.attempts).toEqual({ [first.lessonId]: 2 });
    expect(recordEnglishUseAttempt(repeated, "unknown", first.correctChoiceId)).toEqual(repeated);
    expect(recordEnglishUseAttempt(repeated, first.lessonId, "unknown")).toEqual(repeated);
    expect(recordEnglishUseAttempt(repeated, first.lessonId, second.correctChoiceId)).toEqual(repeated);
    const capped = { ...repeated, attempts: { [first.lessonId]: 999 } };
    expect(recordEnglishUseAttempt(capped, first.lessonId, wrongId).attempts[first.lessonId]).toBe(999);
    expect(completed.attempts[first.lessonId]).toBe(1);
  });

  it("merges stale writes without revoking completion or double counting persisted attempts", () => {
    const first = englishUseQuestions[0];
    const second = englishUseQuestions[1];
    const active = recordEnglishUseAttempt(emptyEnglishUseSave(), first.lessonId, first.correctChoiceId);
    const stored = recordEnglishUseAttempt(
      recordEnglishUseAttempt(emptyEnglishUseSave(), second.lessonId, second.correctChoiceId),
      second.lessonId,
      second.correctChoiceId,
    );
    const merged = mergeEnglishUseSave(active, stored);
    expect(merged).toEqual({
      version: 1,
      active: false,
      current: first.lessonId,
      completed: [first.lessonId, second.lessonId],
      attempts: { [first.lessonId]: 1, [second.lessonId]: 2 },
    });
    expect(mergeEnglishUseSave(merged, stored)).toEqual(merged);
    expect(mergeEnglishUseSave(stored, active).current).toBe(second.lessonId);
    expect(active.completed).toEqual([first.lessonId]);
    expect(stored.completed).toEqual([second.lessonId]);
    const empty = mergeEnglishUseSave({ ...emptyEnglishUseSave(), current: first.lessonId }, stored);
    expect(empty.completed).toEqual([second.lessonId]);
  });

  it("restores only an explicit active flag and keeps the active writer's resume decision", () => {
    const legacy = { version: 1, current: "word-save", completed: ["word-file"], attempts: { "word-file": 1 } };
    const inactive = { ...legacy, active: false } as EnglishUseSave;
    expect(readEnglishUseSave(JSON.stringify(legacy))).toEqual(inactive);
    for (const active of [false, null, 1, "true", [], {}]) {
      expect(readEnglishUseSave(JSON.stringify({ ...legacy, active }))).toEqual(inactive);
    }
    const checking = { ...inactive, active: true };
    expect(readEnglishUseSave(JSON.stringify(checking))).toEqual(checking);
    const inheritedFlag = Object.assign(Object.create({ active: true }), legacy) as EnglishUseSave;
    expect(mergeEnglishUseSave(inheritedFlag, emptyEnglishUseSave())).toEqual(inactive);

    expect(mergeEnglishUseSave(checking, inactive).active).toBe(true);
    expect(mergeEnglishUseSave(inactive, checking).active).toBe(false);
    expect(mergeEnglishUseSave(inactive, checking).completed).toEqual(["word-file"]);
    const question = getEnglishUseQuestion(checking.current)!;
    const wrong = question.choices.find(choice => choice.id !== question.correctChoiceId)!;
    expect(recordEnglishUseAttempt(checking, question.lessonId, wrong.id).active).toBe(true);
    expect(recordEnglishUseAttempt(checking, question.lessonId, question.correctChoiceId).active).toBe(true);
    expect(recordEnglishUseAttempt(inactive, question.lessonId, question.correctChoiceId).active).toBe(false);
  });
});
