import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = (process.env.ENGLISH_USE_BASE_URL || "http://localhost:3015").replace(/\/$/, "");
const url = process.env.ENGLISH_USE_URL || `${base}/dev/academy-preview?activity=english#falar`;
const output = resolve("test-results/english-use");
const account = "academy-preview";
const accountSuffix = `s-${encodeURIComponent(JSON.stringify(account))}`;
const speakingKey = `orbitamos-english-speaking-v1-${accountSuffix}`;
const useKey = `orbitamos-english-use-v1-${accountSuffix}`;
const foreignUseKey = `orbitamos-english-use-v1-s-${encodeURIComponent(JSON.stringify("another-preview-account"))}`;
const oldEnglishKey = `orbitamos-english-v1-${account}`;
const journalKey = `orbitamos-practice-journal-v1-${account}`;
const spokenScope = "[data-spoken-english]";
const useScope = "[data-english-use-check]";
const profileArg = process.argv.slice(2).find(value => !value.startsWith("--")) || process.env.ENGLISH_USE_PROFILE;
const profiles = [
  { name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } },
  { name: "iphone", engine: webkit, options: devices["iPhone 13"] },
  { name: "small", engine: chromium, options: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } },
].filter(profile => !profileArg || profileArg === profile.name);
assert(profiles.length, "Use desktop, iphone ou small como argumento opcional.");

// Expected expressions are independent of the application's question-bank imports.
const lessons = [
  { id: "word-file", en: "file", correct: "main-js", meaning: /arquivo/i },
  { id: "word-folder", en: "folder", correct: "images-directory", meaning: /pasta/i },
  { id: "word-code", en: "code", correct: "instructions", meaning: /código/i },
  { id: "word-save", en: "save", correct: "store-changes", meaning: /guarda.*alteraç/i },
  { id: "word-run", en: "run", correct: "execute", meaning: /execuç|executa/i },
  { id: "word-error", en: "error", correct: "investigate", meaning: /erro/i },
  { id: "phrase-open-the-file", en: "Open the file", correct: "show-contents", meaning: /abrir o arquivo/i },
  { id: "phrase-save-the-file", en: "Save the file", correct: "store-changes", meaning: /salvar o arquivo/i },
  { id: "phrase-run-the-code", en: "Run the code", correct: "execute", meaning: /executar o código/i },
  { id: "phrase-fix-the-error", en: "Fix the error", correct: "inspect-and-adjust", meaning: /corrigir o erro/i },
  { id: "phrase-the-test-passed", en: "The test passed", correct: "this-check-succeeded", meaning: /teste passou/i },
  { id: "phrase-the-build-failed", en: "The build failed", correct: "preparation-failed", meaning: /geraç.*falhou/i },
];

