import { describe, expect, it } from "vitest";
import { getAcademyEnglishRecords } from "./academyEnglishRecords";
import { getAcademyActivity, resumeStorageKey } from "./academyActivity";
import { practiceDestination } from "./practiceStation";
import { emptySpeakingSave, englishSpeakingLessons, speakingSaveKey } from "./spokenEnglish";
import { emptyEnglishUseSave, englishUseKey } from "./englishUse";
import { emptyEnglishReviewSave, englishReviewKey } from "./englishReview";
import { ENGLISH_SPEAKING_HREF, academyPreviewHref } from "./portalNavigation";

describe("separate English practice records", () => {
  it("keeps practices visible after another activity, without inflating catalog counts or writing storage", () => {
    const lesson = englishSpeakingLessons[0];
    const saves = new Map([
      [speakingSaveKey("u"), JSON.stringify({ ...emptySpeakingSave(), completed: [lesson.id] })],
      [englishUseKey("u"), JSON.stringify({ ...emptyEnglishUseSave(), completed: [lesson.id] })],
      [englishReviewKey("u"), JSON.stringify({ ...emptyEnglishReviewSave(), history: { [lesson.id]: { reviews: 2, helped: 1, lastAt: 1000 } } })],
      [resumeStorageKey("u"), JSON.stringify({ href: "/estudante/pratica/variaveis-js", updatedAt: 2000 })],
    ]);
    const before = [...saves];
    const read = (key: string) => saves.get(key) ?? null;
    const records = getAcademyEnglishRecords("u", read);
    expect(records.map(item => item.id)).toEqual(["spoken-english", "english-use", "english-review"]);
    expect(records.map(item => item.completedUnits)).toEqual([1, 1, 1]);
    expect(records[0].history).toContain("não é uma nota de pronúncia");
    expect(records[2]).toMatchObject({ lastAt: 1000, totalUnits: 12, unit: "expressões revisadas" });
    expect(getAcademyActivity("u", read).summaries.experiences).toMatchObject({ total: 6, completed: 0 });
    expect(getAcademyEnglishRecords("another", read)).toEqual([]);
    expect(getAcademyEnglishRecords(42, read)).toEqual([]);
    expect([...saves]).toEqual(before);
  });

  it("does not invent practice from absent, corrupt or default saves", () => {
    expect(getAcademyEnglishRecords("u", () => null)).toEqual([]);
    expect(getAcademyEnglishRecords("u", () => "corrupt")).toEqual([]);
    const defaults = new Map([[speakingSaveKey("u"), JSON.stringify(emptySpeakingSave())], [englishUseKey("u"), JSON.stringify(emptyEnglishUseSave())], [englishReviewKey("u"), JSON.stringify(emptyEnglishReviewSave())]]);
    expect(getAcademyEnglishRecords("u", key => defaults.get(key) ?? null)).toEqual([]);
  });

  it("resumes the exact speaking destination in Games while preserving the six-activity identity", () => {
    const read = (key: string) => key === resumeStorageKey("u") ? JSON.stringify({ href: ENGLISH_SPEAKING_HREF, updatedAt: 2000 }) : null;
    expect(practiceDestination("english", "u", read)).toBe(ENGLISH_SPEAKING_HREF);
    expect(practiceDestination("english", "u", read, true)).toBe(academyPreviewHref(ENGLISH_SPEAKING_HREF));
    expect(practiceDestination("english", "other", read)).toBe("/estudante/jogos/ingles-em-cena");
    expect(getAcademyActivity("u", read).continueItem?.id).toBe("spoken-english");
    for (const href of ["https://example.org/#falar", "//example.org/", "/estudante/jogos/ingles-em-cena#falarr", "/estudante/pratica/variaveis-js"]) {
      expect(practiceDestination("english", "u", () => JSON.stringify({ href, updatedAt: 2000 }))).toBe("/estudante/jogos/ingles-em-cena");
    }
  });
});
