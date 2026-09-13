import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

const baseURL = process.env.PORTAL_AUDIT_URL || "http://localhost:3015";
const output = path.resolve("test-results", "portal-experience");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const role of ["student", "work"]) {
    for (const width of [320, 390, 768, 1024, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.goto(baseURL + "/dev/portal-preview?role=" + role, { waitUntil: "domcontentloaded", timeout: 180000 });
      await page.locator("[data-portal-preview] h1").waitFor({ timeout: 120000 });
      await page.locator('[data-preview-ready="true"]').waitFor({ timeout: 120000 });
      await page.evaluate(() => document.fonts.ready);
      console.log("Checking", role, width);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(overflow <= 1, role + " " + width + ": horizontal overflow " + overflow);
      assert.equal(await page.locator("[data-portal-preview] h1").count(), 1);
      if (width === 390 || width === 1440) {
        await page.screenshot({ path: path.join(output, role + "-" + width + ".png"), fullPage: true });
        const axe = await new AxeBuilder({ page }).include("[data-portal-preview]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        assert.deepEqual(axe.violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) })), [], role + ": accessibility violations");
      }
      if (role === "student" && width < 480) {
        const shelf = page.locator("[data-course-shelf]");
        await shelf.locator("a").last().focus();
        const bounds = await shelf.locator("a").last().boundingBox();
        assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1, "Focused course stays visible on mobile");
        assert.ok(await shelf.evaluate(el => el.scrollLeft > 0), "Mobile shelf scrolls to focused course");
        await shelf.locator("a").first().focus();
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      if (width < 1024) {
        await page.locator("[data-portal-preview]").getByRole("button", { name: "Abrir menu", exact: true }).click();
        const close = page.getByRole("button", { name: "Fechar menu", exact: true });
        await close.waitFor({ state: "visible" });
        assert.ok(await close.evaluate(el => document.activeElement === el), "Menu must receive focus");
        await page.keyboard.press("Shift+Tab");
        assert.ok(await page.getByRole("button", { name: "Sair da conta", exact: true }).evaluate(el => document.activeElement === el), "Focus wraps inside menu");
        await page.keyboard.press("Escape");
        assert.ok(await page.locator("[data-portal-preview]").getByRole("button", { name: "Abrir menu", exact: true }).evaluate(el => document.activeElement === el), "Focus returns to trigger");
      }
      assert.deepEqual(errors, [], role + " " + width + ": runtime errors");
      results.push({ role, width, overflow, runtimeErrors: errors.length });
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const state of ["empty", "loading", "error", ...(role === "student" ? ["complete"] : [])]) {
      await page.goto(baseURL + "/dev/portal-preview?role=" + role + "&state=" + state, { waitUntil: "domcontentloaded" });
      await page.locator('[data-preview-ready="true"]').waitFor({ timeout: 120000 });
      await page.locator("[data-portal-preview] h1").waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), role + " " + state + ": overflow");
      if (state === "loading") assert.ok(await page.getByRole("status", { name: "Carregando dados" }).count() > 0);
      if (state === "error") {
        await page.locator("[data-portal-preview]").getByRole("alert").waitFor();
        await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
        await page.locator("[data-portal-preview]").getByRole("alert").waitFor({ state: "hidden" });
      }
      if (state === "empty") await page.screenshot({ path: path.join(output, role + "-empty-390.png"), fullPage: true });
      if (state === "complete") {
        assert.equal(await page.getByRole("link", { name: "Revisitar aulas", exact: true }).getAttribute("href"), "/estudante/aulas");
      }
      results.push({ role, state, passed: true });
    }
    await context.close();
  }
  const page = await browser.newPage();
  for (const route of ["/estudante", "/colaborador"]) {
    await page.goto(baseURL + route, { waitUntil: "domcontentloaded" });
    await page.waitForURL(url => url.pathname === "/entrar", { timeout: 30000, waitUntil: "domcontentloaded" });
    results.push({ route, unauthenticatedRedirect: "/entrar" });
  }
  await page.close();
  await writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: results.length, results }, null, 2));
} finally {
  await browser.close();
}
