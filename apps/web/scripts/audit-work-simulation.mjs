import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Run with the development server already listening; this script never starts a
// server or build. All scenarios run serially. Optional argument: desktop,
// iphone-safari or small-mobile. No simulator completion/runtime state is seeded.
const base = (process.env.WORK_SIMULATION_TEST_URL || process.env.ORBI_TEST_URL || process.env.BASE_URL || "http://localhost:3015").replace(/\/$/, "");
const previewPath = "/dev/work-simulation-preview?from=academy";
const url = base + previewPath;
const homeUrl = base + "/dev/academy-preview?view=home";
const otherUrl = base + "/dev/work-simulation-preview";
const canonicalHref = "/estudante/jogos/simulador";
const output = resolve("test-results/work-simulation");
// Mirrors the published account-key contract; no internal functions run in-page.
const workKey = user => `orbitamos-work-simulation-v1-s-${encodeURIComponent(JSON.stringify(user))}`;
const keys = {
  work: workKey("academy-preview"),
  other: workKey("work-simulation-preview"),
  resume: "orbitamos-academy-resume-v1-academy-preview",
  chapter: "orbitamos-orbi-chapter-v2-academy-preview",
  pulse: "orbitamos-orbi-pulse-v1-academy-preview",
  legacy: "orbitamos-delivery-v1-academy-preview",
  journal: "orbitamos-practice-journal-v1-academy-preview",
  otherLegacy: "orbitamos-orbi-chapter-v2-another-account",
};
const chapterFixture = JSON.stringify({ version: 2, current: "farol", completed: ["ponte", "elevador", "farol"], drafts: { ponte: "const alcance = 280;", elevador: "let altura = 180;", farol: "const custo = 4;\nconst energia = custo + 2;" }, attempts: { ponte: 2, elevador: 1, farol: 3 } });
const fixtures = {
  [keys.chapter]: chapterFixture,
  [keys.pulse]: JSON.stringify({ version: 1, current: "ritmo", completed: ["alcance"], drafts: { alcance: "const alcancePulso = 280;\nconst recarga = 1.4;", ritmo: "const alcancePulso = 280;\nconst recarga = .6;" }, attempts: { alcance: 4, ritmo: 2 } }),
  [keys.legacy]: JSON.stringify({ version: 1, current: 2, completed: ["velocidade", "impulso", "condicao"] }),
  [keys.journal]: JSON.stringify({ version: 1, activities: { delivery: { contentVersion: 2, openedAt: 1000, completedAt: 2000, reviewedAt: 3000, dueAt: 86403000, reviews: 1 } } }),
  [keys.otherLegacy]: chapterFixture,
};
const source = (port, environment = "staging") => JSON.stringify({ environment, ordersBaseUrl: `http://orders:${port}` }, null, 2);
const firstStarter = source(3001);
const retainedDraft = ' {\n  "ordersBaseUrl": "http://orders:3000/",\n  "environment": "staging"\n}\n';
const otherDraft = source(3201);
const profiles = [
  { name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } },
  { name: "iphone-safari", engine: webkit, options: devices["iPhone 13"] },
  { name: "small-mobile", engine: chromium, options: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
].filter(profile => !process.argv[2] || profile.name === process.argv[2]);
assert(profiles.length, "Use desktop, iphone-safari or small-mobile.");
await mkdir(output, { recursive: true });
const reports = [];

