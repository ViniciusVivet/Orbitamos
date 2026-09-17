import { describe, expect, it } from "vitest";
import { servicos } from "@/data/servicos";
import { servicePhotoKind, studioPhotos } from "./studioPhotography";
describe("Studio service photography", () => {
  it("gives all six canonical services a local illustrative photograph", () => {
    expect(servicos).toHaveLength(6);
    for(const service of servicos) expect(studioPhotos[servicePhotoKind(service.slug)]).toBeTruthy();
  });
  it("uses subject-based covers and preserves them through sorting", () => {
    expect(servicePhotoKind("organizar-a-empresa")).toBe("dados");
    expect(servicePhotoKind("vender-pela-internet")).toBe("lancamento");
    expect(servicePhotoKind("presenca-profissional")).toBe("criacao");
    expect(servicePhotoKind("novo-servico")).toBe("criacao");
  });
});
