import { chromium, webkit, devices, expect as playwrightExpect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Run from apps/web, against the development preview, with other heavy checks stopped:
// ACADEMY_AUDIT_URL=http://localhost:3015 node scripts/audit-academy-chosen-csharp.mjs
// Uses new synthetic contexts only. It never connects to the user's browser/account.
const expect = playwrightExpect.configure({ timeout: 120000 });
const base = process.env.ACADEMY_AUDIT_URL || "http://localhost:3015";
const out = path.resolve(process.env.ACADEMY_AUDIT_OUTPUT || "../../docs/local/academy-control-20261116/chosen-csharp");
const screenshots = process.env.ACADEMY_AUDIT_SCREENSHOTS !== "0";
const homeHref = "/dev/academy-preview?view=home";
const methodsHref = "/dev/csharp-preview?academy=1&view=methods";
const objectsHref = "/dev/csharp-preview?academy=1&view=objects";
const englishHref = "/dev/academy-preview?activity=english#falar";
const keys = {
  choice: "orbitamos-academy-study-path-v1-academy-preview",
  track: "orbitamos-csharp-track-v1-academy-preview",
  resume: "orbitamos-academy-resume-v1-academy-preview",
  methods: "orbitamos-csharp-methods-prep-v1-string:academy-preview",
  objects: "orbitamos-csharp-objects-prep-v1-string:academy-preview",
};
const profiles = [
  ["desktop-chromium", chromium, { viewport: { width: 1366, height: 768 } }],
  ["iphone-webkit", webkit, { ...devices["iPhone 13"], viewport: { width: 390, height: 664 } }],
  ["narrow-webkit", webkit, { ...devices["iPhone SE"], viewport: { width: 320, height: 640 } }],
];
// ACADEMY_AUDIT_PROFILE=iphone-webkit reproduces one profile; use a separate
// ACADEMY_AUDIT_OUTPUT when preserving a previous complete report.
const requestedProfiles = (process.env.ACADEMY_AUDIT_PROFILES || process.env.ACADEMY_AUDIT_PROFILE || "")
  .split(",").map(name => name.trim()).filter(Boolean);
if (requestedProfiles.some(name => !profiles.some(([known]) => known === name))) {
  throw new Error("Unknown audit profile. Use desktop-chromium, iphone-webkit or narrow-webkit.");
}
const selectedProfiles = profiles.filter(([name]) => !requestedProfiles.length || requestedProfiles.includes(name));

// Explicit fixture, not observed learner completion. Correct quiz answers are
// included because the readers deliberately reject "done" quizzes without them.
const browserModulesDoneFixture = [
  { key: "orbitamos-csharp-variables-v1-academy-preview", done: ["guided", "quiz-values", "client", "transfer", "quiz-types", "update", "remaining", "debug", "quiz-update", "delivery"], answers: { "quiz-values": 1, "quiz-types": 2, "quiz-update": 1 } },
  { key: "orbitamos-csharp-conditions-v1-academy-preview", done: ["guided", "quiz-branch", "branches", "threshold", "quiz-equality", "both", "either", "debug-limit", "quiz-and", "delivery"], answers: { "quiz-branch": 1, "quiz-equality": 1, "quiz-and": 1 } },
  { key: "orbitamos-csharp-loops-v1-academy-preview", done: ["guided", "quiz-limit", "count", "countdown", "quiz-stop", "accumulate", "select", "debug-last", "quiz-total", "delivery"], answers: { "quiz-limit": 1, "quiz-stop": 0, "quiz-total": 1 } },
];
const report = {
  scope: "Isolated synthetic development previews; UI navigation, saves and recommendation only. No learner trial, physical iPhone, C# compilation or proof of mastery.",
  startedAt: new Date().toISOString(),
  base,
  selectedProfiles: selectedProfiles.map(([name]) => name),
  fixture: { kind: "explicit localStorage fixture in a second fresh context", browserModulesDoneFixture },
  profiles: [],
  errors: [],
  completed: false,
};
await mkdir(out, { recursive: true });

const readSave = (page, key) => page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey) || "null"), key);
const home = page => page.locator('[data-academy-continue][aria-busy="false"]');
const primary = (page, name = "Continuar minha trilha") => home(page).getByRole("link", { name, exact: true });

async function hrefIs(link, expected) {
  await expect(link).toHaveAttribute("href", expected);
}

async function visitHome(page) {
  // The real preview header stays available when the mobile dock is hidden in an editor.
  await page.getByRole("link", { name: "Prévia local · Academy", exact: true }).click();
  await expect(home(page)).toBeVisible();
  await expect(page).toHaveURL(new URL(homeHref, base).href);
}

