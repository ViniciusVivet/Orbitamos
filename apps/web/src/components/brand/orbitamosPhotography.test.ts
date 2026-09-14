import { describe, expect, it } from "vitest";
import { cursos } from "@/lib/cursos";
import { coursePhotoKind, orbitamosPhotos } from "./orbitamosPhotography";

describe("Orbitamos editorial photography", () => {
  it("keeps all six local photographs available", () => {
    expect(Object.keys(orbitamosPhotos)).toHaveLength(6);
    for (const photo of Object.values(orbitamosPhotos)) expect(photo).toBeTruthy();
  });
  it("maps courses to their subject, not their position", () => {
    expect(coursePhotoKind("html-css-js")).toBe("criacao");
    expect(coursePhotoKind("sql-na-pratica")).toBe("dados");
    expect(coursePhotoKind("github-colaborativo")).toBe("equipe");
    expect(coursePhotoKind("montagem-manutencao")).toBe("hardware");
    for (const course of cursos.slice().reverse()) {
      expect(orbitamosPhotos[coursePhotoKind(course.slug)]).toBeTruthy();
    }
  });
  it("supplies a safe study scene for new course slugs", () => {
    expect(coursePhotoKind("curso-novo")).toBe("estudo");
  });
})
