import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

// Real inputs and public scene diagnostics only: no teleport, fake victory or
// assignment of game internals. Runs serially to fit the development machine.
const base = process.env.ORBI_TEST_URL || process.env.BASE_URL || "http://localhost:3015";
const output = "test-results/orbi-pulse";
const url = base + "/dev/academy-preview?activity=delivery#oficina-do-pulso";
const pulseKey = "orbitamos-orbi-pulse-v1-academy-preview";
const chapterKey = "orbitamos-orbi-chapter-v2-academy-preview";
const journalKey = "orbitamos-practice-journal-v1-academy-preview";
const legacyKey = "orbitamos-delivery-v1-academy-preview";
const otherAccountKey = "orbitamos-orbi-pulse-v1-other-account";
const chapterFixture = JSON.stringify({ version: 2, current: "farol", completed: ["ponte", "elevador", "farol"], drafts: { ponte: "const alcance = 280;", elevador: "let altura = 180;", farol: "const custo = 4;\nconst energia = custo + 2;" }, attempts: { ponte: 2, elevador: 1, farol: 3 } });
const legacyFixture = JSON.stringify({ version: 1, current: 2, completed: ["velocidade", "impulso", "condicao"] });
const otherFixture = JSON.stringify({ version: 1, current: "alcance", completed: [], drafts: { alcance: "const alcancePulso = 125;\nconst recarga = 1;", ritmo: "const alcancePulso = 280;\nconst recarga = 1.4;" }, attempts: { alcance: 3, ritmo: 0 } });
const profiles = [
  { name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } },
  { name: "iphone-safari", engine: webkit, options: devices["iPhone 13"] },
  { name: "small-mobile", engine: chromium, options: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
].filter(profile => !process.argv[2] || process.argv[2] === profile.name);
assert(profiles.length, "Unknown profile. Use desktop, iphone-safari or small-mobile.");
const reports = [];
await mkdir(output, { recursive: true });

