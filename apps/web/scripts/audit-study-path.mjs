import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "test-results/study-path";
await mkdir(output, { recursive: true });
const base = "http://localhost:3015";
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 1000 } }], ["iphone", webkit, devices["iPhone 13"]], ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }]];
for (const [name, engine, options] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  const page = await context.newPage(); page.setDefaultTimeout(60000);
  const report = { completed: false, checks: [], violations: [], errors: [] };
  page.on("pageerror", error => report.errors.push(error.message));
  const tap = locator => options.hasTouch ? locator.tap() : locator.click();
  const home = () => page.goto(`${base}/dev/academy-preview?view=home`, { waitUntil: "domcontentloaded", timeout: 180000 });
  try {
    await home();
    await expect(page.locator("[data-academy-continue] h1")).toHaveText("Sua primeira linha de código.", { timeout: 60000 });
    await page.goto(`${base}/dev/academy-preview?view=tracks`);
    const picker = page.locator("[data-study-path-picker]");
    await tap(picker.getByRole("button", { name: "C# & .NET", exact: false }));
    await expect(picker.getByRole("button", { name: "C# & .NET", exact: false })).toHaveAttribute("aria-pressed", "true");
    await home();
    await expect(page.locator("[data-academy-continue] h1")).toHaveText("Comece sua trilha C# & .NET.");
    await expect(page.locator("[data-academy-continue]").getByRole("link", { name: "Começar minha trilha", exact: false })).toHaveAttribute("href", "/dev/csharp-preview?academy=1");
    await page.goto(`${base}/dev/academy-preview?activity=english`);
    await page.getByRole("button", { name: "Entrar na missão", exact: true }).waitFor();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("orbitamos-academy-resume-v1-academy-preview"))).toContain("ingles-em-cena");
    await home();
    await expect(page.locator("[data-academy-continue] h1")).toHaveText("Comece sua trilha C# & .NET.");
    await expect(page.getByRole("link", { name: "Retomar última atividade: Inglês em cena", exact: false })).toBeVisible();
    await page.reload();
    await expect(page.locator("[data-academy-continue] h1")).toHaveText("Comece sua trilha C# & .NET.");
    const compact = page.locator("[data-study-path-picker]");
    await tap(compact.locator("summary"));
    const accessibility = await new AxeBuilder({ page }).include("[data-study-path-picker]").analyze();
    report.violations = accessibility.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }));
    expect(report.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `${output}/${name}-csharp.jpg`, fullPage: true });
    await tap(compact.getByRole("button", { name: "SQL com Orbi", exact: true }));
    await expect(page.locator("[data-academy-continue] h1")).toHaveText("Comece sua jornada SQL com Orbi.");
    await page.reload();
    await expect(page.locator("[data-academy-continue] h1")).toHaveText("Comece sua jornada SQL com Orbi.");
    await tap(page.locator("[data-study-path-picker] summary"));
    await tap(page.getByRole("button", { name: "Explorar sem uma trilha principal", exact: true }));
    await expect(page.locator("[data-academy-continue] h1")).toHaveText("Inglês em cena");
    report.checks.push("optional choice, track priority survives unrelated visit and reload, recent activity remains secondary, switching/clearing choice preserves activity history");
    const fresh = await browser.newContext(options); const freshPage = await fresh.newPage();
    await freshPage.goto(`${base}/dev/academy-preview?view=home`);
    await expect(freshPage.locator("[data-academy-continue] h1")).toHaveText("Sua primeira linha de código.");
    await fresh.close();
    report.checks.push("a different browser context has no inherited choice");
    expect(report.errors).toEqual([]); report.completed = true;
    console.log(`${name}: chosen formation and exploration continuity passed`);
  } catch (error) { report.failure = String(error); report.url = page.url(); throw error; }
  finally { await writeFile(`${output}/${name}.json`, JSON.stringify(report, null, 2)); await context.close(); await browser.close(); }
}
