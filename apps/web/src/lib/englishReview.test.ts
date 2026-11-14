import { describe, expect, it } from "vitest";
import {
  advanceEnglishReview,
  beginEnglishReview,
  closeEnglishReview,
  consultEnglishReviewModel,
  emptyEnglishReviewSave,
  englishReviewKey,
  evaluateEnglishReviewAnswer,
  mergeEnglishReviewSave,
  readEnglishReviewSave,
  setEnglishReviewDraft,
  startAnotherEnglishReview,
  submitEnglishReviewAnswer,
  type EnglishReviewSave,
} from "./englishReview";
import { englishUseKey } from "./englishUse";
import { englishSpeakingLessons, getSpeakingLesson, speakingSaveKey } from "./spokenEnglish";

const NOW = 1_794_700_800_000;
const ids = englishSpeakingLessons.map(lesson => lesson.id);

function begin(eligible: readonly string[] = ids): EnglishReviewSave {
  return beginEnglishReview(emptyEnglishReviewSave(), eligible, NOW);
}

function answerCurrent(save: EnglishReviewSave, now = NOW): EnglishReviewSave {
  const session = save.session!;
  const lesson = getSpeakingLesson(session.ids[session.cursor])!;
  return submitEnglishReviewAnswer(setEnglishReviewDraft(save, lesson.en), now);
}

