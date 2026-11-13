import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = (process.env.SPOKEN_ENGLISH_BASE_URL || "http://localhost:3015").replace(/\/$/, "");
const url = process.env.SPOKEN_ENGLISH_URL || `${base}/dev/academy-preview?activity=english#falar`;
const output = resolve("test-results/spoken-english");
const account = "academy-preview";
const speakingKey = id => `orbitamos-english-speaking-v1-s-${encodeURIComponent(JSON.stringify(id))}`;
const saveKey = speakingKey(account);
const oldEnglishKey = `orbitamos-english-v1-${account}`;
const journalKey = `orbitamos-practice-journal-v1-${account}`;
const scope = "[data-spoken-english]";
const profileArg = process.argv.slice(2).find(value => !value.startsWith("--")) || process.env.SPOKEN_ENGLISH_PROFILE;
const profiles = [
  { name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } },
  { name: "iphone", engine: webkit, options: devices["iPhone 13"] },
  { name: "small", engine: chromium, options: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } },
].filter(profile => !profileArg || profileArg === profile.name);
assert(profiles.length, "Use desktop, iphone ou small como argumento opcional.");
await mkdir(output, { recursive: true });

/** Only browser speech capabilities are simulated. Application state and timers stay real. */
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
    const audit = {
      mode: "success",
      utterances: [],
      cancellations: 0,
      lateCallbacks: 0,
      active: null,
      reset() { this.utterances = []; this.cancellations = 0; this.lateCallbacks = 0; },
      finish() {
        const active = this.active;
        if (!active) return;
        clearTimeout(active.timer);
        this.active = null;
        active.entry.ended = true;
        active.utterance.onend?.(new Event("end"));
      },
    };
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
        const entry = { text: utterance.text, lang: utterance.lang, rate: utterance.rate, voiceURI: utterance.voice?.voiceURI ?? null, ended: false, canceled: false };
        audit.utterances.push(entry);
        const active = { utterance, entry, timer: null, onend: utterance.onend, onerror: utterance.onerror };
        audit.active = active;
        utterance.onstart?.(new Event("start"));
        if (audit.mode === "hold") return;
        active.timer = setTimeout(() => {
          if (audit.active !== active) return;
          if (audit.mode === "error") {
            audit.active = null;
            const event = new Event("error");
            Object.defineProperty(event, "error", { value: "synthesis-failed" });
            utterance.onerror?.(event);
          } else audit.finish();
        }, 20);
      },
      cancel() {
        audit.cancellations += 1;
        const active = audit.active;
        if (!active) return;
        clearTimeout(active.timer);
        audit.active = null;
        active.entry.canceled = true;
        // A queued browser callback can arrive after cancellation and listener cleanup.
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
    window.__spokenAudit = audit;
  }, { available });
}

const readSave = page => page.evaluate(key => JSON.parse(localStorage.getItem(key) || "null"), saveKey);
const readLog = page => page.evaluate(() => window.__spokenAudit.utterances);
const setSpeech = (page, mode, reset = true) => page.evaluate(({ mode, reset }) => {
  window.__spokenAudit.mode = mode;
  if (reset) window.__spokenAudit.reset();
}, { mode, reset });
const protectedStorage = page => page.evaluate(({ oldEnglishKey, journalKey }) => {
  const keys = new Set([oldEnglishKey, journalKey, ...Object.keys(localStorage).filter(key => /(?:^orbitamos-english-v1-|^orbitamos-practice-journal-|xp)/i.test(key))]);
  return Object.fromEntries([...keys].sort().map(key => [key, localStorage.getItem(key)]));
}, { oldEnglishKey, journalKey });