async function choose(page, label, pathId) {
  const picker = home(page).locator("[data-study-path-picker]");
  const button = picker.getByRole("button", { name: label, exact: true });
  if (!(await button.isVisible())) await picker.locator("summary").click();
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => (await readSave(page, keys.choice))?.path).toBe(pathId);
}

async function pictureAndLayout(page, result, label, firstFold = false) {
  await page.evaluate(() => scrollTo(0, 0));
  await page.evaluate(async () => {
    const visible = [...document.images].filter(img => { const box = img.getBoundingClientRect(); return box.top < innerHeight && box.bottom > 0; });
    await Promise.race([Promise.all(visible.map(img => img.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 2000))]);
    await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 2000))]);
  });
  const layout = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }));
  expect(layout.scrollWidth, label + " horizontal overflow").toBeLessThanOrEqual(layout.width + 1);
  if (firstFold) {
    const action = home(page).getByRole("link", { name: /^(Começar minha trilha|Continuar minha trilha|Continuar no projeto \.NET)$/ });
    const actionBox = await action.boundingBox();
    const dock = page.locator("[data-academy-dock]");
    const dockBox = await dock.isVisible() ? await dock.boundingBox() : null;
    const bottom = dockBox ? Math.min(layout.height, dockBox.y) : layout.height;
    const image = home(page).locator("aside img");
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    const imageBox = await image.boundingBox();
    expect(actionBox, label + " primary action bounds").not.toBeNull();
    expect(imageBox, label + " contextual image bounds").not.toBeNull();
    expect(actionBox.y).toBeGreaterThanOrEqual(0);
    expect(actionBox.y + actionBox.height, label + " primary action above dock").toBeLessThanOrEqual(bottom);
    const visibleImageHeight = Math.min(imageBox.y + imageBox.height, bottom) - Math.max(imageBox.y, 0);
    expect(visibleImageHeight, label + " useful contextual media in first fold").toBeGreaterThanOrEqual(label === "browser-done-native-methods-bridge" ? 100 : 60);
    Object.assign(layout, { action: actionBox, image: imageBox, usableBottom: bottom, visibleImageHeight });
  }
  if (screenshots) await page.screenshot({ path: path.join(out, result.name + "-" + label + ".png") });
  result.frames.push({ label, ...layout });
}

async function scopedAxe(page, result, label, selector) {
  const axe = await new AxeBuilder({ page }).include(selector).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const violations = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, count: nodes.length }));
  result.accessibility.push({ label, scope: selector, violations });
  expect(violations, label + " scoped accessibility").toEqual([]);
}

async function traceSyntheticInput(page) {
  await page.evaluate(objectKey => {
    const events = [];
    window.__academyChosenInputEvents = events;
    for (const type of ["focusin", "focusout", "input", "change"]) document.addEventListener(type, event => {
      const editor = document.querySelector("[data-csharp-objects] textarea");
      let savedActive = null;
      try { savedActive = JSON.parse(localStorage.getItem(objectKey) || "null")?.active ?? null; } catch { /* Diagnostic only. */ }
      events.push({
        type, at: Math.round(performance.now()), trusted: event.isTrusted,
        targetId: event.target?.id, targetTag: event.target?.tagName,
        activeElementId: document.activeElement?.id, activeElementTag: document.activeElement?.tagName,
        activity: document.querySelector("[data-csharp-objects] h1")?.textContent.trim(), savedActive,
        textareaValue: editor?.value.slice(0, 300) ?? null,
      });
      if (events.length > 120) events.shift();
    }, true);
  }, keys.objects);
}

