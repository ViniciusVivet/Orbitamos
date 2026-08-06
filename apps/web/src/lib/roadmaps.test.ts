import { describe, expect, it } from "vitest";

import { getRoadmapBySlug, getTotalSkills, roadmaps } from "./roadmaps";

function expectUnique(values: string[]) {
  expect(new Set(values).size).toBe(values.length);
}

describe("career roadmaps", () => {
  it("has unique and resolvable roadmap identifiers", () => {
    expect(roadmaps.length).toBeGreaterThan(0);
    expectUnique(roadmaps.map((roadmap) => roadmap.id));
    expectUnique(roadmaps.map((roadmap) => roadmap.slug));

    for (const roadmap of roadmaps) {
      expect(getRoadmapBySlug(roadmap.slug)).toBe(roadmap);
      expect(roadmap.title.trim()).not.toBe("");
      expect(roadmap.categories.length).toBeGreaterThan(0);
    }
    expect(getRoadmapBySlug("nao-existe")).toBeUndefined();
  });

  it("has unique category and skill identifiers inside every roadmap", () => {
    for (const roadmap of roadmaps) {
      expectUnique(roadmap.categories.map((category) => category.id));
      const skills = roadmap.categories.flatMap((category) => category.skills);
      expectUnique(skills.map((skill) => skill.id));
      expect(skills.every((skill) => skill.label.trim().length > 0)).toBe(true);
      expect(getTotalSkills(roadmap)).toBe(skills.length);
    }
  });

  it("does not publish empty presentation metadata", () => {
    for (const roadmap of roadmaps) {
      expect(roadmap.subtitle.trim()).not.toBe("");
      expect(roadmap.estimatedMonths.trim()).not.toBe("");
      expect(roadmap.color).toContain("from-");
      expect(roadmap.accent).toContain("text-");
      expect(roadmap.border).toContain("border-");
    }
  });
});
