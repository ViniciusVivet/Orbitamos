import { chromium, webkit, devices } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const base = process.env.IDE_AUDIT_URL || "http://localhost:3015";
const dir = path.resolve("test-results/guided-practice");
await mkdir(dir, { recursive: true });
const report = [];
async function sourceExports(file) {
  const code = ts.transpileModule(await readFile(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("exports", code)(exports);
  return exports;
}
const { desafios } = await sourceExports("src/lib/desafios.ts");
const { guidedProgram } = await sourceExports("src/lib/guidedPractice.ts");
const assert = (condition, message) => { if (!condition) throw Error(message); };
async function open(page, slug) {
  await page.goto(`${base}/dev/ide-preview/${slug}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.locator("[data-guided-lab]").waitFor({ timeout: 120000 });
}
async function execute(page) {
  await page.getByRole("button", { name: "Executar código", exact: true }).click();
  await page.getByRole("button", { name: "Executar código", exact: true }).waitFor({ timeout: 65000 });
}
async function geometry(page) {
  return page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, font: getComputedStyle(document.querySelector("#guided-code")).fontSize }));
}
for (const [name, engine, profile] of [["safari-iphone", webkit, devices["iPhone 13"]], ["small-mobile", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }], ["desktop", chromium, { viewport: { width: 1440, height: 1000 } }]].filter(([name]) => !process.env.GUIDED_PROFILE || process.env.GUIDED_PROFILE === name)) {
  const browser = await engine.launch({ headless: true });
  try {
    const context = await browser.newContext(profile);
    const page = await context.newPage();
    const errors = [];
    let intentionalSyntaxError = false;
    page.on("pageerror", error => { if (!(intentionalSyntaxError && /unexpected token/i.test(error.message))) errors.push(error.message); });
    await open(page, "lacos-python");
    const editor = page.getByRole("textbox", { name: "Seu código", exact: true });
    assert(await editor.inputValue() === "", `${name}: new guided editor must be blank`);
    await page.screenshot({ path: path.join(dir, `${name}-start.jpg`), type: "jpeg", quality: 75 });
    const initialA11y = await new AxeBuilder({ page }).include("[data-guided-lab]").analyze();
    assert(!initialA11y.violations.length, `${name}: initial accessibility: ${initialA11y.violations.map(v => v.id).join(", ")}`);
    const next = page.getByRole("button", { name: "Próxima etapa", exact: true, includeHidden: true });
    assert(await next.isDisabled(), `${name}: empty code passed`);
    await editor.fill("# total = 0");
    assert(await next.isDisabled(), `${name}: commented solution passed`);
    await editor.fill("total = 0");
    await next.click();
    await page.getByRole("heading", { name: "Peça para repetir de 1 até 100" }).waitFor();
    await editor.fill("total = 0\nfor numero in range(1, 101):");
    await next.click();
    await editor.fill("total = 0\nfor numero in range(1, 101):\n");
    await editor.focus();
    await editor.press("ControlOrMeta+End");
    await page.getByRole("button", { name: "Inserir recuo", exact: true }).click();
    assert((await editor.inputValue()).endsWith("\n    "), `${name}: indent key failed`);
    await editor.fill("total = 0\nfor numero in range(1, 101):\n    total += numero");
    await next.click();
    await editor.fill("total = 0\nfor numero in range(1, 101):\n    total += numero\nprint(total)");
    await execute(page);
    await page.getByRole("heading", { name: "Você escreveu. E fez funcionar." }).waitFor({ timeout: 3000 });
    assert((await page.getByRole("region", { name: "Resultado da execução" }).innerText()).includes("5050"), `${name}: Python did not run`);
    const geo = await geometry(page);
    assert(!geo.overflow && parseFloat(geo.font) >= 16, `${name}: overflow or small mobile font`);
    await page.screenshot({ path: path.join(dir, `${name}-python.jpg`), fullPage: true, type: "jpeg", quality: 75 });
    const accessibility = await new AxeBuilder({ page }).include("[data-guided-lab]").analyze();
    assert(!accessibility.violations.length, `${name}: accessibility: ${accessibility.violations.map(v => v.id).join(", ")}`);
    const original = await editor.inputValue();
    await page.reload();
    await editor.waitFor();
    assert(await editor.inputValue() === original, `${name}: reload lost code`);
    await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
    await page.getByRole("button", { name: "Continuar editando", exact: true }).click();
    assert(await editor.inputValue() === original, `${name}: cancel reset lost code`);
    await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
    await page.getByRole("button", { name: "Sim, reiniciar", exact: true }).click();
    assert(await editor.inputValue() === "", `${name}: reset not blank`);
    await page.getByRole("button", { name: "Recuperar código anterior ao reinício" }).click();
    assert(await editor.inputValue() === original, `${name}: recovery failed`);
    await editor.fill("");
    await page.waitForTimeout(350);
    await page.reload();
    await editor.waitFor();
    assert(await editor.inputValue() === "", `${name}: empty draft was replaced with starter`);
    await open(page, "variaveis-js");
    await editor.fill('let nome = "Seu Nome";\nconsole.log(nome);');
    await execute(page);
    await page.getByRole("button", { name: "Próxima missão", exact: true }).click();
    assert((await editor.inputValue()).includes("let nome"), `${name}: progression erased earlier code`);
    await editor.fill('let nome = "Seu Nome";\nconsole.log(nome);\nlet idade = 20;\nconsole.log(idade);');
    await execute(page);
    await page.getByRole("button", { name: "Próxima missão", exact: true }).click();
    await editor.fill('let nome = "Seu Nome";\nconsole.log(nome);\nlet idade = 20;\nconsole.log(idade);\nlet ativo = true;\nconsole.log(ativo);');
    await execute(page);
    await page.getByRole("heading", { name: "Você escreveu. E fez funcionar." }).waitFor();
    await editor.fill("while (true) {}");
    await page.getByRole("button", { name: "Executar código", exact: true }).click();
    await page.getByRole("button", { name: "Parar execução", exact: true }).click();
    await page.getByText("Execução interrompida. Seu código está preservado.", { exact: true }).waitFor();
    await editor.fill("let = ;");
    intentionalSyntaxError = true;
    await execute(page);
    await page.getByText("Ainda não rodou. Vamos ajustar.", { exact: true }).waitFor();
    intentionalSyntaxError = false;
    await page.getByRole("button", { name: "Modo livre", exact: true }).click();
    await page.getByRole("button", { name: "Voltar ao passo a passo", exact: true }).click();
    await editor.waitFor();
    assert(await editor.inputValue() === "let = ;", `${name}: mode switch lost guided draft`);
    await page.setViewportSize({ width: profile.viewport.width, height: 440 });
    await editor.fill('console.log("teclado");');
    await editor.focus();
    assert(!(await geometry(page)).overflow, `${name}: short viewport overflow`);
    await page.screenshot({ path: path.join(dir, `${name}-short-viewport.jpg`), type: "jpeg", quality: 75 });
    report.push({ name, passed: true, pageErrors: errors, accessibility: accessibility.violations.length, simulatedKeyboard: "short viewport only; physical iPhone keyboard needs manual check" });
    assert(!errors.length, `${name}: page errors ${errors.join("; ")}`);
    await page.setViewportSize(profile.viewport);
    await page.goto(`${base}/dev/portal-preview`, { waitUntil: "domcontentloaded" });
    await page.getByRole("region", { name: "Programe pelo celular", exact: true }).waitFor({ timeout: 60000 });
    await page.screenshot({ path: path.join(dir, `${name}-student-home.jpg`), type: "jpeg", quality: 75 });
    await page.goto(`${base}/dev/lab-preview`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "Uma linha de cada vez.", exact: true }).waitFor({ timeout: 60000 });
    assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), `${name}: catalog overflow`);
    await page.screenshot({ path: path.join(dir, `${name}-catalog.jpg`), type: "jpeg", quality: 75 });
    if (name === "desktop") {
      for (const challenge of desafios) {
        await page.addInitScript(slug => { localStorage.removeItem(`orbitamos-guided-v1-ide-preview-${slug}`); localStorage.removeItem(`orbitamos-practice-mode-ide-preview-${slug}`); }, challenge.slug);
        await open(page, challenge.slug);
        await editor.waitFor();
        let code = "";
        for (let mission = 0; mission < challenge.steps.length; mission++) {
          code += (code ? "\n" : "") + guidedProgram(challenge, mission);
          await editor.fill(code);
          await execute(page);
          if (mission < challenge.steps.length - 1) await page.getByRole("button", { name: "Próxima missão", exact: true }).click({ timeout: 3000 });
          else await page.getByRole("heading", { name: "Você escreveu. E fez funcionar." }).waitFor({ timeout: 3000 });
        }
        report.push({ reference: challenge.slug, passed: true });
        console.log(`PASS reference ${challenge.slug}`);
      }
    }
    console.log(`PASS ${name}`);
    await context.close();
  } finally { await browser.close(); await writeFile(path.join(dir, `${process.env.GUIDED_PROFILE || "all"}-report.json`), JSON.stringify(report, null, 2)); }
}
console.log(`All guided checks passed. Report: ${dir}`);
