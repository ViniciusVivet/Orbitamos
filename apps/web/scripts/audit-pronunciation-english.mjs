import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = (process.env.ENGLISH_PRONUNCIATION_BASE_URL || "http://localhost:3015").replace(/\/$/, "");
const url = process.env.ENGLISH_PRONUNCIATION_URL || `${base}/dev/academy-preview?activity=english#falar`;
const output = resolve("test-results/english-pronunciation");
const requested = process.argv.slice(2).find(value => !value.startsWith("--"));
const profiles = [
  { name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } },
  { name: "iphone", engine: webkit, options: devices["iPhone 13"] },
  { name: "small", engine: chromium, options: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } },
].filter(profile => !requested || profile.name === requested);
assert(profiles.length, "Use desktop, iphone ou small como argumento opcional.");
const spokenScope = "[data-spoken-english]:not([data-english-review])";
const reviewScope = "[data-english-review]";
const eligibleKey = 'orbitamos-english-speaking-v1-s-%22academy-preview%22';
const oldKey = "orbitamos-english-v1-academy-preview";
const journalKey = "orbitamos-practice-journal-v1-academy-preview";
const lessons = [
  ["word-file", "file"], ["word-folder", "folder"], ["word-code", "code"],
  ["word-save", "save"], ["word-run", "run"], ["word-error", "error"],
  ["phrase-open-the-file", "Open the file"], ["phrase-save-the-file", "Save the file"],
  ["phrase-run-the-code", "Run the code"], ["phrase-fix-the-error", "Fix the error"],
  ["phrase-the-test-passed", "The test passed"], ["phrase-the-build-failed", "The build failed"],
];
await mkdir(output, { recursive: true });

/** Fake browser audio events only. All lesson, participation and review state uses the real UI. */
async function installSpeech(context, supported = true) {
  await context.addInitScript(({ supported }) => {
    if (!supported) {
      for (const name of ["speechSynthesis", "SpeechSynthesisUtterance"]) {
        for (let object = window; object; object = Object.getPrototypeOf(object)) {
          if (Object.getOwnPropertyDescriptor(object, name)?.configurable) delete object[name];
        }
        if (name in window) Object.defineProperty(window, name, { configurable: true, value: undefined });
      }
      return;
    }
    const events = new EventTarget();
    const voices = [
      { name: "Audit PT", lang: "pt-BR", voiceURI: "audit-pt", localService: true, default: true },
      { name: "Audit English", lang: "en-US", voiceURI: "audit-en", localService: true, default: false },
    ];
    const audit = {
      mode: "hold", utterances: [], active: null, cancellations: 0, lateCallbacks: 0,
      begin() { this.active?.utterance.onstart?.(new Event("start")); },
      finish() {
        const active = this.active;
        if (!active) return;
        clearTimeout(active.timer); this.active = null;
        active.utterance.onend?.(new Event("end"));
      },
    };
    class Utterance extends EventTarget {
      constructor(text = "") {
        super(); Object.assign(this, { text, lang: "", rate: 1, pitch: 1, volume: 1, voice: null, onstart: null, onend: null, onerror: null });
      }
    }
    const synth = {
      getVoices: () => voices,
      addEventListener: (...args) => events.addEventListener(...args),
      removeEventListener: (...args) => events.removeEventListener(...args),
      speak(utterance) {
        audit.utterances.push({ text: utterance.text, lang: utterance.lang });
        const active = { utterance, onstart: utterance.onstart, onend: utterance.onend, onerror: utterance.onerror, timer: null };
        audit.active = active;
        if (audit.mode === "auto") {
          utterance.onstart?.(new Event("start"));
          active.timer = setTimeout(() => audit.finish(), 25);
        }
      },
      cancel() {
        audit.cancellations++;
        const active = audit.active;
        if (!active) return;
        clearTimeout(active.timer); audit.active = null;
        setTimeout(() => {
          active.onstart?.(new Event("start"));
          active.onend?.(new Event("end"));
          const error = new Event("error"); Object.defineProperty(error, "error", { value: "interrupted" });
          active.onerror?.(error); audit.lateCallbacks++;
        }, 20);
      },
      pause() {}, resume() {},
    };
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: Utterance });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synth });
    window.__pronunciationAudit = audit;
  }, { supported });
}

