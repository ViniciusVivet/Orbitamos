import { describe, expect, it } from "vitest";
import { emptyChapterSave, orbiChapterKey } from "./orbiChapter";
import {
  PULSE_CODE_LIMIT, completePulseLesson, defaultPulseProgram, emptyPulseSave,
  getPulseLesson, preservePulseAchievements, pulseLessonIds, pulseLessons,
  pulseSaveKey, readPulseSave, testPulseProgram,
} from "./orbiPulse";

describe("Oficina do Pulso: programação do equipamento", () => {
  it("lê declarações JavaScript equivalentes e expressões sem executar código", () => {
    expect(testPulseProgram("const alcancePulso=280;\nconst recarga=.6;")).toMatchObject({ ok: true, program: { range: 280, cooldown: .6 } });
    expect(testPulseProgram("// equipamento\nlet alcancePulso=(140+140);\nvar recarga=3/5")).toMatchObject({ ok: true, program: { range: 280, cooldown: .6 } });
    expect(testPulseProgram("const alcancePulso=280\nconst recarga=alcancePulso / 400")).toMatchObject({ ok: true, program: { range: 280, cooldown: .7 } });
    expect(testPulseProgram("const alcancePulso=+ +280; const recarga=0.6;")).toMatchObject({ ok: true });
  });

  it("rejeita execução, coerção e sintaxe fora da gramática sem tocar globais", () => {
    const cases = [
      "alert(1)", "fetch('/api')", "while(true){}",
      "const alcancePulso=window.x; const recarga=.6;",
      "const alcancePulso=(()=>280)(); const recarga=.6;",
      "const alcancePulso='280'; const recarga=.6;",
      "const alcancePulso=280; const recarga=NaN;",
      "const alcancePulso=Infinity; const recarga=.6;",
      "const alcancePulso=1/0; const recarga=.6;",
      "const alcancePulso=280; const recarga=0/0;",
      "const alcancePulso=++280; const recarga=.6;",
      "const alcancePulso=--280; const recarga=.6;",
      "const alcancePulso=0280; const recarga=.6;",
      "const alcancePulso=280; const recarga=0,6;",
      "const alcancePulso=280 const recarga=.6",
      "const alcancePulso=280; const recarga=.6; recarga=1;",
      "const alcancePulso=280; const recarga=.6; const extra=1;",
      "const alcancePulso=280; const alcancePulso=.6;",
      "const alcancePulso=recarga; const recarga=.6;",
      "const alcancePulso=280; const recarga=constructor;",
      "const alcancePulso=280; const recarga=1/**/.toString();",
      "const alcancePulso=280; const recarga=Math.random();",
    ];
    for (const code of cases) expect(testPulseProgram(code), code).toMatchObject({ ok: false, output: "" });
  });

  it("aplica configurações insuficientes para que o cenário mostre a consequência", () => {
    const initial = defaultPulseProgram();
    expect(initial).toEqual({ range: 90, cooldown: 1.4 });
    expect(defaultPulseProgram("ritmo")).toEqual({ range: 280, cooldown: 1.4 });
    expect(testPulseProgram(getPulseLesson("alcance").starterCode)).toMatchObject({ ok: true, program: initial });
    expect(testPulseProgram(getPulseLesson("ritmo").starterCode)).toMatchObject({ ok: true, program: { range: 280, cooldown: 1.4 } });
    const next = defaultPulseProgram(); next.range = 400;
    expect(defaultPulseProgram().range).toBe(90);
  });

  it("protege limites finitos, fontes grandes e quantidade de tokens", () => {
    for (const [range, cooldown] of [[40, .25], [400, 2.5], [240.5, .6]]) {
      expect(testPulseProgram(`const alcancePulso=${range}; const recarga=${cooldown};`)).toMatchObject({ ok: true, program: { range, cooldown } });
    }
    for (const [range, cooldown] of [[39.99, .6], [400.1, .6], [280, .249], [280, 2.501], [-280, .6]]) {
      expect(testPulseProgram(`const alcancePulso=${range}; const recarga=${cooldown};`)).toMatchObject({ ok: false });
    }
    expect(testPulseProgram("")).toMatchObject({ ok: false });
    expect(testPulseProgram(" ".repeat(PULSE_CODE_LIMIT + 1) + "const alcancePulso=280; const recarga=.6;")).toMatchObject({ ok: false });
    expect(testPulseProgram(`const alcancePulso=${"(".repeat(190)}280${")".repeat(190)}; const recarga=.6;`)).toMatchObject({ ok: false });
  });

  it("exige os dois nomes na ordem ensinada e preserva referências executáveis", () => {
    for (const code of ["const alcancePulso=280;", "const recarga=.6; const alcancePulso=280;", "const alcance=280; const recarga=.6;"]) {
      expect(testPulseProgram(code)).toMatchObject({ ok: false });
    }
    expect(pulseLessons).toHaveLength(2);
    expect(pulseLessonIds).toEqual(["alcance", "ritmo"]);
    for (const lesson of pulseLessons) {
      expect(testPulseProgram(lesson.referenceCode), lesson.id).toMatchObject({ ok: true, program: { range: 280, cooldown: .6 } });
      expect(lesson.hints).toHaveLength(3);
      expect(lesson.instruction).toContain("recarga");
    }
  });
});

