import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
const base = process.env.IDE_AUDIT_URL || "http://localhost:3015";
const dir = "test-results/csharp-track";
await mkdir(dir, { recursive: true });
const sourceCache = {};
async function compile(file) {
  const source = ts.transpileModule(await readFile(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("require", "exports", source)(name => sourceCache[name], exports);
  return exports;
}
sourceCache["./csharpTrack"] = await compile("src/lib/csharpTrack.ts");
const { variableActivities } = await compile("src/lib/csharpVariables.ts");
const { csharpPilot } = sourceCache["./csharpTrack"];
const results = [];
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 1000 } }], ["iphone-webkit", webkit, devices["iPhone 13"]], ["small-phone", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }]];
for (const [name, engine, options] of profiles.filter(([name]) => !process.env.CSHARP_PROFILE || process.env.CSHARP_PROFILE === name)) {
  const browser = await engine.launch();
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto(base + "/dev/csharp-preview", { waitUntil: "domcontentloaded", timeout: 120000 });
    const root = page.locator("[data-csharp-track]");
    await root.waitFor({ timeout: 120000 });
    const navigation = page.getByRole("navigation", { name: "Etapas da jornada C#" });
    async function check(view) {
      await page.screenshot({ path: path.join(dir, name + "-v2-" + view + ".jpg"), fullPage: true, type: "jpeg", quality: 75 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name + "/" + view + " overflow").toBe(true);
      const axe = await new AxeBuilder({ page }).include("[data-csharp-track]").analyze();
      expect(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), name + "/" + view + " accessibility").toEqual([]);
    }
    await page.getByRole("button", { name: "Começar a codar · variáveis", exact: true }).click();
    await page.locator("#guided-code").waitFor();
    await expect(page.getByText("Você está aprendendo: Variáveis", { exact: true })).toBeVisible();
    await check("guided-start");
    for (const activity of variableActivities) {
      await expect(page.getByRole("heading", { name: activity.title, exact: true, level: 1 })).toBeVisible();
      if (activity.kind === "guided") {
        const lines = csharpPilot.steps[0].codigoExemplo.split("\n");
        for (let i = 0; i < lines.length; i++) {
          await page.locator("#guided-code").fill(lines.slice(0, i + 1).join("\n"));
          if (i < lines.length - 1) await page.getByRole("button", { name: "Próxima etapa", exact: true }).click();
        }
        await page.getByRole("button", { name: "Executar código", exact: true }).click();
        await page.getByRole("heading", { name: "Você escreveu. E fez funcionar.", exact: true }).waitFor({ timeout: 15000 });
      } else if (activity.kind === "quiz") {
        await page.getByRole("radio", { name: activity.options[(activity.answer + 1) % activity.options.length], exact: true }).check();
        await expect(page.getByText(activity.feedback[(activity.answer + 1) % activity.options.length], { exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "Continuar para a próxima", exact: true })).toHaveCount(0);
        await page.getByRole("radio", { name: activity.options[activity.answer], exact: true }).check();
        if (activity.id === "quiz-values") await check("quiz");
      } else {
        const editor = page.locator("#variables-code");
        await expect(editor).toHaveValue(activity.starter);
        expect(await editor.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
        if (activity.id === "transfer") {
          await editor.fill("int servicosPendentes = 5;\nConsole.WriteLine(5);");
          await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
          await page.getByText("Ainda não passou.", { exact: false }).waitFor();
        }
        if (activity.id === "debug") {
          await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
          await page.getByText("Vamos ajustar.", { exact: false }).waitFor();
        }
        await editor.fill(activity.solution);
        await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
        await page.getByText("Código validado!", { exact: false }).waitFor();
        if (activity.id === "client") {
          await check("code");
          await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
          await page.getByRole("button", { name: "Continuar editando", exact: true }).click();
          await expect(editor).toHaveValue(activity.solution);
          await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
          await page.getByRole("button", { name: "Sim, reiniciar", exact: true }).click();
          await expect(editor).toHaveValue("");
          await page.getByRole("button", { name: "Recuperar código anterior", exact: true }).click();
          await expect(editor).toHaveValue(activity.solution);
          await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
          await page.getByText("Código validado!", { exact: false }).waitFor();
        }
      }
      if (activity.id !== "delivery") await page.getByRole("button", { name: activity.kind === "quiz" ? "Continuar para a próxima" : "Próxima atividade", exact: true }).click();
    }
    await expect(page.getByRole("heading", { name: "Variáveis: primeiras práticas concluídas.", exact: true })).toBeVisible();
    await page.waitForTimeout(300);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Variáveis: primeiras práticas concluídas.", exact: true })).toBeVisible();
    await expect(page.locator("#variables-code")).toHaveValue(variableActivities.at(-1).solution);
    await check("complete");
    await page.getByRole("button", { name: "Mapa completo", exact: true }).click();
    await expect(page.getByText("VOCÊ ESTÁ AQUI · VARIÁVEIS DISPONÍVEL", { exact: true })).toBeVisible();
    await expect(page.getByText("PLANEJADO", { exact: true })).toHaveCount(7);
    await page.getByRole("button", { name: "Abrir módulo de variáveis", exact: true }).click();
    await expect(page.getByRole("heading", { name: variableActivities.at(-1).title, exact: true, level: 1 })).toBeVisible();
    await page.locator("#variables-code").fill("");
    await expect(page.getByRole("heading", { name: "Variáveis: primeiras práticas concluídas.", exact: true })).toHaveCount(0);
    await page.waitForTimeout(300);
    await page.reload();
    await expect(page.locator("#variables-code")).toHaveValue("");
    expect(errors).toEqual([]);
    results.push({ profile: name, passed: true, codePractices: 7, quizzes: 3, accessibilityViolations: 0, checks: "guided line-by-line, all runtime solutions, wrong answers and feedback, reset recovery, progress and draft persistence, full map and return, changed draft invalidates completion", limitation: "WebKit emulation does not test physical iOS keyboard" });
    console.log(name + ": passed");
  } finally { await browser.close(); }
}
await writeFile(path.join(dir, "report-v2.json"), JSON.stringify(results, null, 2));
