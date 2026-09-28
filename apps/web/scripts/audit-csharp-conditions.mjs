import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
const base = process.env.IDE_AUDIT_URL || "http://localhost:3015";
const loops = process.env.CSHARP_MODULE === "loops";
const label = loops ? "Laços" : "Condições";
const moduleTab = `${loops ? "02.2" : "02.1"} · ${label}`;
const dir = loops ? "test-results/csharp-loops" : "test-results/csharp-conditions";
await mkdir(dir, { recursive: true });
const sourceCache = {};
async function compile(file) {
  const source = ts.transpileModule(await readFile(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("require", "exports", source)(name => sourceCache[name], exports);
  return exports;
}
sourceCache["./csharpTrack"] = await compile("src/lib/csharpTrack.ts");
sourceCache["./csharpVariables"] = await compile("src/lib/csharpVariables.ts");
const curriculum = await compile(loops ? "src/lib/csharpLoops.ts" : "src/lib/csharpConditions.ts");
const variableActivities = loops ? curriculum.loopsActivities : curriculum.conditionsActivities;
const csharpPilot = loops ? curriculum.loopsPilot : curriculum.conditionsPilot;
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
    async function check(view) {
      await page.screenshot({ path: path.join(dir, name + "-v2-" + view + ".jpg"), fullPage: true, type: "jpeg", quality: 75 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name + "/" + view + " overflow").toBe(true);
      const axe = await new AxeBuilder({ page }).include("[data-csharp-track]").analyze();
      expect(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), name + "/" + view + " accessibility").toEqual([]);
    }
    await page.getByRole("button", { name: "Começar a codar · variáveis", exact: true }).click();
    await page.getByRole("navigation", { name: "Módulos disponíveis" }).getByRole("button", { name: moduleTab, exact: true }).click();
    await page.locator("#guided-code").waitFor();
    await expect(page.getByText(`Você está aprendendo: ${label}`, { exact: true })).toBeVisible();
    await check("guided-start");
    for (const activity of variableActivities) {
      await expect(page.getByRole("heading", { name: activity.title, exact: true, level: 1 })).toBeVisible();
      if (activity.kind === "guided") {
        await page.getByRole("checkbox", { name: "Avanço automático", exact: true }).uncheck();
        const lines = csharpPilot.steps[0].codigoExemplo.split("\n");
        for (let i = 0; i < lines.length; i++) {
          await page.locator("#guided-code").fill(lines.slice(0, i + 1).join("\n"));
          if (i < lines.length - 1) await page.getByRole("button", { name: "Continuar para próxima etapa", exact: true }).click();
        }
        await page.getByRole("button", { name: "Executar código", exact: true }).click();
        await page.getByRole("heading", { name: "Você escreveu. E fez funcionar.", exact: true }).waitFor({ timeout: 15000 });
      } else if (activity.kind === "quiz") {
        await page.getByRole("radio", { name: activity.options[(activity.answer + 1) % activity.options.length], exact: true }).check();
        await expect(page.getByText(activity.feedback[(activity.answer + 1) % activity.options.length], { exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "Continuar para a próxima", exact: true })).toHaveCount(0);
        await page.getByRole("radio", { name: activity.options[activity.answer], exact: true }).check();
        if (activity.id === "quiz-branch" || activity.id === "quiz-limit") await check("quiz");
      } else {
        const editor = page.locator("#variables-code");
        await expect(editor).toHaveValue(activity.starter);
        expect(await editor.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
        if (activity.id === "threshold") {
          await editor.fill(activity.solution.replace(">= 100", ">= 99"));
          await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
          await page.getByText("entrada inicial funcionou", { exact: false }).waitFor();
        }
        if (activity.id === "count") {
          await editor.fill(activity.solution.replace("numero <= quantidade", "numero <= 4"));
          await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
          await page.getByText("entrada inicial funcionou", { exact: false }).waitFor();
        }
        if (activity.id === "countdown") {
          const infinite = "int pendentes = 3;\nwhile (pendentes > 0) {\n    pendentes += 0;\n}";
          await editor.fill(infinite);
          await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
          await page.getByText("programa levou tempo demais", { exact: false }).waitFor({ timeout: 15000 });
          await expect(editor).toHaveValue(infinite);
          await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
          // Dispatch immediately: WebKit actionability/scroll waits can consume
          // the 2.5s safety timeout on a busy machine. Physical click is covered
          // separately by audit-csharp-cancellation.mjs.
          await page.getByRole("button", { name: "Parar execução", exact: true }).dispatchEvent("click");
          await page.getByText("Execução interrompida. Seu código está preservado.", { exact: true }).waitFor();
          await expect(editor).toHaveValue(infinite);
        }
        if (activity.id === "debug-limit" || activity.id === "debug-last") {
          await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
          await page.getByText("saída é diferente", { exact: false }).waitFor();
        }
        await editor.fill(activity.solution);
        await expect(editor, `${name}/${activity.id}: draft must survive activity focus`).toHaveValue(activity.solution);
        await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
        await page.getByText("Código validado!", { exact: false }).waitFor();
        if (activity.id === "branches" || activity.id === "count") {
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
    await page.getByRole("button", { name: "Ver minha entrega", exact: true }).click();
    await expect(page.getByRole("heading", { name: `${label}: primeiras práticas concluídas.`, exact: true })).toBeVisible();
    await page.waitForTimeout(300);
    await page.reload();
    await expect(page.getByRole("heading", { name: `${label}: primeiras práticas concluídas.`, exact: true })).toBeVisible();
    await expect(page.locator("#variables-code")).toHaveValue(variableActivities.at(-1).solution);
    await check("complete");
    await page.getByRole("navigation", { name: "Módulos disponíveis" }).getByRole("button", { name: "01 · Variáveis", exact: true }).click();
    await expect(page.getByText("Você está aprendendo: Variáveis", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: `${label}: primeiras práticas concluídas.`, exact: true })).toHaveCount(0);
    await page.getByRole("navigation", { name: "Módulos disponíveis" }).getByRole("button", { name: moduleTab, exact: true }).click();
    await expect(page.locator("#variables-code")).toHaveValue(variableActivities.at(-1).solution);
    await page.getByRole("button", { name: "Mapa completo", exact: true }).click();
    await expect(page.getByText("CONDIÇÕES E LAÇOS DISPONÍVEIS", { exact: true })).toBeVisible();
    await expect(page.getByText("PLANEJADO", { exact: true })).toHaveCount(6);
    await check("map");
    await page.getByRole("button", { name: `Abrir módulo de ${label.toLowerCase()}`, exact: true }).click();
    await expect(page.getByRole("heading", { name: variableActivities.at(-1).title, exact: true, level: 1 })).toBeVisible();
    await page.locator("#variables-code").fill("");
    await expect(page.getByRole("heading", { name: `${label}: primeiras práticas concluídas.`, exact: true })).toHaveCount(0);
    await page.waitForTimeout(300);
    await page.reload();
    await expect(page.locator("#variables-code")).toHaveValue("");
    expect(errors).toEqual([]);
    results.push({ profile: name, module: label, passed: true, codePractices: 7, quizzes: 3, accessibilityViolations: 0, checks: "guided line-by-line, all runtime solutions and alternate inputs, wrong answers and feedback, reset recovery, progress and draft persistence, full map and return, changed draft invalidates completion", loopChecks: loops ? "hardcoded limit rejected; infinite loop times out; manual cancellation preserves draft; recovery after timeout and cancellation" : undefined, limitation: "WebKit emulation does not test physical iOS keyboard" });
    console.log(name + ": passed");
    await writeFile(path.join(dir, "report-v2.json"), JSON.stringify(results, null, 2));
  } catch (error) {
    await page.screenshot({ path: path.join(dir, name + "-failure.png"), fullPage: false }).catch(() => {});
    console.error(await page.locator('[role="status"]').allTextContents());
    results.push({ profile: name, passed: false, error: String(error) });
    await writeFile(path.join(dir, "report-v2.json"), JSON.stringify(results, null, 2));
    throw error;
  } finally { await browser.close(); }
}
await writeFile(path.join(dir, "report-v2.json"), JSON.stringify(results, null, 2));