describe("Oficina do Pulso: progresso independente", () => {
  it("isola contas e não importa nem altera a conclusão das três entregas", () => {
    expect(pulseSaveKey("alice")).not.toBe(pulseSaveKey("bob"));
    expect(pulseSaveKey("alice")).toBe("orbitamos-orbi-pulse-v1-alice");
    expect(pulseSaveKey("alice")).not.toBe(orbiChapterKey("alice"));
    const chapter = { ...emptyChapterSave(), completed: ["ponte", "elevador", "farol"] };
    const before = JSON.stringify(chapter);
    expect(readPulseSave(before)).toEqual(emptyPulseSave());
    expect(JSON.stringify(chapter)).toBe(before);
  });

  it("recupera rascunhos, limita dados e não aceita atalhos para a segunda conquista", () => {
    for (const raw of [null, "", "{", "null", "[]", '{"version":2}']) expect(readPulseSave(raw)).toEqual(emptyPulseSave());
    const save = readPulseSave(JSON.stringify({
      version: 1, current: "ritmo", completed: ["ritmo", "desconhecido"],
      drafts: { alcance: "x".repeat(PULSE_CODE_LIMIT + 50), ritmo: 42 },
      attempts: { alcance: -2, ritmo: 20000 },
    }));
    expect(save.current).toBe("alcance"); expect(save.completed).toEqual([]);
    expect(save.drafts.alcance).toHaveLength(PULSE_CODE_LIMIT);
    expect(save.drafts.ritmo).toBe(getPulseLesson("ritmo").starterCode);
    expect(save.attempts).toEqual({ alcance: 0, ritmo: 10000 });
    const next = readPulseSave(JSON.stringify({ version: 1, current: "ritmo", completed: ["alcance"], drafts: [], attempts: { alcance: .5, ritmo: "3" } }));
    expect(next.current).toBe("ritmo"); expect(next.completed).toEqual(["alcance"]);
    expect(next.attempts).toEqual({ alcance: 0, ritmo: 0 });
  });

  it("só avança em prefixo e não duplica conclusão nem muta o save anterior", () => {
    const start = emptyPulseSave();
    expect(completePulseLesson(start, "ritmo")).toBe(start);
    const first = completePulseLesson(start, "alcance");
    expect(start.completed).toEqual([]); expect(first.completed).toEqual(["alcance"]); expect(first.current).toBe("ritmo");
    expect(completePulseLesson(first, "alcance")).toBe(first);
    const all = completePulseLesson(first, "ritmo");
    expect(all.completed).toEqual(["alcance", "ritmo"]);
    expect(completePulseLesson(all, "ritmo")).toBe(all);
    expect(readPulseSave(JSON.stringify(all))).toEqual(all);
  });

  it("uma aba antiga mantém conquistas e tentativas sem apagar a edição ativa", () => {
    const editing = emptyPulseSave(); editing.drafts.alcance = "const alcancePulso=320;\nconst recarga=.5;"; editing.attempts.alcance = 2;
    const stored = completePulseLesson(emptyPulseSave(), "alcance"); stored.attempts.alcance = 5; stored.attempts.ritmo = 1;
    const merged = preservePulseAchievements(editing, stored);
    expect(merged.completed).toEqual(["alcance"]);
    expect(merged.current).toBe("alcance"); expect(merged.drafts).toEqual(editing.drafts);
    expect(merged.attempts).toEqual({ alcance: 5, ritmo: 1 });
    expect(editing.completed).toEqual([]); expect(stored.completed).toEqual(["alcance"]);
    const all = completePulseLesson(stored, "ritmo"); editing.attempts.ritmo = 9;
    expect(preservePulseAchievements(editing, all)).toMatchObject({ completed: ["alcance", "ritmo"], attempts: { alcance: 5, ritmo: 9 } });
  });
});
