import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

const base = process.env.PHOTO_AUDIT_URL || "http://localhost:3015";
const output = path.resolve("test-results/photography");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const area of ["comunidade", "cursos", "mentorias", "portfolio", "squad"]) {
    for (const width of [320, 390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(base + "/dev/photos-preview?area=" + area, { waitUntil: "domcontentloaded", timeout: 180000 });
      const root = page.locator("[data-photo-preview]");
      await root.locator("[data-orbit-photo]").first().waitFor({ timeout: 120000 });
      await page.evaluate(() => document.fonts.ready);
      const photos = root.locator("[data-orbit-photo] img");
      const count = await photos.count();
      const kinds = await root.locator("[data-orbit-photo]").evaluateAll(nodes => [...new Set(nodes.map(n => n.dataset.orbitPhoto))]);
      for (const kind of kinds) {
        const photo = root.locator('[data-orbit-photo="' + kind + '"] img').first();
        await photo.scrollIntoViewIfNeeded();
        await photo.evaluate(img => img.decode());
        assert.ok(await photo.evaluate(img => img.naturalWidth > 0 && img.clientWidth > 0));
        assert.equal(await photo.getAttribute("alt"), "");
        assert.ok(await photo.getAttribute("sizes"));
        assert.ok(await photo.getAttribute("srcset"));
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), area + " overflow at " + width);
      if (area === "comunidade" || area === "portfolio" || area === "squad") {
        const axe = await new AxeBuilder({ page }).include("[data-photo-preview]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        assert.deepEqual(axe.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), [], area + " accessibility");
      }
      if (area === "cursos") {
        assert.ok(kinds.includes("hardware") && kinds.includes("dados"));
        await root.getByRole("textbox", { name: "Pesquisar aulas e cursos" }).fill("SQL");
        await root.locator('[data-orbit-photo="dados"]').first().waitFor();
        assert.ok(await root.locator('a[href="/estudante/cursos/sql-na-pratica"]').count() > 0);
        await root.getByRole("button", { name: "Limpar pesquisa", exact: true }).click();
      }
      await page.evaluate(() => scrollTo(0, 0));
      if (width !== 320) await page.screenshot({ path: path.join(output, area + "-" + width + ".jpg"), type: "jpeg", quality: 75, fullPage: area !== "cursos" });
      assert.deepEqual(errors, [], area + " runtime errors");
      results.push({ area, width, count, kinds, passed: true });
      console.log("PASS", area, width, count, "photos");
      await context.close();
    }
  }
  for (const route of ["/sobre", "/mentorias", "/orbitacademy", "/forum"]) {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const previewRoute = route === "/orbitacademy" ? "/dev/photos-preview?area=academy" : route;
      await page.goto(base + previewRoute, { waitUntil: "domcontentloaded", timeout: 180000 });
      const image = page.locator("[data-orbit-photo] img").first();
      // Forum's help column is intentionally desktop-only.
      if (route === "/forum" && width < 1280) { await page.close(); continue; }
      await image.scrollIntoViewIfNeeded({ timeout: 120000 });
      await image.evaluate(img => img.decode());
      assert.ok(await image.evaluate(img => img.naturalWidth > 0));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route + " overflow at " + width);
      await page.screenshot({ path: path.join(output, "public-" + route.slice(1) + "-" + width + ".jpg"), type: "jpeg", quality: 75 });
      results.push({ route, width, passed: true });
      console.log("PASS", route, width);
      await page.close();
    }
  }
  await writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: results.length }));
} finally { await browser.close(); }
