import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "test-results/academy-navigation";
await mkdir(output, { recursive: true });
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 1000 } }], ["iphone", webkit, devices["iPhone 13"]], ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }]].filter(([name]) => !process.env.NAV_PROFILE || name === process.env.NAV_PROFILE);
for (const [name, engine, options] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);
  const report = { completed: false, checks: [], accessibility: [], errors: [] };
  page.on("pageerror", error => report.errors.push(error.message));
  const sidebar = page.locator('aside[aria-label="Navegação do estudante"]');
  const tap = locator => options.hasTouch ? locator.tap() : locator.click();
  async function menu(label) {
    if (options.hasTouch) await tap(page.getByRole("button", { name: "Abrir menu", exact: true }));
    const nav = sidebar.locator("nav");
    await expect(nav.getByRole("link")).toHaveCount(5);
    await tap(nav.getByRole("link", { name: label, exact: true }));
  }
  async function checkpoint(label) {
    await expect(page.locator('.site-navigation')).toHaveCount(0);
    await expect(page.locator('main[data-site-context="workspace"]')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const result = await new AxeBuilder({ page }).include('[data-portal-area="student"]').analyze();
    const violations = result.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }));
    report.accessibility.push({ label, violations });
    expect(violations, label).toEqual([]);
    await page.screenshot({ path: `${output}/${name}-${label}.jpg`, fullPage: true });
  }
  try {
    await page.goto("http://localhost:3015/dev/academy-preview?view=home", { waitUntil: "domcontentloaded", timeout: 240000 });
    await expect(page.locator("[data-academy-continue] h1")).toHaveText("Sua primeira linha de código.", { timeout: 120000 });
    await checkpoint("home");
    if (options.hasTouch) {
      await expect(page.getByRole("navigation", { name: "Atalhos da Academy" })).toBeVisible();
      await tap(page.getByRole("button", { name: "Abrir menu", exact: true }));
      await expect(sidebar).toHaveAttribute("role", "dialog");
      await page.keyboard.press("Escape");
      await expect(page.getByRole("button", { name: "Abrir menu", exact: true })).toBeFocused();
    } else expect(await sidebar.evaluate(node => getComputedStyle(node).top)).toBe("0px");
    await menu("Trilhas");
    await expect(page).toHaveURL(/view=tracks/);
    await expect(page.locator("[data-academy-tracks]")).toBeVisible();
    await expect(sidebar.locator('a[aria-current="page"]')).toHaveText("Trilhas");
    report.checks.push("five clear menu destinations, shared shell, active section and mobile shortcuts/focus");
    await menu("Praticar");
    await expect(page).toHaveURL(/\/dev\/lab-preview\?academy=1/);
    await expect(page.locator("[data-lab-catalog] h1")).toBeVisible({ timeout: 120000 });
    const formats = page.getByRole("navigation", { name: "Formatos de prática" });
    await expect(formats.getByRole("link", { name: "Código", exact: true })).toHaveAttribute("aria-current", "page");
    await tap(formats.getByRole("link", { name: "Jogos", exact: true }));
    await expect(page.locator("[data-practice-station] h1")).toBeVisible();
    await expect(formats.getByRole("link", { name: "Jogos", exact: true })).toHaveAttribute("aria-current", "page");
    await tap(formats.getByRole("link", { name: "Inglês", exact: true }));
    await expect(page.getByRole("button", { name: "Entrar na missão", exact: true })).toBeVisible({ timeout: 120000 });
    await expect(formats.getByRole("link", { name: "Inglês", exact: true })).toHaveAttribute("aria-current", "page");
    if (options.hasTouch) await expect(page.getByRole("navigation", { name: "Atalhos da Academy" })).toHaveCount(0);
    await checkpoint("english");
    await menu("Início");
    await expect(page.locator("[data-academy-continue] h1")).toHaveText("Inglês em cena");
    await expect(page.locator("[data-academy-continue]").getByRole("link", { name: /Retomar atividade/ })).toHaveAttribute("href", "/dev/academy-preview?activity=english");
    await menu("Progresso");
    await expect(page.locator("[data-academy-evidence]")).toContainText("Visitada · sem etapa validada");
    await expect(page.locator("[data-academy-evidence]")).toContainText("0 / 6");
    await checkpoint("progress");
    report.checks.push("code → games → English → Home continuation → progress; visits never award a conclusion; no bottom dock over activity controls");
    await menu("Comunidade");
    await expect(page.locator("[data-academy-community]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir mensagens", exact: false })).toHaveAttribute("href", "/mensagens?area=student");
    await page.goto("http://localhost:3015/", { waitUntil: "domcontentloaded", timeout: 240000 });
    await expect(page.locator(".site-navigation")).toBeVisible({ timeout: 120000 });
    if (options.hasTouch) await tap(page.locator('.site-navigation').getByRole("button", { name: "Abrir menu", exact: true }));
    await expect(page.locator('.site-navigation').getByRole("link", { name: "Solicitar orçamento", exact: false })).toBeVisible();
    report.checks.push("commercial navigation and quote CTA remain on the public site");
    expect(report.errors).toEqual([]);
    report.completed = true;
    console.log(`${name}: navigation, continuation, context and accessibility passed`);
  } catch (error) {
    report.failure = String(error); report.url = page.url();
    await page.screenshot({ path: `${output}/${name}-failure.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally { await writeFile(`${output}/${name}.json`, JSON.stringify(report, null, 2)); await context.close(); await browser.close(); }
}
