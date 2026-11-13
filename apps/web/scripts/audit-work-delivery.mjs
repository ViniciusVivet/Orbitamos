import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Use an already-running development server. Profiles and scenarios run serially.
// Optional argument: desktop, iphone-safari or small-mobile. Only existing first-
// shift prerequisites and unrelated legacy saves are fixtures; every delivery
// draft, selection, attempt, publication and completion is produced through UI.
const base = (process.env.WORK_DELIVERY_TEST_URL || process.env.WORK_SIMULATION_TEST_URL || process.env.ORBI_TEST_URL || process.env.BASE_URL || "http://localhost:3015").replace(/\/$/, "");
const origin = new URL(base).origin;
const previewPath = "/dev/work-simulation-preview?from=academy#esteira";
const url = base + previewPath;
const otherUrl = base + "/dev/work-simulation-preview#esteira";
const homeUrl = base + "/dev/academy-preview?view=home";
const canonicalHref = "/estudante/jogos/simulador#esteira";
const output = resolve("test-results/work-delivery");
const accountKey = (prefix, user) => `${prefix}-s-${encodeURIComponent(JSON.stringify(user))}`;
const keys = {
  work: accountKey("orbitamos-work-simulation-v1", "academy-preview"),
  otherWork: accountKey("orbitamos-work-simulation-v1", "work-simulation-preview"),
  delivery: accountKey("orbitamos-work-delivery-v1", "academy-preview"),
  otherDelivery: accountKey("orbitamos-work-delivery-v1", "work-simulation-preview"),
  resume: "orbitamos-academy-resume-v1-academy-preview",
  chapter: "orbitamos-orbi-chapter-v2-academy-preview",
  pulse: "orbitamos-orbi-pulse-v1-academy-preview",
  legacy: "orbitamos-delivery-v1-academy-preview",
  journal: "orbitamos-practice-journal-v1-academy-preview",
  otherLegacy: "orbitamos-orbi-chapter-v2-another-account",
};
const workSource = port => JSON.stringify({ environment: "staging", ordersBaseUrl: `http://orders:${port}` }, null, 2);
const prerequisite = JSON.stringify({
  version: 1, current: "checkout-transfer", completed: ["checkout-staging", "checkout-transfer"],
  drafts: { "checkout-staging": workSource(3000), "checkout-transfer": workSource(4100) },
  attempts: { "checkout-staging": 3, "checkout-transfer": 2 },
});
const chapterFixture = JSON.stringify({ version: 2, current: "farol", completed: ["ponte", "elevador", "farol"], drafts: { ponte: "const alcance = 280;", elevador: "let altura = 180;", farol: "const custo = 4;\nconst energia = custo + 2;" }, attempts: { ponte: 2, elevador: 1, farol: 3 } });
const legacyFixtures = {
  [keys.chapter]: chapterFixture,
  [keys.pulse]: JSON.stringify({ version: 1, current: "ritmo", completed: ["alcance"], drafts: { alcance: "const alcancePulso = 280;\nconst recarga = 1.4;", ritmo: "const alcancePulso = 280;\nconst recarga = .6;" }, attempts: { alcance: 4, ritmo: 2 } }),
  [keys.legacy]: JSON.stringify({ version: 1, current: 2, completed: ["velocidade", "impulso", "condicao"] }),
  [keys.journal]: JSON.stringify({ version: 1, activities: { delivery: { contentVersion: 2, openedAt: 1000, completedAt: 2000, reviewedAt: 3000, dueAt: 86403000, reviews: 1 } } }),
  [keys.otherLegacy]: chapterFixture,
};
const protectedFixtures = { ...legacyFixtures, [keys.work]: prerequisite, [keys.otherWork]: prerequisite };
const smokeSource = (checks = ["home"], environment = "staging") => JSON.stringify({ environment, checks }, null, 2);
const starter = '{\n  "environment": "staging",\n  "checks": ["home"]\n}';
const bothChecks = smokeSource(["home", "checkout"]);
const retainedDraft = ' {\n  "checks": ["checkout", "home"],\n  "environment": "staging"\n}\n';
const otherDraft = smokeSource(["checkout"]);
const saveFields = ["attempts", "completed", "draft", "selectedArtifact", "version"];
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
  // Abort unexpected calls as well as recording them: a failed audit cannot
  // mutate a remote account or send learner text to an external hostname.
  await context.route(/^https?:\/\//, route => {
    const request = route.request();
    const target = new URL(request.url());
    const isRpc = target.pathname.startsWith("/rest/v1/rpc/");
    const isRestMutation = !["GET", "HEAD", "OPTIONS"].includes(request.method()) && target.pathname.startsWith("/rest/v1/");
    if (isRpc || isRestMutation) {
      remoteMutations.push({ method: request.method(), host: target.host, path: target.pathname });
      return route.abort();
    }
    if (target.origin !== origin) {
      forbiddenRequests.push({ method: request.method(), host: target.host, path: target.pathname });
      return route.abort();
    }
    return route.continue();
  });

  const root = page.locator("[data-work-delivery]");
  const scene = root.getByRole("group", { name: /^Escritório da equipe\./ });
  const destinations = root.getByRole("group", { name: "Destinos no escritório", exact: true });
  const computer = root.locator("[data-delivery-computer]");
  const person = root.locator("[data-delivery-person]");
  const editor = computer.locator("#work-smoke-config");
  const pipeline = computer.locator("[data-delivery-pipeline]");
  const deployment = computer.locator("[data-delivery-deployment]");
  const validation = computer.locator("[data-delivery-verification]");
  const feedback = computer.locator("[data-delivery-feedback]");
  const runButton = computer.locator("[data-delivery-run]");
  const publishButton = computer.locator("[data-delivery-publish]");
  const verifyButton = computer.locator("[data-delivery-verify]");
  const submitButton = computer.locator("[data-delivery-submit]");
  const readRaw = key => page.evaluate(key => localStorage.getItem(key), key);
  const readSave = async (key = keys.delivery) => JSON.parse(await readRaw(key) ?? "null");
  const readResume = async () => JSON.parse(await readRaw(keys.resume) ?? "null");
  const goToPage = async target => { await page.goto(target, { waitUntil: "domcontentloaded", timeout: 180000 }); };
  const waitOffice = async () => {
    await expect(root).toBeVisible({ timeout: 120000 });
    await expect(scene).toHaveAttribute("aria-busy", "false", { timeout: 120000 });
    await expect(destinations.getByRole("button", { name: "Abrir computador", exact: true })).toBeEnabled();
  };
  const walk = async (name, target, dialog) => {
    const button = destinations.getByRole("button", { name, exact: true });
    await expect(button).toBeEnabled();
    if (profile.options.hasTouch) await button.tap(); else await button.click();
    await expect(dialog).toBeVisible({ timeout: 20000 });
    await expect(scene).not.toHaveAttribute("data-walking-to", target);
  };
  const openComputer = () => walk("Abrir computador", "computer", computer);
  const closeComputer = async () => {
    await computer.getByRole("button", { name: "Voltar ao escritório", exact: true }).first().click();
    await expect(computer).not.toBeVisible();
  };
  const panel = async label => {
    await computer.getByRole("navigation").getByRole("button", { name: label, exact: true }).click();
  };
  const selectArtifact = async artifactId => {
    await panel("Esteira");
    await computer.locator(`input[name="work-artifact"][value="${artifactId}"]`).check();
  };
  const assertCheckpointOnly = async (key = keys.delivery) => {
    const save = await readSave(key);
    if (save) {
      assert.deepEqual(Object.keys(save).sort(), saveFields, "O save guarda apenas rascunho, seleção e histórico; nenhum estado ativo da esteira");
      assert.equal(save.version, 1);
    }
    return save;
  };
  const assertCompleted = async value => {
    assert.equal((await readSave())?.completed ?? false, value, "Somente enviar evidências atuais para Nina conclui a missão");
    await assertCheckpointOnly();
  };
  const editSource = async text => {
    await panel("Arquivo");
    await editor.fill(text);
  };
  const run = async ({ passed, covered, checkout = null }) => {
    await panel("Esteira");
    await runButton.click();
    await expect(pipeline).toBeVisible();
    await expect(pipeline).toHaveAttribute("data-passed", String(passed));
    await expect(pipeline).toHaveAttribute("data-covered", String(covered));
    await expect(pipeline).toContainText("GET / → 200");
    if (checkout === null) {
      await expect(pipeline).not.toContainText(/POST \/checkout → (201|502)/);
      await expect(pipeline).toContainText(/cobertura incompleta/i);
    } else await expect(pipeline).toContainText(`POST /checkout → ${checkout}`);
    await expect(pipeline).toContainText("Produção: sem alterações.");
  };
  const assertPublishingBlocked = async () => {
    await panel("Publicação");
    const installedBefore = await computer.locator("[data-delivery-installed]").innerText();
    if (await publishButton.isEnabled()) {
      await publishButton.click();
      await expect(feedback).toContainText(/Publicação bloqueada/i);
    } else await expect(publishButton).toBeDisabled();
    await expect(computer.locator("[data-delivery-installed]")).toHaveText(installedBefore);
    await expect(submitButton).toBeDisabled();
    await assertCompleted(false);
  };
  const assertVerificationBlocked = async () => {
    await panel("Publicação");
    if (await verifyButton.isEnabled()) {
      await verifyButton.click();
      await expect(validation).toBeVisible();
      await expect(validation).toHaveAttribute("data-delivery-verification", "failed");
      await expect(validation).toContainText("503");
    } else await expect(verifyButton).toBeDisabled();
    await expect(submitButton).toBeDisabled();
    await assertCompleted(false);
  };
  const publish = async () => {
    await panel("Publicação");
    await expect(publishButton).toBeEnabled();
    await publishButton.click();
    await expect(deployment).toHaveAttribute("data-delivery-deployment", "loja-015");
    await expect(deployment).toContainText("loja-015");
    await expect(deployment).toContainText(/homologa[çc][aã]o/i);
    await expect(submitButton).toBeDisabled();
    await assertCompleted(false);
  };
  const assertNoRuntime = async () => {
    await panel("Esteira");
    await expect(pipeline).toHaveCount(0);
    await panel("Publicação");
    await expect(deployment).toHaveAttribute("data-delivery-deployment", "initial");
    await expect(computer.locator("[data-delivery-installed]")).toHaveText("loja-014");
    await expect(validation).toHaveCount(0);
    await expect(submitButton).toBeDisabled();
    await assertCheckpointOnly();
  };
  const assertUntouched = async () => {
    const stored = await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), Object.keys(protectedFixtures));
    assert.deepEqual(stored, protectedFixtures, "A esteira não pode reescrever os tickets anteriores, conquistas, journal ou outra conta legada");
    assert.deepEqual(forbiddenRequests, [], "Nenhuma ação ou texto do aluno pode virar requisição externa");
    assert.deepEqual(remoteMutations, [], "A esteira não pode chamar RPC ou gravar progresso/XP remoto");
  };
  const shot = async (name, scope = "[data-work-delivery]") => {
    const bounds = await page.evaluate(selector => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return { pageOverflow: document.documentElement.scrollWidth - innerWidth, left: rect?.left, right: rect?.right, width: innerWidth };
    }, scope);
    assert(bounds.pageOverflow <= 1, `${profile.name}: overflow horizontal ${bounds.pageOverflow}px em ${name}`);
    assert(bounds.left >= -1 && bounds.right <= bounds.width + 1, `${profile.name}: área essencial sai da viewport em ${name}`);
    const axe = await new AxeBuilder({ page }).include(scope).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(axe.violations.map(issue => ({ id: issue.id, targets: issue.nodes.map(node => node.target) })), [], `${profile.name}: acessibilidade em ${name}`);
    await page.screenshot({ path: `${output}/${profile.name}-${name}-viewport.png`, fullPage: false });
    const captureRoot = await root.isVisible() ? root : page.locator(scope);
    await captureRoot.screenshot({ path: `${output}/${profile.name}-${name}-root.png` });
    if (scope !== "[data-work-delivery]") await page.locator(scope).screenshot({ path: `${output}/${profile.name}-${name}-panel.png` });
    report.captures.push(name);
  };

  try {
    // Fixtures are installed once, never in addInitScript: reloads cannot hide
    // lost progress by silently restoring a fixture or manufacturing runtime.
    await goToPage(homeUrl);
    await page.evaluate(fixtures => {
      for (const [key, value] of Object.entries(fixtures)) localStorage.setItem(key, value);
    }, legacyFixtures);
    await page.reload({ waitUntil: "domcontentloaded" });
    const xp = page.getByText("XP conquistados", { exact: true }).locator("..");
    await expect(xp).toBeVisible({ timeout: 120000 });
    const xpBefore = await xp.innerText();
    assert.equal(await readRaw(keys.delivery), null);

    await goToPage(url);
    await expect(root.locator("[data-delivery-locked]")).toBeVisible({ timeout: 120000 });
    await expect(destinations.getByRole("button", { name: "Abrir computador", exact: true })).toBeDisabled();
    await expect(page.locator("#work-smoke-config")).toHaveCount(0);
    await expect(page.locator("[data-delivery-run]")).toHaveCount(0);
    assert.equal(await readRaw(keys.delivery), null, "Sem pré-requisitos não há save ou runtime da nova fase");
    await shot("entry-locked");
    report.checks.missingPrerequisitesCannotEnterDelivery = true;

    await page.evaluate(({ work, otherWork, prerequisite }) => {
      localStorage.setItem(work, prerequisite);
      localStorage.setItem(otherWork, prerequisite);
    }, { work: keys.work, otherWork: keys.otherWork, prerequisite });
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitOffice();
    await assertCompleted(false);
    await shot("office");
    await walk("Conversar com Nina", "lead", person);
    await expect(person).toContainText("Nina");
    await shot("nina", "[data-delivery-person][open]");
    await page.keyboard.press("Escape");
    await expect(person).not.toBeVisible();
    await openComputer();
    await shot("ticket", "[data-delivery-computer][open]");
    await selectArtifact("loja-014");
    await run({ passed: true, covered: false });
    await assertCompleted(false);
    await shot("green-home-incomplete-coverage", "[data-delivery-computer][open]");
    await assertPublishingBlocked();
    report.checks.greenHomeOnlyDoesNotAuthorizePublishingOrCompletion = true;

    for (const invalid of [
      { name: "json", text: '{"environment": "staging",', message: /JSON não pôde ser lido/ },
      { name: "production", text: smokeSource(["home", "checkout"], "production"), message: /somente em homologação/ },
      { name: "extra-key", text: JSON.stringify({ environment: "staging", checks: ["home", "checkout"], command: "apagar teste" }), message: /somente environment e checks/ },
      { name: "external-check", text: smokeSource(["home", "https://outside.invalid/checkout"]), message: /Use apenas "home" e "checkout"/ },
    ]) {
      const attempts = (await readSave()).attempts;
      await panel("Arquivo");
      await editor.fill(invalid.text);
      await runButton.click();
      await expect(feedback).toContainText(invalid.message);
      await expect(computer.locator('[data-delivery-panel="config"]')).toBeVisible();
      assert.equal((await readSave()).attempts, attempts, "JSON recusado não inicia uma execução");
      await panel("Esteira");
      await expect(pipeline).toHaveCount(0);
      await assertPublishingBlocked();
      await assertCompleted(false);
      report.checks[`rejects-${invalid.name}-without-running-or-publishing`] = true;
    }
    await panel("Arquivo");
    await editor.fill(bothChecks);
    await computer.getByRole("button", { name: "Recuperar arquivo inicial", exact: true }).click();
    await computer.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(editor).toHaveValue(bothChecks);
    await computer.getByRole("button", { name: "Recuperar arquivo inicial", exact: true }).click();
    await computer.getByRole("button", { name: "Sim, recuperar", exact: true }).click();
    await expect(editor).toHaveValue(starter);
    await computer.getByRole("button", { name: "Desfazer recuperação", exact: true }).click();
    await expect(editor).toHaveValue(bothChecks);
    await shot("editor-reset-undo", "[data-delivery-computer][open]");
    report.checks.resetCancelAndUndoPreserveDraft = true;

    await editSource(bothChecks);
    await run({ passed: false, covered: true, checkout: 502 });
    await assertPublishingBlocked();
    await shot("014-checkout-502", "[data-delivery-computer][open]");
    report.checks.completeCoverageFindsThe014CheckoutFailure = true;

    // Escape cancels the actual in-flight timer. Reopening cannot reveal a
    // result from a callback belonging to a closed computer.
    await panel("Esteira");
    await runButton.click();
    await page.keyboard.press("Escape");
    await expect(computer).not.toBeVisible();
    await page.waitForTimeout(1200);
    await openComputer();
    await panel("Esteira");
    await expect(pipeline).toHaveCount(0);
    await closeComputer();
    await destinations.getByRole("button", { name: "Conversar com Nina", exact: true }).click();
    await expect(scene).toHaveAttribute("data-walking-to", "lead");
    await root.getByRole("button", { name: "Pausar turno", exact: true }).click();
    await expect(destinations.getByRole("button", { name: "Abrir computador", exact: true })).toBeDisabled();
    assert.equal(await scene.getAttribute("data-walking-to"), null);
    await page.waitForTimeout(400);
    await expect(person).not.toBeVisible();
    await shot("paused");
    await root.getByRole("button", { name: "Continuar turno", exact: true }).first().click();
    report.checks.escapeCancelsPipelineTimerAndPauseCancelsWalking = true;

    await openComputer();
    await selectArtifact("loja-015");
    await run({ passed: true, covered: true, checkout: 201 });
    await assertCompleted(false);
    await shot("015-complete-pipeline", "[data-delivery-computer][open]");
    const attemptsBeforeReload = (await readSave()).attempts;
    await panel("Arquivo");
    await editor.fill(retainedDraft);
    await panel("Esteira");
    await runButton.click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitOffice();
    await openComputer();
    await assertNoRuntime();
    await panel("Arquivo");
    await expect(editor).toHaveValue(retainedDraft);
    await panel("Esteira");
    await expect(computer.locator('input[name="work-artifact"][value="loja-015"]')).toBeChecked();
    assert.equal((await readSave()).attempts, attemptsBeforeReload + 1, "Reabrir preserva o contador do timer cancelado sem executar nada automaticamente");
    await shot("reload-draft-no-runtime", "[data-delivery-computer][open]");
    report.checks.reloadRestoresDraftSelectionAndAttemptsWithoutExecutingOrRestoringRuntime = true;

    await closeComputer();
    await expect.poll(async () => (await readResume())?.href).toBe(canonicalHref);
    await goToPage(homeUrl);
    const continuation = page.locator("[data-academy-continue]");
    await expect(continuation).toHaveAttribute("aria-busy", "false", { timeout: 120000 });
    await expect(continuation.getByRole("heading", { name: "A esteira de homologação", exact: true })).toBeVisible();
    const resumeLink = continuation.getByRole("link", { name: "Retomar atividade", exact: true });
    await expect(resumeLink).toHaveAttribute("href", previewPath);
    assert.equal(await xp.innerText(), xpBefore, "Praticar a esteira não altera XP");
    await shot("home-resume", "[data-academy-continue]");
    await resumeLink.click();
    await expect(page).toHaveURL(url);
    await waitOffice();
    await openComputer();
    await panel("Arquivo");
    await expect(editor).toHaveValue(retainedDraft);
    await assertNoRuntime();
    report.checks.homeResumesTheExactDeliveryHash = true;

    await goToPage(otherUrl);
    await waitOffice();
    await openComputer();
    await panel("Arquivo");
    await expect(editor).toHaveValue(starter);
    await editor.fill(otherDraft);
    await panel("Esteira");
    await expect(computer.locator('input[name="work-artifact"][value="loja-014"]')).toBeChecked();
    const otherBefore = await readRaw(keys.otherDelivery);
    await assertCheckpointOnly(keys.otherDelivery);
    assert.equal((await readSave(keys.otherDelivery)).completed, false);
    await goToPage(url);
    await waitOffice();
    await openComputer();
    await panel("Arquivo");
    await expect(editor).toHaveValue(retainedDraft);
    await editSource(retainedDraft);
    await selectArtifact("loja-015");
    await run({ passed: true, covered: true, checkout: 201 });
    report.checks.accountsHaveSeparateDeliveryDraftsAndSelections = true;

    await selectArtifact("loja-014");
    await expect(pipeline).toHaveCount(0);
    await assertPublishingBlocked();
    await selectArtifact("loja-015");
    await expect(pipeline).toHaveCount(0);
    await assertPublishingBlocked();
    await run({ passed: true, covered: true, checkout: 201 });
    await panel("Publicação");
    await publishButton.click();
    await page.keyboard.press("Escape");
    await expect(computer).not.toBeVisible();
    await page.waitForTimeout(1200);
    await openComputer();
    await panel("Publicação");
    await expect(deployment).toHaveAttribute("data-delivery-deployment", "initial");
    await expect(computer.locator("[data-delivery-installed]")).toHaveText("loja-014");
    await expect(verifyButton).toBeDisabled();
    await assertCompleted(false);
    report.checks.escapeCancelsPublicationTimerWithoutInstallingTheArtifact = true;
    await publish();
    await shot("published-not-completed", "[data-delivery-computer][open]");
    report.checks.publishingRequiresTheCurrentlySelectedVerifiedArtifactAndIsNotCompletion = true;

    await selectArtifact("loja-014");
    await expect(pipeline).toHaveCount(0);
    await panel("Publicação");
    await expect(deployment).toHaveAttribute("data-delivery-deployment", "loja-015");
    await expect(computer.locator("[data-delivery-installed]")).toHaveText("loja-015");
    await expect(validation).toHaveCount(0);
    await assertVerificationBlocked();
    await selectArtifact("loja-015");
    await expect(pipeline).toHaveCount(0);
    await assertPublishingBlocked();
    await run({ passed: true, covered: true, checkout: 201 });
    await publish();
    report.checks.artifactChangesInvalidateAuthorizationAndEvidenceWithoutChangingTheInstalledVersion = true;

    await verifyButton.click();
    await page.keyboard.press("Escape");
    await expect(computer).not.toBeVisible();
    await page.waitForTimeout(1200);
    await openComputer();
    await panel("Publicação");
    await expect(validation).toHaveCount(0);
    await expect(submitButton).toBeDisabled();
    await verifyButton.click();
    await expect(validation).toHaveAttribute("data-delivery-verification", "passed");
    await expect(validation).toContainText("loja-015");
    await expect(validation).toContainText("GET / → 200");
    await expect(validation).toContainText("POST /checkout → 201");
    await assertCompleted(false);
    await expect(submitButton).toBeEnabled();
    await shot("post-publication-verified", "[data-delivery-computer][open]");
    report.checks.escapeCancelsPostPublicationTimerAndVerificationAloneDoesNotComplete = true;
    await submitButton.click();
    await expect(person).toBeVisible();
    await expect.poll(async () => (await readSave())?.completed).toBe(true);
    await expect(person).toContainText(/Nina/);
    await shot("nina-received-evidence", "[data-delivery-person][open]");
    await assertCheckpointOnly();
    report.checks.onlyCurrentPostPublicationEvidenceSentToNinaCompletesDelivery = true;

    await page.reload({ waitUntil: "domcontentloaded" });
    await waitOffice();
    await assertCompleted(true);
    await openComputer();
    await assertNoRuntime();
    await shot("history-restored-live-state-empty", "[data-delivery-computer][open]");
    await panel("Arquivo");
    await expect(editor).toHaveValue(retainedDraft);
    await panel("Esteira");
    await expect(computer.locator('input[name="work-artifact"][value="loja-015"]')).toBeChecked();
    await run({ passed: true, covered: true, checkout: 201 });
    await assertCompleted(true);
    report.checks.historicalCompletionSurvivesReloadWithoutRestoringLiveEvidence = true;

    assert.equal(await readRaw(keys.otherDelivery), otherBefore, "Concluir a esteira não muda a segunda conta");
    const completedBefore = await readRaw(keys.delivery);
    await goToPage(homeUrl);
    await expect(xp).toBeVisible({ timeout: 120000 });
    assert.equal(await xp.innerText(), xpBefore, "Concluir a esteira não altera XP");
    await assertUntouched();
    await goToPage(otherUrl);
    await waitOffice();
    await openComputer();
    await panel("Arquivo");
    await expect(editor).toHaveValue(otherDraft);
    assert.equal(await readRaw(keys.delivery), completedBefore, "Visitar outra conta preserva a conquista original");
    assert.equal(await readRaw(keys.otherDelivery), otherBefore);
    await assertUntouched();
    assert.deepEqual(errors, [], "O percurso não deve gerar erros de página");
    report.checks.previousCasesLegacyJournalXpAndOtherAccountRemainUntouched = true;
    report.status = "passed";
    report.finishedAt = new Date().toISOString();
    console.log(`${profile.name}: cobertura, artefato, publicação, smoke pós-publicação, entrega, retomada e preservação passaram`);
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
    console.error("WORK DELIVERY FAILURE", JSON.stringify(report, null, 2));
    throw error;
  } finally {
    await writeFile(`${output}/results${process.argv[2] ? "-" + process.argv[2] : ""}.json`, JSON.stringify(reports, null, 2));
    await context.close();
    await browser.close();
  }
}
console.log(JSON.stringify(reports, null, 2));
