import { describe, expect, it } from "vitest";
import {
  buildSpokenScript,
  completeSpeakingPractice,
  emptySpeakingSave,
  englishSpeakingLessons,
  getSpeakingLesson,
  mergeSpeakingSave,
  readSpeakingSave,
  speakingSaveKey,
} from "./spokenEnglish";

describe("Spoken English practice", () => {
  it("offers six programming words and six complete phrases with stable unique ids", () => {
    expect(englishSpeakingLessons).toHaveLength(12);
    expect(new Set(englishSpeakingLessons.map(lesson => lesson.id)).size).toBe(12);
    expect(englishSpeakingLessons.filter(lesson => lesson.kind === "word").map(lesson => lesson.en))
      .toEqual(["file", "folder", "code", "save", "run", "error"]);
    expect(englishSpeakingLessons.filter(lesson => lesson.kind === "phrase").map(lesson => lesson.en))
      .toEqual(["Open the file", "Save the file", "Run the code", "Fix the error", "The test passed", "The build failed"]);
    for (const lesson of englishSpeakingLessons) {
      expect(getSpeakingLesson(lesson.id)).toBe(lesson);
      expect(lesson.pt.trim().length).toBeGreaterThan(0);
      expect(lesson.context.trim().length).toBeGreaterThan(20);
    }
    expect(getSpeakingLesson("file")).toBeUndefined();
    expect(getSpeakingLesson("unknown")).toBeUndefined();
    expect(getSpeakingLesson("word-run")?.pt).toBe("executar");
  });

  it("guides a Portuguese question, English model, repetition together, then independent practice", () => {
    for (const lesson of englishSpeakingLessons) {
      const script = buildSpokenScript(lesson);
      expect(script.map(part => part.lang)).toEqual(["pt-BR", "en-US", "pt-BR", "en-US", "pt-BR"]);
      expect(script.map(part => part.phase)).toEqual(["meaning", "model", "together", "together", "your-turn"]);
      expect(script.map(part => part.text)).toEqual([`Como se diz ${lesson.pt} em inglês?`, lesson.en, "Agora repita comigo.", lesson.en, "Agora tente sozinho."]);
      expect(script.map(part => part.pauseAfterMs)).toEqual([600, 1000, 300, lesson.kind === "phrase" ? 2000 : 1200, 0]);
      expect(new Set(script.map(part => part.id)).size).toBe(script.length);
      expect(script.every(part => part.id.startsWith(`${lesson.id}-`))).toBe(true);
      expect(script.slice(0, -1).every(part => Number.isInteger(part.pauseAfterMs) && part.pauseAfterMs > 0 && part.pauseAfterMs <= 2000)).toBe(true);
      expect(script.at(-1)?.pauseAfterMs).toBe(0);
    }
    const phrase = buildSpokenScript(getSpeakingLesson("phrase-the-test-passed")!);
    const word = buildSpokenScript(getSpeakingLesson("word-file")!);
    expect(phrase.filter(part => part.lang === "en-US").map(part => part.text)).toEqual(["The test passed", "The test passed"]);
    expect(phrase[3].pauseAfterMs).toBeGreaterThan(word[3].pauseAfterMs);
  });

  it("isolates account types and safely encodes identifiers without sharing the reading save", () => {
    const ids = ["42", 42, "a/b", "a%2Fb", "a-b", "a b", "a\"b", "á", "", 0];
    const keys = ids.map(speakingSaveKey);
    expect(new Set(keys).size).toBe(ids.length);
    expect(speakingSaveKey("42")).toBe("orbitamos-english-speaking-v1-s-%2242%22");
    expect(speakingSaveKey(42)).toBe("orbitamos-english-speaking-v1-n-42");
    expect(speakingSaveKey("a/b")).not.toContain("/");
    expect(() => speakingSaveKey(Number.NaN)).toThrow(TypeError);
    expect(() => speakingSaveKey(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });

  it("recovers from broken, foreign, or oversized saves with fresh independent defaults", () => {
    for (const raw of [null, "", "oops", "null", "[]", "true", "42", '{"version":2}', '{"completed":[]}', " ".repeat(32_769)]) {
      expect(readSpeakingSave(raw)).toEqual(emptySpeakingSave());
    }
    // The existing reading activity also uses version 1, but numeric indices and its ids cannot unlock this activity.
    expect(readSpeakingSave(JSON.stringify({ version: 1, current: 7, completed: ["file", "folder"], finished: true, draft: "found" })))
      .toEqual(emptySpeakingSave());
    const mutated = emptySpeakingSave();
    mutated.completed.push("word-file");
    mutated.attempts["word-file"] = 1;
    expect(emptySpeakingSave().completed).toEqual([]);
    expect(emptySpeakingSave().attempts).toEqual({});
  });

  it("recovers known achievements independently, caps attempts, and discards runtime and unknown fields", () => {
    const recovered = readSpeakingSave(JSON.stringify({
      version: 1,
      current: "phrase-run-the-code",
      completed: ["phrase-the-test-passed", "word-file", "word-file", "unknown", 1],
      attempts: { "word-file": 100000, "word-folder": -2, "word-code": 1.5, "word-save": "3", "word-run": 0, "phrase-run-the-code": 2, unknown: 10 },
      speaking: true,
      playing: true,
      voiceURI: "an-old-voice",
      phase: "together",
      xp: 10000,
      score: 100,
    }));
    expect(recovered).toEqual({
      version: 1,
      current: "phrase-run-the-code",
      completed: ["word-file", "phrase-the-test-passed"],
      attempts: { "word-file": 999, "phrase-run-the-code": 2 },
    });
    expect(readSpeakingSave(JSON.stringify({ version: 1, current: "missing", completed: null, attempts: [] })))
      .toEqual(emptySpeakingSave());
    expect(readSpeakingSave(JSON.stringify({ version: 1, current: "word-code", completed: {}, attempts: { "word-code": 2 } })))
      .toEqual({ version: 1, current: "word-code", completed: [], attempts: { "word-code": 2 } });
  });

  it("merges a stale active save with stored achievements while keeping the active lesson", () => {
    const active = completeSpeakingPractice(emptySpeakingSave(), "word-file");
    const stored = completeSpeakingPractice(completeSpeakingPractice(emptySpeakingSave(), "phrase-run-the-code"), "phrase-run-the-code");
    const merged = mergeSpeakingSave(active, stored);
    expect(merged.current).toBe("word-file");
    expect(merged.completed).toEqual(["word-file", "phrase-run-the-code"]);
    expect(merged.attempts).toEqual({ "word-file": 1, "phrase-run-the-code": 2 });
    expect(mergeSpeakingSave(merged, stored)).toEqual(merged);
    expect(active.completed).toEqual(["word-file"]);
    expect(stored.current).toBe("phrase-run-the-code");
    expect(mergeSpeakingSave(stored, active).current).toBe("phrase-run-the-code");
  });

  it("records declared practice without grading, preserves achievements and bounds repeated participation", () => {
    const first = completeSpeakingPractice(emptySpeakingSave(), "phrase-the-build-failed");
    const second = completeSpeakingPractice(first, "word-file");
    const repeated = completeSpeakingPractice(second, "phrase-the-build-failed");
    expect(repeated).toEqual({
      version: 1,
      current: "phrase-the-build-failed",
      completed: ["word-file", "phrase-the-build-failed"],
      attempts: { "word-file": 1, "phrase-the-build-failed": 2 },
    });
    expect(completeSpeakingPractice(repeated, "unknown")).toEqual(repeated);
    expect(first.completed).toEqual(["phrase-the-build-failed"]);
    const capped = readSpeakingSave(JSON.stringify({ ...repeated, attempts: { "phrase-the-build-failed": 999 } }));
    expect(completeSpeakingPractice(capped, "phrase-the-build-failed").attempts["phrase-the-build-failed"]).toBe(999);
    expect(readSpeakingSave(JSON.stringify(repeated))).toEqual(repeated);
  });
});
