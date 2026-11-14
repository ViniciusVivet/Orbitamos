import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = (process.env.ENGLISH_REVIEW_BASE_URL || "http://localhost:3015").replace(/\/$/, "");
const url = process.env.ENGLISH_REVIEW_URL || `${base}/dev/academy-preview?activity=english#falar`;
const output = resolve("test-results/english-review");
const account = "academy-preview";
const typedKey = (activity, id) => `orbitamos-${activity}-v1-${typeof id === "string" ? "s" : "n"}-${encodeURIComponent(JSON.stringify(id))}`;
const speakingKey = typedKey("english-speaking", account);
const useKey = typedKey("english-use", account);
const reviewKey = typedKey("english-review", account);
const oldEnglishKey = `orbitamos-english-v1-${account}`;
const journalKey = `orbitamos-practice-journal-v1-${account}`;
const spokenScope = "[data-spoken-english]:not([data-english-review])";
const reviewScope = "[data-english-review]";
const profileArg = process.argv.slice(2).find(value => !value.startsWith("--")) || process.env.ENGLISH_REVIEW_PROFILE;
const profiles = [
  { name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } },
  { name: "iphone", engine: webkit, options: devices["iPhone 13"] },
  { name: "small", engine: chromium, options: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } },
].filter(profile => !profileArg || profileArg === profile.name);
assert(profiles.length, "Use desktop, iphone ou small como argumento opcional.");

// Expected recall answers remain independent of application question-bank imports.
const lessons = [
  { id: "word-file", en: "file", cue: /arquivo/i },
  { id: "word-folder", en: "folder", cue: /pasta/i },
  { id: "word-code", en: "code", cue: /código/i },
  { id: "word-save", en: "save", cue: /salvar/i },
];
const lessonFor = id => {
  const lesson = lessons.find(item => item.id === id);
  assert(lesson, `Unexpected review lesson: ${id}`);
  return lesson;
};

/** Mock only browser speech capabilities. Participation, review and persistence use the real UI. */
async function installSpeech(context, available = true) {
  await context.addInitScript(({ available }) => {
    const audit = { utterances: [], cancellations: 0, lateCallbacks: 0, active: null, microphoneCalls: 0 };
    window.__englishReviewAudit = audit;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia = () => {
        audit.microphoneCalls += 1;
        return Promise.reject(new Error("Written recall must not request microphone access."));
      };
    }
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
        // Exercise queued callbacks that survive listener cleanup and component unmount.
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
  }, { available });
}

const readRaw = (page, key) => page.evaluate(key => localStorage.getItem(key), key);
const readSave = async (page, key = reviewKey) => JSON.parse(await readRaw(page, key) || "null");
const protectedStorage = page => page.evaluate(({ speakingKey, useKey, oldEnglishKey, journalKey }) => {
  const keys = new Set([speakingKey, useKey, oldEnglishKey, journalKey, ...Object.keys(localStorage).filter(key => /(?:^orbitamos-english-v1-|^orbitamos-english-speaking-|^orbitamos-english-use-|^orbitamos-practice-journal-|xp)/i.test(key))]);
  return Object.fromEntries([...keys].sort().map(key => [key, localStorage.getItem(key)]));
}, { speakingKey, useKey, oldEnglishKey, journalKey });
const speechLog = page => page.evaluate(() => ({
  utterances: window.__englishReviewAudit.utterances,
  cancellations: window.__englishReviewAudit.cancellations,
  lateCallbacks: window.__englishReviewAudit.lateCallbacks,
  active: window.__englishReviewAudit.active !== null,
  microphoneCalls: window.__englishReviewAudit.microphoneCalls,
}));
const questionElement = page => page.locator(`${reviewScope}[data-review-lesson-id], ${reviewScope} [data-review-lesson-id]`).first();

async function assertFirstViewport(locator, message) {
  await locator.page().evaluate(() => scrollTo(0, 0));
  const geometry = await locator.evaluate(element => {
    const box = element.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, width: innerWidth, height: innerHeight };
  });
  assert(geometry.top >= 0 && geometry.bottom <= geometry.height && geometry.left >= 0 && geometry.right <= geometry.width, `${message}: ${JSON.stringify(geometry)}`);
  return geometry;
}

