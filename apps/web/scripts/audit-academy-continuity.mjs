import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.ACADEMY_URL || "http://localhost:3015";
const dir = "test-results/academy-continuity";
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 1000 } }], ["iphone", webkit, devices["iPhone 13"]], ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }]].filter(([name]) => !process.env.ACADEMY_PROFILE || name === process.env.ACADEMY_PROFILE);
await mkdir(dir, { recursive: true });
for (const [name, engine, device] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...device, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(240000);
  const report = { completed: false, checks: [], accessibility: [], errors: [] };
  page.on("pageerror", error => report.errors.push(error.message));
  async function check(label, selector) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: horizontal overflow`).toBe(true);
    const result = await new AxeBuilder({ page }).include(selector).analyze();
    const violations = result.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }));
    report.accessibility.push({ label, violations });
    expect(violations).toEqual([]);
    await page.screenshot({ path: `${dir}/${name}-${label}.jpg`, fullPage: true });
  }
  try {
    await page.goto(`${base}/dev/academy-preview?view=home`, { waitUntil: "domcontentloaded" });
    const lead = page.locator("[data-academy-continue]");
    await expect(lead.getByRole("heading", { level: 1, name: "Sua primeira linha de código." })).toBeVisible({ timeout: 180000 });
    await expect(lead.getByRole("link", { name: /Escrever minha primeira linha/ })).toHaveAttribute("href", /\/dev\/ide-preview\/variaveis-js.*academy=1/);
    await check("first-step", "[data-academy-continue]");
    report.checks.push("One clear first step, without invented prior progress.");

    // Account-local learning fixtures in this isolated browser context; not an authenticated session.
    const fixture = await page.evaluate(() => {
      const journal = JSON.stringify({ version: 1, activities: { english: { reviews: 1, completedAt: Date.now() - 20000, reviewedAt: Date.now() - 10000, dueAt: Date.now() + 86400000 } } });
      const draft = JSON.stringify({ version: 1, code: "let nome", mission: 0, line: 0, passed: [], started: true });
      localStorage.setItem("orbitamos-practice-journal-v1-academy-preview", journal);
      localStorage.setItem("orbitamos-guided-v1-academy-preview-variaveis-js", draft);
      localStorage.setItem("orbitamos-academy-resume-v1-academy-preview", JSON.stringify({ href: "/estudante/trilhas/csharp?module=conditions", updatedAt: Date.now() }));
      return { journal, draft };
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(lead.getByRole("heading", { name: "C# · Condições", exact: true })).toBeVisible({ timeout: 180000 });
    await expect(lead.getByRole("link", { name: /Retomar atividade/ })).toHaveAttribute("href", /\/dev\/csharp-preview\?.*module=conditions/);
    report.checks.push("Latest known activity resumes the correct C# module; visit awards no completion.");
    await check("resume", "[data-academy-continue]");

    const resumeLink = lead.getByRole("link", { name: /Retomar atividade/ });
    if (device.hasTouch) await resumeLink.tap(); else await resumeLink.click();
    await expect(page.locator('[data-module-kind="conditions"]')).toBeVisible({ timeout: 180000 });
    const loopsTab = page.getByRole("navigation", { name: "Módulos disponíveis" }).getByRole("button", { name: /Laços/ });
    if (device.hasTouch) await loopsTab.tap(); else await loopsTab.click();
    await expect(page.locator('[data-module-kind="loops"]')).toBeVisible();
    await expect(page).toHaveURL(/module=loops/);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-module-kind="loops"]')).toBeVisible({ timeout: 180000 });
    report.checks.push("C# deep link opens the actual module; module switch and reload retain the correct destination.");

    await page.goto(`${base}/dev/academy-preview?view=progress`, { waitUntil: "domcontentloaded" });
    const evidence = page.locator("[data-academy-evidence]");
    await expect(evidence.getByRole("heading", { name: "O que você está construindo." })).toBeVisible({ timeout: 180000 });
    await expect(evidence.getByText("Visitada · sem etapa validada", { exact: false })).toBeVisible();
    await expect(evidence.getByText(/Atividade finalizada.*1 revisão/)).toBeVisible();
    await expect(evidence.getByText(/Em prática · 0 de.*missões/)).toBeVisible();
    await expect(evidence.getByText("1 / 6", { exact: true })).toBeVisible();
    await expect(evidence.getByText("0 / 3", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("orbitamos-guided-v1-academy-preview-variaveis-js"))).toBe(fixture.draft);
    expect(await page.evaluate(() => localStorage.getItem("orbitamos-practice-journal-v1-academy-preview"))).toBe(fixture.journal);
    report.checks.push("Progress distinguishes visits, attempts, completed experiences and reviews; sources remain unchanged.");
    await check("progress", "[data-academy-evidence]");
    expect(report.errors).toEqual([]);
    report.completed = true;
  } catch (error) {
    report.failure = String(error);
    report.url = page.url();
    await page.screenshot({ path: `${dir}/${name}-failure.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${dir}/${name}.json`, JSON.stringify(report, null, 2));
    await browser.close();
  }
  console.log(`${name}: continuity, source preservation, overflow and accessibility passed.`);
}
