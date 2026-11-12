import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

// Block B uses real controls and public scene diagnostics. Storage fixtures
// represent existing accounts; they never teleport Orbi or fake a repair.
// Run serially with the dev server already running; no build alongside this.
const base = process.env.ORBI_TEST_URL || process.env.BASE_URL || "http://localhost:3015";
const output = "test-results/orbi-pulse-guidance";
const deliveryUrl = base + "/dev/academy-preview?activity=delivery";
const homeUrl = base + "/dev/academy-preview?view=home";
const publicPulseHref = "/estudante/jogos/entregas-do-orbi#oficina-do-pulso";
const previewPulseHref = "/dev/academy-preview?activity=delivery#oficina-do-pulso";
const keys = {
  pulse: "orbitamos-orbi-pulse-v1-academy-preview",
  chapter: "orbitamos-orbi-chapter-v2-academy-preview",
  legacy: "orbitamos-delivery-v1-academy-preview",
  journal: "orbitamos-practice-journal-v1-academy-preview",
  resume: "orbitamos-academy-resume-v1-academy-preview",
  other: "orbitamos-orbi-pulse-v1-another-account",
};
const fixtures = {
  [keys.chapter]: JSON.stringify({ version: 2, current: "farol", completed: ["ponte", "elevador", "farol"], drafts: { ponte: "const alcance = 280;", elevador: "let altura = 180;", farol: "const custo = 4;\nconst energia = custo + 2;" }, attempts: { ponte: 2, elevador: 1, farol: 3 } }),
  [keys.legacy]: JSON.stringify({ version: 1, current: 2, completed: ["velocidade", "impulso", "condicao"] }),
  [keys.journal]: JSON.stringify({ version: 1, activities: { delivery: { contentVersion: 2, openedAt: 1000, completedAt: 2000, reviewedAt: 3000, dueAt: 86403000, reviews: 1 } } }),
  [keys.other]: JSON.stringify({ version: 1, current: "alcance", completed: [], drafts: { alcance: "const alcancePulso = 125;\nconst recarga = 1;", ritmo: "const alcancePulso = 280;\nconst recarga = 1.4;" }, attempts: { alcance: 3, ritmo: 0 } }),
};
const source = (range, cooldown = 1.4) => `const alcancePulso = ${range};\nconst recarga = ${cooldown};`;
const profiles = [
  { name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } },
  { name: "iphone-safari", engine: webkit, options: devices["iPhone 13"] },
  { name: "small-mobile", engine: chromium, options: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
].filter(profile => !process.argv[2] || profile.name === process.argv[2]);
assert(profiles.length, "Use desktop, iphone-safari or small-mobile.");
await mkdir(output, { recursive: true });
const reports = [];
for (const profile of profiles) {
  const browser = await profile.engine.launch();
  const context = await browser.newContext({ ...profile.options, reducedMotion: process.env.ORBI_REDUCED_MOTION === "1" ? "reduce" : "no-preference" });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const report = { profile: profile.name, status: "running", startedAt: new Date().toISOString(), checks: {}, errors };
  reports.push(report);
  const root = page.locator("[data-orbi-pulse]");
  const stage = root.locator("[data-orbi-chapter-canvas]");
  const coach = root.locator("[data-pulse-guide]");
  const dialog = page.getByRole("dialog");
  const code = dialog.getByRole("textbox", { name: "Seu código" });
  const prediction = dialog.locator("[data-pulse-prediction]");
  const review = root.locator("[data-pulse-prediction-result]");
  const applyButton = dialog.getByRole("button", { name: "Aplicar e testar o pulso", exact: true });
  const x = async () => Number(await stage.getAttribute("data-player-x"));
  const cleared = async () => Number(await stage.getAttribute("data-pulse-cleared"));
  const readSave = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), keys.pulse);
  const readResume = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), keys.resume);
  const snapshot = async () => ({
    scene: await stage.count() ? await stage.evaluate(element => ({ ...element.dataset })).catch(() => null) : null,
    guide: await coach.count() ? await coach.evaluate(element => ({ ...element.dataset, text: element.textContent })).catch(() => null) : null,
    href: page.url(),
  });
  const go = async target => {
    await stage.focus();
    await page.keyboard.down("ArrowRight");
    try { await expect.poll(async () => await x() >= target || await root.getAttribute("data-game-status") === "arrived", { timeout: 25000, intervals: [40] }).toBe(true); }
    finally { await page.keyboard.up("ArrowRight"); }
  };
  const start = async () => {
    await root.getByRole("button", { name: /Entrar na Oficina do Pulso|Continuar na oficina/ }).click();
    await expect(stage.locator("canvas")).toBeVisible({ timeout: 120000 });
    await expect(stage).toHaveAttribute("data-player-x", /\d+/);
    await expect(coach).toBeVisible();
    await stage.scrollIntoViewIfNeeded();
  };
  const openTerminal = async () => {
    const button = root.getByRole("button", { name: "Abrir terminal", exact: true });
    await expect(button).toBeEnabled();
    await button.click();
    await expect(dialog).toBeVisible();
    await expect(code).toBeFocused();
  };
  const apply = async () => {
    await expect(applyButton).toBeEnabled();
    await applyButton.click();
    await expect(dialog).not.toBeVisible();
    await expect(stage).toBeFocused();
  };
  const choosePrediction = async label => {
    await prediction.getByText(label, { exact: true }).click();
    await expect(prediction.getByRole("radio", { name: label, exact: true })).toBeChecked();
  };
  const returnToEditor = async () => {
    const button = coach.getByRole("button", { name: "Voltar ao terminal", exact: true });
    await expect(button).toBeEnabled();
    await button.click();
    // This is the new explicit action: no second click on the old E terminal.
    await expect(dialog).toBeVisible();
    await expect(code).toBeFocused();
    // The dialog immediately sleeps the scene; sampled X diagnostics can still
    // show the previous frame. Verify the engine's near-terminal UI event.
    await expect(coach).toContainText("Terminal aceso");
  };
  const repair = async (target, count) => {
    await go(target);
    await stage.focus();
    await page.keyboard.down("f");
    try { await expect.poll(cleared, { timeout: 14000, intervals: [60] }).toBe(count); }
    finally { await page.keyboard.up("f"); }
  };
  const screenshot = async (name, scope = "[data-orbi-pulse]") => {
    assert(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, `${profile.name}: horizontal overflow at ${name}`);
    const axe = await new AxeBuilder({ page }).include(scope).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(axe.violations.map(issue => ({ id: issue.id, targets: issue.nodes.map(node => node.target) })), [], `${profile.name}: accessibility at ${name}`);
    await page.screenshot({ path: `${output}/${profile.name}-${name}.png`, fullPage: true });
  };
  try {
    await context.addInitScript(fixtures => {
      for (const [key, value] of Object.entries(fixtures)) if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
    }, fixtures);
    await page.goto(deliveryUrl, { waitUntil: "domcontentloaded", timeout: 180000 });
    const oldChapter = page.locator("[data-orbi-delivery]");
    await expect(oldChapter).toBeVisible({ timeout: 120000 });
    const workshopEntry = oldChapter.getByRole("button", { name: /Oficina do Pulso/ });
    await expect(workshopEntry).toBeEnabled({ timeout: 120000 });
    await workshopEntry.click();
    await expect(root).toBeVisible({ timeout: 120000 });
    await expect(page).toHaveURL(/#oficina-do-pulso$/);
    await expect.poll(async () => (await readResume())?.href, { timeout: 30000 }).toBe(publicPulseHref);
    report.checks.replaceStateRecordsWorkshop = true;
    console.log(profile.name + ": workshop entry and resume pointer passed");
    await start();
    await expect(coach).toHaveAttribute("data-phase", "terminal");
    await expect(coach).toContainText("encontre o terminal");
    await go(430);
    await openTerminal();
    await expect(prediction).toHaveCount(0); // The default comparison has no edit.
    await apply();
    await expect(review).toHaveCount(0);
    report.checks.unchangedProgramHasNoQuizGate = true;
    await go(823);
    await expect(coach).toHaveAttribute("data-phase", "repair");
    await expect(coach.getByRole("button", { name: "Voltar ao terminal" })).toBeEnabled();
    await expect(coach).toHaveAttribute("data-threat", "charging", { timeout: 30000 });
    await expect(coach).toContainText("preparando um ataque");
    await expect(stage).toHaveAttribute("data-pulse-guide-direction", "right");
    report.checks.chargingWarningIsVisible = true;
    // Timed guide transitions are captured without Axe, which could consume
    // the warning window; game state is never frozen or assigned by the audit.
    await stage.screenshot({ path: `${output}/${profile.name}-charging-world.png` });
    await coach.screenshot({ path: `${output}/${profile.name}-charging-guide.png` });
    await expect(coach).toHaveAttribute("data-threat", "incoming", { timeout: 15000 });
    await expect(coach).toContainText("Pule para desviar");
    await expect(coach).toContainText("pela direita");
    await expect(stage).toHaveAttribute("data-pulse-guide-direction", "right");
    report.checks.incomingWarningNamesTheDirection = true;
    console.log(profile.name + ": real attack warnings passed");
    await stage.focus();
    await page.keyboard.press("Space");
    await expect.poll(async () => Number(await stage.getAttribute("data-player-y"))).toBeLessThan(420);
    await returnToEditor();
    assert.equal(await code.inputValue(), source(90));
    await code.fill(source(280));
    await expect(prediction).toBeVisible();
    await expect(prediction).toContainText("90 → 280");
    const actionBounds = await applyButton.boundingBox();
    const viewport = page.viewportSize();
    assert(actionBounds && actionBounds.y >= 0 && actionBounds.y + actionBounds.height <= viewport.height + 1, "Apply stays fully visible when the edited code reveals a prediction");
    assert(actionBounds.width >= 44 && actionBounds.height >= 44, "Apply keeps a usable touch target");
    report.checks.applyIsVisibleWithPrediction = true;
    await choosePrediction("Orbi espera menos entre disparos.");
    await code.fill(source(240));
    await expect(prediction).toContainText("90 → 240");
    await expect(prediction.locator("input:checked")).toHaveCount(0);
    await code.fill(source(280));
    await expect(prediction.locator("input:checked")).toHaveCount(0);
    report.checks.editCycleInvalidatesPreviousChoice = true;
    await choosePrediction("O pulso vai mais longe.");
    await screenshot("prediction", "dialog");
    await apply();
    await expect(review).toHaveAttribute("data-pulse-prediction-result", "correct");
    await review.locator("summary").click();
    await expect(review).toContainText("A recarga continua em 1.4 s");
    await expect(stage).toHaveAttribute("data-pulse-range", "280");
    report.checks.correctPredictionExplainsOnlyTheChangedParameter = true;
    await screenshot("prediction-result");
    await openTerminal();
    await code.fill(source(90));
    await expect(prediction).toContainText("280 → 90");
    await choosePrediction("Orbi espera mais entre disparos.");
    await apply();
    await expect(review).toHaveAttribute("data-pulse-prediction-result", "compare");
    await review.locator("summary").click();
    await expect(review).toContainText("termina mais perto");
    await expect(review).toContainText("a espera entre disparos é a mesma");
    await expect(stage).toHaveAttribute("data-pulse-range", "90");
    report.checks.wrongPredictionIsCorrectedWithoutBlockingCode = true;
    await openTerminal();
    await code.fill(source(280));
    await expect(prediction).toBeVisible();
    await expect(prediction.locator("input:checked")).toHaveCount(0);
    await apply();
    await expect(review).toHaveAttribute("data-pulse-prediction-result", "observe");
    report.checks.predictionCanBeSkipped = true;
    console.log(profile.name + ": optional predictions passed");
    await repair(823, 1);
    await expect(coach).toContainText("barreira");
    await returnToEditor();
    assert.equal(await cleared(), 1);
    assert.equal(await code.inputValue(), source(280));
    await code.fill(source(300));
    await page.keyboard.press("Escape");
    await expect(stage).toHaveAttribute("data-pulse-range", "280");
    await go(1285);
    await returnToEditor();
    assert.equal(await cleared(), 1, "Returning to the editor preserves the first repair");
    assert.equal(await code.inputValue(), source(300), "Returning preserves an unapplied draft");
    await expect(stage).toHaveAttribute("data-pulse-range", "280");
    assert.deepEqual((await readSave()).completed, [], "A return or a code edit cannot finish the route");
    await screenshot("return-preserves-repair", "dialog");
    report.checks.explicitReturnOpensEditorAndPreservesRepairDraftAndEquipment = true;
    console.log(profile.name + ": explicit return preserved repair, draft and equipment");
    await apply();
    await repair(1285, 2);
    await repair(1775, 3);
    await expect(coach).toHaveAttribute("data-phase", "workshop");
    await expect(coach).toContainText("três passagens estão livres");
    await go(2140);
    await expect(root).toHaveAttribute("data-game-status", "arrived");
    assert.deepEqual((await readSave()).completed, ["alcance"]);
    await root.getByRole("button", { name: "Próxima rota: o ritmo" }).click();
    await expect(root).toHaveAttribute("data-pulse-lesson", "ritmo");
    await expect.poll(x).toBe(100);
    await go(430);
    await openTerminal();
    await code.fill(source(280, .6));
    await expect(prediction).toContainText("1.4 → 0.6");
    await choosePrediction("Orbi espera menos entre disparos.");
    await apply();
    await expect(review).toHaveAttribute("data-pulse-prediction-result", "correct");
    await go(823);
    await stage.focus();
    await page.keyboard.press("f");
    await expect(coach).toHaveAttribute("data-breach", "true", { timeout: 10000 });
    await expect(coach).toContainText("Brecha aberta");
    assert.equal(await cleared(), 0, "The opening is not a completed repair");
    await stage.screenshot({ path: `${output}/${profile.name}-breach-world.png` });
    await coach.screenshot({ path: `${output}/${profile.name}-breach-guide.png` });
    await repair(823, 1);
    report.checks.breachGuidanceMatchesRealFirstHit = true;
    console.log(profile.name + ": route arrival and real breach passed");
    await screenshot("coach-after-repair");
    await expect.poll(async () => (await readResume())?.href, { timeout: 30000 }).toBe(publicPulseHref);
    await page.goto(homeUrl, { waitUntil: "domcontentloaded", timeout: 180000 });
    const continuation = page.locator("[data-academy-continue]");
    await expect(continuation).toHaveAttribute("aria-busy", "false", { timeout: 120000 });
    await expect(continuation.getByRole("heading", { name: "Oficina do Pulso", exact: true })).toBeVisible();
    await expect(continuation).toContainText("Dois pulsos, um reparo");
    const resume = continuation.getByRole("link", { name: "Retomar atividade", exact: true });
    await expect(resume).toHaveAttribute("href", previewPulseHref);
    await screenshot("home-continuation", "[data-academy-continue]");
    await resume.click();
    await expect(page).toHaveURL(/activity=delivery#oficina-do-pulso$/);
    await expect(root).toBeVisible();
    await start();
    await expect(root).toHaveAttribute("data-pulse-lesson", "ritmo");
    await expect.poll(cleared).toBe(0);
    await expect(stage).toHaveAttribute("data-pulse-cooldown", "1.4");
    await go(430);
    await openTerminal();
    assert.equal(await code.inputValue(), source(280, .6), "Home restores the right route and draft without silently applying it");
    await page.keyboard.press("Escape");
    await root.getByRole("button", { name: "Entregas do Orbi", exact: true }).click();
    await expect(oldChapter).toBeVisible();
    await expect.poll(async () => (await readResume())?.href, { timeout: 30000 }).toBe("/estudante/jogos/entregas-do-orbi");
    await oldChapter.getByRole("button", { name: /Oficina do Pulso/ }).click();
    await expect(root).toBeVisible();
    await expect.poll(async () => (await readResume())?.href, { timeout: 30000 }).toBe(publicPulseHref);
    report.checks.homeResumesTheWorkshopHashAndRoute = true;
    report.checks.returningToOriginalChapterUpdatesThePointer = true;
    const untouched = await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), Object.keys(fixtures));
    assert.deepEqual(untouched, fixtures, "Guidance and the optional workshop must not rewrite old achievements, journal/XP or another account");
    report.checks.oldProgressXpAndOtherAccountUnchanged = true;
    assert.deepEqual(errors, []);
    report.status = "passed";
    report.finishedAt = new Date().toISOString();
  } catch (error) {
    report.status = "failed";
    report.finishedAt = new Date().toISOString();
    report.failure = String(error);
    report.snapshot = await snapshot();
    await page.screenshot({ path: `${output}/${profile.name}-failure.png`, fullPage: true }).catch(() => {});
    console.error("GUIDANCE FAILURE", JSON.stringify(report, null, 2));
    throw error;
  } finally {
    await writeFile(`${output}/results${process.argv[2] ? "-" + process.argv[2] : ""}.json`, JSON.stringify(reports, null, 2));
    await context.close();
    await browser.close();
  }
}
console.log(JSON.stringify(reports, null, 2));