for (const profile of profiles) {
  const browser = await profile.engine.launch();
  const context = await browser.newContext({ ...profile.options, reducedMotion: "no-preference" });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  const forbiddenRequests = [];
  const remoteMutations = [];
  const report = {
    profile: profile.name, status: "running", startedAt: new Date().toISOString(), checks: {}, captures: [], errors,
    limitations: ["WebKit/iPhone 13 é emulação; não comprova Safari em iPhone físico.", "XP e saves são conferidos na prévia local; não há validação de conta ou produção remota."],
  };
  reports.push(report);
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => {
    const target = new URL(request.url());
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method()) && target.pathname.startsWith("/rest/v1/")) {
      remoteMutations.push({ method: request.method(), path: target.pathname });
    }
  });
  // A broken parser must fail this audit without reaching a fictitious hostname.
  await context.route(/^https?:\/\/(?:orders(?::\d+)?|outside\.invalid)(?:\/|$)/i, route => {
    forbiddenRequests.push(new URL(route.request().url()).host);
    return route.abort();
  });
  const root = page.locator("[data-work-simulation]");
  const scene = root.getByRole("group", { name: /^Escritório da equipe\./ });
  const destinations = root.getByRole("group", { name: "Destinos no escritório", exact: true });
  const computer = root.locator("[data-work-computer]");
  const chat = root.locator('dialog[aria-labelledby="work-person-title"]');
  const editor = computer.locator("#work-config");
  const testResult = computer.locator("[data-work-test-result]");
  const runButton = computer.locator("[data-work-run-test]");
  const submitButton = computer.locator("[data-work-submit]");
  const readRaw = key => page.evaluate(key => localStorage.getItem(key), key);
  const readSave = async (key = keys.work) => JSON.parse(await readRaw(key) ?? "null");
  const readResume = async () => JSON.parse(await readRaw(keys.resume) ?? "null");
  const goToPage = async target => {
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 180000 });
  };
  const waitOffice = async () => {
    await expect(root).toBeVisible({ timeout: 120000 });
    await expect(scene).toHaveAttribute("aria-busy", "false", { timeout: 120000 });
    await expect(destinations.getByRole("button", { name: "Abrir computador", exact: true })).toBeEnabled();
  };
  const walk = async (name, target, dialog) => {
    const button = destinations.getByRole("button", { name, exact: true });
    await expect(button).toBeEnabled();
    if (profile.options.hasTouch) await button.tap();
    else await button.click();
    // The dialog appears only after the real movement callback reaches the desk.
    await expect(dialog).toBeVisible({ timeout: 20000 });
    await expect(scene).not.toHaveAttribute("data-walking-to", target);
  };
  const openComputer = () => walk("Abrir computador", "computer", computer);
  const panel = async label => {
    await computer.getByRole("navigation", { name: "Áreas do computador" }).getByRole("button", { name: label, exact: true }).click();
  };
  const assertApplied = async port => {
    await panel("Teste");
    await expect(computer.locator('[data-work-panel="test"] p code')).toHaveText(`http://orders:${port}`);
  };
  const assertCompleted = async ids => {
    await expect(root).toHaveAttribute("data-completed", String(ids.length));
    assert.deepEqual((await readSave())?.completed ?? [], ids);
  };
  const applySource = async text => {
    await panel("Arquivo");
    await editor.fill(text);
    await computer.getByRole("button", { name: "Aplicar configuração", exact: true }).click();
    await expect(computer.locator('[data-work-panel="test"]')).toBeVisible();
    await expect(testResult).toHaveCount(0);
  };
  const verify = async passed => {
    await panel("Teste");
    await runButton.click();
    await expect(testResult).toHaveAttribute("data-work-test-result", passed ? "passed" : "failed");
    const testPanel = computer.locator('[data-work-panel="test"]');
    await expect(testPanel).toContainText("200 · abriu");
    await expect(testPanel).toContainText(passed ? "201 · concluído" : "502 · conexão recusada");
    await testResult.locator("summary").click();
    await expect(testResult.locator("pre")).toContainText("Produção: sem alterações.");
  };
  const assertUntouched = async () => {
    const stored = await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), Object.keys(fixtures));
    assert.deepEqual(stored, fixtures, "A simulação não pode reescrever conquistas, journal ou outra conta legada");
    assert.deepEqual(forbiddenRequests, [], "Nenhum endereço editado pode virar requisição externa");
    assert.deepEqual(remoteMutations, [], "A simulação não pode gravar progresso/XP remoto");
  };
  const shot = async (name, scope = "[data-work-simulation]") => {
    const bounds = await page.evaluate(selector => {
      const element = document.querySelector(selector);
      const rect = element?.getBoundingClientRect();
      return { pageOverflow: document.documentElement.scrollWidth - innerWidth, left: rect?.left, right: rect?.right, width: innerWidth };
    }, scope);
    assert(bounds.pageOverflow <= 1, `${profile.name}: overflow horizontal ${bounds.pageOverflow}px em ${name}`);
    assert(bounds.left >= -1 && bounds.right <= bounds.width + 1, `${profile.name}: área essencial sai da viewport em ${name}`);
    const axe = await new AxeBuilder({ page }).include(scope).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(axe.violations.map(issue => ({ id: issue.id, targets: issue.nodes.map(node => node.target) })), [], `${profile.name}: acessibilidade em ${name}`);
    await page.screenshot({ path: `${output}/${profile.name}-${name}-viewport.png`, fullPage: false });
    const captureRoot = await root.isVisible() ? root : page.locator(scope);
    await captureRoot.screenshot({ path: `${output}/${profile.name}-${name}-root.png` });
    if (scope !== "[data-work-simulation]") await page.locator(scope).screenshot({ path: `${output}/${profile.name}-${name}-panel.png` });
    report.captures.push(name);
  };
  try {
    // Seed existing legacy progress once. Reloads never reinstall deleted data,
    // so a persistence regression cannot be hidden by an init script.
    await goToPage(homeUrl);
    await page.evaluate(fixtures => {
      for (const [key, value] of Object.entries(fixtures)) localStorage.setItem(key, value);
    }, fixtures);
    await page.reload({ waitUntil: "domcontentloaded" });
    const xp = page.getByText("XP conquistados", { exact: true }).locator("..");
    await expect(xp).toBeVisible({ timeout: 120000 });
    const xpBefore = await xp.innerText();
    assert.equal(await readRaw(keys.work), null, "A conta começa sem fixture de simulador");
    await goToPage(url);
    await waitOffice();
    await expect(root).toHaveAttribute("data-case", "checkout-staging");
    await expect(root.getByRole("navigation", { name: "Situações do primeiro turno" }).getByRole("button", { name: /Uma nova porta/ })).toBeDisabled();
    await shot("office");

    await walk("Conversar com Nina", "lead", chat);
    await expect(chat).toContainText("Produção está funcionando.");
    await shot("nina", 'dialog[aria-labelledby="work-person-title"][open]');
    await chat.getByRole("button", { name: "Vou investigar", exact: true }).click();
    await expect(chat).not.toBeVisible();
    await openComputer();
    await shot("ticket", "[data-work-computer][open]");
    await panel("Serviços");
    await expect(computer.locator('[data-service="orders"]')).toContainText("orders:3000");
    await shot("services", "[data-work-computer][open]");
    await panel("Logs");
    await expect(computer.getByLabel("Log da conexão", { exact: true })).toContainText("http://orders:3001");
    await expect(computer.getByLabel("Log da conexão", { exact: true })).toContainText("ECONNREFUSED");
    await shot("logs", "[data-work-computer][open]");
    await verify(false);
    await assertCompleted([]);
    await shot("initial-502", "[data-work-computer][open]");
    report.checks.initialHome200Checkout502 = true;

    for (const invalid of [
      { name: "json", text: '{"environment": "staging",', message: /JSON não pôde ser lido/ },
      { name: "production", text: source(3000, "production"), message: /somente homologação/ },
      { name: "external", text: JSON.stringify({ environment: "staging", ordersBaseUrl: "https://outside.invalid:3000" }), message: /Use http:\/\/orders:PORTA/ },
      { name: "extra-key", text: JSON.stringify({ environment: "staging", ordersBaseUrl: "http://orders:3000", command: "apagar teste" }), message: /somente environment e ordersBaseUrl/ },
    ]) {
      await panel("Arquivo");
      await editor.fill(invalid.text);
      await computer.getByRole("button", { name: "Aplicar configuração", exact: true }).click();
      await expect(computer.locator("[data-work-feedback]")).toContainText(invalid.message);
      await assertApplied(3001);
      await assertCompleted([]);
      report.checks[`rejects-${invalid.name}-without-applying`] = true;
    }
    await panel("Arquivo");
    await editor.fill(source(3000));
    await computer.getByRole("button", { name: "Recuperar arquivo inicial", exact: true }).click();
    await computer.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(editor).toHaveValue(source(3000));
    await computer.getByRole("button", { name: "Recuperar arquivo inicial", exact: true }).click();
    await computer.getByRole("button", { name: "Sim, recuperar", exact: true }).click();
    await expect(editor).toHaveValue(firstStarter);
    await computer.getByRole("button", { name: "Desfazer recuperação", exact: true }).click();
    await expect(editor).toHaveValue(source(3000));
    await computer.getByRole("button", { name: "Pedir pista", exact: true }).click();
    await expect(computer.getByText("Orbi explica", { exact: true })).toBeVisible();
    await shot("editor-reset-undo", "[data-work-computer][open]");
    report.checks.resetCancelAndUndoPreserveDraftAndAppliedConfig = true;

    await applySource(source(3200));
    await assertApplied(3200);
    await verify(false);
    await assertCompleted([]);
    report.checks.validWrongPortAppliesAndFails = true;
    // Escape cancels a running test; reopening cannot reveal its delayed result.
    await runButton.click();
    await page.keyboard.press("Escape");
    await expect(computer).not.toBeVisible();
    await page.waitForTimeout(1100);
    await openComputer();
    await assertApplied(3200);
    await expect(testResult).toHaveCount(0);
    await panel("Entrega");
    await expect(submitButton).toBeDisabled();
    await computer.getByRole("button", { name: "Voltar ao escritório", exact: true }).first().click();
    await destinations.getByRole("button", { name: "Conversar com Nina", exact: true }).click();
    await expect(scene).toHaveAttribute("data-walking-to", "lead");
    await root.getByRole("button", { name: "Pausar turno", exact: true }).click();
    await expect(root.getByText("Turno pausado. Seu rascunho está guardado.")).toBeVisible();
    await expect(destinations.getByRole("button", { name: "Abrir computador", exact: true })).toBeDisabled();
    assert.equal(await scene.getAttribute("data-walking-to"), null);
    await page.waitForTimeout(350);
    await expect(chat).not.toBeVisible();
    await shot("paused");
    await root.getByRole("button", { name: "Continuar turno", exact: true }).first().click();
    await root.getByRole("button", { name: "Ativar som do escritório", exact: true }).click();
    await expect(root.getByRole("button", { name: "Silenciar escritório", exact: true })).toBeVisible();
    await root.getByRole("button", { name: "Silenciar escritório", exact: true }).click();
    report.checks.escapeCancelsPendingTestAndPauseDisablesDestinations = true;

    await openComputer();
    await panel("Arquivo");
    await editor.fill(retainedDraft);
    await assertApplied(3200);
    await runButton.click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitOffice();
    await openComputer();
    await assertApplied(3001);
    await expect(testResult).toHaveCount(0);
    await panel("Arquivo");
    await expect(editor).toHaveValue(retainedDraft);
    await assertCompleted([]);
    await shot("reload-draft", "[data-work-computer][open]");
    report.checks.reloadKeepsDraftAndCancelsRuntimeWithoutApplying = true;
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await readResume())?.href).toBe(canonicalHref);
    await goToPage(homeUrl);
    const continuation = page.locator("[data-academy-continue]");
    await expect(continuation).toHaveAttribute("aria-busy", "false", { timeout: 120000 });
    await expect(continuation.getByRole("heading", { name: "Simulador de trabalho", exact: true })).toBeVisible();
    const resumeLink = continuation.getByRole("link", { name: "Retomar atividade", exact: true });
    await expect(resumeLink).toHaveAttribute("href", previewPath);
    assert.equal(await xp.innerText(), xpBefore, "O XP da prévia permanece igual");
    await shot("home-resume", "[data-academy-continue]");
    await resumeLink.click();
    await expect(page).toHaveURL(url);
    await waitOffice();
    await openComputer();
    await panel("Arquivo");
    await expect(editor).toHaveValue(retainedDraft);
    await assertApplied(3001);
    report.checks.homeResumesCanonicalSimulatorWithoutAutoApplying = true;
    await assertUntouched();

    // A second preview identity gets a real edit, not a fabricated save fixture.
    await goToPage(otherUrl);
    await waitOffice();
    await expect(root).toHaveAttribute("data-completed", "0");
    await openComputer();
    await panel("Arquivo");
    await expect(editor).toHaveValue(firstStarter);
    await editor.fill(otherDraft);
    await assertApplied(3001);
    const otherBefore = await readRaw(keys.other);
    await goToPage(url);
    await waitOffice();
    await openComputer();
    await panel("Arquivo");
    await expect(editor).toHaveValue(retainedDraft);
    await assertApplied(3001);
    report.checks.accountsHaveSeparateDraftsAndAppliedSessions = true;

    await applySource(retainedDraft);
    await assertApplied(3000);
    await panel("Entrega");
    await expect(submitButton).toBeDisabled();
    await assertCompleted([]);
    await verify(true);
    await assertCompleted([]);
    await applySource(source(3002));
    await assertApplied(3002);
    await panel("Entrega");
    await expect(submitButton).toBeDisabled();
    await assertCompleted([]);
    report.checks.applyingInvalidatesOldPassingEvidence = true;
    await applySource(retainedDraft);
    await verify(true);
    await computer.getByRole("button", { name: "Preparar entrega para Nina", exact: true }).click();
    await expect(submitButton).toBeEnabled();
    await expect(computer.locator('[data-diff="added"]')).toContainText("http://orders:3000");
    await assertCompleted([]);
    await shot("first-report", "[data-work-computer][open]");
    await submitButton.click();
    await expect(chat).toBeVisible();
    await expect(chat).toContainText("Revisei sua entrega.");
    await assertCompleted(["checkout-staging"]);
    await shot("first-review", 'dialog[aria-labelledby="work-person-title"][open]');
    report.checks.firstCaseRequiresApplyTestAndSend = true;

    await chat.getByRole("button", { name: "Investigar a nova situação", exact: true }).click();
    await expect(root).toHaveAttribute("data-case", "checkout-transfer");
    await openComputer();
    await panel("Serviços");
    await expect(computer.locator('[data-service="orders"]')).toContainText("orders:4100");
    await panel("Logs");
    await expect(computer.getByLabel("Log da conexão", { exact: true })).toContainText("http://orders:3000");
    await verify(false);
    await assertCompleted(["checkout-staging"]);
    await shot("transfer-502", "[data-work-computer][open]");
    await applySource('{"ordersBaseUrl":"HTTP://ORDERS:04100/", "environment":"staging"}');
    await assertApplied(4100);
    await panel("Entrega");
    await expect(submitButton).toBeDisabled();
    await verify(true);
    await computer.getByRole("button", { name: "Preparar entrega para Nina", exact: true }).click();
    await expect(computer.locator('[data-diff="added"]')).toContainText("http://orders:4100");
    await assertCompleted(["checkout-staging"]);
    await shot("transfer-report", "[data-work-computer][open]");
    await submitButton.click();
    await expect(chat).toBeVisible();
    await expect(chat).toContainText("Você encontrou a relação entre o endereço e o serviço.");
    await assertCompleted(["checkout-staging", "checkout-transfer"]);
    const deliveredSave = await readRaw(keys.work);
    await expect(chat.getByRole("link", { name: "Preparar a entrega", exact: true })).toHaveAttribute("href", "#esteira");
    await shot("transfer-review", 'dialog[aria-labelledby="work-person-title"][open]');
    await chat.getByRole("button", { name: "Voltar ao escritório", exact: true }).click();
    await expect(root.getByRole("heading", { name: "A correção está pronta. E a entrega?", exact: true })).toBeVisible();
    await expect(root.getByRole("link", { name: "Continuar: do teste à entrega", exact: true })).toHaveAttribute("href", "#esteira");
    assert.equal(await readRaw(keys.work), deliveredSave, "A ponte para a esteira preserva os dois casos entregues");
    await shot("both-delivered");
    report.checks.transferRequiresNewPortAndItsOwnTestAndReport = true;
    report.checks.deliveryBridgePreservesCompletedCases = true;
    await root.getByRole("link", { name: "Continuar: do teste à entrega", exact: true }).click();
    const deliveryPhase = page.locator("[data-work-delivery]");
    await expect(deliveryPhase).toBeVisible();
    await expect(deliveryPhase.locator("[data-delivery-locked]")).toHaveCount(0);
    await expect(deliveryPhase.getByRole("heading", { name: "Do teste à entrega.", exact: true })).toBeVisible();
    assert.equal(await readRaw(keys.work), deliveredSave, "Abrir a esteira não altera os casos que o aluno acabou de concluir");
    await deliveryPhase.getByRole("link", { name: "Rever os casos de conexão", exact: true }).click();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-completed", "2");
    report.checks.deliveryBridgeNavigatesAndReturnsWithoutChangingCases = true;

    assert.equal(await readRaw(keys.other), otherBefore, "Concluir ambas as missões não muda a segunda conta");
    const completedBefore = await readRaw(keys.work);
    await goToPage(homeUrl);
    await expect(xp).toBeVisible({ timeout: 120000 });
    assert.equal(await xp.innerText(), xpBefore, "Concluir tickets não altera XP da prévia");
    await assertUntouched();
    await goToPage(otherUrl);
    await waitOffice();
    await expect(root).toHaveAttribute("data-completed", "0");
    await openComputer();
    await panel("Arquivo");
    await expect(editor).toHaveValue(otherDraft);
    await assertApplied(3001);
    assert.equal(await readRaw(keys.work), completedBefore, "Visitar outra conta não apaga conquistas da conta original");
    assert.equal(await readRaw(keys.other), otherBefore);
    await assertUntouched();
    assert.deepEqual(errors, [], "O percurso não deve gerar erros de página");
    report.checks.legacyJournalXpAndOtherAccountUnchanged = true;
    report.status = "passed";
    report.finishedAt = new Date().toISOString();
    console.log(`${profile.name}: percurso real, dois tickets, retomada, isolamento e acessibilidade passaram`);
  } catch (error) {
    report.status = "failed";
    report.finishedAt = new Date().toISOString();
    report.failure = String(error);
    report.url = page.url();
    report.snapshot = await root.evaluate(element => ({ ...element.dataset })).catch(() => null);
    report.forbiddenRequests = forbiddenRequests;
    report.remoteMutations = remoteMutations;
    await page.screenshot({ path: `${output}/${profile.name}-failure-viewport.png`, fullPage: false }).catch(() => {});
    await root.screenshot({ path: `${output}/${profile.name}-failure-root.png` }).catch(() => {});
    console.error("WORK SIMULATION FAILURE", JSON.stringify(report, null, 2));
    throw error;
  } finally {
    await writeFile(`${output}/results${process.argv[2] ? "-" + process.argv[2] : ""}.json`, JSON.stringify(reports, null, 2));
    await context.close();
    await browser.close();
  }
}
console.log(JSON.stringify(reports, null, 2));
