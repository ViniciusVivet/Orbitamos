import { describe, expect, it } from "vitest";
import { courseEdition, displayDate, projectIsComplete, projectStatusLabel, safeProgress } from "./portalPresentation";

describe("portal presentation", () => {
  it.each(["completed", "Concluído", "encerrado", "finalizado"])("recognizes the completed status %s", status => {
    expect(projectIsComplete(status)).toBe(true);
    expect(projectStatusLabel(status)).toBe("Concluído");
  });
  it.each(["todo", "in_progress", "paused", "em_andamento"])("does not count %s as completed", status => {
    expect(projectIsComplete(status)).toBe(false);
  });
  it("translates the actual admin status values", () => {
    expect(projectStatusLabel("todo")).toBe("A fazer");
    expect(projectStatusLabel("in_progress")).toBe("Em andamento");
    expect(projectStatusLabel("paused")).toBe("Pausado");
  });
  it("does not invent percentages or dates", () => {
    expect(safeProgress(undefined)).toBeNull();
    expect(safeProgress(Number.NaN)).toBeNull();
    expect(safeProgress(Infinity)).toBeNull();
    expect(safeProgress(150)).toBe(100);
    expect(safeProgress(-2)).toBe(0);
    expect(safeProgress(65)).toBe(65);
    expect(displayDate(null)).toBeNull();
    expect(displayDate("invalid")).toBeNull();
    expect(displayDate("2026-09-13")).toContain("13");
  });
  it("keeps a course edition consistent with its subject", () => {
    expect(courseEdition({id:"x",slug:"github-colaborativo",titulo:"GitHub",modulos:[]}).mark).toBe("Git");
    expect(courseEdition({id:"x",slug:"html-css-js",titulo:"Web",modulos:[]}).tone).toBe("violet");
  });
});