/** Only browser speech capabilities are simulated; UI state and saves remain real. */
async function installSpeech(context, available = true) {
  await context.addInitScript(({ available }) => {
    if (!available) {
      for (const name of ["speechSynthesis", "SpeechSynthesisUtterance"]) {
        for (let object = window; object; object = Object.getPrototypeOf(object)) {
          const descriptor = Object.getOwnPropertyDescriptor(object, name);
          if (descriptor?.configurable) delete object[name];
        }
        if (name in window) Object.defineProperty(window, name, { configurable: true, value: undefined });
      }
      return;
    }
    const voices = [
      { name: "Audit português", lang: "pt-BR", voiceURI: "audit-pt-BR", localService: true, default: true },
      { name: "Audit English", lang: "en-US", voiceURI: "audit-en-US", localService: true, default: false },
    ];
    const events = new EventTarget();
    const audit = { utterances: [], cancellations: 0, lateCallbacks: 0, active: null };
    class AuditUtterance extends EventTarget {
      constructor(text = "") {
        super();
        this.text = text;
        this.lang = "";
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.voice = null;
        this.onend = null;
        this.onerror = null;
        this.onstart = null;
      }
    }
    const synth = {
      get speaking() { return audit.active !== null; },
      get pending() { return audit.active !== null; },
      paused: false,
      onvoiceschanged: null,
      getVoices: () => voices,
      addEventListener: (...args) => events.addEventListener(...args),
      removeEventListener: (...args) => events.removeEventListener(...args),
      speak(utterance) {
        const entry = { text: utterance.text, lang: utterance.lang, canceled: false };
        audit.utterances.push(entry);
        audit.active = { utterance, entry, onend: utterance.onend, onerror: utterance.onerror };
        utterance.onstart?.(new Event("start"));
      },
      cancel() {
        audit.cancellations += 1;
        const active = audit.active;
        if (!active) return;
        audit.active = null;
        active.entry.canceled = true;
        // Simulate queued end/error callbacks arriving after listener cleanup.
        setTimeout(() => {
          const event = new Event("error");
          Object.defineProperty(event, "error", { value: "interrupted" });
          active.onerror?.(event);
          active.onend?.(new Event("end"));
          audit.lateCallbacks += 1;
        }, 20);
      },
      pause() {},
      resume() {},
    };
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: AuditUtterance });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synth });
    window.__englishUseAudit = audit;
  }, { available });
  await context.addInitScript(() => {
    window.__englishUseMicrophoneCalls = 0;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia = () => {
        window.__englishUseMicrophoneCalls += 1;
        return Promise.reject(new Error("This activity must not request microphone access."));
      };
    }
  });
}

const readRaw = (page, key) => page.evaluate(key => localStorage.getItem(key), key);
const readSave = async (page, key = useKey) => JSON.parse(await readRaw(page, key) || "null");
const protectedStorage = page => page.evaluate(({ oldEnglishKey, journalKey }) => {
  const keys = new Set([oldEnglishKey, journalKey, ...Object.keys(localStorage).filter(key => /(?:^orbitamos-english-v1-|^orbitamos-practice-journal-|xp)/i.test(key))]);
  return Object.fromEntries([...keys].sort().map(key => [key, localStorage.getItem(key)]));
}, { oldEnglishKey, journalKey });

async function assertFirstViewport(locator, message) {
  await locator.page().evaluate(() => scrollTo(0, 0));
  const geometry = await locator.evaluate(element => {
    const box = element.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, width: innerWidth, height: innerHeight };
  });
  assert(geometry.top >= 0 && geometry.bottom <= geometry.height && geometry.left >= 0 && geometry.right <= geometry.width, `${message}: ${JSON.stringify(geometry)}`);
  return geometry;
}

