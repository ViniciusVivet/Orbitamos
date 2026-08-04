import { describe, expect, it } from "vitest";
import {
  candidateCourseMaterialFilenames,
  getCourseMaterialContentType,
  isSafeCourseMaterialSegment,
  normalizeCourseMaterialStem,
} from "./courseMaterials";

describe("course material path safety", () => {
  it.each(["sql-na-pratica", "01-aula.pdf", "arquivo com espaço.docx"])(
    "accepts safe segment %s",
    (segment) => expect(isSafeCourseMaterialSegment(segment)).toBe(true)
  );

  it.each(["", ".", "..", "../secret", "pasta/arquivo", "pasta\\arquivo"])(
    "rejects unsafe segment %s",
    (segment) => expect(isSafeCourseMaterialSegment(segment)).toBe(false)
  );
});

describe("course material filename fallback", () => {
  it("tries office formats when a PDF was requested", () => {
    expect(candidateCourseMaterialFilenames("apostila.pdf")).toEqual([
      "apostila.pdf",
      "apostila.docx",
      "apostila.xlsx",
      "apostila.xlsm",
    ]);
  });

  it.each(["arquivo\nmalicioso.pdf", "arquivo\rmalicioso.pdf", "arquivo\0.pdf", "a".repeat(256)])(
    "rejects control characters and oversized segments: %j",
    (segment) => {
      expect(isSafeCourseMaterialSegment(segment)).toBe(false);
    }
  );

  it("does not create fallbacks for an existing office extension", () => {
    expect(candidateCourseMaterialFilenames("apostila.docx")).toEqual([
      "apostila.docx",
    ]);
  });
});

describe("course material normalization", () => {
  it("removes accents, sequence prefixes and punctuation", () => {
    expect(normalizeCourseMaterialStem("01-Apostila Lógica de Programação.pdf")).toBe(
      "apostila-logica-de-programacao"
    );
  });

  it("normalizes equivalent names to the same stem", () => {
    expect(normalizeCourseMaterialStem("02_banco-de-dados.xlsx")).toBe(
      normalizeCourseMaterialStem("Banco de Dados.pdf")
    );
  });
});

describe("course material content types", () => {
  it.each([
    ["a.pdf", "application/pdf"],
    [
      "a.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    [
      "a.xlsx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    ["a.xlsm", "application/vnd.ms-excel.sheet.macroEnabled.12"],
  ])("maps %s", (filename, expected) => {
    expect(getCourseMaterialContentType(filename)).toBe(expected);
  });

  it("uses a safe binary default", () => {
    expect(getCourseMaterialContentType("arquivo.exe")).toBe(
      "application/octet-stream"
    );
  });
});
