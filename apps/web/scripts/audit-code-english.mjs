import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const outputDir = "test-results/code-english";
const url = process.env.ENGLISH_URL || "http://localhost:3015/dev/academy-preview?activity=english";
const shellSmoke = process.argv.includes("--shell-smoke");
const profiles = [
  ["desktop", chromium, { viewport: { width: 1440, height: 1000 } }],
  ["iphone", webkit, devices["iPhone 13"]],
  ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }],
].filter(([name]) => !process.env.ENGLISH_PROFILE || name === process.env.ENGLISH_PROFILE);
if (!profiles.length) throw new Error("ENGLISH_PROFILE deve ser desktop, iphone ou small.");
await mkdir(outputDir, { recursive: true });

for (const [profile, engine, device] of profiles) {
  const artifactName = shellSmoke ? `${profile}-shell-smoke` : profile;
  const browser = await engine.launch();
  const context = await browser.newContext({ ...device, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const report = { profile, url, completed: false, checks: [], accessibility: [], errors: [] };
  const activity = page.locator("[data-code-english]");
  const button = name => activity.getByRole("button", { name, exact: true });
  const field = () => activity.getByRole("textbox", { name: "Palavra que falta", exact: true });
  let checkpoint = "intro";
  page.on("pageerror", error => report.errors.push(error.message));
  async function press(name) {
    const target = button(name);
    if (device.isMobile) await target.tap();
    else await target.click();
  }
  async function inspect(label, screenshot = false) {
    await expect(activity).toBeVisible();
    const width = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    expect(width.document, `${profile}/${label}: overflow`).toBeLessThanOrEqual(width.viewport + 1);
    expect(width.body, `${profile}/${label}: body overflow`).toBeLessThanOrEqual(width.viewport + 1);
    const accessibility = await new AxeBuilder({ page }).include("[data-code-english]").analyze();
    const violations = accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) }));
    report.accessibility.push({ label, violations });
    expect(violations, `${profile}/${label}: accessibility`).toEqual([]);
    if (screenshot) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${outputDir}/${artifactName}-${label}.jpg`, fullPage: true });
      await page.screenshot({ path: `${outputDir}/${artifactName}-${label}-viewport.jpg` });
    }
    report.checks.push(`${label}: layout and accessibility`);
  }
  async function choose(answer) {
    await press(answer);
    await expect(button("Continuar")).toBeVisible();
  }
  async function next() { await press("Continuar"); }
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await button("Entrar na missão").waitFor({ timeout: 90000 });
    if (shellSmoke) {
      await press("Entrar na missão");
      await expect(button("folder")).toBeVisible();
      const navigation = await page.locator(".site-navigation").evaluateAll(elements => elements.map(element => getComputedStyle(element).display));
      expect(navigation.length, "commercial navigation element exists for the CSS assertion").toBeGreaterThan(0);
      expect(navigation.every(display => display === "none"), "commercial navigation is hidden inside the mobile activity").toBe(true);
      await inspect("scene1", true);
      checkpoint = "restore-bridge-fixture";
      // Explicit persistence fixture: this checks restoration, not learning completion.
      await page.evaluate(() => {
        localStorage.setItem("orbitamos-english-v1-academy-preview", JSON.stringify({ version: 1, current: 7, completed: ["folder", "file", "button", "server", "missing-file", "complete-error", "return", "transfer"], finished: true, draft: "" }));
        localStorage.setItem("orbitamos-practice-journal-v1-academy-preview", JSON.stringify({ version: 1, activities: { english: { reviews: 0, completedAt: Date.now(), dueAt: Date.now() + 86400000 } } }));
      });
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(activity.getByRole("heading", { name: /Você leu as pistas\.\s*E seguiu o código\./ })).toBeVisible();
      const bridge = page.locator("[data-learning-bridge]");
      await expect(bridge).toBeVisible();
      await expect(bridge.getByRole("link", { name: "Experimentar no código", exact: false })).toHaveAttribute("href", /\/dev\/ide-preview\/variaveis-js/);
      await inspect("restored", true);
      expect(report.errors).toEqual([]);
      report.checks.push("mobile commercial navigation hidden; finished English and code bridge restore from an explicit persistence fixture");
      report.completed = true;
      console.log(`${profile}: current mobile shell and completed-English bridge restoration passed`);
      continue;
    }
    await inspect("intro", true);
    await press("Entrar na missão");
    checkpoint = "folder";
    await press("file");
    await expect(button("Continuar")).not.toBeVisible();
    await expect(activity.getByRole("status").filter({ hasText: "File é um arquivo" })).toBeVisible();
    await choose("folder");
    await inspect("folder", true);
    await next();
    checkpoint = "file";
    await choose("file"); await next();
    checkpoint = "button";
    await choose("button"); await next();
    checkpoint = "server";
    await choose("server");
    await inspect("server", true);
    await next();
    checkpoint = "error";
    await press("Concluir que o servidor caiu");
    await expect(button("Continuar")).not.toBeVisible();
    await choose("Conferir o nome e o caminho do arquivo"); await next();
    checkpoint = "write";
    await expect(activity.locator("figure code")).toHaveText("File not …");
    await field().fill("fou");
    await expect(button("Continuar")).not.toBeVisible();
    expect(await field().evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
    await page.reload({ waitUntil: "domcontentloaded" });
    await press("Retomar missão");
    await expect(field()).toHaveValue("fou");
    await press("Verificar palavra");
    await expect(field()).toHaveAttribute("aria-invalid", "true");
    await expect(button("Continuar")).not.toBeVisible();
    await expect(field()).toHaveValue("fou");
    await press("Preciso de uma pista");
    await expect(activity.getByText("A palavra que falta é found:", { exact: false })).toBeVisible();
    await field().fill("FOUND"); await field().press("Enter");
    await expect(button("Continuar")).toBeVisible();
    await inspect("write", true);
    await next();
    checkpoint = "return";
    await press("Mostra 6 no console automaticamente");
    await expect(button("Continuar")).not.toBeVisible();
    await choose("Devolve 6 para a chamada dobro(3)");
    await inspect("return", true);
    await next();
    checkpoint = "output";
    await press("Nenhuma saída");
    await expect(button("Concluir missão")).not.toBeVisible();
    await press("8");
    await expect(button("Concluir missão")).toBeVisible();
    await press("Concluir missão");
    checkpoint = "complete";
    await expect(activity.getByRole("heading", { name: /Você leu as pistas\.\s*E seguiu o código\./ })).toBeVisible();
    const completed = await page.evaluate(() => ({ english: JSON.parse(localStorage.getItem("orbitamos-english-v1-academy-preview")), journals: Object.entries(localStorage).filter(([key]) => key.includes("practice") && key.includes("academy-preview")).map(([key, value]) => ({ key, data: JSON.parse(value) })) }));
    expect(completed.english.finished).toBe(true);
    expect(completed.english.completed).toHaveLength(8);
    expect(completed.journals.some(({ data }) => !!data.activities?.english?.completedAt), "parent onComplete recorded completion").toBe(true);
    await inspect("complete", true);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(activity.getByRole("heading", { name: /Você leu as pistas\.\s*E seguiu o código\./ })).toBeVisible();
    await press("Praticar de novo");
    await expect(button("folder")).toBeVisible();
    await expect(button("Continuar")).not.toBeVisible();
    expect(report.errors).toEqual([]);
    report.checks.push("eight scenes completed, wrong answers recover, draft and finish survive refresh, callback records completion, replay resets own progress");
    report.completed = true;
    console.log(`${profile}: eight English scenes, draft recovery, callback, accessibility and layout passed`);
  } catch (error) {
    report.failure = { checkpoint, message: error instanceof Error ? error.message : String(error) };
    await page.screenshot({ path: `${outputDir}/${artifactName}-failure-${checkpoint}.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${outputDir}/${artifactName}.json`, JSON.stringify(report, null, 2));
    await browser.close();
  }
}
