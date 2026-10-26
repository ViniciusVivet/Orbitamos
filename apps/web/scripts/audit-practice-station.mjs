import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const dir = "test-results/practice-station";
const url = "http://localhost:3015/dev/academy-preview";
const profiles = [
  ["desktop", chromium, { viewport: { width: 1440, height: 1000 } }],
  ["iphone", webkit, devices["iPhone 13"]],
  ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }],
].filter(([name]) => !process.env.STATION_PROFILE || name === process.env.STATION_PROFILE);
if (!profiles.length) throw new Error("STATION_PROFILE deve ser desktop, iphone ou small.");
await mkdir(dir, { recursive: true });

for (const [name, engine, device] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...device, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const report = { completed: false, checks: [], accessibility: [], errors: [] };
  let checkpoint = "hub";
  page.on("pageerror", error => report.errors.push(error.message));
  const station = page.locator("[data-practice-station]");
  async function activate(locator) {
    if (device.hasTouch) await locator.tap();
    else await locator.click();
  }
  async function navigate(locator, activity) {
    await Promise.all([
      page.waitForURL(next => next.pathname === "/dev/academy-preview" && next.searchParams.get("activity") === activity, { timeout: 20000 }),
      activate(locator),
    ]);
  }
  async function capture(label, selector = "[data-practice-station]") {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${label}: overflow`).toBe(true);
    const result = await new AxeBuilder({ page }).include(selector).analyze();
    const violations = result.violations.map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) }));
    report.accessibility.push({ checkpoint: label, violations });
    expect(violations, `${name}/${label}: accessibility`).toEqual([]);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${dir}/${name}-${label}.jpg`, fullPage: true });
    report.checks.push(`${label}: accessibility and layout`);
  }
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await expect(page.getByRole("heading", { name: /Tem mais de um jeito/ })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("link", { name: /Começar: A loja do Orbi/ })).toBeVisible();
    await capture("hub");
    await activate(page.getByRole("button", { name: "Inglês para código", exact: true }));
    await expect(page.getByRole("heading", { name: "Inglês em cena", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Vila dos Blocos", exact: true })).toHaveCount(0);
    await activate(page.getByRole("button", { name: "Explorar tudo", exact: true }));
    await expect(station.locator("h3")).toHaveCount(6);
    report.checks.push("goal filters show the intended activities");

    checkpoint = "hub-to-english";
    const englishCard = station.getByRole("link").filter({ has: page.getByRole("heading", { name: "Inglês em cena", exact: true }) });
    await navigate(englishCard, "english");
    await expect(page.getByRole("button", { name: "Entrar na missão", exact: true })).toBeVisible({ timeout: 20000 });
    await expect(station).toHaveCount(0);
    checkpoint = "english-to-hub";
    await navigate(page.getByRole("link", { name: "Explorar atividades", exact: false }), null);
    await expect(page.getByRole("heading", { name: /Tem mais de um jeito/ })).toBeVisible({ timeout: 20000 });
    await expect(page.locator("[data-code-english]")).toHaveCount(0);
    report.checks.push("same-path query navigation switches hub → English → hub without a reload");

    // This fixture exercises shared review. It does not stand in for a completed-game test.
    await page.evaluate(() => localStorage.setItem("orbitamos-practice-journal-v1-academy-preview", JSON.stringify({ version: 1, activities: { english: { reviews: 0, completedAt: Date.now() - 86400001, dueAt: Date.now() - 1 } } })));
    await page.reload({ waitUntil: "domcontentloaded" });
    checkpoint = "hub-to-review";
    await navigate(page.getByRole("link", { name: "Revisar minhas descobertas", exact: false }), "review");
    await expect(page.getByRole("heading", { name: /Um arquivo foi renomeado/ })).toBeVisible({ timeout: 20000 });
    await expect(station).toHaveCount(0);
    await activate(page.getByRole("button", { name: "Trocar a cor do botão", exact: true }));
    await expect(page.getByRole("button", { name: "Concluir revisão", exact: true })).toHaveCount(0);
    await activate(page.getByRole("button", { name: "Conferir nome e caminho do arquivo", exact: true }));
    await activate(page.getByRole("button", { name: "Concluir revisão", exact: true }));
    await expect(page.getByRole("heading", { name: "Você voltou à ideia.", exact: true })).toBeVisible();
    await capture("review", "[data-practice-review]");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-practice-journal-v1-academy-preview")).activities.english.reviews)).toBe(1);
    checkpoint = "review-to-hub";
    await navigate(page.getByRole("link", { name: "Escolher o próximo passo", exact: false }), null);
    await expect(page.getByRole("heading", { name: /Tem mais de um jeito/ })).toBeVisible({ timeout: 20000 });
    report.checks.push("review requires a correct answer, records the revisit and returns to the hub");
    expect(report.errors).toEqual([]);
    report.completed = true;
    console.log(`${name}: hub, filters, query navigation, review, persistence, accessibility and layout passed`);
  } catch (error) {
    report.failure = { checkpoint, url: page.url(), message: error instanceof Error ? error.message : String(error) };
    console.error(`${name}: failed at ${checkpoint}; current URL: ${page.url()}`);
    await page.screenshot({ path: `${dir}/${name}-failure.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${dir}/${name}.json`, JSON.stringify(report, null, 2));
    await browser.close();
  }
}
