import { chromium, webkit, devices, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const dir = "test-results/sql-resume";
await mkdir(dir, { recursive: true });
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 1000 } }], ["iphone", webkit, devices["iPhone 13"]], ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }]];
for (const [name, engine, device] of profiles.filter(([name]) => !process.env.SQL_PROFILE || name === process.env.SQL_PROFILE)) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...device, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const report = { completed: false, checks: [], errors: [] };
  page.on("pageerror", error => report.errors.push(error.message));
  const workshop = () => page.locator("[data-sql-studio]:not([data-sql-quest])");
  const quest = () => page.locator("[data-sql-quest]");
  const questKey = "orbitamos-sql-quest-v1-academy-preview";
  const draftKey = "orbitamos-sql-v1-academy-preview";
  const otherKey = "orbitamos-sql-v1-another-account";
  const resumeKey = "orbitamos-academy-resume-v1-academy-preview";
  const stored = key => page.evaluate(value => localStorage.getItem(value), key);
  const assertMode = mode => expect.poll(() => page.evaluate(() => new URLSearchParams(location.search).get("mode"))).toBe(mode);
  async function preserveContext() {
    const target = new URL(page.url());
    expect(target.searchParams.get("activity")).toBe("sql");
    expect(target.searchParams.get("source")).toBe("journey");
    expect(target.hash).toBe("#my-progress");
    expect(await stored(otherKey)).toBe("another account stays untouched");
  }
  try {
    await page.goto("http://localhost:3015/dev/academy-preview?view=home", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.locator("[data-academy-continue]").waitFor();
    const questFixture = JSON.stringify({ version: 1, step: 3, drafts: Array.from({ length: 10 }, (_, index) => index === 3 ? "FROM produ" : ""), hints: Array(10).fill(false) });
    await page.evaluate(({ questKey, questFixture, otherKey }) => { localStorage.setItem(questKey, questFixture); localStorage.setItem(otherKey, "another account stays untouched"); }, { questKey, questFixture, otherKey });
    await page.goto("http://localhost:3015/dev/academy-preview?activity=sql&source=journey#my-progress", { waitUntil: "domcontentloaded", timeout: 120000 });
    await quest().waitFor();
    await page.getByLabel("Opções da aventura", { exact: true }).click();
    await page.getByRole("button", { name: "Abrir oficina de criação", exact: true }).click();
    await workshop().waitFor();
    await assertMode("workshop");
    await preserveContext();
    await expect.poll(async () => JSON.parse(await stored(resumeKey) || "null")?.href).toBe("/estudante/trilhas/sql?mode=workshop");
    await page.getByRole("button", { name: "Construir com o Orbi", exact: false }).click();
    const firstLine = page.getByRole("textbox", { name: "SQL linha 1", exact: true });
    await firstLine.fill("CREATE TABLE produtos (");
    await expect.poll(() => stored(draftKey)).toContain("CREATE TABLE produtos (");
    const rawDraft = await stored(draftKey);
    expect(rawDraft).toContain("CREATE TABLE produtos (");
    expect(await stored(questKey)).toBe(questFixture);
    report.checks.push("switching from adventure persists mode, unrelated query/hash, account scope and canonical resume target");

    await page.reload();
    await workshop().waitFor();
    await assertMode("workshop");
    await preserveContext();
    await page.getByRole("button", { name: "Retomar minha construção", exact: false }).waitFor();
    expect(await stored(draftKey)).toBe(rawDraft);
    expect(await stored(questKey)).toBe(questFixture);

    await page.goBack();
    await quest().waitFor();
    await assertMode(null);
    await preserveContext();
    await page.goForward();
    await workshop().waitFor();
    await assertMode("workshop");
    await preserveContext();
    expect(await stored(draftKey)).toBe(rawDraft);
    report.checks.push("reload and browser back/forward restore the correct area without rewriting adventure or workshop drafts");

    await page.getByRole("button", { name: "Voltar à aventura com o Orbi", exact: false }).click();
    await quest().waitFor();
    await assertMode(null);
    await preserveContext();
    await expect.poll(async () => JSON.parse(await stored(resumeKey) || "null")?.href).toBe("/estudante/trilhas/sql");
    await page.goBack();
    await workshop().waitFor();
    await assertMode("workshop");
    await expect.poll(async () => JSON.parse(await stored(resumeKey) || "null")?.href).toBe("/estudante/trilhas/sql?mode=workshop");
    await page.screenshot({ path: `${dir}/${name}-restored.jpg`, fullPage: true });
    await page.getByRole("button", { name: "Retomar minha construção", exact: false }).click();
    await expect(firstLine).toHaveValue("CREATE TABLE produtos (");
    expect(await stored(questKey)).toBe(questFixture);
    report.checks.push("explicit return creates a navigable history entry; going back restores workshop and its edited code");

    await page.goto("http://localhost:3015/dev/sql-preview?mode=workshop&source=direct#my-progress", { waitUntil: "domcontentloaded", timeout: 120000 });
    await workshop().waitFor();
    await assertMode("workshop");
    await expect(quest()).toHaveCount(0);
    report.checks.push("direct mode=workshop opens the standalone SQL preview without entering the adventure first");
    expect(report.errors).toEqual([]);
    report.completed = true;
    console.log(`${name}: SQL mode, history, reload, drafts, account isolation and resume tracker passed`);
  } catch (error) { report.failure = String(error); report.url = page.url(); await page.screenshot({ path: `${dir}/${name}-failure.jpg`, fullPage: true }).catch(() => {}); throw error; }
  finally { await writeFile(`${dir}/${name}.json`, JSON.stringify(report, null, 2)); await context.close(); await browser.close(); }
}