const reports = [];
for (const profile of profiles) {
  const report = { profile: profile.name, url, status: "running", checks: [], captures: [], accessibility: [], errors: [], forbiddenRequests: [], speech: {}, startedAt: new Date().toISOString() };
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
      if (/\/rest\/v1\/rpc\//.test(address) || speechEndpoint || externalWrite) {
        report.forbiddenRequests.push({ method: request.method(), url: address });
      }
    });
  };
  const capture = async label => {
    await expect(page.locator(scope)).toBeVisible();
    await expect.poll(() => page.locator(`${scope} img`).evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), { timeout: 30_000, message: `${profile.name}/${label}: contextual images must load before capture` }).toBe(true);
    const geometry = await page.locator(scope).evaluate(element => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      left: element.getBoundingClientRect().left,
      right: element.getBoundingClientRect().right,
    }));
    assert(geometry.document <= geometry.viewport + 1 && geometry.body <= geometry.viewport + 1 && geometry.left >= -1 && geometry.right <= geometry.viewport + 1, `${profile.name}/${label}: horizontal overflow`);
    const axe = await new AxeBuilder({ page }).include(scope).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const violations = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) }));
    report.accessibility.push({ label, violations });
    assert.deepEqual(violations, [], `${profile.name}/${label}: Axe`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${output}/${profile.name}-${label}.png`, fullPage: true });
    await page.screenshot({ path: `${output}/${profile.name}-${label}-viewport.png` });
    report.captures.push(label);
  };

  try {
    context = await browser.newContext({ ...profile.options, reducedMotion: "reduce" });
    await installSpeech(context);
    page = await context.newPage();
    observe(page);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const root = page.locator(scope);
    const item = root.locator("#speaking-item");
    const start = root.locator("[data-speaking-start]");
    const stop = root.locator("[data-speaking-stop]");
    const complete = root.locator("[data-speaking-complete]");
    await expect(root).toBeVisible({ timeout: 90_000 });
    await expect(start).toBeEnabled({ timeout: 90_000 });
    await expect.poll(() => root.locator("img").evaluateAll(images => images.length > 0 && images.every(image => image.complete && image.naturalWidth > 0)), { timeout: 45_000, message: "The actual Orbi image must finish loading before starting speech" }).toBe(true);
    await expect(item).toHaveValue("word-file");
    const lessonIds = await item.locator("option").evaluateAll(options => options.map(option => option.value));
    assert.equal(lessonIds.length, 12);
    assert.equal(lessonIds.filter(id => id.startsWith("word-")).length, 6);
    assert.equal(lessonIds.filter(id => id.startsWith("phrase-")).length, 6);
    assert.equal(new Set(lessonIds).size, 12);
    assert.deepEqual(await readLog(page), []);
    await expect(complete).toBeDisabled();
    await expect(root.locator("[data-speaking-english]")).toHaveText("…");
    report.checks.push("12 selectable lessons: six words and six phrases; no automatic speech or completion");
    await page.evaluate(() => scrollTo(0, 0));
    const playbackGeometry = await start.evaluate(button => ({
      top: button.getBoundingClientRect().top,
      bottom: button.getBoundingClientRect().bottom,
      left: button.getBoundingClientRect().left,
      right: button.getBoundingClientRect().right,
      width: innerWidth,
      height: innerHeight,
    }));
    assert(playbackGeometry.top >= 0 && playbackGeometry.bottom <= playbackGeometry.height && playbackGeometry.left >= 0 && playbackGeometry.right <= playbackGeometry.width, `${profile.name}: initial playback must fit in the first viewport: ${JSON.stringify(playbackGeometry)}`);
    report.playbackGeometry = playbackGeometry;
    report.checks.push("The initial playback action is visible in the first viewport without scrolling");
    await capture("idle");

    // Unfinished fixtures belong only to the pre-existing reading activity and journal.
    // New speaking achievements are always earned through this UI, never seeded.
    await page.evaluate(({ oldEnglishKey, journalKey }) => {
      localStorage.setItem(oldEnglishKey, JSON.stringify({ version: 1, current: 0, completed: [], finished: false, draft: "" }));
      localStorage.setItem(journalKey, JSON.stringify({ version: 1, activities: {} }));
    }, { oldEnglishKey, journalKey });
    const protectedBefore = await protectedStorage(page);

    checkpoint = "word-script";
    await setSpeech(page, "hold");
    await start.click();
    await expect(root).toHaveAttribute("data-speaking-phase", "meaning");
    await expect(root.locator("[data-speaking-english]")).toHaveText("…");
    await expect(complete).toBeDisabled();
    await capture("meaning");
    await page.evaluate(() => window.__spokenAudit.finish());
    await expect.poll(async () => (await readLog(page)).length).toBe(2);
    await expect(root).toHaveAttribute("data-speaking-phase", "model");
    await expect(root.locator("[data-speaking-english]")).toHaveText("file");
    await capture("model");
    for (let count = 2; count < 5; count += 1) {
      await page.evaluate(() => window.__spokenAudit.finish());
      await expect.poll(async () => (await readLog(page)).length).toBe(count + 1);
    }
    await page.evaluate(() => window.__spokenAudit.finish());
    await expect(root).toHaveAttribute("data-speaking-phase", "your-turn");
    await expect(complete).toBeEnabled();
    const wordLog = await readLog(page);
    assert.deepEqual(wordLog.map(part => part.lang), ["pt-BR", "en-US", "pt-BR", "en-US", "pt-BR"]);
    assert.deepEqual(wordLog.map(part => part.text), ["Como se diz arquivo em inglês?", "file", "Agora repita comigo.", "file", "Agora tente sozinho."]);
    assert.deepEqual((await readSave(page))?.completed ?? [], []);
    await capture("your-turn");
    await complete.click();
    await expect.poll(async () => (await readSave(page))?.completed).toEqual(["word-file"]);
    await expect(complete).toBeDisabled();
    report.speech.word = wordLog;
    report.checks.push("Portuguese question, one English model, repetition together and an independent turn; completion requires manual participation confirmation");

    checkpoint = "stop-and-selection";
    await item.selectOption("word-folder");
    await setSpeech(page, "hold");
    await start.click();
    await expect.poll(async () => (await readLog(page)).length).toBe(1);
    await stop.click();
    await expect.poll(() => page.evaluate(() => window.__spokenAudit.lateCallbacks)).toBe(1);
    await expect(complete).toBeDisabled();
    assert.deepEqual((await readSave(page)).completed, ["word-file"]);
    await setSpeech(page, "hold");
    await start.click();
    await expect.poll(async () => (await readLog(page)).length).toBe(1);
    await item.selectOption("phrase-open-the-file");
    await expect.poll(() => page.evaluate(() => window.__spokenAudit.lateCallbacks)).toBe(1);
    await expect(complete).toBeDisabled();
    await expect(root).toHaveAttribute("data-speaking-lesson-id", "phrase-open-the-file");
    report.checks.push("Stop and lesson changes cancel active speech; stale queued end/error callbacks cannot unlock completion");

    checkpoint = "phrase-script";
    const settings = root.locator("details").filter({ hasText: "Voz e ritmo" });
    if (await settings.getAttribute("open") === null) await settings.locator("summary").click();
    await root.locator("#speaking-rate").selectOption("0.75");
    await root.locator("#speaking-voice").selectOption("audit-en-US");
    await setSpeech(page, "success");
    await start.click();
    await expect(complete).toBeEnabled({ timeout: 20_000 });
    const phraseLog = await readLog(page);
    assert.equal(phraseLog.length, 5);
    assert.deepEqual(phraseLog.map(part => part.lang), wordLog.map(part => part.lang));
    assert.deepEqual(phraseLog.filter(part => part.lang === "en-US").map(part => part.text), ["Open the file", "Open the file"]);
    assert.equal(phraseLog[0].text, "Como se diz Abra o arquivo em inglês?");
    assert(phraseLog.every(part => part.rate === 0.75));
    assert(phraseLog.every(part => part.voiceURI === (part.lang === "pt-BR" ? "audit-pt-BR" : "audit-en-US")));
    await complete.click();
    await expect.poll(async () => (await readSave(page))?.completed.length).toBe(2);
    report.speech.phrase = phraseLog;
    report.checks.push("Multiword phrases preserve case, language, local voice selection and speed 0.75 across all five segments (two English, three Portuguese)");

    checkpoint = "reload-and-home";
    const beforeReload = await readSave(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(item).toHaveValue("phrase-open-the-file");
    await expect(start).toBeEnabled();
    await expect(complete).toBeDisabled();
    assert.deepEqual(await readSave(page), beforeReload);
    assert.deepEqual(await readLog(page), []);
    await page.goto(`${base}/dev/academy-preview?view=home`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const continuation = page.locator("[data-academy-continue]");
    const resume = continuation.getByRole("link", { name: "Retomar atividade", exact: true });
    await expect(resume).toHaveAttribute("href", "/dev/academy-preview?activity=english#falar");
    await resume.click();
    await expect(item).toHaveValue("phrase-open-the-file");
    assert.deepEqual(await readLog(page), []);
    report.checks.push("Reload restores cursor and achievements without replay; Home resumes the exact #falar route");

    checkpoint = "voice-error-and-mode";
    await item.selectOption("word-error");
    await setSpeech(page, "error");
    await start.click();
    await expect(root.getByRole("alert")).toBeVisible();
    await expect(complete).toBeDisabled();
    assert(!((await readSave(page)).completed.includes("word-error")));
    await capture("voice-error");
    await item.selectOption("word-run");
    await setSpeech(page, "hold");
    await start.click();
    await expect.poll(async () => (await readLog(page)).length).toBe(1);
    const beforeText = await readSave(page);
    await root.locator("[data-speaking-text-mode]").click();
    await expect(root).toHaveAttribute("data-speaking-mode", "text");
    await expect.poll(() => page.evaluate(() => window.__spokenAudit.lateCallbacks)).toBe(1);
    await expect(complete).toBeEnabled();
    assert.deepEqual((await readSave(page)).completed, beforeText.completed);
    await root.locator("[data-speaking-voice-mode]").click();
    await expect(root).toHaveAttribute("data-speaking-mode", "voice");
    await expect(complete).toBeDisabled();
    report.checks.push("Voice errors never declare practice; switching to guided text cancels speech and still requires a separate confirmation");

    checkpoint = "all-lessons-manual";
    await root.locator("[data-speaking-text-mode]").click();
    for (const id of lessonIds) {
      if ((await readSave(page)).completed.includes(id)) continue;
      await item.selectOption(id);
      await expect(complete).toBeEnabled();
      await complete.click();
      await expect.poll(async () => (await readSave(page))?.completed.includes(id)).toBe(true);
    }
    const finished = await readSave(page);
    assert.equal(finished.completed.length, 12);
    assert.deepEqual(Object.keys(finished).sort(), ["attempts", "completed", "current", "version"]);
    assert(Object.values(finished.attempts).every(count => count === 1));
    await expect(root.getByRole("heading", { name: "Você praticou palavras e frases de código.", exact: true })).toBeVisible();
    await expect(root.getByRole("link", { name: "Praticar com imagens e código", exact: true })).toHaveAttribute("href", "#");
    await expect(root).toContainText("Este registro é de prática declarada.");
    await expect(root).toContainText("Não é uma nota automática de pronúncia.");
    await capture("all-practiced");
    assert.equal(await page.evaluate(key => localStorage.getItem(key), speakingKey("another-preview-account")), null);
    assert.deepEqual(await protectedStorage(page), protectedBefore);
    report.checks.push("All 12 lessons practiced through guided text UI; save records participation only; another account key, old reading save, journal and XP storage remain untouched");
    report.checks.push("Browser account scope covers the written key and an untouched foreign key; actual userId replacement is not exercised by this fixed-account preview");

    if (profile.name === "desktop") {
      checkpoint = "cross-tab-interruption";
      // Reuse the 12 UI-earned achievements; no speaking save is seeded or copied.
      const listener = await context.newPage();
      const writer = await context.newPage();
      observe(listener);
      observe(writer);
      try {
        await listener.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
        await writer.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
        const listenerRoot = listener.locator(scope);
        const writerRoot = writer.locator(scope);
        await writerRoot.getByRole("button", { name: "Repetir a prática", exact: true }).click();
        await writerRoot.locator("[data-speaking-text-mode]").click();
        await listenerRoot.getByRole("button", { name: "Repetir a prática", exact: true }).click();
        await listener.bringToFront();
        await setSpeech(listener, "hold");
        await listenerRoot.locator("[data-speaking-start]").click();
        await expect.poll(async () => (await readLog(listener)).length).toBe(1);
        await expect(listenerRoot.locator("[data-speaking-stop]")).toBeVisible();
        const beforePeerConfirmation = await readSave(writer);
        await writerRoot.locator("[data-speaking-complete]").click();
        await expect.poll(async () => (await readSave(writer))?.attempts["word-file"]).toBe(beforePeerConfirmation.attempts["word-file"] + 1);
        await expect.poll(() => listener.evaluate(() => window.__spokenAudit.lateCallbacks)).toBe(1);
        await expect(listenerRoot).toHaveAttribute("data-speaking-phase", "idle");
        await expect(listenerRoot.locator("[data-speaking-stop]")).toHaveCount(0);
        await expect(listenerRoot.locator("[data-speaking-start]")).toBeEnabled();
        await expect(listenerRoot.locator("[data-speaking-complete]")).toBeDisabled();
        assert.equal(await listener.evaluate(() => window.__spokenAudit.active), null);
        assert.equal((await readSave(listener)).completed.length, 12);
        const listenerVisibility = await listener.evaluate(() => document.visibilityState);
        report.speech.crossTab = { listenerVisibility, canceled: (await readLog(listener))[0].canceled, lateCallbacks: 1, completed: 12 };
        assert.equal(report.speech.crossTab.canceled, true);
        report.checks.push(listenerVisibility === "visible"
          ? "An active visible tab cancels speech when another tab confirms a repeat with all 12 UI-earned achievements; late callbacks cannot restart it"
          : "Cross-tab repeat preserves all 12 achievements and speech stays canceled; browser backgrounding prevents isolating storage cancellation from visibility cancellation");
      } finally {
        await writer.close();
        await listener.close();
      }
      await page.bringToFront();
    }

    checkpoint = "legacy-link";
    await root.getByRole("link", { name: "Praticar com imagens e código", exact: true }).click();
    await expect(page.locator("[data-code-english]")).toBeVisible();
    assert.deepEqual(await protectedStorage(page), protectedBefore);
    report.checks.push("Final link opens the existing image/code English activity without modifying its save");
    await context.close();

    checkpoint = "no-speech-api";
    context = await browser.newContext({ ...profile.options, reducedMotion: "reduce" });
    await installSpeech(context, false);
    page = await context.newPage();
    observe(page);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const fallback = page.locator(scope);
    await expect(fallback).toBeVisible({ timeout: 90_000 });
    await fallback.locator("[data-speaking-text-mode]").click();
    await expect(fallback).toHaveAttribute("data-speaking-mode", "text");
    const manual = fallback.locator("[data-speaking-complete]");
    await expect(manual).toBeEnabled();
    assert.deepEqual((await readSave(page))?.completed ?? [], []);
    await capture("without-speech-api");
    await manual.click();
    await expect.poll(async () => (await readSave(page))?.completed).toEqual(["word-file"]);
    report.checks.push("Speech API absent: guided text is usable and records only a manually declared practice");
    assert.deepEqual(report.forbiddenRequests, [], "No RPC, cloud speech service or external write requests");
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
