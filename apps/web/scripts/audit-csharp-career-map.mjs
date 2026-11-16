import { chromium, webkit, devices, expect as baseExpect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const expect = baseExpect.configure({ timeout: 60000 });
const base = process.env.ACADEMY_AUDIT_URL || "http://localhost:3015";
const out = path.resolve("test-results/csharp-career-map");
await mkdir(out, { recursive: true });
const report = { scope: "Isolated previews; no applications, production account or learner trial", profiles: [], errors: [] };
const profiles = [
  ["iphone-webkit", webkit, { ...devices["iPhone 13"], viewport: { width: 390, height: 664 } }],
  ["narrow-webkit", webkit, { ...devices["iPhone SE"], viewport: { width: 320, height: 640 } }],
  ["desktop", chromium, { viewport: { width: 1366, height: 768 } }],
];
try {
  for (const [name, engine, options] of profiles) {
    const browser = await engine.launch();
    try {
      const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
      const page = await context.newPage();
      page.on("pageerror", error => report.errors.push({ name, error: String(error) }));
      page.setDefaultTimeout(60000);
      const result = { name, checks: [] };
      report.profiles.push(result);
      await page.goto(base + "/dev/academy-preview?view=tracks", { waitUntil: "domcontentloaded", timeout: 120000 });
      await page.goto(base + "/dev/csharp-preview?academy=1&view=map", { waitUntil: "domcontentloaded", timeout: 120000 });
      const map = page.locator("[data-csharp-career-map]");
      await expect(map).toBeVisible();
      await page.evaluate(() => scrollTo(0, 0));
      const action = await page.getByRole("button", { name: "Abrir práticas disponíveis", exact: true }).boundingBox();
      result.firstFold = { action, width: options.viewport.width, height: options.viewport.height };
      expect(action.y + action.height).toBeLessThan(options.viewport.height - (options.isMobile ? 64 : 0));
      const scene = await map.locator("header img").boundingBox();
      expect(Math.min(scene.y + scene.height, options.viewport.height - (options.isMobile ? 64 : 0)) - Math.max(scene.y, 0)).toBeGreaterThan(60);
      const stations = map.locator('ol[aria-label="Oito estações da formação"] > li');
      await expect(stations).toHaveCount(8);
      await expect(stations.nth(2).getByRole("button", { name: "Métodos e projeto .NET", exact: true })).toHaveCount(1);
      await expect(stations.nth(2).getByRole("button", { name: "Objetos e listas", exact: true })).toHaveCount(1);
      await expect(stations.nth(2)).toContainText("Métodos, objetos e listas disponíveis");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(options.viewport.width);
      await page.screenshot({ path: path.join(out, name + "-map.png") });
      const index = map.getByRole("navigation", { name: "Ir para uma estação", exact: true });
      await expect(index.getByRole("link")).toHaveCount(8);
      await index.getByRole("link", { name: "04 Dados", exact: true }).click();
      expect(new URL(page.url()).hash).toBe("#career-stage-data");
      await expect(stations.nth(3)).toBeVisible();
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(map).toBeVisible();
      await expect(async () => { const bounds = await stations.nth(3).boundingBox(); expect(bounds.y).toBeLessThan(200); }).toPass({ timeout: 15000 });
      await index.getByRole("link", { name: "03 Projeto .NET", exact: true }).click();
      await stations.nth(2).getByText("Ver tarefa de trabalho e critérios", { exact: true }).click();
      await expect(stations.nth(2)).toContainText("Como conferir o que aprendi");
      await stations.nth(2).getByText("Conhecer os arquivos desta entrega", { exact: true }).click();
      await expect(stations.nth(2).locator("pre")).toBeVisible();
      await page.screenshot({ path: path.join(out, name + "-assignment.png") });
      await map.getByText("Como usar IA sem perder o aprendizado", { exact: true }).click();
      await expect(map.locator('details').filter({ hasText: "Como usar IA sem perder o aprendizado" }).locator('ol>li')).toHaveCount(6);
      await expect(map).toContainText("sem IA");
      const accessibility = await new AxeBuilder({ page }).include("[data-csharp-career-map]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      result.accessibility = accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, count: nodes.length }));
      expect(result.accessibility).toEqual([]);
      result.checks.push("Eight stations, real module availability, readable work ticket/reference, optional critical AI routine");
      await stations.nth(1).getByRole("button", { name: "Condições", exact: true }).click();
      await expect(page.locator('[data-variables-module][data-module-kind="conditions"]')).toBeVisible();
      expect(new URL(page.url()).searchParams.get("module")).toBe("conditions");
      await page.getByRole("button", { name: "Mapa completo", exact: true }).click();
      await expect(map).toBeVisible();
      expect(new URL(page.url()).searchParams.get("view")).toBe("map");
      expect(new URL(page.url()).searchParams.has("module")).toBe(false);
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(map).toBeVisible();
      await expect(map.locator('[data-current="true"]')).toHaveCount(1);
      await expect(map).toContainText("Seu módulo: Condições");
      result.checks.push("Map → real conditions module → map → reload preserves selected module and shareable view");
      await page.getByRole("button", { name: /A profissão/ }).click();
      await expect(page.getByText("Leitura de anúncios consultados em 15/11/2026.", { exact: false })).toBeVisible();
      await expect(page.getByRole("link", { name: "Ler anúncio original", exact: true })).toHaveCount(6);
      await expect(page.getByText("Pleno · contraste, não ponto de entrada", { exact: false })).toBeVisible();
      result.checks.push("Updated public job examples; seniority/context retained without applying to jobs");
      await page.goBack({ waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(base + "/dev/academy-preview?view=tracks");
      await expect(page.locator("[data-csharp-track]")).toHaveCount(0);
      result.checks.push("Station index does not add misleading history; browser Back returns to the previous page");
      await context.close();
      console.log(name + " passed");
    } finally { await browser.close(); }
  }
  expect(report.errors).toEqual([]);
  report.completed = true;
} finally { await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2)); }