describe("Short written English review", () => {
  it("isolates account types and encoded identifiers from all previous English saves", () => {
    const accounts = ["42", 42, "a/b", "a%2Fb", "a-b", "a b", "a\"b", "á", "", 0];
    expect(new Set(accounts.map(englishReviewKey)).size).toBe(accounts.length);
    expect(englishReviewKey("42")).toBe("orbitamos-english-review-v1-s-%2242%22");
    expect(englishReviewKey(42)).toBe("orbitamos-english-review-v1-n-42");
    for (const account of accounts) {
      expect(englishReviewKey(account)).not.toBe(speakingSaveKey(account));
      expect(englishReviewKey(account)).not.toBe(englishUseKey(account));
    }
    for (const account of [Number.NaN, Number.POSITIVE_INFINITY, {} as string, null as unknown as string]) {
      expect(() => englishReviewKey(account)).toThrow(TypeError);
    }
  });

  it("recovers malformed and oversized saves without creating practice or a session", () => {
    for (const raw of [null, "", "bad-json", "null", "[]", "true", "42", "{}", '{"version":2}', " ".repeat(32_769)]) {
      expect(readEnglishReviewSave(raw)).toEqual(emptyEnglishReviewSave());
    }
    expect(readEnglishReviewSave('{"version":1,"active":true,"completed":["word-file"],"xp":999}'))
      .toEqual(emptyEnglishReviewSave());
    const raw = JSON.stringify(begin(["word-file"]));
    expect(readEnglishReviewSave(raw.padEnd(32_768, " "))).toEqual(begin(["word-file"]));
    expect(readEnglishReviewSave(raw.padEnd(32_769, " "))).toEqual(emptyEnglishReviewSave());
    const multibyteOversized = JSON.stringify({ ...begin(["word-file"]), ignored: "á".repeat(16_400) });
    expect(multibyteOversized.length).toBeLessThan(32_768);
    expect(readEnglishReviewSave(multibyteOversized)).toEqual(emptyEnglishReviewSave());
    const first = emptyEnglishReviewSave();
    first.history["word-file"] = { reviews: 4, helped: 2, lastAt: NOW };
    expect(emptyEnglishReviewSave().history).toEqual({});
  });

  it("keeps known, bounded history independently from an invalid session", () => {
    const read = readEnglishReviewSave(JSON.stringify({
      version: 1,
      active: true,
      session: { ids: ["unknown"], cursor: 0, draft: "", consulted: false, results: [] },
      history: {
        "word-file": { reviews: 5_000, helped: 9_000, lastAt: NOW },
        "word-folder": { reviews: 3, helped: 1, lastAt: 0 },
        "word-code": { reviews: 2, helped: -1, lastAt: NOW },
        "word-save": { reviews: 1.5, helped: 1, lastAt: NOW },
        "word-run": { reviews: 1, helped: 0, lastAt: 8_640_000_000_000_001 },
        "word-error": { reviews: 1, helped: 0, lastAt: -1 },
        "phrase-open-the-file": { reviews: 0, helped: 0, lastAt: NOW },
        "phrase-save-the-file": { reviews: 1, helped: 0, lastAt: 1.1 },
        unknown: { reviews: 999, helped: 999, lastAt: NOW },
      },
      score: 100,
      mastery: true,
    }));
    expect(read).toEqual({
      version: 1,
      active: false,
      history: {
        "word-file": { reviews: 999, helped: 999, lastAt: NOW },
        "word-folder": { reviews: 3, helped: 1, lastAt: 0 },
      },
    });
    expect(readEnglishReviewSave(JSON.stringify(read))).toEqual(read);
  });

  it("rejects malformed queues and nonsequential results without losing valid history", () => {
    const valid = begin();
    const session = valid.session!;
    const history = { "word-save": { reviews: 1, helped: 0, lastAt: NOW } };
    const invalidSessions = [
      null,
      [],
      {},
      { ...session, ids: [] },
      { ...session, ids: ids.slice(0, 4) },
      { ...session, ids: ["word-file", "word-file"] },
      { ...session, ids: ["__proto__"] },
      { ...session, ids: ["word-file", 2] },
      { ...session, cursor: -1 },
      { ...session, cursor: 1.5 },
      { ...session, cursor: 4 },
      { ...session, cursor: 2 },
      { ...session, draft: "a".repeat(161) },
      { ...session, draft: 1 },
      { ...session, consulted: "true" },
      { ...session, results: {} },
      { ...session, results: [{ lessonId: "word-folder", helped: false }] },
      { ...session, results: [{ lessonId: "word-file", helped: "true" }] },
      { ...session, results: [{ lessonId: "word-file", helped: true }] },
      { ...session, results: [{ lessonId: "word-file", helped: false }, { lessonId: "word-folder", helped: false }] },
    ];
    for (const badSession of invalidSessions) {
      expect(readEnglishReviewSave(JSON.stringify({ ...valid, session: badSession, history })))
        .toEqual({ version: 1, active: false, history });
    }
  });

  it("ignores prototype pollution and inherited save fields", () => {
    const read = readEnglishReviewSave('{"version":1,"active":true,"session":{"ids":["constructor"],"cursor":0,"draft":"","consulted":false,"results":[]},"history":{"__proto__":{"polluted":true},"constructor":{"reviews":99,"helped":99,"lastAt":0},"word-file":{"reviews":2,"helped":1,"lastAt":0}}}');
    expect(read).toEqual({ version: 1, active: false, history: { "word-file": { reviews: 2, helped: 1, lastAt: 0 } } });
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, "polluted")).toBe(false);
    const inherited = Object.create(begin()) as EnglishReviewSave;
    expect(mergeEnglishReviewSave(inherited, emptyEnglishReviewSave())).toEqual(emptyEnglishReviewSave());
    const inheritedHistory = Object.create({ "word-file": { reviews: 99, helped: 99, lastAt: NOW } });
    expect(mergeEnglishReviewSave({ ...emptyEnglishReviewSave(), history: inheritedHistory }, emptyEnglishReviewSave()))
      .toEqual(emptyEnglishReviewSave());
    const session = begin().session;
    if (!session) throw new Error("Expected a review session in this fixture.");
    const inheritedSession = Object.create(session) as EnglishReviewSave["session"];
    expect(mergeEnglishReviewSave({ ...begin(), session: inheritedSession }, emptyEnglishReviewSave()))
      .toEqual(emptyEnglishReviewSave());
  });

  it("selects at most three practiced known items, prioritizing unseen then oldest and original order", () => {
    const history = {
      "word-file": { reviews: 2, helped: 0, lastAt: 200 },
      "word-folder": { reviews: 5, helped: 2, lastAt: 100 },
      "word-code": { reviews: 1, helped: 0, lastAt: 100 },
      "word-save": { reviews: 1, helped: 0, lastAt: 50 },
    };
    const save: EnglishReviewSave = { ...emptyEnglishReviewSave(), history };
    const eligible = ["word-error", "unknown", "word-save", "word-code", "word-run", "word-file", "word-folder", "word-run"];
    expect(beginEnglishReview(save, eligible, NOW).session?.ids).toEqual(["word-run", "word-error", "word-save"]);
    expect(beginEnglishReview(save, ids.slice(0, 4).reverse(), NOW).session?.ids).toEqual(["word-save", "word-folder", "word-code"]);
    expect(begin(["phrase-the-build-failed"]).session?.ids).toEqual(["phrase-the-build-failed"]);
    expect(begin(["word-file", "word-file", "unknown"]).session?.ids).toEqual(["word-file"]);
    expect(begin([])).toEqual(emptyEnglishReviewSave());
    expect(begin(["unknown", "__proto__"])).toEqual(emptyEnglishReviewSave());
    expect(save.history).toEqual(history);
  });

  it("resumes an unfinished closed session with its draft, hint and correct prefix intact", () => {
    let save = answerCurrent(begin());
    save = advanceEnglishReview(save);
    save = consultEnglishReviewModel(setEnglishReviewDraft(save, "fol"));
    const closed = closeEnglishReview(save);
    const reloaded = readEnglishReviewSave(JSON.stringify(closed));
    expect(closed.active).toBe(false);
    expect(closed.session).toEqual(save.session);
    expect(beginEnglishReview(reloaded, ids, NOW + 1)).toEqual(save);
    expect(beginEnglishReview(reloaded, ["word-error"], NOW + 1).session?.ids).toEqual(["word-error"]);
    expect(beginEnglishReview(reloaded, [], NOW + 1)).toEqual({ version: 1, active: false, history: save.history });
    expect(save.session?.draft).toBe("fol");
    expect(save.session?.consulted).toBe(true);
  });

  it("compares only the practiced expression with case, whitespace, NFKC and final .!? tolerance", () => {
    for (const lesson of englishSpeakingLessons) {
      expect(evaluateEnglishReviewAnswer(lesson.id, lesson.en).ok).toBe(true);
      expect(evaluateEnglishReviewAnswer(lesson.id, ` \t${lesson.en.toUpperCase().replaceAll(" ", "  \n")}?!  `).ok).toBe(true);
      expect(evaluateEnglishReviewAnswer(lesson.id, lesson.pt).ok).toBe(false);
    }
    expect(evaluateEnglishReviewAnswer("word-file", "ｆｉｌｅ").ok).toBe(true);
    expect(evaluateEnglishReviewAnswer("phrase-open-the-file", "Open\u00a0the\u00a0file.").ok).toBe(true);
    for (const wrong of ["open a file", "open file", "file the open", "Open, the file", "Open the file;", "Open the file extra", "Ópen the file", "Open the file/"]) {
      expect(evaluateEnglishReviewAnswer("phrase-open-the-file", wrong).ok).toBe(false);
    }
    expect(evaluateEnglishReviewAnswer("unknown", "file").ok).toBe(false);
    expect(evaluateEnglishReviewAnswer("__proto__", "file").ok).toBe(false);
    expect(evaluateEnglishReviewAnswer("word-file", "  \n ").ok).toBe(false);
    expect(evaluateEnglishReviewAnswer("word-file", "a".repeat(161)).ok).toBe(false);
  });

  it("persists a capped draft, but wrong answers and Next before correctness record nothing", () => {
    const initial = begin();
    const longDraft = setEnglishReviewDraft(initial, "a".repeat(200));
    expect(longDraft.session?.draft).toHaveLength(160);
    const wrong = setEnglishReviewDraft(initial, "arquivo");
    expect(submitEnglishReviewAnswer(wrong, NOW)).toEqual(wrong);
    expect(advanceEnglishReview(wrong)).toEqual(wrong);
    expect(wrong.history).toEqual({});
    expect(wrong.session?.results).toEqual([]);
    expect(initial.session?.draft).toBe("");
    expect(readEnglishReviewSave(JSON.stringify(wrong))).toEqual(wrong);
  });

  it("records an unassisted correct answer once and waits for explicit advancement", () => {
    const initial = begin();
    const answered = answerCurrent(initial);
    expect(answered.session).toEqual({ ids: ids.slice(0, 3), cursor: 0, draft: "file", consulted: false, results: [{ lessonId: "word-file", helped: false }] });
    expect(answered.history).toEqual({ "word-file": { reviews: 1, helped: 0, lastAt: NOW } });
    expect(submitEnglishReviewAnswer(answered, NOW + 1)).toEqual(answered);
    expect(submitEnglishReviewAnswer(readEnglishReviewSave(JSON.stringify(answered)), NOW + 1)).toEqual(answered);
    expect(setEnglishReviewDraft(answered, "wrong")).toEqual(answered);
    expect(consultEnglishReviewModel(answered)).toEqual(answered);
    const next = advanceEnglishReview(answered);
    expect(next.session?.cursor).toBe(1);
    expect(next.session?.draft).toBe("");
    expect(next.session?.consulted).toBe(false);
    expect(next.history).toEqual(answered.history);
    expect(initial.history).toEqual({});
  });

  it("keeps consulting sticky through retries and reloads and records supported practice honestly", () => {
    const supported = consultEnglishReviewModel(begin(["word-file"]));
    const wrong = submitEnglishReviewAnswer(setEnglishReviewDraft(supported, "arquivo"), NOW);
    const reloaded = readEnglishReviewSave(JSON.stringify(wrong));
    expect(reloaded.session?.consulted).toBe(true);
    expect(reloaded.history).toEqual({});
    const answered = answerCurrent(reloaded);
    expect(answered.session?.results).toEqual([{ lessonId: "word-file", helped: true }]);
    expect(answered.history["word-file"]).toEqual({ reviews: 1, helped: 1, lastAt: NOW });
    expect(consultEnglishReviewModel(supported)).toEqual(supported);
  });

  it("finishes at cursor length without creating a new round until an explicit begin", () => {
    let save = begin();
    for (let index = 0; index < 3; index += 1) save = advanceEnglishReview(answerCurrent(save, NOW + index));
    expect(save.active).toBe(true);
    expect(save.session?.cursor).toBe(3);
    expect(save.session?.results).toHaveLength(3);
    expect(save.session?.draft).toBe("");
    expect(save.session?.consulted).toBe(false);
    const reloaded = readEnglishReviewSave(JSON.stringify(save));
    expect(reloaded).toEqual(save);
    expect(submitEnglishReviewAnswer(save, NOW + 10)).toEqual(save);
    expect(advanceEnglishReview(save)).toEqual(save);
    expect(setEnglishReviewDraft(save, "file")).toEqual(save);
    expect(consultEnglishReviewModel(save)).toEqual(save);
    const fresh = beginEnglishReview(save, ids, NOW + 10);
    expect(fresh.session?.ids).toEqual(ids.slice(3, 6));
    expect(fresh.session?.results).toEqual([]);
    expect(fresh.history).toEqual(save.history);
  });

  it("supports an explicitly fresh round and leaves no-eligible starts safely inactive", () => {
    const unfinished = setEnglishReviewDraft(begin(), "fi");
    const fresh = startAnotherEnglishReview(unfinished, ["word-error"], NOW);
    expect(fresh.session).toEqual({ ids: ["word-error"], cursor: 0, draft: "", consulted: false, results: [] });
    const completedOne = answerCurrent(begin(["word-file"]));
    expect(startAnotherEnglishReview(completedOne, [], NOW))
      .toEqual({ version: 1, active: false, history: completedOne.history });
    const closed = closeEnglishReview(unfinished);
    expect(setEnglishReviewDraft(closed, "file")).toEqual(closed);
    expect(consultEnglishReviewModel(closed)).toEqual(closed);
    expect(submitEnglishReviewAnswer(closed, NOW)).toEqual(closed);
    expect(advanceEnglishReview(closed)).toEqual(closed);
  });

  it("bounds counts, keeps timestamps monotonic, and refuses invalid submission time", () => {
    const save: EnglishReviewSave = {
      ...begin(["word-file"]),
      history: { "word-file": { reviews: 999, helped: 998, lastAt: NOW + 100 } },
    };
    const correct = setEnglishReviewDraft(consultEnglishReviewModel(save), "file");
    expect(submitEnglishReviewAnswer(correct, NOW).history["word-file"])
      .toEqual({ reviews: 999, helped: 999, lastAt: NOW + 100 });
    for (const now of [Number.NaN, Number.POSITIVE_INFINITY, -1, 0.5, 8_640_000_000_000_001]) {
      expect(submitEnglishReviewAnswer(correct, now)).toEqual(correct);
    }
    expect(submitEnglishReviewAnswer(correct, 0).session?.results).toHaveLength(1);
  });

  it("merges monotonic history without recounting while preserving next's session and navigation", () => {
    const active = setEnglishReviewDraft(begin(["word-run"]), "ru");
    active.history = {
      "word-file": { reviews: 2, helped: 0, lastAt: NOW + 10 },
      "word-save": { reviews: 1, helped: 1, lastAt: NOW },
    };
    const previous = closeEnglishReview(answerCurrent(begin(["word-error"])));
    previous.history["word-file"] = { reviews: 3, helped: 2, lastAt: NOW };
    const merged = mergeEnglishReviewSave(active, previous);
    expect(merged.active).toBe(true);
    expect(merged.session).toEqual(active.session);
    expect(merged.history).toEqual({
      "word-file": { reviews: 3, helped: 2, lastAt: NOW + 10 },
      "word-save": { reviews: 1, helped: 1, lastAt: NOW },
      "word-error": { reviews: 1, helped: 0, lastAt: NOW },
    });
    expect(mergeEnglishReviewSave(merged, previous)).toEqual(merged);
    expect(mergeEnglishReviewSave(closeEnglishReview(active), previous).active).toBe(false);
    const emptyNavigation = mergeEnglishReviewSave(emptyEnglishReviewSave(), previous);
    expect(emptyNavigation.session).toBeUndefined();
    expect(emptyNavigation.active).toBe(false);
    expect(emptyNavigation.history).toEqual(previous.history);
    expect(active.history["word-file"].reviews).toBe(2);
    expect(previous.session?.ids).toEqual(["word-error"]);
  });
});