async function recordFailure(page, result, scenario, error) {
  const storageKeys = [...Object.values(keys), ...browserModulesDoneFixture.map(fixture => fixture.key)];
  const diagnostic = await page.evaluate(knownKeys => {
    const saves = {};
    for (const key of knownKeys) {
      try { saves[key] = JSON.parse(localStorage.getItem(key) || "null"); }
      catch (failure) { saves[key] = { unreadable: String(failure) }; }
    }
    const focused = document.activeElement;
    return {
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight },
      readyState: document.readyState,
      visibility: document.visibilityState,
      trackView: document.querySelector("[data-csharp-track]")?.getAttribute("data-view"),
      headings: [...document.querySelectorAll("h1")].map(heading => heading.textContent.trim()),
      focused: focused ? { tag: focused.tagName, id: focused.id, name: focused.getAttribute("name"), label: focused.getAttribute("aria-label") } : null,
      textareas: [...document.querySelectorAll("textarea")].map(input => {
        const box = input.getBoundingClientRect();
        return { id: input.id, value: input.value, focused: input === focused, disabled: input.disabled, readOnly: input.readOnly, bounds: { x: box.x, y: box.y, width: box.width, height: box.height } };
      }),
      syntheticInputEvents: window.__academyChosenInputEvents ?? [],
      saves,
    };
  }, storageKeys).catch(failure => ({ unavailable: String(failure) }));
  const entry = { name: result.name, scenario, stage: result.stage, error: String(error), stack: error.stack, diagnostic };
  report.errors.push(entry);
  result.failure = { scenario, stage: result.stage };
  report.updatedAt = new Date().toISOString();
  console.error(result.name + " FAILED at " + result.stage + ": " + String(error));
  await Promise.all([
    writeFile(path.join(out, result.name + "-failure.json"), JSON.stringify(entry, null, 2)),
    writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2)),
  ]);
  if (screenshots) await page.screenshot({ path: path.join(out, result.name + "-failure.png") }).catch(() => {});
}

async function visitEnglishThroughGames(page) {
  await home(page).getByRole("link", { name: "Jogar", exact: true }).click();
  const games = page.locator("[data-practice-station]");
  await expect(games).toBeVisible();
  await games.locator('a[href^="/dev/academy-preview?activity=english"]').first().click();
  await page.getByRole("link", { name: "Ouvir e repetir com o Orbi", exact: true }).click();
  await expect(page.locator("[data-spoken-english]")).toBeVisible();
  await expect(page).toHaveURL(new URL(englishHref, base).href);
  await expect.poll(async () => (await readSave(page, keys.resume))?.href).toBe("/estudante/jogos/ingles-em-cena#falar");
}

