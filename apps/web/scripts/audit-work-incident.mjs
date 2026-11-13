import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = (process.env.WORK_INCIDENT_AUDIT_URL || "http://localhost:3015").replace(/\/$/, "");
const url = base + "/dev/work-simulation-preview?from=academy#incidente";
const output = resolve("test-results/work-incident");
const identity = value => `s-${encodeURIComponent(JSON.stringify(value))}`;
const key = (prefix, account = "academy-preview") => `${prefix}-${identity(account)}`;
const incidentKey = key("orbitamos-work-incident-v1");
const otherIncidentKey = key("orbitamos-work-incident-v1", "work-simulation-preview");
const priorSave = JSON.stringify({ version: 1, current: "checkout-transfer", completed: ["checkout-staging", "checkout-transfer"], drafts: { "checkout-staging": "{}", "checkout-transfer": "{}" }, attempts: { "checkout-staging": 2, "checkout-transfer": 1 } });
const deliverySave = JSON.stringify({ version: 1, draft: '{"environment":"staging","checks":["home","checkout"]}', selectedArtifact: "loja-015", attempts: 3, completed: true });
const fixtures = { [key("orbitamos-work-simulation-v1")]: priorSave, [key("orbitamos-work-delivery-v1")]: deliverySave, [key("orbitamos-work-delivery-v1", "work-simulation-preview")]: deliverySave, "orbitamos-practice-journal-v1-academy-preview": '{"version":1,"activities":{}}' };
const source = targetArtifact => JSON.stringify({ environment: "staging", targetArtifact }, null, 2);
const profiles = [{ name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } }, { name: "iphone-safari", engine: webkit, options: devices["iPhone 13"] }, { name: "small-mobile", engine: chromium, options: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } }].filter(item => !process.argv[2] || item.name === process.argv[2]);
assert(profiles.length, "Use desktop, iphone-safari ou small-mobile");
await mkdir(output, { recursive: true });
const reports = [];