await mkdir(output, { recursive: true });
const reports = [];
for (const profile of profiles) {
  const report = { profile: profile.name, url, status: "running", checks: [], captures: [], accessibility: [], errors: [], forbiddenRequests: [], situations: [], startedAt: new Date().toISOString() };
  reports.push(report);
  const browser = await profile.engine.launch({ headless: true });
  let context;
  let page;
  let checkpoint = "initial";
  const observe = target => {
    target.setDefaultTimeout(15_000);
    target.on("pageerror", error => report.errors.push(error.message));
    target.on("request", request => {
      const address = request.url();
      const externalWrite = /^https?:/.test(address) && new URL(address).origin !== new URL(base).origin && !["GET", "HEAD", "OPTIONS"].includes(request.method());
      const speechEndpoint = /\/(?:api\/)?(?:speech|tts|transcriptions|synthesize|synthesis)(?:\/|\?|$)|(?:speech|text-to-speech|transcriptions|elevenlabs|openai)\.[^/]+\//i.test(address);
      if (/\/rest\/v1\/rpc\//.test(address) || speechEndpoint || externalWrite) report.forbiddenRequests.push({ method: request.method(), url: address });
    });
  };
  const capture = async label => {
    const root = page.locator(useScope);
    await expect(root).toBeVisible();
    await expect.poll(() => root.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), { timeout: 30_000, message: `${profile.name}/${label}: contextual images must load before capture` }).toBe(true);
    const geometry = await root.evaluate(element => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      root: element.scrollWidth,
      client: element.clientWidth,
      left: element.getBoundingClientRect().left,
      right: element.getBoundingClientRect().right,
    }));
    assert(geometry.document <= geometry.viewport + 1 && geometry.body <= geometry.viewport + 1 && geometry.root <= geometry.client + 1 && geometry.left >= -1 && geometry.right <= geometry.viewport + 1, `${profile.name}/${label}: horizontal overflow: ${JSON.stringify(geometry)}`);
    const axe = await new AxeBuilder({ page }).include(useScope).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const violations = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) }));
    report.accessibility.push({ label, violations, geometry });
    assert.deepEqual(violations, [], `${profile.name}/${label}: Axe`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${output}/${profile.name}-${label}.png`, fullPage: true });
    await page.screenshot({ path: `${output}/${profile.name}-${label}-viewport.png` });
    report.captures.push(label);
  };
  const question = async lesson => {
    const root = page.locator(useScope);
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-use-lesson-id", lesson.id);
    await expect(root.locator("[data-use-expression]")).toHaveText(lesson.en);
    await expect(root.locator("[data-use-expression]")).toHaveAttribute("lang", "en-US");
    await expect(root.locator("[data-use-meaning]")).toHaveCount(0);
    await expect(root.locator("button[data-use-choice]")).toHaveCount(3);
    const choiceIds = await root.locator("button[data-use-choice]").evaluateAll(buttons => buttons.map(button => button.dataset.useChoice));
    assert.equal(new Set(choiceIds).size, 3, `${lesson.id}: choices must be distinct`);
    assert(choiceIds.includes(lesson.correct), `${lesson.id}: expected contextual choice is present`);
    await expect(root.locator("[data-use-next]")).toBeDisabled();
    // The old translation board, coach context and lesson picker must not leak the answer.
    await expect(page.locator("[data-speaking-english]")).toHaveCount(0);
    await expect(page.locator("#speaking-item")).toHaveCount(0);
    return root;
  };
  const answer = async (lesson, beforeSpeaking) => {
    const root = page.locator(useScope);
    await root.locator(`[data-use-choice="${lesson.correct}"]`).click();
    await expect.poll(async () => (await readSave(page))?.completed.includes(lesson.id)).toBe(true);
    assert.equal(await readRaw(page, speakingKey), beforeSpeaking, `${lesson.id}: check must preserve the speaking save byte for byte`);
    const feedback = root.locator("[data-use-meaning]");
    if (await feedback.count()) {
      await expect(feedback).toHaveAttribute("role", "status");
      await expect(feedback).toContainText(lesson.meaning);
    }
    report.situations.push({ lesson: lesson.id, expression: lesson.en, selected: lesson.correct });
  };

  try {
    context = await browser.newContext({ ...profile.options, reducedMotion: "reduce" });
    await installSpeech(context);
    page = await context.newPage();
    observe(page);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const spoken = page.locator(spokenScope);
    const item = spoken.locator("#speaking-item");
    const complete = spoken.locator("[data-speaking-complete]");
    const open = spoken.locator("[data-speaking-use-open]");
    await expect(spoken).toBeVisible({ timeout: 90_000 });
    await expect(item).toHaveValue(lessons[0].id, { timeout: 90_000 });
    assert.deepEqual(await item.locator("option").evaluateAll(options => options.map(option => option.value)), lessons.map(lesson => lesson.id));
    assert.deepEqual((await readSave(page))?.completed ?? [], []);
    assert.deepEqual((await readSave(page, speakingKey))?.completed ?? [], []);
    if (await open.count()) await expect(open).toBeDisabled();
    assert.deepEqual(await page.evaluate(() => window.__englishUseAudit.utterances), []);
    report.checks.push("Twelve existing items, no automatic speech, no completed use or speaking fixtures, and no check before speaking participation");

    // Preserve unfinished fixtures belonging only to the established reading activity/journal.
    await page.evaluate(({ oldEnglishKey, journalKey }) => {
      localStorage.setItem(oldEnglishKey, JSON.stringify({ version: 1, current: 0, completed: [], finished: false, draft: "" }));
      localStorage.setItem(journalKey, JSON.stringify({ version: 1, activities: {} }));
    }, { oldEnglishKey, journalKey });
    const protectedBefore = await protectedStorage(page);

    checkpoint = "initial-question";
    await spoken.locator("[data-speaking-text-mode]").click();
    await expect(complete).toBeEnabled();
    await complete.click();
    await expect.poll(async () => (await readSave(page, speakingKey))?.completed).toEqual([lessons[0].id]);
    const firstSpeaking = await readRaw(page, speakingKey);
    await expect(open).toBeEnabled();
    await open.click();
    let root = await question(lessons[0]);
    assert.equal((await readSave(page)).active, true);
    assert.equal(await readRaw(page, speakingKey), firstSpeaking);
    report.initialChoiceGeometry = await assertFirstViewport(root.locator("button[data-use-choice]").first(), `${profile.name}: first contextual choice must fit in the initial viewport`);
    await capture("initial-question");
    report.checks.push("Opening the optional check shows the English expression and three contextual actions without the previous Portuguese answer board; the first choice fits the initial viewport");

    checkpoint = "wrong-and-retry";
    await root.locator('[data-use-choice="src"]').click();
    await expect(root.locator("[data-use-meaning]")).toHaveAttribute("role", "status");
    await expect(root.locator("[data-use-meaning]")).toContainText(/pasta.*arquivo/i);
    await expect(root.locator("[data-use-next]")).toBeDisabled();
    await expect.poll(async () => (await readSave(page))?.attempts?.[lessons[0].id]).toBe(1);
    assert.deepEqual((await readSave(page)).completed, []);
    assert.equal(await readRaw(page, speakingKey), firstSpeaking);
    await capture("wrong-answer");
    checkpoint = "home-resume-with-zero-correct";
    const wrongUse = await readSave(page);
    assert.equal(wrongUse.active, true);
    assert.equal(await page.evaluate(() => window.__englishUseMicrophoneCalls), 0);
    await page.goto(`${base}/dev/academy-preview?view=home`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const continuation = page.locator("[data-academy-continue]");
    const resume = continuation.getByRole("link", { name: "Retomar atividade", exact: true });
    await expect(resume).toHaveAttribute("href", "/dev/academy-preview?activity=english#falar");
    await resume.click();
    root = await question(lessons[0]);
    assert.deepEqual(await readSave(page), wrongUse);
    assert.equal(await readRaw(page, speakingKey), firstSpeaking);
    assert.deepEqual(await page.evaluate(() => window.__englishUseAudit.utterances), []);
    report.checks.push("Home resumes the active contextual check with zero correct answers after a wrong attempt, keeping the speaking save and without replaying speech or feedback");
    checkpoint = "correct-retry";
    await answer(lessons[0], firstSpeaking);
    await expect(root.locator("[data-use-next]")).toBeEnabled();
    assert.equal((await readSave(page)).attempts[lessons[0].id], 2);
    await capture("correct-answer");
    report.checks.push("A wrong answer gives specific feedback without completion or next; retrying correctly records only contextual-use progress and preserves the speaking save");

    checkpoint = "back-and-cancel";
    await root.locator("[data-use-back]").click();
    await expect(item).toHaveValue(lessons[0].id);
    assert.equal((await readSave(page)).active, false);
    assert.equal(await readRaw(page, speakingKey), firstSpeaking);
    assert.deepEqual(await page.evaluate(() => window.__englishUseAudit.utterances), []);
    if (await spoken.locator("[data-speaking-voice-mode]").count()) await spoken.locator("[data-speaking-voice-mode]").click();
    await spoken.locator("[data-speaking-start]").click();
    await expect.poll(() => page.evaluate(() => window.__englishUseAudit.utterances.length)).toBe(1);
    const beforeOpen = await readSave(page);
    await open.click();
    root = await question(lessons[0]);
    await expect.poll(() => page.evaluate(() => window.__englishUseAudit.lateCallbacks)).toBe(1);
    assert.equal(await page.evaluate(() => window.__englishUseAudit.active), null);
    assert.equal(await page.evaluate(() => window.__englishUseAudit.utterances[0].canceled), true);
    assert.deepEqual(await readSave(page), { ...beforeOpen, active: true });
    assert.equal(await readRaw(page, speakingKey), firstSpeaking);
    report.checks.push("Back returns to the same speaking item without replay; opening a check cancels active synthesis and ignores late callbacks without modifying either achievement save");

    checkpoint = "reload";
    const beforeReload = await readSave(page);
    assert.equal(await page.evaluate(() => window.__englishUseMicrophoneCalls), 0);
    await page.reload({ waitUntil: "domcontentloaded" });
    root = await question(lessons[0]);
    assert.deepEqual(await readSave(page), beforeReload);
    assert.equal(await readRaw(page, speakingKey), firstSpeaking);
    assert.deepEqual(await page.evaluate(() => window.__englishUseAudit.utterances), []);
    report.checks.push("Reload resumes the same active contextual question with its achievements retained, asks for a fresh selection and performs no automatic speech");

    // A saved correct choice is retained, but a fresh question still asks for a new selection.
    await answer(lessons[0], firstSpeaking);
    await expect(root.locator("[data-use-next]")).toBeEnabled();
    await root.locator("[data-use-next]").click();
    await expect(item).toHaveValue(lessons[1].id);
    assert.equal((await readSave(page)).active, false);
    report.checks.push("A correct answer enables the explicit next action, which returns to the following speaking item");

    checkpoint = "all-twelve";
    for (const [index, lesson] of lessons.entries()) {
      if (index === 0) continue;
      if (await item.count()) {
        await item.selectOption(lesson.id);
        await spoken.locator("[data-speaking-text-mode]").click();
        await expect(complete).toBeEnabled();
        await complete.click();
      }
      await expect.poll(async () => (await readSave(page, speakingKey))?.completed.includes(lesson.id)).toBe(true);
      const beforeSpeaking = await readRaw(page, speakingKey);
      await expect(open).toBeEnabled();
      await open.click();
      root = await question(lesson);
      assert.equal(await readRaw(page, speakingKey), beforeSpeaking);
      if (lesson.id === "phrase-open-the-file") await capture("phrase-question");
      await answer(lesson, beforeSpeaking);
      if (index < lessons.length - 1) {
        await expect(root.locator("[data-use-next]")).toBeEnabled();
        await root.locator("[data-use-next]").click();
        await expect(item).toHaveValue(lessons[index + 1].id);
        assert.equal((await readSave(page)).active, false);
      } else if (!await root.locator("[data-use-finished]").count()) {
        await expect(root.locator("[data-use-next]")).toBeEnabled();
        await root.locator("[data-use-next]").click();
      }
    }
    root = page.locator(useScope);
    await expect(root.locator("[data-use-finished]")).toBeVisible();
    await expect(root.locator("[data-use-finished]")).toContainText(/12 situações/);
    await expect(root.locator("[data-use-finished]")).toContainText(/opção|escolha/);
    const finished = await readSave(page);
    assert.deepEqual(finished.completed, lessons.map(lesson => lesson.id));
    assert.deepEqual(Object.keys(finished).sort(), ["active", "attempts", "completed", "current", "version"]);
    assert.equal(finished.active, true);
    assert.equal(finished.attempts[lessons[0].id], 3);
    assert(lessons.slice(1).every(lesson => finished.attempts[lesson.id] === 1));
    const finishedSpeaking = await readSave(page, speakingKey);
    assert.deepEqual(finishedSpeaking.completed, lessons.map(lesson => lesson.id));
    assert(lessons.every(lesson => finishedSpeaking.attempts[lesson.id] === 1));
    await capture("all-twelve");
    assert.equal(await readRaw(page, foreignUseKey), null);
    assert.deepEqual(await protectedStorage(page), protectedBefore);
    assert.equal(await page.evaluate(() => window.__englishUseMicrophoneCalls), 0);
    report.checks.push("All twelve use checks and all twelve speaking participations are earned through the real UI; correct-use completion remains separate from speaking participation, the old English save, journal and XP");
    report.checks.push("The preview writes only its account-scoped use key and leaves a foreign account key absent; actual authenticated account replacement remains outside this fixed-account preview");
    checkpoint = "finished-reload";
    const finalSpeakingRaw = await readRaw(page, speakingKey);
    await page.reload({ waitUntil: "domcontentloaded" });
    root = await question(lessons.at(-1));
    await expect(root.locator("[data-use-finished]")).toHaveCount(0);
    assert.deepEqual(await readSave(page), finished);
    assert.equal(await readRaw(page, speakingKey), finalSpeakingRaw);
    assert.deepEqual(await protectedStorage(page), protectedBefore);
    assert.deepEqual(await page.evaluate(() => window.__englishUseAudit.utterances), []);
    await root.locator("[data-use-back]").click();
    await expect(spoken.getByRole("heading", { name: "Você praticou palavras e frases de código.", exact: true })).toBeVisible();
    assert.deepEqual(await readSave(page), { ...finished, active: false });
    assert.equal(await readRaw(page, speakingKey), finalSpeakingRaw);
    report.checks.push("A final reload preserves all twelve correct-use records and resumes question twelve without a preselected answer; Back closes the check and restores the established speaking finish screen without replay");
    await context.close();

    checkpoint = "without-speech-api";
    context = await browser.newContext({ ...profile.options, reducedMotion: "reduce" });
    await installSpeech(context, false);
    page = await context.newPage();
    observe(page);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const fallback = page.locator(spokenScope);
    await expect(fallback).toBeVisible({ timeout: 90_000 });
    await fallback.locator("[data-speaking-text-mode]").click();
    await fallback.locator("[data-speaking-complete]").click();
    await fallback.locator("[data-speaking-use-open]").click();
    await question(lessons[0]);
    const fallbackSpeaking = await readRaw(page, speakingKey);
    await answer(lessons[0], fallbackSpeaking);
    assert.deepEqual((await readSave(page)).completed, [lessons[0].id]);
    assert.equal(await page.evaluate(() => window.__englishUseMicrophoneCalls), 0);
    report.checks.push("Without speech APIs, guided text participation still unlocks the contextual question and a correct choice saves separate use progress without microphone access");
    assert.deepEqual(report.forbiddenRequests, [], "No RPC, application speech API or external write requests");
    assert.deepEqual(report.errors, [], "No uncaught page errors");
    report.status = "passed";
  } catch (error) {
    report.status = "failed";
    report.failure = { checkpoint, message: error instanceof Error ? error.stack || error.message : String(error), url: page?.url() };
    await page?.screenshot({ path: `${output}/${profile.name}-failure-${checkpoint}.png`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    report.finishedAt = new Date().toISOString();
    await writeFile(`${output}/results-${profile.name}.json`, JSON.stringify(report, null, 2));
    await writeFile(`${output}/results.json`, JSON.stringify(reports, null, 2));
    await context?.close().catch(() => {});
    await browser.close();
    console.log(`${profile.name}: ${report.status}; ${report.checks.length} checks, ${report.captures.length} captures`);
  }
}
