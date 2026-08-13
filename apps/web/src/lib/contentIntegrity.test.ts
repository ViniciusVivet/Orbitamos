import { afterEach, describe, expect, it, vi } from "vitest";
import { getProjetoBySlug, getProjetosByCategoria, projetos } from "@/data/projetos";
import {
  aulaNoCurso,
  cursoPorSlug,
  cursos,
  proximaAulaId,
  totalAulas,
} from "./cursos";
import { desafios, getDesafio, getNextDesafio } from "./desafios";
import {
  fasesMonteCodigo,
  getFaseMonteCodigo,
  getProximaFase,
  lerProgressoFase,
  salvarProgressoFase,
} from "./jogoMonteCodigo";

function expectUnique(values: string[]) {
  expect(new Set(values).size).toBe(values.length);
}

describe("portfolio integrity", () => {
  it("has unique, resolvable project slugs", () => {
    expect(projetos.length).toBeGreaterThan(0);
    expectUnique(projetos.map((projeto) => projeto.slug));
    for (const projeto of projetos) {
      expect(getProjetoBySlug(projeto.slug)).toBe(projeto);
      expect(projeto.nome.trim()).not.toBe("");
      expect(projeto.resumo.trim()).not.toBe("");
    }
  });

  it("filters categories without changing the all-projects contract", () => {
    expect(getProjetosByCategoria("todos")).toBe(projetos);
    const category = projetos[0].categoria;
    expect(getProjetosByCategoria(category).every((item) => item.categoria === category)).toBe(
      true
    );
    expect(getProjetosByCategoria("inexistente")).toEqual([]);
  });

  it("keeps the new product cases available across portfolio routes", () => {
    expect(projetos).toHaveLength(9);
    expect(getProjetoBySlug("radar-da-rima")?.link).toBe("https://batalhai.vercel.app/");
    expect(getProjetoBySlug("orbicore-gestao")?.github).toBe(
      "https://github.com/ViniciusVivet/OrbiCore"
    );
  });
});

describe("course catalog integrity", () => {
  it("has unique course, module and lesson identifiers", () => {
    expect(cursos.length).toBeGreaterThan(0);
    expectUnique(cursos.map((curso) => curso.slug));
    expectUnique(cursos.flatMap((curso) => curso.modulos.map((modulo) => modulo.id)));
    expectUnique(
      cursos.flatMap((curso) =>
        curso.modulos.flatMap((modulo) => modulo.aulas.map((aula) => aula.id))
      )
    );
  });

  it("keeps course helpers consistent across module boundaries", () => {
    for (const curso of cursos) {
      expect(cursoPorSlug(curso.slug)).toBe(curso);
      expect(totalAulas(curso)).toBe(
        curso.modulos.reduce((sum, modulo) => sum + modulo.aulas.length, 0)
      );
      const aulas = curso.modulos.flatMap((modulo) => modulo.aulas);
      aulas.forEach((aula, index) => {
        expect(aulaNoCurso(curso, aula.id)).toBe(aula);
        expect(proximaAulaId(curso, aula.id)).toBe(aulas[index + 1]?.id ?? null);
      });
    }
  });
});

describe("practice catalog integrity", () => {
  it("has unique challenges with valid lookup", () => {
    expect(desafios.length).toBeGreaterThan(0);
    expectUnique(desafios.map((desafio) => desafio.slug));
    for (const desafio of desafios) {
      expect(getDesafio(desafio.slug)).toBe(desafio);
      expect(desafio.titulo.trim()).not.toBe("");
      expect(desafio.steps.length).toBeGreaterThan(0);
    }
  });

  it("only advances to a challenge in the same language", () => {
    for (const desafio of desafios) {
      const next = getNextDesafio(desafio.slug);
      if (next) expect(next.linguagem).toBe(desafio.linguagem);
    }
    expect(getNextDesafio("nao-existe")).toBeUndefined();
  });

  it("keeps hidden checks out of the visible starter code", () => {
    for (const desafio of desafios) {
      if (!desafio.testCode) continue;
      expect(desafio.codigoInicial).not.toContain(desafio.testCode);
      expect(desafio.testCode.trim()).not.toBe("");
    }
    expect(desafios.filter((desafio) => desafio.testCode).length).toBeGreaterThanOrEqual(8);
  });

  it("accepts the reference solutions in JavaScript hidden checks", () => {
    const javascriptChallenges = desafios.filter(
      (desafio) => desafio.linguagem === "javascript" && desafio.testCode && desafio.solucao
    );
    for (const desafio of javascriptChallenges) {
      const output: string[] = [];
      const safeConsole = { log: (value: unknown) => output.push(String(value)) };
      const execute = new Function("console", `${desafio.solucao}\n${desafio.testCode}`);
      expect(() => execute(safeConsole)).not.toThrow();
      expect(output.at(-1)?.toLowerCase()).not.toContain("false");
    }
  });
});

describe("Monte o Código integrity", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("has unique phases with a single ordered source", () => {
    expect(fasesMonteCodigo.length).toBeGreaterThan(0);
    expectUnique(fasesMonteCodigo.map((fase) => fase.slug));
    for (const fase of fasesMonteCodigo) {
      expect(getFaseMonteCodigo(fase.slug)).toBe(fase);
      expect(fase.linhas.length).toBeGreaterThan(1);
      expect(fase.saidaEsperada.trim()).not.toBe("");
    }
  });

  it("navigates phases and ends after the final one", () => {
    fasesMonteCodigo.forEach((fase, index) => {
      expect(getProximaFase(fase.slug)).toBe(fasesMonteCodigo[index + 1]);
    });
    expect(getProximaFase("nao-existe")).toBeUndefined();
  });

  it("returns empty progress outside the browser", () => {
    expect(lerProgressoFase("user", "fase")).toEqual({
      concluido: false,
      tentativas: 0,
    });
  });

  it("persists progress using a user-scoped key", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    salvarProgressoFase("user", "fase", { concluido: true, tentativas: 4 });
    expect(lerProgressoFase("user", "fase")).toEqual({
      concluido: true,
      tentativas: 4,
    });
    expect(lerProgressoFase("other", "fase")).toEqual({
      concluido: false,
      tentativas: 0,
    });
  });

  it("falls back safely for invalid JSON and unavailable storage", () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: () => "{",
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(lerProgressoFase(undefined, "fase")).toEqual({
      concluido: false,
      tentativas: 0,
    });
    expect(() =>
      salvarProgressoFase(undefined, "fase", {
        concluido: false,
        tentativas: 1,
      })
    ).not.toThrow();
  });
});
