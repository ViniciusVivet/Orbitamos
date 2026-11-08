import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, webkit, devices, expect as baseExpect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const expect = baseExpect.configure({ timeout: 20000 });
const base = process.env.PROJECT_WORLDS_AUDIT_URL || "http://localhost:3015";
const output = path.resolve("test-results/project-worlds");
await mkdir(output, { recursive: true });
const categories = [
  ["todos", "Todos", "Da presença digital ao produto.", 11],
  ["landing-pages", "Landing Pages", "Uma página. Um próximo passo.", 1],
  ["sites-institucionais", "Sites Institucionais", "Seu negócio, bem apresentado."],
  ["sistemas-dashboards", "Plataformas / Sistemas web", "Da operação ao produto digital."],
  ["ecommerce", "E-commerce", "Sua coleção, no seu canal."],
  ["automacoes", "Automações", "Conecte o que hoje é manual.", 0],
];
const profiles = [
  { name: "desktop", type: chromium, viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" },
  { name: "notebook", type: chromium, viewport: { width: 1280, height: 600 }, reducedMotion: "no-preference" },
  { name: "iphone", type: webkit, ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" },
  { name: "tablet", type: chromium, viewport: { width: 820, height: 1180 }, reducedMotion: "no-preference" },
  { name: "compact-reduced", type: chromium, viewport: { width: 320, height: 740 }, reducedMotion: "reduce" },
];
const report = [];
const selectedProfiles = process.env.PROJECT_WORLDS_PROFILES?.split(",");

for (const { name, type, ...options } of profiles.filter(profile => !selectedProfiles || selectedProfiles.includes(profile.name))) {
  const browser = await type.launch({ headless: true });
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  const failedMedia = [];
  const mediaRequests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.url().includes("/project-worlds/") && response.status() >= 400) failedMedia.push(response.url());
  });
  page.on("request", request => { if (request.url().includes("/videos/project-worlds/")) mediaRequests.push(request.url()); });
  const world = page.locator('[data-project-world="scope"]');
  const cards = page.locator("#projetos-grid [data-project-card]");
  const choose = async (id, label) => {
    if (options.viewport.width < 1024) await page.getByLabel("Tipo de projeto", { exact: true }).selectOption(id);
    else await page.getByRole("group", { name: "Filtrar projetos por tipo" }).getByRole("button", { name: label, exact: true }).click();
  };
  try {
    await page.goto(`${base}/projetos`, { waitUntil: "load", timeout: 120000 });
    await page.bringToFront();
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.getByRole("heading", { level: 1 }).evaluate(el => {
      for (let node = el; node; node = node.parentElement) if (Number(getComputedStyle(node).opacity) < .98) return false;
      return true;
    })).toBe(true);
    await expect(cards).toHaveCount(11);
    const initialOrder = await cards.evaluateAll(items => items.map(item => item.dataset.projectCard));
    assert.deepEqual(initialOrder.slice(0, 3), ["sabrina-lashes", "radar-da-rima", "yume-moda-disruptiva"]);
    assert.equal(new Set(initialOrder).size, 11);
    await expect(page.locator("#project-category")).toHaveCount(1);
    const states = [];
    for (const [id, label, title, count] of categories) {
      if (id !== "todos") await choose(id, label);
      await expect(world).toHaveAttribute("data-world-category", id);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      if (count !== undefined) await expect(cards).toHaveCount(count);
      await expect.poll(() => world.locator("[data-world-frame]").count()).toBe(1);
      await expect(world.locator("picture img")).toHaveCount(1);
      await world.locator("picture img").evaluate(img => img.decode());
      assert.ok(await world.locator("picture img").evaluate(img => img.naturalWidth > 0));
      if (options.reducedMotion === "reduce") {
        await expect(world).toHaveAttribute("data-world-motion", "static");
        assert.equal(await world.locator("video").count(), 0);
      } else {
        await expect(world.locator("video")).toHaveCount(1);
        await expect.poll(() => world.locator("video").getAttribute("data-world-video")).not.toBe("loading");
        await expect(world).toHaveAttribute("data-world-resource", options.viewport.width < 768 ? "mobile" : "desktop");
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Overflow ${name}/${id}`);
      const headingGeometry = await page.getByRole("heading", { level: 1 }).evaluate(el => {
        const r = el.getBoundingClientRect();
        let opaque = true;
        for (let node = el; node; node = node.parentElement) if (Number(getComputedStyle(node).opacity) < .98) opaque = false;
        return { top: r.top, bottom: r.bottom, opaque, viewport: innerHeight };
      });
      assert.ok(headingGeometry.opaque && headingGeometry.top >= 64 && headingGeometry.bottom < headingGeometry.viewport, `Heading clipped ${name}/${id}`);
      await page.screenshot({ path: path.join(output, `${name}-${id}.png`) });
      states.push({ category: id, projects: await cards.count(), resource: await world.getAttribute("data-world-resource"), motion: await world.getAttribute("data-world-motion") });
    }
    await expect(page.getByText("Ainda não há um case público de automação nesta seleção.", { exact: true })).toBeVisible();
    if (options.reducedMotion !== "reduce") {
      await page.getByRole("button", { name: "Pausar movimento do cenário", exact: true }).click();
      await expect(world).toHaveAttribute("data-world-motion", "paused");
      await expect.poll(() => world.locator("video").evaluate(video => video.paused)).toBe(true);
      await choose("ecommerce", "E-commerce");
      await expect(world).toHaveAttribute("data-world-motion", "paused");
      await page.getByRole("button", { name: "Retomar movimento do cenário", exact: true }).click();
      await expect(world).toHaveAttribute("data-world-motion", "running");
    }
    await choose("todos", "Todos");
    await expect(cards).toHaveCount(11);
    const search = page.getByLabel("Buscar projeto ou objetivo", { exact: true });
    await search.fill("comunicacao");
    await expect(cards).toHaveCount(1);
    await expect(cards).toHaveAttribute("data-project-card", "fast-comunicacao-design");
    await expect(world).toHaveAttribute("data-world-category", "todos");
    await search.fill("nenhum-projeto-existe-aqui");
    await expect(cards).toHaveCount(0);
    await page.getByRole("button", { name: "Ver todos os projetos", exact: true }).click();
    await expect(cards).toHaveCount(11);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    // Rapid choices must settle at the last selection and never retain multiple videos.
    for (const id of ["ecommerce", "landing-pages", "sistemas-dashboards"]) await choose(id, categories.find(item => item[0] === id)[1]);
    await expect(world).toHaveAttribute("data-world-category", "sistemas-dashboards");
    await expect.poll(() => world.locator("[data-world-frame]").count()).toBe(1);
    assert.ok(await world.locator("video").count() <= 1);
    await expect(page).toHaveURL(/categoria=sistemas-dashboards/);
    await page.goBack();
    await expect(world).toHaveAttribute("data-world-category", "landing-pages");
    await page.goForward();
    await expect(world).toHaveAttribute("data-world-category", "sistemas-dashboards");
    await page.locator("#projetos-grid").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `${name}-catalog-world.png`) });
    const accessibility = await new AxeBuilder({ page }).include('[data-project-world="scope"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(accessibility.violations, []);
    if (options.reducedMotion === "reduce") assert.equal(mediaRequests.length, 0, "Reduced motion must not fetch videos");
    assert.deepEqual(errors, []);
    assert.deepEqual(failedMedia, []);
    report.push({ name, states, noOverflow: true, preservedProjects: 11, pauseAndBack: true, axeViolations: 0, errors, mediaRequests: [...new Set(mediaRequests)] });
    console.log(`${name}: six worlds, category/search/back, media and accessibility passed`);
  } catch (error) {
    await page.screenshot({ path: path.join(output, `${name}-failure.png`), fullPage: true }).catch(() => {});
    await writeFile(path.join(output, "failure.json"), JSON.stringify({ name, error: String(error), errors, failedMedia, report }, null, 2));
    throw error;
  } finally { await context.close(); await browser.close(); }
}

// Explicit data saver and a failed video both retain useful, loaded static scenery.
for (const mode of ["save-data", "video-failure", "legacy-link"]) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  if (mode === "save-data") await context.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true, effectiveType: "4g" }, configurable: true }));
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("request", request => { if (request.url().includes("/videos/project-worlds/")) requests.push(request.url()); });
  if (mode === "video-failure") await page.route("**/videos/project-worlds/**", route => route.abort());
  try {
    if (mode === "legacy-link") {
      await page.goto(`${base}/projetos?case=sabrina-lashes`, { waitUntil: "load", timeout: 120000 });
      const fullCase = page.getByRole("link", { name: "Case completo", exact: true });
      await expect(fullCase).toHaveAttribute("href", "/projetos/sabrina-lashes");
      await page.keyboard.press("ArrowRight");
      await expect(fullCase).toHaveAttribute("href", "/projetos/radar-da-rima");
      await page.keyboard.press("Escape");
      await expect(page.getByRole("button", { name: "Fechar", exact: true })).toHaveCount(0);
      assert.equal(new URL(page.url()).searchParams.has("case"), false);
      assert.deepEqual(errors, [], "Legacy links must not trigger document/SSR hydration errors");
      report.push({ mode, legacyOrder: ["sabrina-lashes", "radar-da-rima"], closeRemovesQuery: true, errors });
      continue;
    }
    await page.goto(`${base}/projetos?categoria=ecommerce`, { waitUntil: "load", timeout: 120000 });
    const world = page.locator('[data-project-world="scope"]');
    await expect(world).toHaveAttribute("data-world-category", "ecommerce");
    await world.locator("picture img").evaluate(img => img.decode());
    if (mode === "save-data") {
      await expect(world).toHaveAttribute("data-world-motion", "static");
      assert.equal(requests.length, 0);
    } else await expect.poll(() => world.locator("video").count()).toBe(0);
    await page.screenshot({ path: path.join(output, `${mode}.png`) });
    report.push({ mode, posterLoaded: true, noVideoRequested: mode === "save-data" });
  } finally { await context.close(); await browser.close(); }
}
await writeFile(path.join(output, "report.json"), JSON.stringify(report, null, 2));
console.log(`Project worlds: ${report.length} profiles/modes passed. Report: ${output}`);