const reports = [];
for (const profile of profiles) {
  const report = { profile: profile.name, status: "running", startedAt: new Date().toISOString(), checks: [], captures: [], accessibility: [], errors: [], forbiddenRequests: [] };
  reports.push(report);
  const browser = await profile.engine.launch({ headless: true });
  let context;
  let page;
  let checkpoint = "initial";
  function observe(target) {
    target.setDefaultTimeout(15_000);
    target.on("pageerror", error => report.errors.push(error.message));
    target.on("request", request => {
      const address = request.url();
      const remoteWrite = /^https?:/.test(address) && new URL(address).origin !== new URL(base).origin && !["GET", "HEAD", "OPTIONS"].includes(request.method());
      const speech = /\/(?:api\/)?(?:speech|tts|transcriptions|synthesize|synthesis)(?:\/|\?|$)|(?:speech|text-to-speech|transcriptions|elevenlabs|openai)\.[^/]+\//i.test(address);
      if (remoteWrite || speech || /\/rest\/v1\/rpc\//.test(address)) report.forbiddenRequests.push({ method: request.method(), url: address });
    });
  }
  async function capture(label, scope = spokenScope, preserveScroll = false) {
    const root = page.locator(scope);
    await expect(root).toBeVisible();
    await expect.poll(() => root.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), { timeout: 30_000 }).toBe(true);
    const geometry = await root.evaluate(element => ({ width: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth, left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right }));
    assert(geometry.document <= geometry.width + 1 && geometry.body <= geometry.width + 1 && geometry.left >= -1 && geometry.right <= geometry.width + 1, `${profile.name}/${label}: horizontal overflow ${JSON.stringify(geometry)}`);
    const result = await new AxeBuilder({ page }).include(scope).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const violations = result.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) }));
    report.accessibility.push({ label, violations });
    assert.deepEqual(violations, [], `${profile.name}/${label}: Axe`);
    if (!preserveScroll) await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${output}/${profile.name}-${label}.png`, fullPage: true });
    await page.screenshot({ path: `${output}/${profile.name}-${label}-viewport.png` });
    report.captures.push(label);
  }
  try {
    context = await browser.newContext({ ...profile.options, reducedMotion: "reduce" });
    await installSpeech(context);
    page = await context.newPage(); observe(page);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const root = page.locator(spokenScope);
    const coach = root.locator("[data-orbi-coach]");
    const picker = root.locator("#speaking-item");
    const map = root.locator("[data-speaking-map]");
    const selectLesson = async id => {
      if (await map.getAttribute("open") === null) await map.locator("summary").click();
      await picker.selectOption(id);
    };
    const start = root.locator("[data-speaking-start]");
    const complete = root.locator("[data-speaking-complete]");
    const pronunciation = expression => page.locator(`[data-pronunciation-for=${JSON.stringify(expression)}]`);
    const expectModelInViewport = async expression => {
      if (profile.name === "desktop") return;
      const selectors = [root.locator("[data-speaking-english]"), pronunciation(expression)];
      for (const locator of selectors) {
        // The UI aligns its stage on the next paint after the intentional action.
        await expect.poll(() => locator.evaluate(element => {
          const box = element.getBoundingClientRect();
          return box.top >= 0 && box.bottom <= innerHeight;
        }), { message: `English and pronunciation should fit after the model starts: ${expression}` }).toBe(true);
      }
    };
    await expect(start).toBeEnabled({ timeout: 90_000 });
    await expect(root).toHaveAttribute("data-speaking-world", "words");
    await expect(root).toHaveAttribute("data-speaking-scene", "file");
    await expect(coach).toHaveAttribute("data-speaking", "false");
    await expect(pronunciation("file")).toHaveCount(0);
    assert.deepEqual(await page.evaluate(() => window.__pronunciationAudit.utterances), []);
    await page.evaluate(() => scrollTo(0, 0));
    const initialAction = await start.evaluate(button => ({ top: button.getBoundingClientRect().top, bottom: button.getBoundingClientRect().bottom, width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height, viewport: innerHeight }));
    assert(initialAction.top >= 0 && initialAction.bottom <= initialAction.viewport, `Initial action must fit the first viewport: ${JSON.stringify(initialAction)}`);
    assert(initialAction.height >= 44 && initialAction.width >= 44, `Playback must be a comfortable touch target: ${JSON.stringify(initialAction)}`);
    report.initialAction = initialAction;
    await capture("idle");
    report.checks.push("First word opens quietly with its world and scene; no English pronunciation is exposed before the model");

    checkpoint = "audio-events";
    await start.click();
    await expect(root).toHaveAttribute("data-speaking-phase", "meaning");
    await expect(coach).toHaveAttribute("data-speaking", "false");
    await page.evaluate(() => window.__pronunciationAudit.begin());
    await expect(coach).toHaveAttribute("data-speaking", "true");
    await page.evaluate(() => window.__pronunciationAudit.finish());
    await expect(coach).toHaveAttribute("data-speaking", "false");
    await expect.poll(() => page.evaluate(() => window.__pronunciationAudit.utterances.length)).toBe(2);
    await expect(root).toHaveAttribute("data-speaking-phase", "model");
    await expect(coach).toHaveAttribute("data-speaking", "false");
    await expect(pronunciation("file")).toBeVisible();
    await expect(pronunciation("file")).toContainText(/fáil/i);
    await page.evaluate(() => window.__pronunciationAudit.begin());
    await expect(coach).toHaveAttribute("data-speaking", "true");
    await expectModelInViewport("file");
    await capture("model-file", spokenScope, true);
    await root.locator("[data-speaking-stop]").click();
    await expect.poll(() => page.evaluate(() => window.__pronunciationAudit.lateCallbacks)).toBe(1);
    await expect(coach).toHaveAttribute("data-speaking", "false");
    await expect(complete).toBeDisabled();
    report.checks.push("Orbi speaks only after onstart, rests between audio parts and stays quiet after stop plus stale start/end/error callbacks");

    checkpoint = "english-only";
    const englishOnly = root.locator("[data-speaking-english-only]");
    await expect(englishOnly).toBeEnabled();
    const before = await page.evaluate(() => window.__pronunciationAudit.utterances.length);
    await englishOnly.click();
    await expect.poll(() => page.evaluate(() => window.__pronunciationAudit.utterances.length)).toBe(before + 1);
    const utterance = await page.evaluate(() => window.__pronunciationAudit.utterances.at(-1));
    assert.deepEqual(utterance, { text: "file", lang: "en-US" });
    await page.evaluate(() => window.__pronunciationAudit.begin());
    await expect(coach).toHaveAttribute("data-speaking", "true");
    await root.locator("[data-speaking-stop]").click();
    await expect(coach).toHaveAttribute("data-speaking", "false");
    report.checks.push("The replay-English shortcut speaks the real English expression with an English voice, never the Portuguese approximation");

    checkpoint = "all-models";
    await selectLesson("word-save");
    await root.locator("[data-speaking-text-mode]").click();
    await expect(pronunciation("save")).toContainText(/sêiv/i);
    await expect(root.locator("[data-speaking-english]")).toHaveText("save");
    await expectModelInViewport("save");
    await capture("save", spokenScope, true);
    await complete.click();
    for (const [id, en] of lessons) {
      await selectLesson(id);
      await expect(pronunciation(en)).toBeVisible();
      const text = await pronunciation(en).innerText();
      assert(text.trim().length > 0, `${id} must provide an actual pronunciation cue`);
    }
    await selectLesson("phrase-save-the-file");
    await expect(root).toHaveAttribute("data-speaking-world", "phrases");
    await expect(root).toHaveAttribute("data-speaking-scene", "save");
    await expect(pronunciation("Save the file")).toContainText(/sêiv/i);
    await capture("phrase-save");
    await complete.click();
    const save = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), eligibleKey);
    assert.deepEqual(save.completed, ["word-save", "phrase-save-the-file"]);
    report.checks.push("All 12 words and phrases have model pronunciation support; words and phrase chapters have different world states and participation remains explicit");

    checkpoint = "contextual-support";
    await root.locator("[data-speaking-use-open]").click();
    const use = page.locator("[data-english-use-check]");
    await expect(use).toBeVisible();
    await expect(pronunciation("Save the file")).toBeVisible();
    await capture("contextual", "[data-english-use-check]");
    await use.locator("[data-use-back]").click();
    report.checks.push("Contextual meaning practice retains pronunciation support beside the English expression");

    checkpoint = "review-reveal";
    await root.locator("[data-speaking-review-open]").click();
    const review = page.locator(reviewScope);
    await expect(review).toBeVisible();
    await expect(review.locator("[data-pronunciation-for]")).toHaveCount(0);
    await expect(review.locator("[data-review-expression]")).toHaveCount(0);
    await expect(review.locator("#english-review-answer")).toHaveValue("");
    await capture("review-hidden", reviewScope);
    await review.locator("[data-review-model]").click();
    await expect(pronunciation("save")).toBeVisible();
    await expect(pronunciation("save")).toContainText(/sêiv/i);
    await expect(review.locator("#english-review-answer")).toHaveValue("");
    await capture("review-model", reviewScope);
    await review.locator("[data-review-close]").click();
    report.checks.push("Written recall hides English and pronunciation until the learner explicitly consults the model; consulting never fills the answer");

    checkpoint = "build-world";
    await selectLesson("phrase-the-build-failed");
    if (await root.getAttribute("data-speaking-mode") !== "text") await root.locator("[data-speaking-text-mode]").click();
    await expect(root).toHaveAttribute("data-speaking-scene", "build");
    await expect(pronunciation("The build failed")).toBeVisible();
    await capture("build");
    const motion = await coach.evaluate(element => [...element.querySelectorAll("*")].every(node => getComputedStyle(node).animationName === "none" || getComputedStyle(node).animationDuration.split(",").every(duration => parseFloat(duration) <= 0.01)));
    assert(motion, "Reduced-motion must stop continuous Orbi animation");
    assert.equal(await page.evaluate(key => localStorage.getItem(key), oldKey), null);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), journalKey), null);
    report.checks.push("Build scene changes without changing any reading, journal or XP progress; reduced-motion stops continuous character movement");

    checkpoint = "fallback";
    await context.close();
    context = await browser.newContext({ ...profile.options, reducedMotion: "reduce" });
    await installSpeech(context, false);
    page = await context.newPage(); observe(page);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    const fallback = page.locator(spokenScope);
    await expect(fallback).toBeVisible({ timeout: 90_000 });
    await fallback.locator("[data-speaking-text-mode]").click();
    await expect(fallback).toHaveAttribute("data-speaking-mode", "text");
    await expect(fallback.locator('[data-pronunciation-for="file"]')).toContainText(/fáil/i);
    await expect(fallback.locator("[data-orbi-coach]")).toHaveAttribute("data-speaking", "false");
    await expect(fallback.locator("[data-speaking-complete]")).toBeEnabled();
    await capture("fallback");
    report.checks.push("With no browser speech API, the model and Portuguese pronunciation remain usable; Orbi does not claim to be speaking");
    assert.deepEqual(report.errors, [], "Uncaught browser errors");
    assert.deepEqual(report.forbiddenRequests, [], "Unexpected RPC, paid speech service or external write");
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
