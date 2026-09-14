import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.IDE_AUDIT_URL || "http://localhost:3015";
const output = "test-results/laboratory";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [width, height] of [[1440, 1000], [1024, 768], [768, 1024], [390, 844], [320, 740]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base + "/dev/lab-preview", { waitUntil: "networkidle" });
    await page.locator('[data-lab-ready="true"]').waitFor();
    const catalog = page.locator("[data-lab-catalog]");
    const cards = catalog.locator("a[data-language]");
    const total = await cards.count();
    assert(total > 0);
    assert.equal(await cards.locator("img[data-lab-cover]").count(), total, "every card has a photo");
    assert(await cards.locator("img").evaluateAll(images => images.every(img => img.loading === "lazy" && img.sizes && img.alt === "")), "responsive decorative lazy covers");
    if (width === 1440) {
      const families = await cards.locator("img").evaluateAll(images => [...new Set(images.map(img => img.dataset.labCover))]);
      assert.equal(families.length, 6);
      const imageResults = [];
      for (const family of families) {
        const cover = cards.locator('img[data-lab-cover="' + family + '"]').first();
        await cover.scrollIntoViewIfNeeded();
        await page.waitForFunction(family => {
          const image = document.querySelector('img[data-lab-cover="' + family + '"]');
          return image?.complete && image.naturalWidth > 0;
        }, family);
        const src = await cover.evaluate(image => image.currentSrc);
        assert(src.includes("/_next/image?"), "built-in image optimization");
        const response = await page.request.get(src, { headers: { Accept: "image/webp" } });
        assert.equal(response.status(), 200);
        assert.equal(response.headers()["content-type"], "image/webp");
        const bytes = (await response.body()).length;
        assert(bytes < 250000, "desktop cover budget: " + family);
        imageResults.push({ family, bytes });
      }
      results.push({ optimizedCovers: imageResults });
    }
    await page.evaluate(() => scrollTo(0, 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "horizontal overflow at " + width);
    const axe = await new AxeBuilder({ page }).include("[data-lab-catalog]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], "catalog accessibility " + width);
    await page.screenshot({ path: output + "/catalog-" + width + ".png", fullPage: false });
    await cards.first().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const image = document.querySelector("a[data-language] img");
      return image?.complete && image.naturalWidth > 0;
    });
    await page.screenshot({ path: output + "/experiments-" + width + ".png", fullPage: false });
    await page.getByRole("button", { name: "JavaScript", exact: true }).click();
    assert(await cards.count() > 0);
    assert(await cards.evaluateAll(items => items.every(el => el.dataset.language === "javascript")));
    await page.getByRole("button", { name: "Todas as linguagens", exact: true }).click();
    assert.equal(await cards.count(), total);
    await page.getByLabel("Buscar desafios", { exact: true }).fill("zzzznaoexiste");
    await page.getByRole("heading", { name: "Nenhum experimento por aqui." }).waitFor();
    await page.getByRole("button", { name: "Mostrar todos os experimentos" }).click();
    assert.equal(await cards.count(), total);
    await page.getByLabel("Filtrar por dificuldade").selectOption("iniciante");
    assert(await cards.count() > 0);
    await page.getByLabel("Filtrar por dificuldade").selectOption("todas");
    const firstHref = await cards.first().getAttribute("href");
    const slug = firstHref.split("/").pop();
    await page.evaluate(slug => localStorage.setItem("orbitamos-pratica-lab-preview-" + slug, JSON.stringify({ stepStatus: ["pending"], reflection: "Minha reflexão de teste" })), slug);
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("Retomar experimento", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Em andamento", exact: true }).click();
    assert.equal(await cards.count(), 1);
    await page.getByText("Reflexão salva", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Concluídos", exact: true }).click();
    await page.getByRole("heading", { name: "Nenhum experimento por aqui." }).waitFor();
    assert.deepEqual(errors, []);
    results.push({ width, height, experiments: total, filters: "passed", draft: "passed", accessibility: "passed" });
    await context.close();
  }
  for (const [width, height] of [[1440, 900], [700, 900], [390, 844], [320, 740]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto(base + "/dev/ide-preview/operadores-js", { waitUntil: "networkidle" });
    await page.getByLabel("Editor de código", { exact: true }).waitFor();
    await page.screenshot({ path: output + "/editor-" + width + ".png", fullPage: true });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "IDE horizontal overflow " + width);
    const guideTab = page.getByRole("tab", { name: "Guia", exact: true });
    if (await guideTab.isVisible()) await guideTab.click();
    const axe = await new AxeBuilder({ page }).include("[data-lab-workspace]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), [], "workspace accessibility " + width);
    await page.screenshot({ path: output + "/guide-" + width + ".png", fullPage: true });
    if (width === 700) {
      await page.getByRole("tab", { name: "Código", exact: true }).click();
      const editor = page.getByLabel("Editor de código", { exact: true });
      await editor.fill("console.log(42)");
      await page.waitForTimeout(150);
      await page.getByRole("button", { name: "Executar", exact: true }).click();
      const consoleOutput = page.locator('#practice-editor-panel [role="status"]');
      await page.getByRole("button", { name: "Expandir console", exact: true }).waitFor();
      const before = await consoleOutput.evaluate(el => el.clientHeight);
      await page.getByRole("button", { name: "Expandir console", exact: true }).click();
      await page.waitForTimeout(350);
      assert(await consoleOutput.evaluate(el => el.clientHeight) > before, "700px console expansion");
    }
    results.push({ width, height, workspace: "passed", guideAccessibility: "passed" });
    await context.close();
  }
  console.log(JSON.stringify(results, null, 2));
  await writeFile(output + "/audit.json", JSON.stringify(results, null, 2));
} finally { await browser.close(); }
