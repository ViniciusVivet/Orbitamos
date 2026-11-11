import { chromium, webkit, devices, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

// Run alone, after the dev server is warm. No Axe or screenshot work during
// sampling. This reports local frame intervals, not an iPhone hardware score.
const base = process.env.ORBI_TEST_URL || "http://localhost:3015";
const output = "test-results/orbi-pulse";
const variant = process.env.ORBI_PROFILE_QUERY || "";
const resultSuffix = process.env.ORBI_PROFILE_LABEL || "";
if (resultSuffix && !/^[a-z0-9-]+$/.test(resultSuffix)) throw new Error("Use a plain filename label.");
const resultFile = output + "/frames" + (process.argv[2] ? "-" + process.argv[2] : "") + (resultSuffix ? "-" + resultSuffix : "") + ".json";
const profiles = [
  { name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } },
  { name: "iphone-safari", engine: webkit, options: devices["iPhone 13"] },
].filter(item => !process.argv[2] || process.argv[2] === item.name);
if (!profiles.length) throw new Error("Use desktop or iphone-safari.");
await mkdir(output, { recursive: true });
const reports = [];
for (const profile of profiles) {
  const browser = await profile.engine.launch();
  const context = await browser.newContext({ ...profile.options, reducedMotion: "no-preference" });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const stage = page.locator("[data-orbi-chapter-canvas]");
  const x = async () => Number(await stage.getAttribute("data-player-x"));
  try {
    const blankFrames = await page.evaluate(() => new Promise(resolve => {
      const samples = []; let previous = 0, done = false;
      const finish = () => { if (done) return; done = true; resolve(samples); };
      setTimeout(finish, 3500);
      const frame = now => { if (done) return; if (previous) samples.push(now - previous); previous = now; requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
    }));
    await page.goto(base + "/dev/academy-preview?activity=delivery" + (variant ? "&" + new URLSearchParams(variant) : "") + "#oficina-do-pulso", { waitUntil: "domcontentloaded", timeout: 180000 });
    if (process.env.ORBI_PROFILE_CSS === "no-backdrop") await page.addStyleTag({ content: "[data-portal-header]{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}" });
    await page.getByRole("button", { name: "Entrar na Oficina do Pulso", exact: true }).click();
    await expect(stage.locator("canvas")).toBeVisible({ timeout: 120000 });
    await expect(stage).toHaveAttribute("data-player-x", /\d+/);
    await stage.scrollIntoViewIfNeeded();
    await stage.focus();
    await page.keyboard.down("ArrowRight");
    try { await expect.poll(x, { timeout: 20000 }).toBeGreaterThanOrEqual(430); }
    finally { await page.keyboard.up("ArrowRight"); }
    await page.getByRole("button", { name: "Abrir terminal", exact: true }).click();
    await page.getByRole("textbox", { name: "Seu código" }).fill("const alcancePulso = 280;\nconst recarga = 0.6;");
    await page.getByRole("button", { name: "Aplicar e testar o pulso", exact: true }).click();
    await stage.focus();
    await page.keyboard.down("ArrowRight");
    try { await expect.poll(x, { timeout: 20000 }).toBeGreaterThanOrEqual(823); }
    finally { await page.keyboard.up("ArrowRight"); }
    await page.getByRole("button", { name: "Ativar som", exact: true }).click();
    await stage.focus();
    await page.keyboard.down("f");
    // Warm at the same forcefield; no polling or drawing captures in the sample.
    await page.waitForTimeout(6000);
    const before = await stage.evaluate(element => ({ ...element.dataset }));
    const samples = [];
    for (let index = 0; index < 4; index++) {
      await page.keyboard.press("Space");
      await page.waitForTimeout(2500);
      samples.push(await stage.evaluate(element => ({ ...element.dataset })));
    }
    await page.keyboard.up("f");
    const report = { profile: profile.name, variant, cssVariant: process.env.ORBI_PROFILE_CSS || "default", description: "Single browser, warm scene, holding pulse and jumping at the first forcefield; sound enabled; no screenshots/Axe while sampling", blankFrames, before, samples, modifierReleaseStops: false, visibleWindowBlurPauses: false, errors };
    reports.push(report);
    await page.screenshot({ path: output + "/" + profile.name + "-gameplay.png", fullPage: false });
    await page.keyboard.down("d");
    await page.waitForTimeout(250);
    await page.keyboard.down("Control");
    await page.keyboard.up("d");
    await page.keyboard.up("Control");
    const releaseX = await x();
    let previousX = releaseX, stable = 0;
    await expect.poll(async () => {
      const currentX = await x();
      assert(currentX - releaseX < 120, profile.name + ": movement remains held after key release");
      stable = Math.abs(currentX - previousX) < 3 ? stable + 1 : 0;
      previousX = currentX;
      return stable;
    }, { timeout: 8000, intervals: [350] }).toBeGreaterThanOrEqual(3);
    report.modifierReleaseStops = true;
    // Exercise the window-focus handler while the document is still visible.
    // This is an event fixture, not a physical app-switch hardware test.
    assert.equal(await page.evaluate(() => document.hidden), false);
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await expect(page.locator("[data-orbi-pulse]")).toHaveAttribute("data-game-status", "paused");
    await page.waitForTimeout(200);
    const paused = await stage.evaluate(element => ({ ...element.dataset }));
    await page.waitForTimeout(500);
    const held = await stage.evaluate(element => ({ ...element.dataset }));
    assert.equal(held.playerX, paused.playerX);
    assert.equal(held.pulseShield, paused.pulseShield);
    assert.equal(held.pulseCooldownRemaining, paused.pulseCooldownRemaining);
    report.visibleWindowBlurPauses = true;
    if (errors.length) throw new Error(errors.join("\n"));
  } finally {
    await writeFile(resultFile, JSON.stringify(reports, null, 2));
    await context.close(); await browser.close();
  }
}
await writeFile(resultFile, JSON.stringify(reports, null, 2));
console.log(JSON.stringify(reports.map(report => ({ profile: report.profile, meanMs: report.samples.map(sample => sample.frameMeanMs), p95Ms: report.samples.map(sample => sample.frameP95Ms), modifierReleaseStops: report.modifierReleaseStops, visibleWindowBlurPauses: report.visibleWindowBlurPauses, errors: report.errors })), null, 2));