async function expectQuestion(page, lesson, draft = "", model = false) {
  const root = page.locator(reviewScope);
  await expect(root).toBeVisible();
  await expect(questionElement(page)).toHaveAttribute("data-review-lesson-id", lesson.id);
  await expect(root.locator("[data-review-cue]")).toContainText(lesson.cue);
  await expect(root.locator("#english-review-answer")).toHaveValue(draft);
  await expect(root.locator("[data-review-next]")).toHaveCount(0);
  await expect(root.locator("[data-review-finished]")).toHaveCount(0);
  if (model) {
    await expect(root.locator("[data-review-expression]")).toHaveText(lesson.en);
    await expect(root.locator("[data-review-expression]")).toHaveAttribute("lang", "en-US");
  } else {
    await expect(root.locator("[data-review-expression]")).toHaveCount(0);
    // The Portuguese cue and visible text must not disclose the expected answer.
    assert(!new RegExp(`\\b${lesson.en}\\b`, "i").test(await root.innerText()), `Question reveals English answer ${lesson.en}`);
  }
}

async function earnParticipation(page, ids, onFirst) {
  const spoken = page.locator(spokenScope);
  await spoken.locator("[data-speaking-text-mode]").first().click();
  for (const [index, id] of ids.entries()) {
    await spoken.locator("#speaking-item").selectOption(id);
    await expect(spoken.locator("[data-speaking-complete]")).toBeEnabled();
    await spoken.locator("[data-speaking-complete]").click();
    await expect.poll(async () => (await readSave(page, speakingKey))?.completed.includes(id)).toBe(true);
    if (index === 0) await onFirst?.();
  }
}

