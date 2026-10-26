import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const outputDir = "test-results/sql-quest";
const url = process.env.SQL_URL || "http://localhost:3015/dev/sql-preview";
const profiles = [
  ["desktop", chromium, { viewport: { width: 1440, height: 1000 } }],
  ["iphone", webkit, devices["iPhone 13"]],
  ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }],
];
const selectedProfiles = profiles.filter(([name]) => !process.env.SQL_PROFILE || name === process.env.SQL_PROFILE);
if (!selectedProfiles.length) throw new Error("SQL_PROFILE deve ser desktop, iphone ou small.");
await mkdir(outputDir, { recursive: true });

for (const [profile, engine, device] of selectedProfiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...device, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const report = { profile, url, completed: false, checks: [], errors: [], sqlRequests: [], failedSqlRequests: [], accessibility: [] };
  let checkpoint = "intro";
  const quest = page.locator("[data-sql-quest]");
  const button = name => quest.getByRole("button", { name, exact: true });
  const input = () => quest.getByRole("textbox", { name: "Seu código SQL", exact: true });
  const continueButton = () => button("Continuar");
  const execute = () => button("Testar na loja");
  page.on("pageerror", error => report.errors.push(error.message));
  page.on("request", request => {
    if (/sql-wasm\.(js|wasm)(?:\?|$)/.test(request.url())) report.sqlRequests.push(request.url());
  });
  page.on("requestfailed", request => {
    if (/sql-wasm\.(js|wasm)(?:\?|$)/.test(request.url())) report.failedSqlRequests.push({ url: request.url(), reason: request.failure()?.errorText });
  });

  async function checkLayoutAndAccess(label, screenshot = false) {
    await expect(quest).toBeVisible();
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    expect(dimensions.document, `${profile}/${label}: document overflow`).toBeLessThanOrEqual(dimensions.viewport + 1);
    expect(dimensions.body, `${profile}/${label}: body overflow`).toBeLessThanOrEqual(dimensions.viewport + 1);
    const accessibility = await new AxeBuilder({ page }).include("[data-sql-quest]").analyze();
    const violations = accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) }));
    report.accessibility.push({ checkpoint: label, violations });
    expect(violations, `${profile}/${label}: accessibility`).toEqual([]);
    if (screenshot) {
      await page.screenshot({ path: `${outputDir}/${profile}-${label}-viewport.jpg` });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${outputDir}/${profile}-${label}.jpg`, fullPage: true });
    }
    report.checks.push(`${label}: layout and accessibility`);
  }

  async function next() {
    await expect(continueButton()).toBeVisible();
    await continueButton().click();
  }

  async function choose(name) {
    await button(name).click();
    await expect(continueButton()).toBeVisible();
    await expect(quest.getByRole("status").filter({ hasText: /\S/ }).first()).toBeVisible();
  }

  async function run(code) {
    await input().fill(code);
    await execute().click();
    await expect(continueButton()).toBeVisible();
    await expect(quest.getByRole("status").filter({ hasText: /\S/ }).first()).toBeVisible();
  }

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await button("Ajudar o Orbi").waitFor({ timeout: 90000 });
    await checkLayoutAndAccess("intro", true);
    await button("Ajudar o Orbi").click();

    checkpoint = "step-0";
    await button("Uma coluna").click();
    await expect(continueButton()).not.toBeVisible();
    await choose("Uma linha");
    report.checks.push("wrong choice can be corrected without skipping the question");
    await next();

    checkpoint = "step-1";
    await choose("estoque");
    await next();

    checkpoint = "step-2";
    await choose("SELECT");
    await next();

    checkpoint = "step-3";
    await input().fill("FROM produtos;");
    await expect(continueButton()).toBeVisible();
    expect(await input().evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
    await expect(input()).toHaveValue("FROM produtos;");
    await next();

    checkpoint = "step-4";
    await choose("Só a Caneta");
    await next();

    checkpoint = "step-5";
    await input().fill(">");
    await execute().click();
    await expect(execute()).toBeEnabled();
    await expect(continueButton()).not.toBeVisible();
    await expect(input()).toHaveValue(">");
    report.checks.push("SQLite rejects the wrong result and preserves the learner's input");
    await page.reload({ waitUntil: "domcontentloaded" });
    await button("Retomar missão").click();
    await expect(input()).toHaveValue(">");
    await expect(continueButton()).not.toBeVisible();
    report.checks.push("refresh resumes the current activity and draft");
    await run("<");
    await checkLayoutAndAccess("step5", true);
    await next();

    checkpoint = "step-6";
    await run("SELECT nome, estoque FROM produtos WHERE estoque < 10;");
    await next();

    checkpoint = "step-7";
    await expect(quest.getByRole("table", { name: "Resultado da sua consulta", exact: true })).toContainText("Mochila");
    await page.reload({ waitUntil: "domcontentloaded" });
    await button("Retomar missão").click();
    await expect(quest.getByRole("table", { name: "Resultado da sua consulta", exact: true })).toContainText("Mochila");
    await choose("A consulta só mudou o resultado");
    await next();

    checkpoint = "step-8";
    await run("SELECT nome, estoque FROM produtos WHERE estoque >= 7;");
    await next();

    checkpoint = "step-9";
    await choose("WHERE escolhe quais registros aparecem");
    await next();

    checkpoint = "complete";
    await expect(quest.getByRole("heading", { name: "Você já conversa com os dados.", exact: true })).toBeVisible();
    await checkLayoutAndAccess("complete", true);
    report.checks.push("all ten activities completed through the learner interface");

    // The reset lives in a disclosure so it never competes with the next action.
    const reset = button("Recomeçar aventura");
    if (!(await reset.isVisible())) {
      const summary = quest.getByLabel("Opções da aventura", { exact: true });
      await expect(summary).toBeVisible();
      await summary.click();
    }
    await reset.click();
    await button("Sim, recomeçar").click();
    // A restart may return to the introduction or directly to the first activity.
    if (await button("Ajudar o Orbi").isVisible()) await button("Ajudar o Orbi").click();
    await expect(button("Uma linha")).toBeVisible();
    await expect(continueButton()).not.toBeVisible();
    report.checks.push("confirmed restart clears completed progress");

    expect(report.errors, "browser JavaScript errors").toEqual([]);
    expect(report.failedSqlRequests, "SQLite asset requests").toEqual([]);
    expect(report.sqlRequests.some(request => new URL(request).pathname === "/vendor/sqljs/sql-wasm.wasm")).toBe(true);
    expect(report.sqlRequests.every(request => new URL(request).origin === new URL(url).origin)).toBe(true);
    report.checks.push("SQLite executes with self-hosted WASM");
    report.completed = true;
    console.log(`${profile}: ten SQL activities, recovery, real SQLite, reset, accessibility and layout passed`);
  } catch (error) {
    report.failure = { checkpoint, message: error instanceof Error ? error.message : String(error) };
    await page.screenshot({ path: `${outputDir}/${profile}-failure-${checkpoint}.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${outputDir}/${profile}.json`, JSON.stringify(report, null, 2));
    await browser.close();
  }
}
