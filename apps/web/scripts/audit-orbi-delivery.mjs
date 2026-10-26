import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { chromium, webkit, devices } from "@playwright/test";

const require = createRequire(import.meta.url);
const AxeBuilder = require("@axe-core/playwright").default;
const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "test-results", "orbi-delivery");
const base = process.env.ORBI_TEST_URL || "http://localhost:3015";
const url = `${base}/dev/academy-preview?activity=delivery`;
const journalKey = "orbitamos-practice-journal-v1-academy-preview";
const saveKey = "orbitamos-delivery-v1-academy-preview";
const reports = [];
await fs.mkdir(output, { recursive: true });

const status = (page, expected) => page.locator(`[data-orbi-delivery][data-game-status="${expected}"]`).waitFor({ timeout: 20000 });
const play = page => page.getByRole("button", { name: "▶ Testar entrega", exact: true }).click();
const next = page => page.getByRole("button", { name: "Próxima entrega →", exact: true }).click();

async function auditJourney(config) {
  const browser = await config.engine.launch({ headless: true });
  const context = await browser.newContext(config.options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
    await page.locator("[data-orbi-delivery]").waitFor();
    const dimensions = await page.evaluate(() => ({ width: innerWidth, page: document.documentElement.scrollWidth }));
    assert(dimensions.page <= dimensions.width, `${config.name}: horizontal page overflow`);
    await page.screenshot({ path: path.join(output, `${config.name}-initial.png`), fullPage: true });
    const initialAxe = await new AxeBuilder({ page }).include("[data-orbi-delivery]").analyze();
    assert.equal(initialAxe.violations.length, 0, JSON.stringify(initialAxe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))));

    await play(page);
    await status(page, "fell");
    assert.equal(await page.getByRole("button", { name: "Próxima entrega →", exact: true }).count(), 0);
    await page.getByRole("button", { name: "280 Passo decidido", exact: true }).click();
    await play(page); await status(page, "arrived");
    await page.getByRole("button", { name: "A gravidade desaparece.", exact: false }).click();
    assert.equal(await page.getByRole("button", { name: "Próxima entrega →", exact: true }).count(), 0);
    await page.getByRole("button", { name: "Orbi percorre mais distância na horizontal.", exact: false }).click();
    await next(page);
    await page.getByRole("button", { name: "540 Pulo alto", exact: true }).click();
    await play(page); await status(page, "arrived");
    await page.getByRole("button", { name: "Porque o impulso do pulo controla a subida; a velocidade controla o avanço.", exact: false }).click();
    await next(page);
    await play(page); await status(page, "blocked");
    await page.getByRole("button", { name: "energia >= 2 Maior ou igual a 2", exact: true }).click();
    await play(page); await status(page, "arrived");

    const beforeUnderstanding = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "null"), journalKey);
    assert(!beforeUnderstanding?.activities?.delivery?.completedAt, "Arrival alone must not record understanding");
    await page.getByRole("button", { name: "Não. 1 é menor que o custo de 2.", exact: false }).click();
    await page.getByText("Três entregas. Três ideias para levar ao código.", { exact: true }).waitFor();
    assert.equal(await page.getByRole("link", { name: "Escolher próxima atividade →", exact: true }).getAttribute("href"), "/dev/academy-preview");
    const saved = await page.evaluate(([save, journal]) => ({ save: JSON.parse(localStorage.getItem(save) || "null"), journal: JSON.parse(localStorage.getItem(journal) || "null") }), [saveKey, journalKey]);
    assert.deepEqual(saved.save.completed, ["velocidade", "impulso", "condicao"]);
    assert(saved.journal.activities.delivery.completedAt, "The completion callback must reach the learning hub");
    const finalDimensions = await page.evaluate(() => ({ width: innerWidth, page: document.documentElement.scrollWidth }));
    assert(finalDimensions.page <= finalDimensions.width, `${config.name}: final screen overflow`);
    const finalAxe = await new AxeBuilder({ page }).include("[data-orbi-delivery]").analyze();
    assert.equal(finalAxe.violations.length, 0, JSON.stringify(finalAxe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))));
    await page.screenshot({ path: path.join(output, `${config.name}-complete.png`), fullPage: true });
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("3/3 entregas compreendidas", { exact: true }).waitFor();
    assert.deepEqual(errors, []);
    const report = { name: config.name, dimensions, completed: saved.save.completed, callbackRecorded: true, axeViolations: 0, pageErrors: errors };
    reports.push(report); console.log(JSON.stringify(report));
  } catch (error) {
    await page.screenshot({ path: path.join(output, `${config.name}-failure.png`), fullPage: true }).catch(() => {});
    throw error;
  } finally { await context.close(); await browser.close(); }
}