await mkdir(output, { recursive: true });
const reports = [];
// Profiles deliberately run in series to fit the local 6 GB development machine.
for (const profile of profiles) {
  const report = { profile: profile.name, url, status: "running", checks: [], captures: [], accessibility: [], errors: [], forbiddenRequests: [], speech: [], startedAt: new Date().toISOString() };
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
    const root = page.locator(reviewScope);
    await expect(root).toBeVisible();
    await expect.poll(() => root.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), { timeout: 30_000, message: `${profile.name}/${label}: images must load before capture` }).toBe(true);
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
    const axe = await new AxeBuilder({ page }).include(reviewScope).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const violations = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) }));
    report.accessibility.push({ label, violations, geometry });
    assert.deepEqual(violations, [], `${profile.name}/${label}: Axe`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${output}/${profile.name}-${label}.png`, fullPage: true });
    await page.screenshot({ path: `${output}/${profile.name}-${label}-viewport.png` });
    report.captures.push(label);
  };
  const assertCorrect = async (lesson, index, helped) => {
    const root = page.locator(reviewScope);
    await expect(root.locator("[data-review-next]")).toBeEnabled();
    await expect(root.locator("[data-review-expression]")).toHaveText(lesson.en);
    await expect.poll(async () => (await readSave(page))?.session?.results[index]).toEqual({ lessonId: lesson.id, helped });
    const save = await readSave(page);
    assert.equal(save.session.cursor, index, "Correct answers wait for the explicit Next action");
    assert.equal(save.history[lesson.id].reviews, 1);
    assert.equal(save.history[lesson.id].helped, helped ? 1 : 0);
    return save;
  };

  try {
    context = await browser.newContext({ ...profile.options, reducedMotion: "reduce" });
    await installSpeech(context);
    page = await context.newPage();
    observe(page);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const spoken = page.locator(spokenScope);
    await expect(spoken).toBeVisible({ timeout: 90_000 });
    await expect(spoken.locator("#speaking-item")).toHaveValue("word-file");
    await expect(spoken.locator("[data-speaking-start]")).toBeEnabled({ timeout: 90_000 });
    await expect(page.locator("[data-speaking-review-open]")).toHaveCount(0);
    assert.equal(await readRaw(page, reviewKey), null);
    assert.deepEqual((await speechLog(page)).utterances, []);
    report.checks.push("Review entry is absent before a manually declared speaking participation; review never starts automatically");

    // Fixtures are unfinished legacy activities only. New speaking/review completions are never seeded.
    await page.evaluate(({ oldEnglishKey, journalKey }) => {
      localStorage.setItem(oldEnglishKey, JSON.stringify({ version: 1, current: 0, completed: [], finished: false, draft: "" }));
      localStorage.setItem(journalKey, JSON.stringify({ version: 1, activities: {} }));
    }, { oldEnglishKey, journalKey });

    checkpoint = "earn-four-participations";
    await earnParticipation(page, lessons.map(lesson => lesson.id), async () => {
      await expect(page.locator("[data-speaking-review-open]")).toBeVisible();
    });
    const participation = await readSave(page, speakingKey);
    assert.deepEqual(participation.completed, lessons.map(lesson => lesson.id));
    assert(lessons.every(lesson => participation.attempts[lesson.id] === 1));
    report.checks.push("Four existing terms earn participation through guided text UI; the quiet review entry appears after the first");

    checkpoint = "cancel-speech-on-review";
    await spoken.locator("[data-speaking-voice-mode]").click();
    await spoken.locator("[data-speaking-start]").click();
    await expect(spoken).toHaveAttribute("data-speaking-phase", "meaning");
    await expect.poll(async () => (await speechLog(page)).utterances.length).toBe(1);
    const protectedBefore = await protectedStorage(page);
    await page.locator("[data-speaking-review-open]").click();
    await expect(page.locator(reviewScope)).toBeVisible();
    await expect(page.locator(spokenScope)).toHaveCount(0);
    await expect.poll(async () => (await speechLog(page)).lateCallbacks).toBe(1);
    const canceledSpeech = await speechLog(page);
    assert.equal(canceledSpeech.active, false);
    assert.equal(canceledSpeech.utterances.length, 1, "Late callbacks cannot restart canceled speech");
    assert.equal(canceledSpeech.utterances[0].canceled, true);
    assert.equal(canceledSpeech.microphoneCalls, 0);
    report.speech.push({ stage: "review-open", ...canceledSpeech });
    assert.deepEqual(await protectedStorage(page), protectedBefore);
    report.checks.push("Opening review cancels held speech; queued end/error callbacks cannot resume audio or alter participation");

    checkpoint = "question";
    await expect.poll(async () => (await readSave(page))?.session?.ids.length).toBe(3);
    const initial = await readSave(page);
    assert.equal(initial.active, true);
    assert.equal(initial.version, 1);
    const queue = initial.session.ids;
    assert.equal(new Set(queue).size, 3);
    assert(queue.every(id => participation.completed.includes(id)));
    assert.equal(initial.session.cursor, 0);
    assert.deepEqual(initial.session.results, []);
    assert.deepEqual(initial.history, {});
    const [first, second, third] = queue.map(lessonFor);
    const fourth = lessons.find(lesson => !queue.includes(lesson.id));
    assert(fourth);
    report.queue = queue;
    const root = page.locator(reviewScope);
    const input = root.locator("#english-review-answer");
    const submit = root.locator("[data-review-submit]");
    await expectQuestion(page, first);
    report.firstViewport = {
      input: await assertFirstViewport(input, `${profile.name}: recall input must fit the first viewport`),
      submit: await assertFirstViewport(submit, `${profile.name}: recall submit must fit the first viewport`),
    };
    await capture("question");
    report.checks.push("A unique three-item queue uses only four UI-earned terms; Portuguese cue, input and submit appear before any English answer, within the first viewport");

    checkpoint = "wrong-answer";
    await input.fill("minha resposta incorreta");
    await input.press("Enter");
    await expectQuestion(page, first, "minha resposta incorreta");
    const wrong = await readSave(page);
    assert.deepEqual(wrong.history, initial.history);
    assert.deepEqual(wrong.session.results, []);
    assert.equal(wrong.session.cursor, 0);
    await capture("wrong");
    report.checks.push("Enter submits an incorrect draft without revealing the answer, completing the item, advancing or changing review history");

    checkpoint = "normalized-correct";
    await input.fill(`  ${first.en.toUpperCase()}.  `);
    await input.press("Enter");
    await assertCorrect(first, 0, false);
    await expect(submit).toHaveCount(0);
    await expect(input).not.toBeFocused();
    await capture("correct");
    await expect(root.locator("[data-review-finished]")).toHaveCount(0);
    await root.locator("[data-review-next]").click();
    await expectQuestion(page, second);
    report.checks.push("Case, surrounding whitespace and final punctuation normalize correctly; Enter submits the input, then it loses DOM focus, submit disappears and Next remains explicit (physical mobile keyboard behavior is not simulated)");

    checkpoint = "draft-reload-home";
    const draft = "  minha tentativa exata  ";
    await input.fill(draft);
    await expect.poll(async () => (await readSave(page))?.session?.draft).toBe(draft);
    const draftSave = await readSave(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectQuestion(page, second, draft);
    assert.deepEqual(await readSave(page), draftSave);
    assert.deepEqual((await speechLog(page)).utterances, []);
    await page.goto(`${base}/dev/academy-preview?view=home`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const continuation = page.locator("[data-academy-continue]");
    const resume = continuation.getByRole("link", { name: "Retomar atividade", exact: true });
    await expect(resume).toHaveAttribute("href", "/dev/academy-preview?activity=english#falar");
    await expect(continuation).toContainText("Revisão curta de inglês");
    await expect(continuation).toContainText(second.cue);
    assert(!new RegExp(`\\b${second.en}\\b`, "i").test(await continuation.innerText()), "Home must not leak the recall answer");
    await resume.click();
    await expectQuestion(page, second, draft);
    assert.deepEqual((await readSave(page)).session, draftSave.session);
    assert.deepEqual((await speechLog(page)).utterances, []);
    report.checks.push("Exact draft and queue survive reload and Home continuation; both show the Portuguese recall cue without the English answer or automatic speech");

    checkpoint = "model-on-request";
    const beforeModel = await readSave(page);
    await root.locator("[data-review-model]").click();
    await expectQuestion(page, second, draft, true);
    const modelGeometry = await root.locator("[data-review-expression]").evaluate(expression => ({
      modelBottom: expression.getBoundingClientRect().bottom,
      inputTop: document.querySelector("#english-review-answer").getBoundingClientRect().top,
    }));
    assert(modelGeometry.modelBottom <= modelGeometry.inputTop, `The requested model must precede the input visually: ${JSON.stringify(modelGeometry)}`);
    report.modelGeometry = modelGeometry;
    const modeled = await readSave(page);
    assert.deepEqual(modeled.history, beforeModel.history);
    assert.deepEqual(modeled.session.results, beforeModel.session.results);
    assert.equal(modeled.session.draft, draft, "Consulting the model must never prefill the answer");
    assert.notDeepEqual(modeled.session.consulted, beforeModel.session.consulted, "Model consultation must persist");
    await capture("model");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectQuestion(page, second, draft, true);
    assert.deepEqual((await readSave(page)).session, modeled.session);
    await input.press("Enter");
    await expect(root.locator("[data-review-next]")).toHaveCount(0);
    assert.deepEqual((await readSave(page)).history, beforeModel.history);
    await input.fill(second.en);
    await submit.click();
    await assertCorrect(second, 1, true);
    await root.locator("[data-review-next]").click();
    await expectQuestion(page, third);
    report.checks.push("Only an explicit model request reveals English; it neither prefills nor completes, survives reload with the exact draft, and marks a later correct answer as helped");

    checkpoint = "finish-three-items";
    await input.fill(third.en);
    await input.press("Enter");
    const thirdCorrect = await assertCorrect(third, 2, false);
    assert.deepEqual(thirdCorrect.session.results, [
      { lessonId: first.id, helped: false },
      { lessonId: second.id, helped: true },
      { lessonId: third.id, helped: false },
    ]);
    await expect(root.locator("[data-review-finished]")).toHaveCount(0);
    await root.locator("[data-review-next]").click();
    await expect(root.locator("[data-review-finished]")).toBeVisible();
    await expect(root.locator("[data-review-without-model]")).toContainText("2");
    await expect(root.locator("[data-review-with-model]")).toContainText("1");
    assert.deepEqual((await readSave(page)).history, thirdCorrect.history);
    assert.deepEqual(await protectedStorage(page), protectedBefore);
    await capture("finish");
    report.results = thirdCorrect.session.results;
    report.checks.push("Three items complete entirely through UI and explicit Next; summary separates two answers without a model and one with a model, without XP or legacy progress changes");

    checkpoint = "rotation-and-close";
    await root.locator("[data-review-again]").click();
    await expectQuestion(page, fourth);
    const rotated = await readSave(page);
    assert.equal(rotated.session.ids.length, 3);
    assert.equal(new Set(rotated.session.ids).size, 3);
    assert.equal(rotated.session.ids[0], fourth.id, "The never-reviewed eligible term takes priority in the next round");
    assert.notDeepEqual(rotated.session.ids, queue);
    assert.deepEqual(rotated.history, thirdCorrect.history);
    await root.locator("[data-review-close]").click();
    await expect(spoken).toBeVisible();
    await expect(root).toHaveCount(0);
    const closed = await readSave(page);
    assert.equal(closed.active, false);
    assert.deepEqual(closed.session, rotated.session);
    assert.deepEqual(closed.history, rotated.history);
    assert.deepEqual(await protectedStorage(page), protectedBefore);
    await page.locator("[data-speaking-review-open]").click();
    await expectQuestion(page, fourth);
    assert.deepEqual((await readSave(page)).session, rotated.session, "Reopening resumes the unfinished round instead of rotating again");
    await root.locator("[data-review-close]").click();
    assert.deepEqual(await protectedStorage(page), protectedBefore);
    assert.equal(await readRaw(page, typedKey("english-review", "another-preview-account")), null);
    assert.equal(await readRaw(page, typedKey("english-review", 42)), null);
    report.secondQueue = rotated.session.ids;
    report.speech.push({ stage: "round-complete", ...await speechLog(page) });
    assert.equal((await speechLog(page)).microphoneCalls, 0);
    report.checks.push("The next unique queue starts with the fourth, never-reviewed term; closing preserves all saves and reopening resumes that exact unfinished round");
    report.checks.push("Typed account key is used and foreign string/numeric keys remain absent; this fixed-account preview does not simulate replacing the authenticated user");
    await context.close();

    checkpoint = "without-speech-api";
    context = await browser.newContext({ ...profile.options, reducedMotion: "reduce" });
    await installSpeech(context, false);
    page = await context.newPage();
    observe(page);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await expect(page.locator(spokenScope)).toBeVisible({ timeout: 90_000 });
    await expect(page.locator("[data-speaking-review-open]")).toHaveCount(0);
    await earnParticipation(page, ["word-file"]);
    const fallbackProtected = await protectedStorage(page);
    await page.locator("[data-speaking-review-open]").click();
    await expectQuestion(page, lessons[0]);
    assert.deepEqual((await readSave(page)).session.ids, ["word-file"]);
    await capture("without-speech-api");
    await page.locator(`${reviewScope} #english-review-answer`).fill("file");
    await page.locator(`${reviewScope} #english-review-answer`).press("Enter");
    await expect(page.locator(`${reviewScope} [data-review-next]`)).toBeEnabled();
    await page.locator(`${reviewScope} [data-review-next]`).click();
    await expect(page.locator(`${reviewScope} [data-review-finished]`)).toBeVisible();
    await expect(page.locator(`${reviewScope} [data-review-without-model]`)).toContainText("1");
    await expect(page.locator(`${reviewScope} [data-review-with-model]`)).toContainText("0");
    assert.deepEqual(await protectedStorage(page), fallbackProtected);
    const fallbackSpeech = await speechLog(page);
    assert.deepEqual(fallbackSpeech.utterances, []);
    assert.equal(fallbackSpeech.microphoneCalls, 0);
    report.speech.push({ stage: "without-speech-api", ...fallbackSpeech });
    report.checks.push("Without speech APIs, one UI-earned participation yields a one-item written review and a correct summary, with no audio or microphone request");

    if (profile.name === "desktop") {
      checkpoint = "storage-unavailable";
      await context.close();
      context = await browser.newContext({ ...profile.options, reducedMotion: "reduce" });
      await installSpeech(context);
      await context.addInitScript(() => {
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          if (String(key).startsWith("orbitamos-")) throw new DOMException("Audit storage quota unavailable", "QuotaExceededError");
          return original.call(this, key, value);
        };
      });
      page = await context.newPage();
      observe(page);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
      const memorySpoken = page.locator(spokenScope);
      await expect(memorySpoken).toBeVisible({ timeout: 90_000 });
      await memorySpoken.locator("[data-speaking-text-mode]").first().click();
      await memorySpoken.locator("[data-speaking-complete]").click();
      await expect(memorySpoken.locator("progress")).toHaveAttribute("value", "1");
      await expect(memorySpoken).toContainText("Seu progresso está apenas nesta tela.");
      assert.equal(await readRaw(page, speakingKey), null);
      await memorySpoken.locator("[data-speaking-use-open]").click();
      const memoryUse = page.locator("[data-english-use-check]");
      await expect(memoryUse).toHaveAttribute("data-use-lesson-id", "word-file");
      await memoryUse.locator("[data-use-choice='main-js']").click();
      await expect(memoryUse.locator("[data-use-meaning]")).toHaveAttribute("data-correct", "true");
      await expect(memoryUse).toContainText("NO CONTEXTO · 1/12");
      assert.equal(await readRaw(page, useKey), null);
      await memoryUse.locator("[data-use-back]").click();
      await page.locator("[data-speaking-review-open]").click();
      await expectQuestion(page, lessons[0]);
      await expect(page.locator(reviewScope).getByRole("alert")).toHaveText("O navegador não conseguiu guardar esta revisão. Ela está apenas nesta tela.");
      await page.locator(`${reviewScope} #english-review-answer`).fill("file");
      await page.locator(`${reviewScope} [data-review-submit]`).click();
      await expect(page.locator(`${reviewScope} [data-review-next]`)).toBeEnabled();
      await page.locator(`${reviewScope} [data-review-next]`).click();
      await expect(page.locator(`${reviewScope} [data-review-finished]`)).toBeVisible();
      await expect(page.locator(`${reviewScope} [data-review-without-model]`)).toContainText("1");
      assert.equal(await readRaw(page, reviewKey), null);
      await page.locator(`${reviewScope} [data-review-close]`).click();
      await expect(memorySpoken).toBeVisible();
      await expect(memorySpoken.locator("progress")).toHaveAttribute("value", "1");
      await expect(memorySpoken).toContainText("O navegador não conseguiu salvar. Seu progresso está apenas nesta tela.");
      await expect(page.locator("[data-speaking-review-open]")).toBeVisible();
      await memorySpoken.locator("[data-speaking-use-open]").click();
      await expect(memoryUse).toContainText("NO CONTEXTO · 1/12");
      await expect(memorySpoken.getByRole("alert")).toHaveText("Não foi possível salvar esta situação. O registro está apenas nesta tela.");
      await memoryUse.locator("[data-use-back]").click();
      // Reopen within the same mounted workshop; never reload and claim failed writes persisted.
      await page.locator("[data-speaking-review-open]").click();
      await expectQuestion(page, lessons[0]);
      assert.equal(await readRaw(page, speakingKey), null);
      assert.equal(await readRaw(page, useKey), null);
      assert.equal(await readRaw(page, reviewKey), null);
      const memorySpeech = await speechLog(page);
      assert.deepEqual(memorySpeech.utterances, []);
      assert.equal(memorySpeech.microphoneCalls, 0);
      report.speech.push({ stage: "storage-unavailable", ...memorySpeech });
      report.checks.push("Desktop quota failure: speaking participation and a correct contextual choice are earned through UI; review completes with a visible warning, then closing retains both source ledgers and another review can open, without a reload or persistence claim");
    }

    assert.deepEqual(report.forbiddenRequests, [], "No RPC, speech-service API or external write requests");
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