for (const profile of profiles) {
  const browser = await profile.engine.launch();
  const context = await browser.newContext({ ...profile.options, reducedMotion: process.env.ORBI_REDUCED_MOTION === "1" ? "reduce" : "no-preference" });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const root = page.locator("[data-orbi-pulse]");
  const stage = root.locator("[data-orbi-chapter-canvas]");
  const dialog = page.getByRole("dialog");
  const code = dialog.getByRole("textbox", { name: "Seu código" });
  const x = async () => Number(await stage.getAttribute("data-player-x"));
  const cleared = async () => Number(await stage.getAttribute("data-pulse-cleared"));
  const metrics = () => stage.evaluate(element => ({ ...element.dataset }));
  const readSave = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), pulseKey);
  const start = async () => {
    const entry = root.getByRole("button", { name: /Entrar na Oficina do Pulso|Continuar na oficina/ });
    await expect(entry).toBeEnabled({ timeout: 120000 });
    await entry.click();
    await expect(stage.locator("canvas")).toBeVisible({ timeout: 120000 });
    await expect(stage).toHaveAttribute("data-player-x", /\d+/);
    await stage.scrollIntoViewIfNeeded();
  };
  const go = async target => {
    await stage.focus();
    await page.keyboard.down("ArrowRight");
    try { await expect.poll(async () => await x() >= target || await root.getAttribute("data-game-status") === "arrived", { timeout: 20000, intervals: [30] }).toBe(true); }
    finally { await page.keyboard.up("ArrowRight"); }
  };
  const terminal = async () => {
    const button = root.getByRole("button", { name: "Abrir terminal", exact: true });
    await expect(button).toBeEnabled();
    await button.click();
    await expect(dialog).toBeVisible();
    await expect(code).toBeFocused();
  };
  const apply = async source => {
    await code.fill(source);
    await dialog.getByRole("button", { name: "Aplicar e testar o pulso", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(stage).toBeFocused();
  };
  const returnToTerminal = async () => {
    await root.getByRole("button", { name: "Voltar ao ponto de retorno", exact: true }).click();
    await expect.poll(x).toBeLessThan(600);
    await terminal();
  };
  const holdFire = async (milliseconds, key = "f") => {
    await stage.focus();
    await page.keyboard.down(key);
    try { await page.waitForTimeout(milliseconds); }
    finally { await page.keyboard.up(key); }
  };
  const repair = async (target, count) => {
    await go(target);
    await stage.focus();
    await page.keyboard.down("f");
    try { await expect.poll(cleared, { timeout: 10000, intervals: [50] }).toBe(count); }
    finally { await page.keyboard.up("f"); }
  };
  const shot = async (name, scope = "[data-orbi-pulse]") => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert(overflow <= 1, `${profile.name}: horizontal overflow ${overflow}px at ${name}`);
    const axe = await new AxeBuilder({ page }).include(scope).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(axe.violations.map(issue => ({ id: issue.id, nodes: issue.nodes.map(node => node.target) })), [], `${profile.name}: a11y ${name}`);
    await page.screenshot({ path: `${output}/${profile.name}-${name}.png`, fullPage: true });
  };
  try {
    await context.addInitScript(({ chapterKey, chapterFixture, legacyKey, legacyFixture, otherAccountKey, otherFixture }) => {
      localStorage.setItem(chapterKey, chapterFixture);
      localStorage.setItem(legacyKey, legacyFixture);
      localStorage.setItem(otherAccountKey, otherFixture);
    }, { chapterKey, chapterFixture, legacyKey, legacyFixture, otherAccountKey, otherFixture });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 180000 });
    await expect(root).toBeVisible({ timeout: 120000 });
    await expect(root.getByRole("button", { name: "Dois pulsos, um reparo" })).toBeDisabled();
    const journalBefore = await page.evaluate(key => localStorage.getItem(key), journalKey);
    await shot("intro");
    await start();
    await expect.poll(x).toBe(100);
    await go(430);
    await terminal();
    assert.equal(await code.inputValue(), "const alcancePulso = 90;\nconst recarga = 1.4;");
    await shot("terminal", "dialog");
    await code.fill("window.alert(1);");
    await dialog.getByRole("button", { name: "Aplicar e testar o pulso" }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Confira a escrita/)).toBeVisible();
    assert.equal(await stage.getAttribute("data-pulse-range"), "90");
    await code.fill("const alcancePulso = 280;\nconst recarga = 1.4;");
    await dialog.getByRole("button", { name: "Recomeçar este código", exact: true }).click();
    await dialog.getByRole("button", { name: "Sim, recomeçar", exact: true }).click();
    assert.equal(await code.inputValue(), "const alcancePulso = 90;\nconst recarga = 1.4;");
    await dialog.getByRole("button", { name: "Desfazer reinício", exact: true }).click();
    assert.equal(await code.inputValue(), "const alcancePulso = 280;\nconst recarga = 1.4;");
    await apply("const alcancePulso = 90;\nconst recarga = 1.4;");
    assert.deepEqual((await readSave()).completed, [], "Applying code cannot complete a route");
    await go(823);
    await holdFire(2500);
    assert.equal(await cleared(), 0, "The short pulse cannot reach a sentinel beyond the forcefield");
    await expect(root.getByRole("status")).toContainText("O pulso termina antes da sentinela");
    await shot("short-range");
    await returnToTerminal();
    await apply("const alcancePulso = 280;\nconst recarga = 1.4;");
    await expect(stage).toHaveAttribute("data-pulse-range", "280");
    // Invalid edits must leave the last working equipment intact.
    await terminal();
    await code.fill("const alcancePulso = 9000;\nconst recarga = 1.4;");
    await dialog.getByRole("button", { name: "Aplicar e testar o pulso" }).click();
    await expect(dialog.getByText(/entre 40 e 400/)).toBeVisible();
    assert.equal(await stage.getAttribute("data-pulse-range"), "280");
    await apply("const alcancePulso = 280;\nconst recarga = 1.4;");
    await root.getByRole("button", { name: "Pausar jogo", exact: true }).click();
    await expect(root).toHaveAttribute("data-game-status", "paused");
    const pausedX = await x();
    await page.waitForTimeout(350);
    assert.equal(await x(), pausedX, "Pause holds the simulation");
    await root.getByRole("button", { name: "Continuar aventura", exact: true }).click();

    let tripleTouch = null;
    if (profile.name === "small-mobile") {
      const right = root.getByRole("button", { name: "Caminhar para a direita", exact: true });
      const jump = root.getByRole("button", { name: /^Pular/ });
      const fire = root.getByRole("button", { name: "Disparar pulso", exact: true });
      await right.scrollIntoViewIfNeeded();
      const boxes = await Promise.all([right.boundingBox(), jump.boundingBox(), fire.boundingBox()]);
      assert(boxes.every(Boolean), "All three touch controls are on screen");
      const point = (box, id) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2, id, radiusX: 8, radiusY: 8, force: 1 });
      const touches = boxes.map(point);
      const cdp = await context.newCDPSession(page);
      const before = await x();
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [touches[0]] });
      await page.waitForTimeout(160);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touches });
      await expect.poll(async () => Number(await stage.getAttribute("data-player-y"))).toBeLessThan(420);
      await expect.poll(x).toBeGreaterThan(before + 30);
      await expect.poll(async () => Number(await root.getByRole("meter", { name: "Recarga do pulso" }).getAttribute("aria-valuenow"))).toBeLessThan(100);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(300);
      const stopped = await x();
      await page.waitForTimeout(300);
      assert(Math.abs(await x() - stopped) < 3, "Releasing all touches stops movement");
      await shot("triple-touch");
      tripleTouch = { movement: true, jump: true, pulse: true, releaseStops: true };
    }
    await repair(823, 1);
    await shot("first-repair");
    await repair(1285, 2);
    await repair(1775, 3);
    assert.deepEqual((await readSave()).completed, [], "Repairs alone cannot complete a route before arrival");
    const firstMetrics = await metrics();
    await go(2140);
    await expect(root).toHaveAttribute("data-game-status", "arrived");
    assert.deepEqual((await readSave()).completed, ["alcance"]);
    await shot("range-complete");
    await root.getByRole("button", { name: "Próxima rota: o ritmo" }).click();
    await expect(root).toHaveAttribute("data-pulse-lesson", "ritmo");
    await expect.poll(x).toBe(100);
    await go(430);
    await terminal();
    assert.equal(await code.inputValue(), "const alcancePulso = 280;\nconst recarga = 1.4;");
    await apply("const alcancePulso = 280;\nconst recarga = 1.4;");
    await go(823);
    await holdFire(6500, "x");
    assert.equal(await cleared(), 0, "A 1.4s cooldown cannot beat a shield that regenerates in 1.1s");
    await expect(root.getByRole("status")).toContainText("proteção voltou");
    await shot("shield-regenerates");
    await returnToTerminal();
    await apply("const alcancePulso = 280;\nconst recarga = 0.6;");
    await expect(stage).toHaveAttribute("data-pulse-cooldown", "0.6");
    await repair(823, 1);
    await repair(1285, 2);
    await repair(1775, 3);
    const finalMetrics = await metrics();
    await go(2140);
    await expect(root).toHaveAttribute("data-game-status", "arrived");
    await shot("workshop-complete");
    const saved = await readSave();
    assert.deepEqual(saved.completed, ["alcance", "ritmo"]);
    assert(saved.attempts.alcance >= 3 && saved.attempts.ritmo >= 2);
    assert.equal(await root.getByRole("link", { name: "Continuar com código no laboratório" }).getAttribute("href"), "/dev/ide-preview/variaveis-js?from=delivery&academy=1");
    const untouched = await page.evaluate(({ chapterKey, legacyKey, journalKey, otherAccountKey }) => ({ chapter: localStorage.getItem(chapterKey), legacy: localStorage.getItem(legacyKey), journal: localStorage.getItem(journalKey), other: localStorage.getItem(otherAccountKey) }), { chapterKey, legacyKey, journalKey, otherAccountKey });
    assert.equal(untouched.chapter, chapterFixture, "The optional adventure cannot change original v2 deliveries");
    assert.equal(untouched.legacy, legacyFixture, "The optional adventure cannot change original v1 achievements");
    assert.equal(untouched.journal, journalBefore, "Pulse repairs cannot award or rewrite delivery XP");
    assert.equal(untouched.other, otherFixture, "The other account's pulse save remains isolated");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(root.getByRole("button", { name: "Continuar na oficina" })).toBeEnabled();
    assert.deepEqual((await readSave()).completed, ["alcance", "ritmo"]);
    await start();
    await expect(root).toHaveAttribute("data-pulse-lesson", "ritmo");
    await expect.poll(cleared).toBe(0);
    await expect(stage).toHaveAttribute("data-pulse-range", "280", { timeout: 30000 });
    await expect(stage).toHaveAttribute("data-pulse-cooldown", "1.4", { timeout: 30000 });
    await go(430); await terminal();
    assert.equal(await code.inputValue(), "const alcancePulso = 280;\nconst recarga = 0.6;", "Reload restores the draft without silently applying it");
    await page.keyboard.press("Escape");
    await expect(stage).toBeFocused();
    assert.deepEqual(errors, []);
    reports.push({ profile: profile.name, completed: saved.completed, wrongRangeCannotRepair: true, slowCooldownRegenerates: true, physicalArrivalRequired: true, invalidPreservesEquipment: true, resetUndo: true, paused: true, originalProgressPreserved: true, xpUnchanged: true, accountIsolation: true, reloadDraftNotAutoApplied: true, tripleTouch, normalMotion: process.env.ORBI_REDUCED_MOTION !== "1", firstMetrics, finalMetrics, errors });
  } catch (error) {
    await page.screenshot({ path: `${output}/${profile.name}-failure.png`, fullPage: true }).catch(() => {});
    console.error("PULSE STATE", await metrics().catch(() => null));
    throw error;
  } finally {
    await writeFile(`${output}/results${process.argv[2] ? "-" + process.argv[2] : ""}.json`, JSON.stringify(reports, null, 2));
    await context.close(); await browser.close();
  }
}
console.log(JSON.stringify(reports, null, 2));