for (const profile of profiles) {
  const report = { profile: profile.name, status: "running", checks: {}, captures: [], errors: [], startedAt: new Date().toISOString() };
  reports.push(report);
  const browser = await profile.engine.launch({ headless: true });
  const context = await browser.newContext(profile.options);
  const page = await context.newPage();
  const remoteWrites = [], foreignRequests = [];
  page.on("pageerror", error => report.errors.push(String(error)));
  page.on("request", request => {
    if (/\/rest\/v1\/rpc\//.test(request.url()) || !["GET", "HEAD", "OPTIONS"].includes(request.method()) && /^https?:/.test(request.url()) && !request.url().startsWith(base)) remoteWrites.push(request.url());
  });
  await page.route("**/*", route => {
    const address = route.request().url();
    if (/^https?:/.test(address) && new URL(address).origin !== new URL(base).origin) { foreignRequests.push(address); return route.abort(); }
    return route.continue();
  });
  const root = page.locator("[data-work-incident]"), pc = page.locator("[data-incident-computer]"), chat = page.locator("[data-incident-person]");
  const raw = name => page.evaluate(name => localStorage.getItem(name), name);
  const completed = async expected => assert.deepEqual(JSON.parse(await raw(incidentKey) || "{}").completed || [], expected);
  const panel = async name => { await pc.getByRole("button", { name, exact: true }).click(); };
  const openPC = async () => { await root.getByRole("group", { name: "Destinos no escritório" }).getByRole("button", { name: "Abrir computador", exact: true }).click(); await expect(pc).toBeVisible(); };
  const waitOffice = async () => { await expect(root).toBeVisible({ timeout: 90000 }); await expect(root.getByRole("group", { name: "Destinos no escritório" }).getByRole("button", { name: "Abrir computador", exact: true })).toBeEnabled({ timeout: 90000 }); };
  const fill = async text => { await panel("Plano"); await pc.locator("#work-incident-plan").fill(text); };
  const apply = async target => { await fill(source(target)); await pc.locator("[data-incident-apply]").click(); await expect(pc.locator("[data-incident-installed]")).toHaveText(target); };
  const verify = async state => { await pc.locator("[data-incident-verify]").click(); await expect(pc.locator("[data-incident-verification]")).toHaveAttribute("data-incident-verification", state); };
  const choose = async value => { await pc.locator(`input[name="incident-reason"][value="${value}"]`).check(); };
  const shot = async (name, scope = "[data-work-incident]", axe = true) => {
    const geometry = await page.locator(scope).evaluate(el => ({ left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right, width: innerWidth, overflow: document.documentElement.scrollWidth - innerWidth }));
    assert(geometry.left >= -1 && geometry.right <= geometry.width + 1 && geometry.overflow <= 1, `${profile.name}: overflow in ${name}`);
    if (axe) { const result = await new AxeBuilder({ page }).include(scope).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); assert.deepEqual(result.violations.map(v => v.id), [], `${profile.name}: Axe ${name}`); }
    await page.screenshot({ path: `${output}/${profile.name}-${name}.png` });
    report.captures.push(name);
  };
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await expect(root.locator("[data-incident-locked]")).toBeVisible({ timeout: 90000 });
    await shot("locked"); report.checks.prerequisiteGuard = true;
    // Seed only prior chapters, once. All incident edits and achievements use UI.
    await page.evaluate(values => { for (const [name, value] of Object.entries(values)) localStorage.setItem(name, value); }, fixtures);
    await page.reload(); await waitOffice();
    await expect(root.getByRole("button", { name: /Recuperar outra instalação/ })).toBeDisabled();
    await shot("office"); await openPC();
    await panel("Sinais"); await expect(pc).toContainText("7/10 erros"); await expect(pc).toContainText("loja-020"); await shot("history", "[data-incident-computer]");
    for (const text of ["{", '{"environment":"production","targetArtifact":"loja-020"}', '{"environment":"staging","targetArtifact":"http://example.invalid"}', source("loja-031"), '{"environment":"staging","targetArtifact":"loja-020","command":"run"}']) {
      await fill(text); await pc.locator("[data-incident-apply]").click(); await expect(pc.locator("[data-incident-feedback]")).toBeVisible();
      await panel("Conferência"); await expect(pc.locator("[data-incident-installed]")).toHaveText("loja-021"); await expect(pc.locator("[data-incident-verify]")).toBeDisabled();
    }
    report.checks.invalidPlanPreservesInstallation = true;
    await apply("loja-019"); await verify("failed"); await expect(pc.locator("[data-incident-submit]")).toBeDisabled(); await shot("old-faulty-version", "[data-incident-computer]");
    report.checks.validOldVersionCanFail = true;
    await fill(source("loja-020"));
    await pc.getByRole("button", { name: "Recuperar arquivo inicial", exact: true }).click(); await pc.getByRole("button", { name: "Cancelar", exact: true }).click(); await expect(pc.locator("#work-incident-plan")).toHaveValue(source("loja-020"));
    await pc.getByRole("button", { name: "Recuperar arquivo inicial", exact: true }).click(); await pc.getByRole("button", { name: "Sim, recuperar", exact: true }).click(); await expect(pc.locator("#work-incident-plan")).toHaveValue(source("loja-021"));
    await pc.getByRole("button", { name: "Desfazer recuperação", exact: true }).click(); await expect(pc.locator("#work-incident-plan")).toHaveValue(source("loja-020"));
    report.checks.resetCancelAndUndo = true;
    await pc.locator("[data-incident-apply]").click(); await page.keyboard.press("Escape"); await expect(pc).not.toBeVisible(); await page.waitForTimeout(900); await openPC(); await panel("Conferência"); await expect(pc.locator("[data-incident-installed]")).toHaveText("loja-019");
    report.checks.escapeCancelsRecovery = true;
    await apply("loja-020"); await completed([]); await expect(pc.locator("[data-incident-submit]")).toBeDisabled();
    await pc.locator("[data-incident-verify]").click(); await page.keyboard.press("Escape"); await page.waitForTimeout(900); await openPC(); await panel("Conferência"); await expect(pc.locator("[data-incident-verification]")).toHaveCount(0);
    report.checks.escapeCancelsVerification = true;
    await verify("passed"); await choose("home-opened"); await pc.locator("[data-incident-submit]").click(); await expect(pc.locator("[data-incident-feedback]")).toContainText("Escolha a evidência"); await completed([]);
    await choose("highest-version"); await pc.locator("[data-incident-submit]").click(); await completed([]);
    report.checks.reasonRequiresVerifiedOrders = true;
    // A draft does not change the installed snapshot or its valid evidence.
    await fill(source("loja-021")); await panel("Conferência"); await expect(pc.locator("[data-incident-installed]")).toHaveText("loja-020"); await expect(pc.locator("[data-incident-verification]")).toHaveAttribute("data-incident-verification", "passed");
    await choose("verified-orders"); await shot("verified-recovery", "[data-incident-computer]"); await pc.locator("[data-incident-submit]").click(); await expect(chat).toBeVisible(); await completed(["release-regression"]);
    report.checks.draftDoesNotInstallOrEraseCurrentEvidence = true;
    await chat.getByRole("button", { name: "Investigar outra instalação", exact: true }).click(); await waitOffice(); await expect(root).toHaveAttribute("data-case", "independent-recovery");
    await page.goto(base + "/dev/academy-preview?view=home", { waitUntil: "domcontentloaded" });
    const continuation = page.locator("[data-academy-continue]");
    await expect(continuation).toContainText("Quando a versão falha");
    const resume = continuation.getByRole("link", { name: "Retomar atividade", exact: true });
    await expect(resume).toHaveAttribute("href", "/dev/work-simulation-preview?from=academy#incidente");
    await resume.click(); await waitOffice(); await expect(root).toHaveAttribute("data-case", "independent-recovery");
    report.checks.homeResumesExactIncident = true;
    await openPC();
    await fill(source("loja-020")); await pc.locator("[data-incident-apply]").click(); await expect(pc.locator("[data-incident-feedback]")).toContainText("histórico deste caso");
    await apply("loja-031"); await verify("passed"); await choose("verified-orders"); await pc.locator("[data-incident-submit]").click(); await expect(chat).toBeVisible(); await completed(["release-regression", "independent-recovery"]); await shot("both-recovered", "[data-incident-person]");
    report.checks.independentCaseRequiresDifferentVersion = true;
    await page.reload(); await waitOffice(); await openPC(); await panel("Conferência"); await expect(pc.locator("[data-incident-installed]")).toHaveText("loja-032"); await expect(pc.locator("[data-incident-verification]")).toHaveCount(0); await expect(pc.locator("[data-incident-verify]")).toBeDisabled();
    await panel("Plano"); await expect(pc.locator("#work-incident-plan")).toHaveValue(source("loja-031"));
    report.checks.reloadRestoresHistoryAndDraftOnly = true;
    await page.goto(base + "/dev/academy-preview?view=home", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-academy-continue]").getByRole("link", { name: "Dar o próximo passo", exact: true })).toHaveAttribute("href", "/dev/lab-preview?academy=1");
    report.checks.completedIncidentSuggestsLaboratory = true;
    const mainBefore = await raw(incidentKey);
    await page.goto(base + "/dev/work-simulation-preview#incidente", { waitUntil: "domcontentloaded" }); await waitOffice(); await expect(root).toHaveAttribute("data-completed", "0"); await openPC(); await fill(source("loja-019")); assert.notEqual(await raw(otherIncidentKey), mainBefore); assert.equal(await raw(incidentKey), mainBefore);
    const protectedValues = await page.evaluate(names => Object.fromEntries(names.map(name => [name, localStorage.getItem(name)])), Object.keys(fixtures));
    assert.deepEqual(protectedValues, fixtures); assert.deepEqual(remoteWrites, []); assert.deepEqual(foreignRequests, []); assert.deepEqual(report.errors, []);
    report.checks.accountsLegacySavesAndNetworkPreserved = true;
    report.status = "passed";
  } catch (error) {
    report.status = "failed"; report.failure = String(error); report.url = page.url(); await page.screenshot({ path: `${output}/${profile.name}-failure.png` }).catch(() => {}); throw error;
  } finally {
    report.finishedAt = new Date().toISOString(); await writeFile(`${output}/results-${profile.name}.json`, JSON.stringify(report, null, 2)); await context.close(); await browser.close(); console.log(JSON.stringify(report, null, 2));
  }
}
