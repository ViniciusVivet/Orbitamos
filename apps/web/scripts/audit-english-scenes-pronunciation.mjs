import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const base = (process.env.ENGLISH_PRONUNCIATION_BASE_URL || "http://localhost:3015").replace(/\/$/, "");
const url = `${base}/dev/academy-preview?activity=english`;
const output = resolve("test-results/english-scenes-pronunciation");
const requested = process.argv.slice(2).find(value => !value.startsWith("--"));
const profiles = [
  { name: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 1000 } } },
  { name: "iphone", engine: webkit, options: devices["iPhone 13"] },
  { name: "small", engine: chromium, options: { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } },
].filter(profile => !requested || profile.name === requested);
assert(profiles.length, "Use desktop, iphone ou small como argumento opcional.");
const scenes = [
  { id: "folder", title: "Cada coisa em seu lugar", answer: /^folder/, takeaway: "folder" },
  { id: "file", title: "Uma peça da oficina", answer: /^file/, expression: "Open the file", takeaway: "file" },
  { id: "button", title: "O comando de salvar", answer: /^button/, expression: "Click the Save button", takeaway: "button" },
  { id: "server", title: "Quem responde à página?", answer: /^server/, takeaway: "server" },
  { id: "missing-file", title: "O arquivo sumiu?", answer: /^Conferir o nome/, expression: "File not found", takeaway: "File not found" },
  { id: "complete-error", title: "Reconheça a mensagem", write: true, takeaway: "File not found" },
  { id: "return", title: "Uma entrega, dentro do código", answer: /^Devolve 6/, expression: "return", takeaway: "return" },
  { id: "transfer", title: "O que chega à saída?", answer: /^8$/, expression: "output", takeaway: "output" },
];
await mkdir(output, { recursive: true });
for (const profile of profiles) {
  const report = { profile: profile.name, status: "running", startedAt: new Date().toISOString(), checks: [], captures: [], accessibility: [], errors: [], forbiddenRequests: [] };
  const browser = await profile.engine.launch({ headless: true });
  const context = await browser.newContext({ ...profile.options, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  page.on("pageerror", error => report.errors.push(error.message));
  page.on("request", request => {
    if (/\/rest\/v1\/rpc\//.test(request.url()) || /^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(base).origin && !["GET", "HEAD", "OPTIONS"].includes(request.method())) report.forbiddenRequests.push({ method: request.method(), url: request.url() });
  });
  const root = page.locator("[data-code-english]");
  const guide = expression => root.locator(`[data-pronunciation-for=${JSON.stringify(expression)}]`);
  async function capture(label) {
    await expect.poll(() => root.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), { timeout: 30_000 }).toBe(true);
    const geometry = await root.evaluate(element => ({ width: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth, left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right }));
    assert(geometry.document <= geometry.width + 1 && geometry.body <= geometry.width + 1 && geometry.left >= -1 && geometry.right <= geometry.width + 1, `${profile.name}/${label}: overflow ${JSON.stringify(geometry)}`);
    const axe = await new AxeBuilder({ page }).include("[data-code-english]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const violations = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) }));
    report.accessibility.push({ label, violations });
    assert.deepEqual(violations, [], `${profile.name}/${label}: Axe`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${output}/${profile.name}-${label}.png`, fullPage: true });
    await page.screenshot({ path: `${output}/${profile.name}-${label}-viewport.png` });
    report.captures.push(label);
  }
  let checkpoint = "initial";
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await root.getByRole("button", { name: "Entrar na missão" }).click({ timeout: 90_000 });
    for (const scene of scenes) {
      checkpoint = scene.id;
      await expect(root.getByRole("heading", { name: scene.title, exact: true })).toBeVisible();
      if (scene.expression) await expect(guide(scene.expression)).toBeVisible();
      if (scene.id === "folder") {
        for (const expression of ["file", "folder", "button"]) await expect(guide(expression)).toBeVisible();
        await capture("alternatives");
      }
      if (scene.id === "button") await capture("phrase");
      if (scene.write) {
        await expect(guide("File not found")).toHaveCount(0);
        await expect(guide("found")).toHaveCount(0);
        assert(!/File not found/i.test(await root.innerText()), "Recall exposes the full written answer before a hint");
        await capture("recall-hidden");
        await root.getByRole("button", { name: "Preciso de uma pista" }).click();
        await expect(guide("File not found")).toBeVisible();
        await expect(root.locator("#english-missing-word")).toHaveValue("");
        await capture("recall-model");
        await root.locator("#english-missing-word").fill("found");
        await root.getByRole("button", { name: "Verificar palavra" }).click();
      } else {
        await root.getByRole("group", { name: "Escolha uma resposta" }).getByRole("button", { name: scene.answer }).click();
      }
      const solved = root.locator('[data-kind="correct"]');
      await expect(solved).toBeVisible();
      await expect(solved.locator(`[data-pronunciation-for=${JSON.stringify(scene.takeaway)}]`)).toBeVisible();
      report.checks.push(`${scene.id}: authored pronunciation remains available beside the scene or solved feedback`);
      if (scene.id === "transfer") await capture("final-scene");
      await root.getByRole("button", { name: scene.id === "transfer" ? "Concluir missão" : "Continuar", exact: true }).click();
    }
    checkpoint = "glossary";
    await expect(root.getByRole("heading", { name: /Você leu as pistas/ })).toBeVisible();
    for (const term of ["folder", "file", "button", "server", "return", "output"]) await expect(guide(term)).toBeVisible();
    const save = await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-english-v1-academy-preview")));
    assert.equal(save.finished, true); assert.equal(save.completed.length, 8);
    await capture("glossary");
    report.checks.push("All 8 scenes completed via UI; 6-term glossary has pronunciation; a consulted recall hint did not fill the input");
    assert.deepEqual(report.errors, []); assert.deepEqual(report.forbiddenRequests, []);
    report.status = "passed";
  } catch (error) {
    report.status = "failed";
    report.failure = { checkpoint, message: error instanceof Error ? error.stack || error.message : String(error) };
    await page.screenshot({ path: `${output}/${profile.name}-failure-${checkpoint}.png`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    report.finishedAt = new Date().toISOString();
    await writeFile(`${output}/results-${profile.name}.json`, JSON.stringify(report, null, 2));
    await context.close(); await browser.close();
    console.log(`${profile.name}: ${report.status}; ${report.checks.length} checks, ${report.captures.length} captures`);
  }
}
