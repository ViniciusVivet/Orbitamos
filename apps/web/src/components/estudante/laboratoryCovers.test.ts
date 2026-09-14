import { describe, expect, it } from "vitest";
import { desafios } from "@/lib/desafios";
import { getLaboratoryCover } from "./laboratoryCovers";

describe("laboratory cover art direction", () => {
  it("keeps the opening subjects visually distinct", () => {
    expect(getLaboratoryCover("Fundamentos").key).toBe("fundamentos");
    expect(getLaboratoryCover("Operadores").key).toBe("calculos");
    expect(getLaboratoryCover("Condicionais").key).toBe("decisoes");
    expect(getLaboratoryCover("Laços").key).toBe("repeticao");
  });
  it("uses all six families and gives every challenge a local cover", () => {
    const covers = desafios.map(challenge => getLaboratoryCover(challenge.categoria));
    expect(new Set(covers.map(cover => cover.key)).size).toBe(6);
    for (const cover of covers) {
      expect(cover.image).toBeTruthy();
      expect(cover.position).toMatch(/%/);
    }
  });
  it("preserves covers after filtering or reordering", () => {
    const originals = new Map(desafios.map(challenge => [challenge.slug, getLaboratoryCover(challenge.categoria).key]));
    for (const challenge of desafios.slice().reverse().filter(item => item.linguagem === "python")) {
      expect(getLaboratoryCover(challenge.categoria).key).toBe(originals.get(challenge.slug));
    }
  });
  it("has a safe visual fallback for future subjects", () => {
    expect(getLaboratoryCover().key).toBe("fundamentos");
    expect(getLaboratoryCover("Novo tema").key).toBe("fundamentos");
  });
});
