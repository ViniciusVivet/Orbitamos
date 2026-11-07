import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, webkit, devices, expect as baseExpect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const expect = baseExpect.configure({ timeout: 20000 });
const base = process.env.PORTFOLIO_AUDIT_URL || "http://localhost:3015";
const output = path.resolve("test-results/commercial-portfolio");
await mkdir(output, { recursive: true });
await Promise.all(["report.json", "failure.json"].map((file) => rm(path.join(output, file), { force: true })));
const results = [];
const views = [
  { name: "desktop", type: chromium, viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" },
  { name: "notebook", type: chromium, viewport: { width: 1280, height: 600 }, reducedMotion: "no-preference" },
  { name: "iphone", type: webkit, ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" },
  { name: "compact-reduced", type: chromium, viewport: { width: 320, height: 740 }, reducedMotion: "reduce" },
];
for (const { name, type, ...options } of views) {
  const browser = await type.launch({ headless: true });
  let page;
  const errors = [];
  try {
    const context = await browser.newContext(options);
    page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base, { waitUntil: "load", timeout: 120000 });
    await page.bringToFront();
    await page.evaluate(() => document.fonts.ready);
    const strip = page.locator("[data-home-capabilities]");
    await strip.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const track = strip.locator("[data-paused]");
    const state = () => track.evaluate((el) => getComputedStyle(el).animationPlayState);
    if (options.reducedMotion === "reduce") {
      assert.equal(await strip.getByRole("button").count(), 0);
      assert.equal(await track.evaluate((el) => getComputedStyle(el).animationName), "none");
      assert.equal(await strip.getByRole("listitem").count(), 4);
    } else {
      await page.mouse.move(0, 0);
      await expect.poll(state).toBe("running");
      const position = () => track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
      const start = await position();
      await expect.poll(async () => Math.abs(await position() - start), { timeout: 15000 }).toBeGreaterThan(1);
      await strip.getByRole("button", { name: "Pausar movimento da faixa" }).click();
      await expect(track).toHaveAttribute("data-paused", "true");
      await expect.poll(state).toBe("paused");
      await strip.getByRole("button", { name: "Retomar movimento da faixa" }).click();
      await page.mouse.move(0, 0);
      await expect.poll(state).toBe("running");
      await strip.getByRole("group", { name: "Faixa de diferenciais" }).hover();
      await expect.poll(state).toBe("paused");
      await page.mouse.move(0, 0);
      await strip.getByRole("group", { name: "Faixa de diferenciais" }).focus();
      await expect.poll(state).toBe("paused");
      await page.keyboard.press("Tab");
      await page.mouse.move(0, 0);
      await expect.poll(state).toBe("running");
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Home overflow ${name}`);
    await strip.screenshot({ path: path.join(output, `${name}-strip.png`) });
    const homeCases = page.locator("section").filter({ has: page.getByRole("link", { name: "Ver portfólio completo", exact: true }) });
    assert.deepEqual(await homeCases.locator("article h3").allTextContents(), ["YUME", "Sabrina Lashes", "Radar da Rima"]);
    for (const img of await homeCases.locator("article img").all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((el) => el.decode());
    }
    await homeCases.evaluate((el) => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: "instant" }));
    await expect.poll(() => homeCases.locator("article").first().evaluate((el) => {
      for (let node = el; node; node = node.parentElement) {
        if (Number(getComputedStyle(node).opacity) < 0.98) return false;
      }
      return true;
    })).toBe(true);
    await expect.poll(() => homeCases.locator("h2").evaluate((el) => [el, ...el.querySelectorAll("span")].every((node) => Number(getComputedStyle(node).opacity) >= 0.98))).toBe(true);
    await page.screenshot({ path: path.join(output, `${name}-home-selection.png`) });
    const homeAxe = await new AxeBuilder({ page }).include("[data-home-projects]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(homeAxe.violations, []);
    const stripAxe = await new AxeBuilder({ page }).include("[data-home-capabilities]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(stripAxe.violations, []);
    console.log(`${name}: strip and three curated home cases passed`);

    await page.goto(`${base}/projetos`, { waitUntil: "load", timeout: 120000 });
    await page.bringToFront();
    await page.getByLabel("Buscar projeto ou objetivo", { exact: true }).waitFor();
    const catalog = page.locator("#projetos-grid");
    await catalog.evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }));
    const cards = catalog.locator("[data-project-card]");
    await expect(cards).toHaveCount(11);
    const slugs = await cards.evaluateAll((items) => items.map((el) => el.dataset.projectCard));
    assert.equal(new Set(slugs).size, 11);
    assert.deepEqual(slugs, ["sabrina-lashes", "radar-da-rima", "yume-moda-disruptiva", "mb-multimarcas-infantil", "sensimilla-records", "orbitamos-portal-tech", "orbicore-gestao", "palladinos-assessoria", "fast-comunicacao-design", "kitcerto", "destaque-multimarcas"]);
    await expect(catalog.locator('[data-project-variant="lead"]')).toHaveCount(1);
    await expect(catalog.locator('[data-project-variant="feature"]')).toHaveCount(2);
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      await card.locator("img").evaluate((img) => img.decode());
      assert.ok(await card.locator("img").evaluate((img) => img.naturalWidth > 0));
    }
    await catalog.evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }));
    await page.screenshot({ path: path.join(output, `${name}-catalog.png`) });
    if (name === "desktop") await catalog.screenshot({ path: path.join(output, "desktop-catalog-full.png") });
    await catalog.locator('[data-project-variant="compact"]').first().evaluate((el) => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 120, behavior: "instant" }));
    await page.screenshot({ path: path.join(output, `${name}-other-projects.png`) });
    const search = page.getByLabel("Buscar projeto ou objetivo", { exact: true });
    if (options.viewport.width < 640) {
      assert.equal(await search.evaluate((el) => getComputedStyle(el).fontSize), "16px");
      assert.equal(await page.getByLabel("Tipo de projeto", { exact: true }).evaluate((el) => getComputedStyle(el).fontSize), "16px");
    }
    await search.fill("comunicacao");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveAttribute("data-project-card", "fast-comunicacao-design");
    assert.equal(await cards.first().getByRole("link", { name: /Repositório/ }).count(), 0, "Private code should not be linked");
    await search.fill("PALLADINOS");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveAttribute("data-project-card", "palladinos-assessoria");
    await page.screenshot({ path: path.join(output, `${name}-search.png`) });
    await search.fill("");
    if (options.viewport.width < 640) {
      await page.getByLabel("Tipo de projeto", { exact: true }).selectOption("landing-pages");
    } else {
      await page.getByRole("button", { name: "Landing Pages", exact: true }).click();
    }
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveAttribute("data-project-card", "fast-comunicacao-design");
    await search.fill("nenhum-projeto-existe-aqui");
    await expect(cards).toHaveCount(0);
    await expect(catalog.getByRole("heading", { name: "Nenhum projeto por aqui ainda." })).toBeVisible();
    await catalog.getByRole("button", { name: "Ver todos os projetos", exact: true }).click();
    await expect(cards).toHaveCount(11);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Catalog overflow ${name}`);
    const catalogAxe = await new AxeBuilder({ page }).include("#projetos-grid").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(catalogAxe.violations, []);
    console.log(`${name}: catalog, images, search, category and empty state passed`);

    for (const [slug, title, live, next] of [["sabrina-lashes", "Sabrina Lashes", "https://salashes-whatsapp-funnel.vercel.app/", "radar-da-rima"], ["radar-da-rima", "Radar da Rima", "https://batalhai.vercel.app/", "yume-moda-disruptiva"], ["yume-moda-disruptiva", "YUME – Moda Disruptiva", "https://yume-atelier.vercel.app/", "mb-multimarcas-infantil"]]) {
      await page.goto(`${base}/projetos/${slug}`, { waitUntil: "load", timeout: 120000 });
      await page.bringToFront();
      if (options.reducedMotion !== "reduce") {
        await expect(page.locator("html")).toHaveAttribute("data-orbita-immersive", "intro");
        await expect(page.locator('[class*="__crossing"]')).toBeHidden();
      }
      const heading = page.getByRole("heading", { name: title, exact: true }).first();
      await expect(heading).toBeVisible();
      await expect.poll(() => heading.evaluate((el) => {
        let node = el;
        while (node) {
          const style = getComputedStyle(node);
          if (Number(style.opacity) < 0.98 || style.visibility === "hidden") return false;
          node = node.parentElement;
        }
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom < innerHeight;
      })).toBe(true);
      await expect(page.getByRole("link", { name: "Explorar projeto", exact: true }).first()).toHaveAttribute("href", live);
      const heroImage = page.locator(`img[alt="Interface real do projeto ${title}"]`).first();
      await heroImage.evaluate((img) => img.decode());
      await expect(page.locator(`a[href="/projetos/${next}"]`)).not.toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(800);
      if (name === "desktop" || name === "iphone") await page.screenshot({ path: path.join(output, `${name}-${slug}.png`) });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Case overflow ${name} ${slug}`);
    }
    assert.deepEqual(errors, []);
    results.push({ name, ticker: true, curatedHome: 3, catalogProjects: 11, commercialOrder: slugs, uniqueProjects: true, images: true, searchAndCategories: true, emptyRecovery: true, primaryCases: 3, nextCaseOrder: true, overflow: false, axeViolations: 0, errors });
    await context.close();
  } catch (error) {
    if (page && !page.isClosed()) await page.screenshot({ path: path.join(output, `${name}-failure.png`), fullPage: true }).catch(() => {});
    await writeFile(path.join(output, "failure.json"), JSON.stringify({ name, error: String(error), errors, results }, null, 2));
    throw error;
  } finally { await browser.close(); }
}
await writeFile(path.join(output, "report.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
