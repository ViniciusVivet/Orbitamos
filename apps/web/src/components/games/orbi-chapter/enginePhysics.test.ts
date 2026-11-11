import { describe, expect, it } from "vitest";
import { chapterPlatforms, defaultChapterProgram, initialChapterBody, stepChapterBody, type ChapterBody, type ChapterInput, type ChapterPlatform } from "@/lib/orbiChapter";

describe("geometria reutilizada no motor do Orbi", () => {
  it("mantém o passageiro do elevador igual à simulação com geometria recalculada", () => {
    const program = { ...defaultChapterProgram(), lift: 220 };
    const platforms = chapterPlatforms("elevador", program, 0);
    const lift = platforms.find(platform => platform.id === "lift")!;
    let cached: ChapterBody = { ...initialChapterBody(), x: 745, support: "lift" };
    let baseline = cached;
    const input: ChapterInput = { direction: 0, jump: false };
    let maxDifference = 0, supportMismatch = false;
    for (let tick = 1; tick <= 1440; tick++) {
      const time = tick / 120;
      lift.y = 500 - program.lift * (1 - Math.cos(time * .92)) / 2;
      cached = stepChapterBody(cached, input, "elevador", program, time, 1 / 120, platforms);
      baseline = stepChapterBody(baseline, input, "elevador", program, time, 1 / 120);
      maxDifference = Math.max(maxDifference, Math.abs(cached.y - baseline.y), Math.abs(cached.x - baseline.x));
      supportMismatch ||= cached.support !== baseline.support;
    }
    expect(maxDifference).toBe(0);
    expect(supportMismatch).toBe(false);
    expect(cached.support).toBe("lift");
  });

  it("usa as barreiras da oficina e percebe sua remoção no mesmo array", () => {
    const platforms: ChapterPlatform[] = [
      { id: "pulse-street", x: 0, y: 500, width: 2360, height: 140 },
      { id: "pulse-barrier-0", x: 860, y: 100, width: 22, height: 400 },
    ];
    const input: ChapterInput = { direction: 1, jump: false };
    let body = initialChapterBody();
    for (let tick = 0; tick < 600; tick++) body = stepChapterBody(body, input, "farol", null, tick / 120, 1 / 120, platforms);
    expect(body.x).toBe(830);
    expect(body.support).toBe("pulse-street");
    platforms.length = 1;
    // The original lighthouse gate at x1200 must not leak into the workshop.
    for (let tick = 600; tick < 900; tick++) body = stepChapterBody(body, input, "farol", null, tick / 120, 1 / 120, platforms);
    expect(body.x).toBeGreaterThan(1450);
    expect(body.y + 54).toBe(500);
  });
});
