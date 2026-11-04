import { describe, expect, it } from "vitest";
import { chapterGoal, chapterMissions, chapterPlatforms, chapterProgramReady, completeChapterMission, defaultChapterProgram, emptyChapterSave, initialChapterBody, orbiChapterKey, preserveChapterAchievements, readChapterSave, stepChapterBody, testChapterProgram, type ChapterBody, type ChapterMissionId } from "./orbiChapter";

describe("Entrega do Orbi: novo capítulo", () => {
  it("aceita JavaScript de variáveis e expressões sem executar texto arbitrário", () => {
    expect(testChapterProgram("ponte", "let alcance = 140 * 2;")).toMatchObject({ ok: true, program: { bridge: 280 } });
    expect(testChapterProgram("elevador", "// altura da plataforma\nconst altura = (90 + 90);")).toMatchObject({ ok: true, program: { lift: 180 } });
    for (const code of ["alert(1)", "const alcance = Infinity;", "const alcance = 1 / 0;", "const alcance = window.x;", 'const alcance = "280";', "const alcance = 99999;", "const alcance = 280; alcance = 300;", "const alcance = 280; const alcance = 300;", "const alcance = (() => 280)();"]) expect(testChapterProgram("ponte", code), code).toMatchObject({ ok: false });
    for (const code of ["const alcance = ++280;", "const alcance = --280;", "const alcance = 140++140;", "const alcance = 0280;"]) expect(testChapterProgram("ponte", code)).toMatchObject({ ok: false });
    expect(testChapterProgram("ponte", "const alcance = + +280;")).toMatchObject({ ok: true });
    expect(testChapterProgram("farol", "const custo=4 const energia=custo+2")).toMatchObject({ ok: false });
    expect(testChapterProgram("farol", "const custo=4\nconst energia=custo+2")).toMatchObject({ ok: true, program: { transfer: true } });
  });
  it("aplica valores insuficientes para mostrar sua consequência, sem tratar como vitória", () => {
    const short = testChapterProgram("ponte", "const alcance = 80;");
    expect(short.ok).toBe(true); if (!short.ok) return;
    expect(chapterProgramReady("ponte", short.program)).toBe(false);
    expect(chapterPlatforms("ponte", short.program, 0).find(platform => platform.id === "bridge")?.width).toBe(80);
    const high = testChapterProgram("elevador", "const altura = 180;"); expect(high.ok).toBe(true); if (!high.ok) return;
    const low = testChapterProgram("elevador", "const altura = 50;"); expect(low.ok).toBe(true); if (!low.ok) return;
    expect(chapterPlatforms("elevador", high.program, Math.PI / .92).find(platform => platform.id === "lift")?.y).toBe(320);
    expect(chapterPlatforms("elevador", low.program, Math.PI / .92).find(platform => platform.id === "lift")?.y).toBe(450);
  });
  it("a entrega independente usa o custo na conta e acompanha outro consumo", () => {
    const ready = testChapterProgram("farol", "const custo=4;\nlet energia=custo+2;"); expect(ready).toMatchObject({ ok: true, program: { energy: 6, transfer: true } });
    const hardcoded = testChapterProgram("farol", "const custo=4;\nlet energia=6;"); expect(hardcoded.ok).toBe(true); if (!hardcoded.ok) return;
    expect(chapterProgramReady("farol", hardcoded.program)).toBe(false);
    expect(chapterPlatforms("farol", hardcoded.program, 0).some(platform => platform.id === "gate")).toBe(true);
    if (ready.ok) expect(chapterPlatforms("farol", ready.program, 0).some(platform => platform.id === "gate")).toBe(false);
    expect(testChapterProgram("farol", "const custo=4;\nconst energia=custo*2;")).toMatchObject({ ok: true, program: { transfer: false } });
  });
  it("mantém rascunhos seguros separados por conta, sem promover conquistas antigas ao novo capítulo", () => {
    expect(orbiChapterKey("a")).not.toBe(orbiChapterKey("b"));
    expect(readChapterSave('{"version":1,"current":2,"completed":["velocidade","impulso","condicao"]}')).toEqual(emptyChapterSave());
    const save = readChapterSave(JSON.stringify({ version: 2, current: "farol", completed: ["farol"], drafts: { farol: "texto".repeat(1000) }, attempts: { farol: -5 } }));
    expect(save.current).toBe("ponte"); expect(save.completed).toEqual([]); expect(save.drafts.farol).toHaveLength(2400); expect(save.attempts.farol).toBe(0);
    expect(completeChapterMission(emptyChapterSave(), "farol").completed).toEqual([]);
    let progress = emptyChapterSave(); for (const id of ["ponte", "elevador", "farol"] as ChapterMissionId[]) progress = completeChapterMission(progress, id);
    expect(readChapterSave(JSON.stringify(progress)).completed).toEqual(["ponte", "elevador", "farol"]);
    expect(completeChapterMission(progress, "farol").completed).toHaveLength(3);
  });
  it("responde a direção, desacelera e oferece salto com tolerância após a borda", () => {
    const program = defaultChapterProgram(); let body = initialChapterBody();
    for (let i = 0; i < 60; i++) body = stepChapterBody(body, { direction: 1, jump: false }, "ponte", program, i / 120, 1 / 120);
    expect(body.x).toBeGreaterThan(180); expect(body.vx).toBe(270);
    for (let i = 0; i < 30; i++) body = stepChapterBody(body, { direction: 0, jump: false }, "ponte", program, i / 120, 1 / 120);
    expect(body.vx).toBe(0);
    const edge = { ...initialChapterBody(), x: 700, y: 446, grounded: false, support: null, coyote: .09 };
    const jumped = stepChapterBody(edge, { direction: 1, jump: true }, "ponte", program, 1, 1 / 120);
    expect(jumped.vy).toBeLessThan(-400); expect(jumped.jumpBuffer).toBe(0);
    const airborne = stepChapterBody({ ...jumped, coyote: 0 }, { direction: 1, jump: true }, "ponte", program, 1.01, 1 / 120);
    expect(airborne.vy).toBeGreaterThan(jumped.vy);
  });
  it("não deixa uma aba antiga apagar entregas ou tentativas de outra aba da mesma conta", () => {
    const stale = emptyChapterSave();
    stale.drafts.ponte = "const alcance = 300;"; stale.attempts.ponte = 2;
    const stored = completeChapterMission(emptyChapterSave(), "ponte");
    stored.attempts.ponte = 5; stored.attempts.elevador = 1;
    const merged = preserveChapterAchievements(stale, stored);
    expect(merged.completed).toEqual(["ponte"]);
    expect(merged.current).toBe("ponte"); expect(merged.drafts).toEqual(stale.drafts);
    expect(merged.attempts).toEqual({ ponte: 5, elevador: 1, farol: 0 });
    expect(stale.completed).toEqual([]); expect(stored.drafts.ponte).not.toBe(merged.drafts.ponte);
    const all = completeChapterMission(completeChapterMission(stored, "elevador"), "farol");
    all.attempts.farol = 3; stale.attempts.elevador = 7;
    const finished = preserveChapterAchievements(stale, all);
    expect(finished.completed).toEqual(["ponte", "elevador", "farol"]);
    expect(finished.attempts).toEqual({ ponte: 5, elevador: 7, farol: 3 });
    expect(finished.current).toBe(stale.current); expect(finished.drafts).toEqual(stale.drafts);
    // The caller selects the account key; another key starts with its own empty records.
    expect(orbiChapterKey("alice")).not.toBe(orbiChapterKey("bob"));
    expect(preserveChapterAchievements(emptyChapterSave(), emptyChapterSave()).completed).toEqual([]);
  });
  it("guarda o pulo apertado antes de pousar e transporta o corpo com o elevador", () => {
    const program = { ...defaultChapterProgram(), lift: 180 };
    let body: ChapterBody = { ...initialChapterBody(), x: 100, y: 442, grounded: false, support: null, coyote: 0, vy: 150 };
    body = stepChapterBody(body, { direction: 0, jump: true }, "ponte", program, 0, 1 / 30);
    expect(body.grounded).toBe(true); expect(body.jumpBuffer).toBeGreaterThan(0);
    body = stepChapterBody(body, { direction: 0, jump: false }, "ponte", program, 1 / 30, 1 / 120);
    expect(body.vy).toBeLessThan(-400);
    const t = 1, lift = chapterPlatforms("elevador", program, t).find(platform => platform.id === "lift")!;
    const aboard = { ...initialChapterBody(), x: 740, y: lift.y - 54, grounded: true, support: "lift" };
    const riding = stepChapterBody(aboard, { direction: 0, jump: false }, "elevador", program, t + .01, .01);
    expect(riding.support).toBe("lift"); expect(riding.y).toBeLessThan(aboard.y);
    expect(chapterGoal("elevador").y).toBe(280);
  });
  it("publica três situações conectadas e deixa a última sem resposta preenchida", () => {
    expect(chapterMissions).toHaveLength(3); expect(chapterMissions[2].starterCode).toBe("");
    for (const mission of chapterMissions) { const run = testChapterProgram(mission.id, mission.referenceCode); expect(run.ok, mission.id).toBe(true); if (run.ok) expect(chapterProgramReady(mission.id, run.program)).toBe(true); }
  });
  it("permite atravessar o canal e os obstáculos com a configuração aprendida", () => {
    const run = testChapterProgram("ponte", chapterMissions[0].referenceCode); if (!run.ok) throw Error("reference");
    let body = initialChapterBody(); const jumped = new Set<number>();
    for (let frame = 0; frame < 2400 && body.x < 2180; frame++) {
      const marker = [825, 1385, 1670].find(x => body.x >= x && body.x <= x + 80 && !jumped.has(x) && body.grounded);
      if (marker) jumped.add(marker);
      body = stepChapterBody(body, { direction: 1, jump: marker !== undefined }, "ponte", run.program, frame / 120, 1 / 120);
      expect(body.y, JSON.stringify({ frame, body })).toBeLessThan(650);
    }
    expect(body.x).toBeGreaterThan(2170); expect(jumped.size).toBe(3);
  });
  it("permite embarcar no elevador, subir e saltar para a biblioteca", () => {
    const run = testChapterProgram("elevador", chapterMissions[1].referenceCode); if (!run.ok) throw Error("reference");
    let body = initialChapterBody(); let roofJump = false, crateJump = false;
    for (let frame = 0; frame < 3600 && body.x < 2180; frame++) {
      let direction: -1 | 0 | 1 = 1, jump = false;
      if (!roofJump && body.x >= 745) {
        direction = 0;
        if (body.support === "lift" && body.y + 54 < 340) { roofJump = true; direction = 1; jump = true; }
      }
      if (roofJump && !crateJump && body.x > 1445 && body.grounded) { jump = true; crateJump = true; }
      body = stepChapterBody(body, { direction, jump }, "elevador", run.program, frame / 120, 1 / 120);
      expect(body.y, JSON.stringify({ frame, body, roofJump, crateJump })).toBeLessThan(650);
    }
    expect(roofJump).toBe(true); expect(crateJump).toBe(true); expect(body.x).toBeGreaterThan(2170); expect(body.y + 54).toBe(280);
  });
});
