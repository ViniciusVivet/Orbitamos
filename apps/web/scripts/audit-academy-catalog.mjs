import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "test-results/academy-catalog";
await mkdir(output, { recursive: true });
const profiles = [
  ["desktop", chromium, { viewport: { width: 1440, height: 1000 } }],
  ["iphone", webkit, devices["iPhone 13"]],
  ["small", chromium, { viewport: { width: 320, height: 740 }, hasTouch: true, isMobile: true }],
].filter(([name]) => !process.env.CATALOG_PROFILE || process.env.CATALOG_PROFILE === name);
if (!profiles.length) throw new Error("CATALOG_PROFILE deve ser desktop, iphone ou small.");

for (const [name, engine, options] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const report = { completed: false, checks: [], accessibility: [], errors: [] };
  page.on("pageerror", error => report.errors.push(error.message));
  async function capture(view, selector) {
    // Warm lazy editorial imagery before a full-page screenshot; blur is not the final visual.
    const photos = page.locator(`${selector} [data-orbit-photo]`);
    for (let index = 0; index < await photos.count(); index += 1) {
      const photo = photos.nth(index);
      await photo.scrollIntoViewIfNeeded();
      await photo.locator("img").evaluate(image => image.decode());
    }
    await page.evaluate(() => scrollTo(0, 0));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${view}: overflow`).toBe(true);
    const result = await new AxeBuilder({ page }).include(selector).analyze();
    const violations = result.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }));
    report.accessibility.push({ view, violations });
    expect(violations, `${view}: accessibility`).toEqual([]);
    await page.screenshot({ path: `${output}/${name}-${view}.jpg`, fullPage: true });
  }
  try {
    await page.goto("http://localhost:3015/dev/academy-preview?view=tracks", { waitUntil: "domcontentloaded", timeout: 240000 });
    const tracks = page.locator("[data-academy-tracks]");
    await expect(tracks.getByRole("heading", { name: /Um caminho claro/ })).toBeVisible({ timeout: 120000 });
    await expect(tracks.getByRole("link", { name: "Abrir trilha C#", exact: false })).toHaveAttribute("href", "/dev/csharp-preview?academy=1");
    await expect(tracks.getByRole("link", { name: "Abrir aventura SQL", exact: false })).toHaveAttribute("href", "/dev/academy-preview?activity=sql");
    await expect(tracks.getByRole("link", { name: "Ver biblioteca completa", exact: false })).toHaveAttribute("href", "/estudante/aulas");
    await expect(tracks.getByText(/Edição piloto. Métodos, APIs/)).toBeVisible();
    const videoLinks = await tracks.locator('a[href^="/estudante/cursos/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("href")));
    expect(videoLinks.length).toBeGreaterThan(0);
    expect(new Set(videoLinks).size).toBe(videoLinks.length);
    const support = tracks.locator("details").first();
    if (await support.count()) {
      if (options.hasTouch) await support.locator("summary").tap();
      else await support.locator("summary").click();
      await expect(support).toHaveAttribute("open", "");
    }
    await capture("tracks", "[data-academy-tracks]");
    report.checks.push("canonical C# and SQL destinations, truthful availability, videos kept as supporting material, unique courses and expandable support");

    await page.goto("http://localhost:3015/dev/academy-preview?view=community", { waitUntil: "domcontentloaded", timeout: 240000 });
    const community = page.locator("[data-academy-community]");
    await expect(community.getByRole("heading", { name: /Você não precisa/ })).toBeVisible({ timeout: 120000 });
    await expect(community.getByRole("link", { name: "Abrir fórum público", exact: false })).toHaveAttribute("href", "/forum");
    await expect(community.getByRole("link", { name: "Ver mentorias", exact: false })).toHaveAttribute("href", "/estudante/mentorias");
    await expect(community.getByRole("link", { name: "Abrir mensagens", exact: false })).toHaveAttribute("href", "/mensagens?area=student");
    await expect(community.getByRole("link", { name: "Entrar no Discord", exact: false })).toHaveAttribute("target", "_blank");
    await capture("community", "[data-academy-community]");
    report.checks.push("public forum and Discord preserved; mentoring and messages contextual links; privacy guidance");
    expect(report.errors).toEqual([]);
    report.completed = true;
    console.log(`${name}: catalog and community passed`);
  } catch (error) {
    report.failure = String(error);
    await page.screenshot({ path: `${output}/${name}-failure.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${output}/${name}.json`, JSON.stringify(report, null, 2));
    await browser.close();
  }
}
