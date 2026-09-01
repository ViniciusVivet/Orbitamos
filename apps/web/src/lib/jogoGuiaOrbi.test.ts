import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calcularEstrelas,
  comandoDoFrameOrbi,
  executarPrograma,
  getNivelGuiaOrbi,
  getProximoNivel,
  lerProgressoNivel,
  niveisGuiaOrbi,
  rotuloFrameOrbi,
  salvarProgressoNivel,
  type NivelGuiaOrbi,
} from "./jogoGuiaOrbi";

const nivelBase: NivelGuiaOrbi = {
  slug: "teste",
  titulo: "Teste",
  descricao: "",
  dica: "",
  explicacao: "",
  cols: 4,
  rows: 3,
  inicio: { x: 0, y: 1, dir: 1 },
  portal: { x: 2, y: 1 },
  asteroides: [],
  slotsPrincipal: 5,
  par: 2,
};

describe("Guia Orbi execution", () => {
  it("reaches the portal with the correct sequence", () => {
    const result = executarPrograma(nivelBase, ["avancar", "avancar"], []);
    expect(result.resultado).toBe("portal");
    expect(result.frames.at(-1)).toMatchObject({ x: 2, y: 1, evento: "portal" });
  });

  it("crashes outside the board", () => {
    const result = executarPrograma(
      { ...nivelBase, portal: { x: 3, y: 2 } },
      ["esquerda", "avancar", "avancar"],
      []
    );
    expect(result.resultado).toBe("crash");
    expect(result.frames.at(-1)?.evento).toBe("crash");
  });

  it("crashes into an asteroid without moving into its cell", () => {
    const result = executarPrograma(
      { ...nivelBase, asteroides: [{ x: 1, y: 1 }] },
      ["avancar"],
      []
    );
    expect(result.resultado).toBe("crash");
    expect(result.frames.at(-1)).toMatchObject({ x: 0, y: 1 });
  });

  it("executes the reusable function track", () => {
    const result = executarPrograma(
      nivelBase,
      ["funcao"],
      ["avancar", "avancar"]
    );
    expect(result.resultado).toBe("portal");
    expect(result.frames.at(-1)?.track).toBe("funcao");
  });

  it("labels trace frames by their real program address", () => {
    const result = executarPrograma(
      { ...nivelBase, portal: { x: 3, y: 2 } },
      ["avancar", "direita", "avancar"],
      []
    );
    const commandFrames = result.frames.filter((frame) => frame.track);
    expect(commandFrames.map(rotuloFrameOrbi)).toEqual(["P1", "P2", "P3"]);
    expect(commandFrames.map((frame) => comandoDoFrameOrbi(frame, ["avancar", "direita", "avancar"], []))).toEqual([
      "avancar",
      "direita",
      "avancar",
    ]);
  });

  it("stops recursive programs at the safety limit", () => {
    const result = executarPrograma(nivelBase, ["funcao"], ["funcao"]);
    expect(result.resultado).toBe("limite");
    expect(result.frames.at(-1)?.evento).toBe("limite");
  });

  it("returns perdido when commands finish away from the portal", () => {
    expect(executarPrograma(nivelBase, ["avancar"], []).resultado).toBe("perdido");
  });
});

describe("Guia Orbi progression", () => {
  it("awards stars according to par", () => {
    expect(calcularEstrelas(nivelBase, 2)).toBe(3);
    expect(calcularEstrelas(nivelBase, 4)).toBe(2);
    expect(calcularEstrelas(nivelBase, 5)).toBe(1);
  });

  it("has unique slugs and valid lookup/navigation", () => {
    expect(new Set(niveisGuiaOrbi.map((nivel) => nivel.slug)).size).toBe(
      niveisGuiaOrbi.length
    );
    const first = niveisGuiaOrbi[0];
    expect(getNivelGuiaOrbi(first.slug)).toBe(first);
    expect(getProximoNivel(first.slug)).toBe(niveisGuiaOrbi[1]);
    expect(getProximoNivel("nao-existe")).toBeUndefined();
  });
});

describe("Guia Orbi persistence", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns empty progress outside the browser", () => {
    expect(lerProgressoNivel("user", "nivel")).toEqual({
      concluido: false,
      estrelas: 0,
      tentativas: 0,
    });
  });

  it("saves and restores normalized progress", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });

    salvarProgressoNivel("user", "nivel", {
      concluido: true,
      estrelas: 3,
      tentativas: 2,
    });
    expect(lerProgressoNivel("user", "nivel")).toEqual({
      concluido: true,
      estrelas: 3,
      tentativas: 2,
    });
  });

  it("sanitizes invalid or corrupted stored values", () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: vi
        .fn()
        .mockReturnValueOnce('{"concluido":1,"estrelas":9,"tentativas":"x"}')
        .mockReturnValueOnce("{"),
      setItem: vi.fn(),
    });

    expect(lerProgressoNivel(undefined, "nivel")).toEqual({
      concluido: true,
      estrelas: 0,
      tentativas: 0,
    });
    expect(lerProgressoNivel(undefined, "nivel")).toEqual({
      concluido: false,
      estrelas: 0,
      tentativas: 0,
    });
  });

  it("keeps the game usable when storage throws", () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() =>
      salvarProgressoNivel("user", "nivel", {
        concluido: false,
        estrelas: 0,
        tentativas: 1,
      })
    ).not.toThrow();
    expect(lerProgressoNivel("user", "nivel").tentativas).toBe(0);
  });
});
