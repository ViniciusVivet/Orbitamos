import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "test-results/academy-visual";
await mkdir(output, { recursive: true });
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 950 } }], ["iphone", webkit, devices["iPhone 13"]], ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }]];
for (const [name, engine, options] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  const page = await context.newPage(); page.setDefaultTimeout(60000);
  const report = { completed: false, screens: [], checks: [], errors: [] };
  page.on("pageerror", error => report.errors.push(error.message));
  const activate = locator => options.hasTouch ? locator.tap() : locator.click();
  try {
    for (const [view, url, selector, photoSelector] of [
      ["home", "/dev/academy-preview?view=home", "[data-academy-continue]", "[data-academy-continue] img"],
      ["code", "/dev/lab-preview?academy=1", "[data-lab-catalog]", "[data-lab-start] img"],
    ]) {
      await page.goto("http://localhost:3015" + url, { waitUntil: "domcontentloaded", timeout: 180000 });
      await page.locator(photoSelector).first().waitFor();
      await page.locator(photoSelector).first().evaluate(image => image.decode());
      await page.evaluate(() => scrollTo(0, 0));
      const image = await page.locator(photoSelector).first().boundingBox();
      const height = page.viewportSize().height;
      expect(image.y).toBeLessThan(height * .7);
      expect(image.height).toBeGreaterThan(100);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      const axe = await new AxeBuilder({ page }).include(selector).analyze();
      expect(axe.violations.map(item => item.id)).toEqual([]);
      await page.screenshot({ path: `${output}/${name}-${view}.jpg`, fullPage: false });
      report.screens.push({ view, imageTop: image.y, imageHeight: image.height, viewportHeight: height, violations: [] });
    }
    const cards = page.locator("[data-lab-catalog] a[data-language]");
    const total = await cards.count(); expect(total).toBeGreaterThan(0);
    expect(await cards.locator("img[data-lab-cover]").count()).toBe(total);
    await activate(page.getByRole("button", { name: "Python", exact: true }));
    expect(await cards.evaluateAll(nodes => nodes.length > 0 && nodes.every(node => node.dataset.language === "python"))).toBe(true);
    await activate(page.locator("[data-lab-filters] > summary"));
    await page.getByLabel("Filtrar por dificuldade").selectOption("iniciante");
    expect(await cards.count()).toBeGreaterThan(0);
    await page.reload();
    await expect(page.getByRole("button", { name: "Python", exact: true })).toHaveAttribute("aria-pressed", "true");
    await activate(page.locator("[data-lab-filters] > summary"));
    await expect(page.getByLabel("Filtrar por dificuldade")).toHaveValue("iniciante");
    await page.getByLabel("Filtrar por dificuldade").selectOption("todas");
    await activate(page.getByRole("button", { name: "Todas", exact: true }));
    await page.getByLabel("Buscar desafios", { exact: true }).fill("nãoexisteestaatividade");
    await expect(page.getByRole("heading", { name: "Nenhum experimento por aqui." })).toBeVisible();
    await activate(page.getByRole("button", { name: "Mostrar todos os experimentos", exact: true }));
    expect(await cards.count()).toBe(total);
    await expect(page.locator("[data-lab-start]")).toHaveAttribute("href", "/dev/ide-preview/variaveis-js?academy=1");
    await expect(page.getByRole("link", { name: /Uma loja. Seus primeiros dados/ })).toHaveAttribute("href", "/dev/academy-preview?activity=sql");
    report.checks.push("first-fold media; all challenge covers; filters reachable and restored; search and clear; canonical start and SQL destinations");
    expect(report.errors).toEqual([]); report.completed = true;
    console.log(`${name}: visual entry, filters and destinations passed`);
  } catch (error) { report.failure = String(error); await page.screenshot({ path: `${output}/${name}-failure.jpg` }).catch(() => {}); throw error; }
  finally { await writeFile(`${output}/${name}.json`, JSON.stringify(report, null, 2)); await context.close(); await browser.close(); }
}
