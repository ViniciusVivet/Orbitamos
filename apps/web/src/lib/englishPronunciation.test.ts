import { describe, expect, it } from "vitest";
import { englishPronunciations, getEnglishPronunciation } from "./englishPronunciation";
import { buildSpokenScript, englishSpeakingLessons } from "./spokenEnglish";

describe("Portuguese reading aids for English pronunciation", () => {
  it("provides an authored guide for every spoken lesson, without replacing the English audio model", () => {
    for (const lesson of englishSpeakingLessons) {
      const pronunciation = getEnglishPronunciation(lesson.en);
      expect(pronunciation, lesson.id).toBeDefined();
      expect(lesson.pronunciation).toBe(pronunciation);
      expect(pronunciation!.guide.toLowerCase()).not.toBe(lesson.en.toLowerCase());
      expect(buildSpokenScript(lesson).filter(part => part.lang === "en-US").map(part => part.text))
        .toEqual([lesson.en, lesson.en]);
      expect(buildSpokenScript(lesson).some(part => part.text === pronunciation!.guide)).toBe(false);
    }
    expect(getEnglishPronunciation("save")?.guide).toBe("sêiv");
    expect(getEnglishPronunciation("file")?.guide).toBe("fáil");
  });

  it("covers the English targets and instructions used by the eight illustrated scenes", () => {
    const sceneTargets = [
      "folder", "file", "button", "server", "save", "Saved!", "return", "output",
      "found", "File not found", "Not found", "Open the folder", "Open the file", "Click the Save button",
    ];
    for (const text of sceneTargets) {
      expect(getEnglishPronunciation(text), text).toBeDefined();
    }
  });

  it("keeps segmented English and its Portuguese aid aligned, with no empty or duplicate catalog entries", () => {
    const keys = englishPronunciations.map(item => item.text.toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
    for (const item of englishPronunciations) {
      expect(item.chunks.map(chunk => chunk.en).join(" ")).toBe(item.text);
      expect(item.chunks.map(chunk => chunk.pt).join(" ")).toBe(item.guide);
      expect(item.tip.trim().length).toBeGreaterThan(20);
      expect(item.chunks.every(chunk => chunk.en.trim() && chunk.pt.trim())).toBe(true);
    }
    expect(getEnglishPronunciation("Save the file")?.chunks).toEqual([
      { en: "Save", pt: "sêiv" }, { en: "the", pt: "dâ" }, { en: "file", pt: "fáil" },
    ]);
    expect(getEnglishPronunciation("Fix the error")?.chunks[1]).toEqual({ en: "the", pt: "di" });
  });

  it("finds the same authored expression across presentation casing, spaces and terminal punctuation", () => {
    const original = getEnglishPronunciation("File not found");
    expect(getEnglishPronunciation("  FILE  not\nfound!? ")).toBe(original);
    expect(getEnglishPronunciation("Ｆｉｌｅ not found.")).toBe(original);
    expect(getEnglishPronunciation("Save!")).toBe(getEnglishPronunciation("save"));
  });

  it("does not invent a pronunciation for an unknown expression or partial code token", () => {
    for (const unknown of ["", " ", "constructor", "__proto__", "console.log", "function", "file name", "save()", "arquivo", "new arbitrary phrase"]) {
      expect(getEnglishPronunciation(unknown)).toBeUndefined();
    }
  });

  it("makes non-equivalent sounds and final clusters explicit instead of presenting the respelling as exact", () => {
    for (const item of englishPronunciations.filter(item => item.chunks.some(chunk => chunk.en.toLowerCase() === "the"))) {
      expect(item.tip).toContain("só uma pista");
      expect(item.tip).toContain("entre os dentes");
    }
    expect(getEnglishPronunciation("passed")?.tip).toContain("ed soa como t");
    expect(getEnglishPronunciation("failed")?.tip).toContain("som de d");
    expect(getEnglishPronunciation("saved")?.tip).toContain("som de d");
    expect(getEnglishPronunciation("return")?.guide).toContain("TÂRN");
  });
});