async function objectsAndEnglish(page, result, stage) {
  stage("fresh-home-choice");
  await page.goto(new URL(homeHref, base).href, { waitUntil: "domcontentloaded", timeout: 120000 });
  await expect(home(page)).toBeVisible();
  expect(await readSave(page, keys.choice)).toBeNull();
  expect(await readSave(page, keys.track)).toBeNull();
  await choose(page, "C# & .NET", "csharp");
  await hrefIs(primary(page, "Começar minha trilha"), "/dev/csharp-preview?academy=1");
  await pictureAndLayout(page, result, "chosen-csharp-start", true);
  await primary(page, "Começar minha trilha").click();
  await expect(page.locator('[data-csharp-track][data-view="welcome"]')).toBeVisible();
  await page.getByRole("button", { name: "Começar a codar · variáveis", exact: true }).click();
  await expect(page.locator("[data-variables-module]")).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("module")).toBe("variables");
  result.checks.push("C# was chosen through Home UI; its primary action opens the C# welcome and the real browser variables pilot.");

  stage("native-methods-pointer");
  const tabs = page.getByRole("navigation", { name: "Módulos disponíveis", exact: true });
  await tabs.getByRole("button", { name: "Métodos · .NET real", exact: true }).click();
  const methods = page.locator("[data-csharp-methods]");
  await expect(methods).toBeVisible();
  await methods.getByRole("button", { name: "Começar a tarefa", exact: true }).click();
  const editor = page.getByRole("textbox", { name: "Seu rascunho C#", exact: true });
  const methodDraft = "// Método sintético protegido · " + result.name;
  await editor.fill(methodDraft);
  await expect.poll(async () => (await readSave(page, keys.methods))?.drafts.guided).toBe(methodDraft);
  await expect.poll(async () => (await readSave(page, keys.track))?.projectUnit).toBe("methods");
  await visitHome(page);
  await hrefIs(primary(page), methodsHref);
  await primary(page).click();
  await expect(editor).toHaveValue(methodDraft);
  result.checks.push("An actual Methods visit and draft create a native pointer; Home resumes Methods without completing the formation.");

  stage("native-objects-draft");
  await methods.getByRole("button", { name: "Mapa completo", exact: true }).click();
  const map = page.locator("[data-csharp-career-map]");
  await expect(map).toBeVisible();
  await map.locator("#career-stage-objects").getByRole("button", { name: "Objetos e listas", exact: true }).click();
  const objects = page.locator("[data-csharp-objects]");
  await expect(objects).toBeVisible();
  await traceSyntheticInput(page);
  await objects.getByRole("button", { name: "Começar a tarefa", exact: true }).click();
  await expect(objects.getByRole("heading", { level: 1, name: "Uma ficha reúne dados e regras", exact: true })).toBeVisible();
  await expect(objects.getByRole("heading", { level: 1, name: "Uma ficha reúne dados e regras", exact: true })).toBeFocused();
  await expect.poll(async () => (await readSave(page, keys.objects))?.active).toBe("guided");
  const serviceDraft = "// Ficha sintética protegida · " + result.name;
  const selectionDraft = "// Seleção independente sintética protegida · " + result.name;
  await editor.fill(serviceDraft);
  await expect(editor).toHaveValue(serviceDraft);
  await expect.poll(async () => (await readSave(page, keys.objects))?.drafts.guided).toBe(serviceDraft);
  for (const [id, title] of [
    ["reuse", "Duas fichas, dois conjuntos de dados"],
    ["debug", "A cópia era a mesma ficha"],
    ["independent", "A lista de serviços do dia"],
  ]) {
    stage("native-objects-transition-" + id);
    await objects.getByRole("button", { name: "Explorar próxima tarefa", exact: true }).click();
    await expect(objects.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
    await expect(objects.getByRole("heading", { level: 1, name: title, exact: true })).toBeFocused();
    await expect.poll(async () => (await readSave(page, keys.objects))?.active).toBe(id);
  }
  stage("native-objects-independent-edit");
  await expect(objects).toContainText("Você escreve: Program.cs");
  await editor.fill(selectionDraft);
  await expect(editor).toHaveValue(selectionDraft);
  await expect.poll(async () => (await readSave(page, keys.objects))?.drafts.independent).toBe(selectionDraft);
  const inputEvents = await page.evaluate(() => window.__academyChosenInputEvents ?? []);
  const inputEventsFile = result.name + "-synthetic-input-events.json";
  await writeFile(path.join(out, inputEventsFile), JSON.stringify({ scope: "Synthetic audit comments only; bounded focus/input/change trace, not proof of a root cause", events: inputEvents }, null, 2));
  result.syntheticInputTrace = { file: inputEventsFile, count: inputEvents.length };
  await expect.poll(async () => (await readSave(page, keys.track))?.projectUnit).toBe("objects");
  expect((await readSave(page, keys.objects)).selfReportedRuns).toEqual({});
  await visitHome(page);
  await hrefIs(primary(page), objectsHref);

  stage("english-does-not-replace-chosen-project");
  await visitEnglishThroughGames(page);
  await visitHome(page);
  const recent = home(page).getByRole("link", { name: /Retomar última atividade: Fale inglês com o Orbi/ });
  await hrefIs(primary(page), objectsHref);
  await hrefIs(recent, englishHref);
  await expect(home(page).getByRole("heading", { level: 1 })).toContainText("ficha");
  await expect(home(page)).toContainText("nenhum resultado conferido pela Orbitamos");
  expect((await readSave(page, keys.track)).projectUnit).toBe("objects");
  expect((await readSave(page, keys.resume)).href).toBe("/estudante/jogos/ingles-em-cena#falar");
  await pictureAndLayout(page, result, "objects-primary-english-recent", true);
  await scopedAxe(page, result, "objects-primary-english-recent", "[data-academy-continue]");
  await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
  await expect(home(page)).toBeVisible();
  await hrefIs(primary(page), objectsHref);
  await hrefIs(recent, englishHref);
  result.checks.push("After English through Games UI, Objects remains primary and English remains the separate recent activity, including after Home reload.");

  stage("change-and-clear-choice");
  await choose(page, "SQL com Orbi", "sql");
  await hrefIs(primary(page, "Começar minha trilha"), "/dev/academy-preview?activity=sql");
  await hrefIs(recent, englishHref);
  const picker = home(page).locator("[data-study-path-picker]");
  await picker.getByRole("button", { name: "Explorar sem uma trilha principal", exact: true }).click();
  await expect.poll(() => readSave(page, keys.choice)).toBeNull();
  await hrefIs(primary(page, "Retomar atividade"), englishHref);
  expect((await readSave(page, keys.track)).projectUnit).toBe("objects");
  await choose(page, "C# & .NET", "csharp");
  await hrefIs(primary(page), objectsHref);
  result.checks.push("Changing to SQL follows SQL; clearing the choice follows recent English. The saved C# project cannot hijack either state, and reselecting C# restores Objects.");

  stage("return-to-exact-object-draft");
  await primary(page).click();
  await expect(objects).toBeVisible();
  await expect(editor).toHaveValue(selectionDraft);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
  await expect(editor).toHaveValue(selectionDraft);
  const savedObjects = await readSave(page, keys.objects);
  expect(savedObjects.active).toBe("independent");
  expect(savedObjects.drafts.guided).toBe(serviceDraft);
  expect(savedObjects.selfReportedRuns).toEqual({});
  expect((await readSave(page, keys.methods)).drafts.guided).toBe(methodDraft);
  expect((await readSave(page, keys.track)).projectUnit).toBe("objects");
  await pictureAndLayout(page, result, "objects-resumed-draft");
  await scopedAxe(page, result, "objects-resumed-draft", "[data-csharp-objects]");
  result.checks.push("The exact independent Objects draft, guided Servico.cs draft and separate Methods draft survive cross-activity visits and reload. No execution declarations were manufactured.");
}

