import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "test-results/student-secondary-visuals";
await mkdir(output, { recursive: true });
const views = [
  ["community", "[data-academy-community]"],
  ["progress", "[data-academy-evidence]"],
  ["lessons", "[data-academy-lessons]"],
  ["mentoring", "[data-academy-mentoring]"],
];
const profiles = [
  ["desktop", chromium, { viewport: { width: 1440, height: 950 } }],
  ["iphone", webkit, devices["iPhone 13"]],
  ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }],
].filter(([name]) => !process.argv[2] || name === process.argv[2]);

for (const [name, engine, options] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  const report = { completed: false, views: [], errors: [] };
  page.on("pageerror", error => report.errors.push(error.message));
  try {
    for (const [view, selector] of views) {
      await page.goto(`http://localhost:3015/dev/academy-preview?view=${view}`, { waitUntil: "domcontentloaded", timeout: 180000 });
      const area = page.locator(selector);
      await area.waitFor({ timeout: 120000 });
      const firstImage = area.locator("img").first();
      await expect.poll(() => firstImage.evaluate(image => image.complete && image.naturalWidth > 0), { timeout: 90000 }).toBe(true);
      await firstImage.evaluate(image => image.decode());
      await expect.poll(() => firstImage.getAttribute("style"), { timeout: 45000 }).not.toContain("background-image");
      if (view === "progress") await expect(area.getByText("Lendo suas atividades salvas…", { exact: true })).toHaveCount(0);
      const firstPhoto = await firstImage.boundingBox();
      expect(firstPhoto).not.toBeNull();
      const viewportHeight = options.viewport?.height ?? 664;
      expect(Math.min(firstPhoto.y + firstPhoto.height, viewportHeight) - Math.max(firstPhoto.y, 0)).toBeGreaterThan(80);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `${output}/${name}-${view}-first.jpg`, quality: 75 });
      const axe = await new AxeBuilder({ page }).include(selector).analyze();
      const violations = axe.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }));
      expect(violations).toEqual([]);
      if (view === "community") {
        await expect(area.getByRole("link", { name: "Pedir ajuda no fórum", exact: true })).toHaveAttribute("href", "/forum");
        await area.getByText("Não sei como explicar minha dúvida", { exact: true }).click();
        await expect(area.getByText("Retire senhas, chaves e dados pessoais antes de compartilhar.", { exact: true })).toBeVisible();
      }
      if (view === "progress") {
        await expect(area.getByRole("link", { name: "Escrever minha primeira linha", exact: true })).toHaveAttribute("href", /variaveis-js/);
        await area.getByText("Como esse progresso é contado?", { exact: true }).click();
        await expect(area.getByText("Os registros de código e jogos ficam separados por conta", { exact: false })).toBeVisible();
      }
      if (view === "lessons") {
        await area.getByText("Filtrar por área", { exact: true }).click();
        const filter = area.locator("details").first();
        const subject = filter.getByRole("button").nth(1);
        await subject.click();
        await expect(subject).toHaveAttribute("aria-pressed", "true");
        await filter.getByRole("button", { name: "Todas", exact: true }).click();
        await expect(subject).toHaveAttribute("aria-pressed", "false");
        await area.getByRole("textbox", { name: "Pesquisar aulas e cursos" }).fill("Python");
        await expect(area.getByRole("heading", { name: /aulas? encontrad/ })).toBeVisible();
        await area.getByRole("button", { name: "Limpar pesquisa", exact: true }).click();
      }
      if (view === "mentoring") await expect(area.getByRole("link", { name: "Solicitar orientação", exact: true })).toHaveAttribute("href", /wa.me|whatsapp/);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let top = 0; top < height; top += 650) await page.evaluate(top => scrollTo(0, top), top);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${output}/${name}-${view}-full.jpg`, fullPage: true, quality: 65 });
      report.views.push({ view, firstPhoto, violations });
      console.log(`${name}/${view}: first-fold image, controls, overflow and axe passed`);
    }
    expect(report.errors).toEqual([]);
    report.completed = true;
  } catch (error) {
    report.failure = String(error); report.url = page.url();
    await page.screenshot({ path: `${output}/${name}-failure.jpg`, fullPage: false }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${output}/${name}.json`, JSON.stringify(report, null, 2));
    await context.close(); await browser.close();
  }
}
