import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "test-results/practice-handoff";
await mkdir(output, { recursive: true });
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 950 } }], ["iphone", webkit, devices["iPhone 13"]], ["small", chromium, { viewport: { width: 320, height: 740 }, hasTouch: true, isMobile: true }]].filter(([name]) => !process.argv[2] || process.argv[2] === name);
const key = "orbitamos-pratica-academy-preview-variaveis-js";
const historyKey = "orbitamos-pratica-versoes-v1-academy-preview-variaveis-js";
const guidedKey = "orbitamos-guided-v1-academy-preview-variaveis-js";
const otherKey = "orbitamos-pratica-other-student-variaveis-js";
const program = 'const nome = "João";\nconsole.log(nome);\nlet idade = 28;\nconsole.log(idade);\nlet ativo = true;\nconsole.log(ativo);';
const edited = program.replace("João", "Meu rascunho livre");
const notYetSaved = program.replace("João", "Edição ainda aberta");

for (const [name, engine, options] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  await context.addInitScript(([other]) => { if (!localStorage.getItem(other)) localStorage.setItem(other, '{"code":"outra conta"}'); }, [otherKey]);
  const page = await context.newPage(); page.setDefaultTimeout(45000);
  const report = { completed: false, checks: [], errors: [] };
  page.on("pageerror", error => report.errors.push(error.message));
  const activate = locator => options.hasTouch ? locator.tap() : locator.click();
  const freeEditor = () => page.getByRole("textbox", { name: "Editor de código", exact: true });
  const expectUsableEditor = async () => {
    await expect.poll(() => freeEditor().evaluate(editor => editor.getBoundingClientRect().height)).toBeGreaterThan(100);
  };
  const read = storageKey => page.evaluate(storageKey => localStorage.getItem(storageKey), storageKey);
  async function setFreeCode(code) {
    const codeTab = page.getByRole("tab", { name: "Código", exact: true });
    if (await codeTab.isVisible()) await activate(codeTab);
    await freeEditor().fill(code);
    await page.waitForTimeout(80); // CodeMirror publishes contenteditable input to its document model.
  }
  try {
    await page.goto("http://localhost:3015/dev/ide-preview/variaveis-js?academy=1", { waitUntil: "domcontentloaded", timeout: 180000 });
    await activate(page.getByRole("button", { name: "Entendi, vamos construir", exact: true }));
    await page.getByRole("textbox", { name: "Seu código", exact: true }).fill(program);
    await activate(page.getByRole("button", { name: "Modo livre", exact: true }));
    await freeEditor().waitFor();
    await expectUsableEditor();
    await expect.poll(() => freeEditor().innerText(), { timeout: 45000 }).toBe(program);
    expect(JSON.parse(await read(key)).stepStatus).toEqual(["pending", "pending", "pending"]);
    await expect(page.locator("[data-practice-handoff-origin]")).toBeVisible();
    report.checks.push("first handoff carries exact code without awarding a free-mode completion");

    for (let step = 0; step < 3; step++) {
      await activate(page.getByRole("button", { name: "Executar", exact: true }));
      await expect.poll(async () => JSON.parse(await read(key)).stepStatus.filter(status => status === "success").length, { timeout: 45000 }).toBe(step + 1);
    }
    await expect(page.locator("#beginner-free-application [data-beginner-practice]")).toBeVisible();
    await expect(page.locator("#beginner-free-application")).toContainText("Código inicial validado");
    await expect(page.locator("#beginner-free-application")).not.toContainText("Guia concluído");
    report.checks.push("free-mode validation exposes application directly with an honest origin label");
    await setFreeCode(edited);
    await activate(page.getByRole("button", { name: "Voltar ao passo a passo", exact: true }));
    const afterLeave = await read(key);
    expect(JSON.parse(afterLeave).code).toBe(edited);
    expect(JSON.parse(afterLeave).stepStatus).toEqual(["pending", "pending", "pending"]);
    const guidedRaw = await read(guidedKey);
    await activate(page.getByRole("button", { name: "Modo livre", exact: true }));
    await expect(page.locator("[data-practice-handoff]")).toBeVisible();
    const axe = await new AxeBuilder({ page }).include("[data-practice-handoff]").analyze();
    report.violations = axe.violations.map(item => item.id);
    expect(report.violations).toEqual([]);
    await page.screenshot({ path: `${output}/${name}-choice.jpg`, fullPage: true });
    await activate(page.getByRole("button", { name: "Retomar meu rascunho livre", exact: true }));
    await expect.poll(() => freeEditor().innerText(), { timeout: 45000 }).toBe(edited);
    expect(await read(key)).toBe(afterLeave);
    await activate(page.getByRole("button", { name: "Voltar ao passo a passo", exact: true }));
    await activate(page.getByRole("button", { name: "Modo livre", exact: true }));
    await activate(page.getByRole("button", { name: "Levar código desta atividade", exact: true }));
    await expectUsableEditor();
    await expect.poll(() => freeEditor().innerText(), { timeout: 45000 }).toBe(program);
    const versions = JSON.parse(await read(historyKey));
    expect(versions.entries.some(entry => entry.raw === afterLeave)).toBe(true);
    report.checks.push("conflict is explicit; keeping old draft preserves its raw data; importing backs it up before replacement");

    const savedVersions = page.locator("[data-practice-code-versions]");
    await activate(savedVersions.locator(":scope > summary"));
    const prior = savedVersions.locator(":scope > div > details").filter({ has: page.locator("pre", { hasText: "Meu rascunho livre" }) }).first();
    // The closed version still has a DOM preview. Open before editing so recovery can be immediate.
    await activate(prior.locator(":scope > summary"));
    await setFreeCode(notYetSaved);
    report.unsavedBeforeRecovery = JSON.parse(await read(key)).code !== notYetSaved;
    await activate(prior.getByRole("button", { name: "Recuperar código desta versão", exact: true }));
    await expect.poll(() => freeEditor().innerText(), { timeout: 45000 }).toBe(edited);
    expect(JSON.parse(await read(historyKey)).entries.some(entry => JSON.parse(entry.raw).code === notYetSaved)).toBe(true);
    await page.reload();
    await freeEditor().waitFor({ timeout: 90000 });
    await expect.poll(() => freeEditor().innerText(), { timeout: 45000 }).toBe(edited);
    await activate(page.getByRole("button", { name: "Voltar ao passo a passo", exact: true }));
    await expect(page.getByRole("textbox", { name: "Seu código", exact: true })).toHaveValue(program);
    expect(await read(guidedKey)).toBe(guidedRaw);
    expect(await read(otherKey)).toBe('{"code":"outra conta"}');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(report.errors).toEqual([]);
    report.checks.push("recovering preserves current edits; reload restores recovered code; guided and other account records stay intact");
    report.completed = true;
    console.log(`${name}: guided/free handoff, conflict choice, recovery and isolation passed`);
  } catch (error) {
    report.failure = String(error); report.url = page.url();
    await page.screenshot({ path: `${output}/${name}-failure.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally { await writeFile(`${output}/${name}.json`, JSON.stringify(report, null, 2)); await context.close(); await browser.close(); }
}