async function completedBrowserBridge(page, result, stage) {
  stage("explicit-browser-modules-fixture");
  await page.goto(new URL(homeHref, base).href, { waitUntil: "domcontentloaded", timeout: 120000 });
  await expect(home(page)).toBeVisible();
  await choose(page, "C# & .NET", "csharp");
  expect(await readSave(page, keys.track)).toBeNull();
  expect(await readSave(page, keys.methods)).toBeNull();
  expect(await readSave(page, keys.objects)).toBeNull();
  await page.evaluate(fixtures => {
    for (const fixture of fixtures) localStorage.setItem(fixture.key, JSON.stringify({ version: 1, active: "delivery", drafts: {}, done: fixture.done, answers: fixture.answers, evidence: {} }));
    window.dispatchEvent(new Event("orbitamos-practice-updated"));
  }, browserModulesDoneFixture);
  await hrefIs(primary(page, "Continuar no projeto .NET"), methodsHref);
  await expect(home(page).getByRole("heading", { level: 1 })).toHaveText("Do navegador ao projeto .NET.");
  await expect(home(page)).toContainText("métodos");
  await expect(home(page)).toContainText("objetos e listas");
  await expect(home(page)).toContainText("SDK .NET 10");
  await expect(home(page)).not.toContainText(/próximo conteúdo.*preparação|métodos.*em preparação|piloto (concluído|encerrado)/i);
  await pictureAndLayout(page, result, "browser-done-native-methods-bridge", true);
  await scopedAxe(page, result, "browser-done-native-methods-bridge", "[data-academy-continue]");
  await primary(page, "Continuar no projeto .NET").click();
  const methods = page.locator("[data-csharp-methods]");
  await expect(methods).toBeVisible();
  await expect(methods).toContainText("SDK .NET 10");
  await expect(methods.getByRole("button", { name: /Executar/ })).toHaveCount(0);
  await expect.poll(async () => (await readSave(page, keys.track))?.projectUnit).toBe("methods");
  result.checks.push("In a second isolated context, an explicitly labeled fixture completes only the three browser modules. Home opens available Methods/.NET, instead of closing the C# path or calling it future preparation.");
}

try {
  for (const [name, engine, settings] of selectedProfiles) {
    const result = { name, viewport: settings.viewport, checks: [], frames: [], accessibility: [], completed: false, stage: "launch" };
    report.profiles.push(result);
    const stage = value => { result.stage = value; console.log(name + " · " + value); };
    const browser = await engine.launch();
    let activePage;
    let recordedFailure = false;
    try {
      for (const [scenario, run] of [["chosen-csharp-native-and-english", objectsAndEnglish], ["explicit-browser-completion-bridge", completedBrowserBridge]]) {
        const context = await browser.newContext({ ...settings, reducedMotion: "reduce" });
        try {
          activePage = await context.newPage();
          activePage.setDefaultTimeout(120000);
          activePage.setDefaultNavigationTimeout(120000);
          activePage.on("pageerror", error => report.errors.push({ name, scenario, stage: result.stage, error: String(error) }));
          await run(activePage, result, stage);
        } catch (error) {
          await recordFailure(activePage, result, scenario, error);
          recordedFailure = true;
          throw error;
        } finally { await context.close(); activePage = undefined; }
      }
      result.completed = true;
      stage("passed");
    } catch (error) {
      if (!recordedFailure) report.errors.push({ name, stage: result.stage, error: String(error), stack: error.stack });
    } finally {
      await browser.close();
      report.updatedAt = new Date().toISOString();
      await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
    }
  }
  expect(report.errors).toEqual([]);
  expect(report.profiles.every(profile => profile.completed)).toBe(true);
  report.completed = true;
} finally {
  report.finishedAt = new Date().toISOString();
  await writeFile(path.join(out, "report.json"), JSON.stringify(report, null, 2));
}
