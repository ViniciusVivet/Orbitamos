import { chromium, webkit, devices, expect as playwrightExpect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const expect = playwrightExpect.configure({ timeout: 60000 });
const base = process.env.ACADEMY_AUDIT_URL || "http://localhost:3015";
const out = path.resolve(process.env.ACADEMY_AUDIT_OUTPUT || "../../docs/local/academy-manifest-20261116/lesson-alignment");
await mkdir(out, { recursive: true });
const report = { scope: "Shared production lesson panels in isolated development previews; not authenticated course loading, remote curation or learner efficacy.", profiles: [], errors: [], completed: false };
const profiles = [
  ["desktop", chromium, { viewport: { width: 1366, height: 768 } }],
  ["iphone", webkit, { ...devices["iPhone 13"], viewport: { width: 390, height: 664 } }],
  ["narrow", webkit, { ...devices["iPhone SE"], viewport: { width: 320, height: 640 } }],
];
const legacyKey = "orbitamos-quiz-v2-lesson-guide-preview-html-css-js-a9";
const conditionsKey = "orbitamos-quiz-v2-lesson-guide-preview-csharp-a6";
const legacy = JSON.stringify({ 0: "Resposta antiga", 1: "Outra resposta antiga" });
const variablesLegacyKey = "orbitamos-quiz-v2-lesson-guide-preview-csharp-a5";
const variablesLegacy = JSON.stringify({ 0: "Bia, depois cliente", 1: "int quantidade = 7;", 2: "8" });

// A cold dev server may listen only after the audit starts. Wait for an actual
// compiled page before allocating browser contexts; never retry an HTTP error.
try {
  const deadline = Date.now() + 120000;
  for (;;) {
    let response;
    try {
      response = await fetch(base + "/dev/lesson-guide-preview", { signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())) });
    } catch (error) {
      const refused = error.cause?.code === "ECONNREFUSED" || error.cause?.errors?.every(item => item.code === "ECONNREFUSED");
      if (!refused || Date.now() >= deadline) throw error;
      await new Promise(resolve => setTimeout(resolve, 300));
      continue;
    }
    await response.body?.cancel();
    if (response.status !== 200) throw new Error("Dev page readiness returned HTTP " + response.status);
    report.readyAt = new Date().toISOString();
    break;
  }
} catch (error) {
  report.errors.push({ phase: "readiness", error: String(error) });
  await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
  throw error;
}
for (const [name, engine, settings] of profiles) {
  const browser = await engine.launch();
  const result = { name, checks: [], axe: [], completed: false };
  report.profiles.push(result);
  const context = await browser.newContext({ ...settings, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", error => report.errors.push({ name, error: String(error) }));
  try {
    await page.goto(base + "/dev/lesson-guide-preview", { waitUntil: "domcontentloaded", timeout: 120000 });
    const preview = page.locator("[data-lesson-guide-preview]");
    const panels = page.locator("[data-lesson-study-panels]");
    await expect(preview).toHaveAttribute("data-scenario", "grid");
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: legacyKey, value: legacy });
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: variablesLegacyKey, value: variablesLegacy });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(panels).toHaveAttribute("data-guide-origin", "general");
    await expect(panels.locator("#secao-revisao")).toHaveCount(0);
    await expect(panels.locator("fieldset")).toHaveCount(0);
    await expect(panels).toContainText("ainda não tem uma prática específica");
    await expect(panels.getByRole("link", { name: "Escolher uma atividade no laboratório" })).toHaveAttribute("href", /\/dev\/lab-preview/);
    await expect(panels.locator('a[href*="funcoes-js"]')).toHaveCount(0);
    expect(await page.evaluate(key => localStorage.getItem(key), legacyKey)).toBe(legacy);
    await page.screenshot({ path: path.join(out, name + "-unlinked.png") });
    result.checks.push("CSS Grid has no invented quiz or function-exercise assignment; a legacy quiz save is retained byte for byte.");

    const audit = async label => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(settings.viewport.width);
      const axe = await new AxeBuilder({ page }).include("[data-lesson-study-panels]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const violations = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, count: nodes.length, targets: nodes.map(node => node.target) }));
      result.axe.push({ label, violations });
      expect(violations).toEqual([]);
    };
    await audit("unlinked");
    await preview.getByRole("button", { name: "Condições com prática", exact: true }).click();
    await expect(panels).toHaveAttribute("data-guide-origin", "authored");
    await expect(panels.locator("fieldset")).toHaveCount(1);
    const fields = panels.locator("fieldset");
    const questionNav = panels.getByRole("navigation", { name: "Perguntas do quiz" });
    await expect(questionNav.getByRole("button")).toHaveCount(3);
    await fields.getByRole("button").nth(1).click();
    await expect(fields.getByRole("status")).toContainText("Ainda não.");
    await expect(panels.getByRole("button", { name: "Próxima pergunta" })).toHaveCount(0);
    for (const [index, answer] of [[0, 0], [1, 1], [2, 0]]) {
      await expect(questionNav.getByRole("button", { name: `Pergunta ${index + 1}`, exact: true })).toHaveAttribute("aria-current", "step");
      await fields.getByRole("button").nth(answer).click();
      if (index < 2) await panels.getByRole("button", { name: "Próxima pergunta" }).click();
    }
    await expect(panels.getByText("Revisão completa", { exact: true })).toBeVisible();
    await expect(panels.getByRole("link", { name: "Abrir prática desta aula" })).toHaveAttribute("href", "/dev/csharp-preview?academy=1&module=conditions");
    await audit("authored");
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(out, name + "-authored.png"), fullPage: true });
    expect(await page.evaluate(key => Boolean(localStorage.getItem(key)), conditionsKey)).toBe(true);
    result.checks.push("One question at a time keeps feedback before explicit progression, numbered navigation, correction and persistence; matching practice remains conditions.");

    await preview.getByRole("button", { name: "CSS Grid sem vínculo", exact: true }).click();
    await expect(panels.locator("#secao-revisao")).toHaveCount(0);
    await expect(panels.getByText("Revisão completa", { exact: true })).toHaveCount(0);
    await preview.getByRole("button", { name: "Quiz fornecido", exact: true }).click();
    await expect(panels.locator("fieldset")).toHaveCount(1);
    await expect(panels.locator("[data-authored-lesson-practice]")).toHaveCount(0);
    await panels.locator("fieldset").getByRole("button").first().click();
    await expect(panels.getByText("Revisão completa", { exact: true })).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(panels.locator("#secao-revisao")).toHaveCount(0);
    expect(await page.evaluate(key => localStorage.getItem(key), legacyKey)).toBe(legacy);
    await preview.getByRole("button", { name: "Condições com prática", exact: true }).click();
    await expect(panels.getByText("Revisão completa", { exact: true })).toBeVisible();
    result.checks.push("An explicit catalog quiz is retained independently; switching/reload cannot display a zero-question success or delete old answers.");
    await panels.getByRole("link", { name: "Abrir prática desta aula" }).click();
    await expect(page.locator('[data-variables-module][data-module-kind="conditions"]')).toBeVisible();
    result.checks.push("The authored practice link reaches the real conditions module in the Academy preview.");
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(preview).toBeVisible();
    await preview.getByRole("button", { name: "Variáveis com prática", exact: true }).click();
    await expect(fields).toHaveCount(1);
    await expect(fields.locator("pre code")).toHaveCount(1);
    await expect(panels).toContainText("ainda não ensina double");
    await expect(panels.getByText("Revisão completa", { exact: true })).toHaveCount(0);
    await fields.getByRole("button").nth(0).click();
    await expect(fields.getByRole("status")).toContainText("Compare a primeira chamada");
    await expect(fields.getByRole("status")).not.toContainText("Sem aspas, cliente lê");
    await questionNav.getByRole("button", { name: "Pergunta 3", exact: true }).click();
    await expect(fields.locator("legend")).toBeFocused();
    await fields.getByRole("button").nth(2).click();
    await panels.getByRole("button", { name: "Próxima pergunta" }).click();
    await expect(questionNav.getByRole("button", { name: "Pergunta 1", exact: true })).toHaveAttribute("aria-current", "step");
    await expect(fields.locator("legend")).toBeFocused();
    await page.reload({ waitUntil: "domcontentloaded" });
    await preview.getByRole("button", { name: "Variáveis com prática", exact: true }).click();
    await expect(questionNav.getByRole("button", { name: "Pergunta 1", exact: true })).toHaveAttribute("aria-current", "step");
    await expect(fields.getByRole("status")).toContainText("Compare a primeira chamada");
    await fields.getByRole("button").nth(1).click();
    await expect(fields.getByRole("status")).toContainText("Sem aspas, cliente lê o valor Bia");
    await panels.locator("[data-lesson-quiz]").evaluate(node => node.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.waitForTimeout(250); // Let answer-color transitions settle for visual evidence.
    await page.screenshot({ path: path.join(out, name + "-variables-first-question.png") });
    await panels.getByRole("button", { name: "Próxima pergunta" }).click();
    await expect(fields.locator("pre code")).toHaveCount(0);
    await fields.getByRole("button").nth(0).click();
    await expect(panels.getByText("Revisão completa", { exact: true })).toBeVisible();
    await questionNav.getByRole("button", { name: "Pergunta 3", exact: true }).click();
    await expect(fields.locator("pre code")).toHaveCount(1);
    await expect(fields.getByRole("button").nth(2)).toBeDisabled();
    await expect(fields.getByRole("status")).toContainText("O valor vai de 7 para 11 e depois para 8");
    await expect(panels.getByText("Revisão completa", { exact: true })).toBeVisible();
    expect(await page.evaluate(key => localStorage.getItem(key), variablesLegacyKey)).toBe(variablesLegacy);
    expect(await page.evaluate(key => Boolean(localStorage.getItem(key + "-variables-v1")), variablesLegacyKey)).toBe(true);
    await audit("authored-variables");
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(out, name + "-variables.png"), fullPage: true });
    await questionNav.getByRole("button", { name: "Pergunta 1", exact: true }).click();
    await expect(fields.getByRole("status")).toContainText("Sem aspas, cliente lê o valor Bia");
    await expect(fields.getByRole("button").first()).toBeDisabled();
    await expect(panels.getByText("Revisão completa", { exact: true })).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await preview.getByRole("button", { name: "Variáveis com prática", exact: true }).click();
    await expect(panels.getByText("Revisão completa", { exact: true })).toBeVisible();
    await panels.getByRole("button", { name: "Refazer", exact: true }).click();
    await expect(fields.locator("legend")).toBeFocused();
    await expect(questionNav.getByRole("button", { name: "Pergunta 1", exact: true })).toHaveAttribute("aria-current", "step");
    await expect(panels.getByText("Revisão completa", { exact: true })).toHaveCount(0);
    expect(await page.evaluate(key => localStorage.getItem(key), variablesLegacyKey)).toBe(variablesLegacy);
    expect(await page.evaluate(key => localStorage.getItem(key + "-variables-v1"), variablesLegacyKey)).toBe(null);
    expect(await page.evaluate(key => Boolean(localStorage.getItem(key)), conditionsKey)).toBe(true);
    result.checks.push("Out-of-order correction returns to the first pending question; reload retains mistakes/correct answers, focus follows navigation, and reset clears only the current version.");
    await expect(panels.getByRole("link", { name: "Abrir prática desta aula" })).toHaveAttribute("href", "/dev/csharp-preview?academy=1&module=variables");
    await panels.getByRole("link", { name: "Abrir prática desta aula" }).click();
    await expect(page.locator('[data-variables-module][data-module-kind="variables"]')).toBeVisible();
    result.checks.push("Variables has readable code, specific hints after mistakes and explanations after correct answers; it opens the real variables module without claiming the whole catalog syllabus.");
    result.completed = true;
    console.log(name + " passed");
  } catch (error) {
    report.errors.push({ name, error: String(error), stack: error.stack });
    console.error(name + " failed: " + String(error));
    await page.screenshot({ path: path.join(out, name + "-failure.png") }).catch(() => {});
  } finally {
    await context.close();
    await browser.close();
    await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
  }
}
expect(report.errors).toEqual([]);
expect(report.profiles.every(item => item.completed)).toBe(true);
report.completed = true;
await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