async function auditControls() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "280 Passo decidido", exact: true }).click();
    await page.getByRole("radio", { name: /Eu controlo o Orbi/ }).check();
    await play(page);
    await page.getByRole("button", { name: "Pausar", exact: true }).click();
    const before = await page.locator('svg[aria-label^="Orbi a"]').getAttribute("aria-label");
    await page.waitForTimeout(250);
    assert.equal(await page.locator('svg[aria-label^="Orbi a"]').getAttribute("aria-label"), before, "Pause must freeze the physics");
    await page.getByRole("button", { name: "Continuar entrega", exact: true }).click();
    await page.locator('[role="group"][aria-label^="Controles do cenário"]').focus();
    await page.evaluate(() => {
      const stage = document.querySelector('[role="group"][aria-label^="Controles do cenário"]');
      stage.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      const timer = setInterval(() => {
        const x = Number(document.querySelector('svg[aria-label^="Orbi a"]').getAttribute("aria-label").match(/Orbi a (\d+)/)[1]);
        if (x > 213) { clearInterval(timer); stage.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true })); }
      }, 10);
    });
    await status(page, "arrived");
    assert.equal(await page.getByRole("button", { name: "Próxima entrega →", exact: true }).count(), 0, "Manual skill alone must not pass the mission");
  } finally { await context.close(); await browser.close(); }

  const touchBrowser = await chromium.launch({ headless: true });
  const touchContext = await touchBrowser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const touchPage = await touchContext.newPage();
  try {
    await touchPage.goto(url, { waitUntil: "networkidle" });
    await touchPage.getByRole("button", { name: "380 Passo rápido", exact: true }).click();
    await touchPage.getByRole("radio", { name: /Eu controlo o Orbi/ }).check();
    await play(touchPage);
    const direction = touchPage.getByRole("button", { name: "Mover Orbi para a direita", exact: true });
    await direction.scrollIntoViewIfNeeded();
    const right = await direction.boundingBox();
    const jump = await touchPage.getByRole("button", { name: "Pular com Orbi", exact: true }).boundingBox();
    const client = await touchContext.newCDPSession(touchPage);
    const point1 = { x: right.x + right.width / 2, y: right.y + right.height / 2, id: 1 };
    const point2 = { x: jump.x + jump.width / 2, y: jump.y + jump.height / 2, id: 2 };
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point1] });
    await touchPage.waitForFunction(() => Number(document.querySelector('svg[aria-label^="Orbi a"]').getAttribute("aria-label").match(/Orbi a (\d+)/)[1]) > 120);
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point1, point2] });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [point2] });
    await status(touchPage, "arrived");
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    assert.equal(await touchPage.getByRole("button", { name: "Próxima entrega →", exact: true }).count(), 0);
    reports.push({ name: "controls", keyboardJump: true, pauseFreezesPhysics: true, simultaneousTouchDirectionAndJump: true });
    console.log("Keyboard, pause and simultaneous touch controls passed.");
  } finally { await touchContext.close(); await touchBrowser.close(); }
}

const configs = [
  { name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } },
  { name: "iphone", engine: webkit, options: devices["iPhone 13"] },
  { name: "narrow", engine: chromium, options: { viewport: { width: 320, height: 740 }, reducedMotion: "reduce" } },
];
for (const config of configs.filter(item => !process.argv.includes("--narrow") || item.name === "narrow")) await auditJourney(config);
if (!process.argv.includes("--narrow")) await auditControls();
await fs.writeFile(path.join(output, process.argv.includes("--narrow") ? "report-narrow.json" : "report.json"), JSON.stringify(reports, null, 2));
