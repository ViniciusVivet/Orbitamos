import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "test-results/visual-games";
const base = process.env.IDE_AUDIT_URL || "http://localhost:3015";
await mkdir(output, { recursive: true });
const profiles = [
  ["desktop", chromium, { viewport: { width: 1440, height: 1000 } }],
  ["iphone", webkit, devices["iPhone 13"]],
  ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }],
].filter(([name]) => !process.argv[2] || process.argv[2] === name);

for (const [name, engine, options] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  const report = { errors: [], completed: false, checks: [] };
  page.on("pageerror", error => report.errors.push(error.message));
  const activate = locator => options.hasTouch ? locator.tap() : locator.click();
  const visit = path => page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: 180000 });
  try {
    await visit("/dev/academy-preview?view=practice");
    const station = page.locator("[data-practice-station]");
    await expect(station.getByRole("heading", { name: "Aprenda jogando.", exact: true })).toBeVisible({ timeout: 90000 });
    await expect(station.locator("a[data-theme]")).toHaveCount(6);
    const covers = station.locator("[data-art] img");
    await expect(covers).toHaveCount(7);
    for (const cover of await covers.all()) {
      await cover.scrollIntoViewIfNeeded();
      await expect.poll(() => cover.evaluate(image => image.complete && image.naturalWidth > 0), { timeout: 60000 }).toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    report.firstVisual = await station.locator("[data-art]").first().boundingBox();
    expect(report.firstVisual.y).toBeLessThan(page.viewportSize().height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    report.checks.push("Seven real game images load; recommended scene is visible in the first viewport; no horizontal overflow");
    await page.screenshot({ path: `${output}/${name}-games.jpg`, fullPage: true });
    await page.screenshot({ path: `${output}/${name}-fold.jpg`, fullPage: false });

    const axe = await new AxeBuilder({ page }).include("[data-practice-station]").analyze();
    report.violations = axe.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }));
    expect(report.violations).toEqual([]);
    await activate(station.getByRole("button", { name: "Inglês", exact: true }));
    await expect(station.locator("a[data-theme]")).toHaveCount(1);
    await activate(station.locator("a[data-theme]"));
    await expect(page).toHaveURL(/activity=english/);
    await expect(page.locator("[data-code-english]")).toBeVisible({ timeout: 90000 });
    report.checks.push("English filter leaves one card; the card opens the actual English experience");

    await visit("/dev/academy-preview?activity=review");
    await expect(page.getByRole("heading", { name: "Primeiro, uma descoberta.", exact: true })).toBeVisible({ timeout: 90000 });
    const reviewArt = page.locator("[data-practice-review] img");
    await expect.poll(() => reviewArt.evaluate(image => image.complete && image.naturalWidth > 0), { timeout: 60000 }).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `${output}/${name}-review-empty.jpg`, fullPage: true });
    const reviewAxe = await new AxeBuilder({ page }).include("[data-practice-review]").analyze();
    report.reviewViolations = reviewAxe.violations.map(item => item.id);
    expect(report.reviewViolations).toEqual([]);
    report.checks.push("Empty review shows Orbi and an actionable next step; no horizontal overflow or axe violations");
    expect(report.errors).toEqual([]);
    report.completed = true;
    console.log(`${name}: loaded images, first viewport, filters, links, empty review and axe passed`);
  } catch (error) {
    report.failure = String(error);
    report.url = page.url();
    await page.screenshot({ path: `${output}/${name}-failure.jpg`, fullPage: false }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${output}/${name}.json`, JSON.stringify(report, null, 2));
    await context.close();
    await browser.close();
  }
}
