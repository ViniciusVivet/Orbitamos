import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "test-results/guided-onboarding";
await mkdir(output, { recursive: true });
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 900 } }], ["iphone", webkit, devices["iPhone 13"]], ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }]].filter(([name]) => !process.argv[2] || process.argv[2] === name);
for (const [name, engine, options] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  const report = { completed: false, checks: [], errors: [] };
  page.on("pageerror", error => report.errors.push(error.message));
  const activate = locator => options.hasTouch ? locator.tap() : locator.click();
  try {
    await page.goto("http://localhost:3015/dev/ide-preview/variaveis-js?academy=1", { waitUntil: "domcontentloaded", timeout: 120000 });
    await activate(page.getByRole("button", { name: "Entendi, vamos construir", exact: true }));
    const editor = page.getByRole("textbox", { name: "Seu código", exact: true });
    await expect(editor).toBeVisible();
    await expect(page.getByText("Seu objetivo, mapa e opções", { exact: false })).toBeVisible();
    if (options.hasTouch) {
      await expect.poll(async () => editor.evaluate(node => {
        const box = node.getBoundingClientRect();
        return box.top >= 64 && box.bottom <= innerHeight;
      })).toBe(true);
      report.editorPosition = await editor.evaluate(node => ({ top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, viewport: innerHeight }));
      await page.screenshot({ path: `${output}/${name}-first-step.jpg` });
      await expect(page.getByRole("navigation", { name: "Formatos de prática" })).toBeHidden();
      await expect(page.getByRole("group", { name: "Teclas para programar", exact: true }).getByRole("button")).toHaveCount(6);
      await activate(page.getByText("Mais símbolos para programar", { exact: true }));
      await expect(page.getByRole("group", { name: "Outras teclas para programar" }).getByRole("button", { name: "Inserir [", exact: true })).toBeVisible();
      await activate(page.getByText("Mais símbolos para programar", { exact: true }));
    }
    if (!options.hasTouch) await page.screenshot({ path: `${output}/${name}-first-step.jpg` });
    const program = 'const nome = "João";\nconsole.log(nome);';
    await editor.fill(program);
    const run = page.getByRole("button", { name: "Executar código", exact: true });
    await expect(run).toBeEnabled();
    await activate(run);
    await expect(page.getByRole("region", { name: "Resultado da execução" })).toContainText("Resultado validado");
    await expect(page.getByRole("region", { name: "Resultado da execução" })).toContainText("João");
    await activate(page.getByRole("button", { name: "Continuar para próxima missão", exact: true }));
    const second = program + '\nvar idade = 28;\nconsole.log(idade);';
    await editor.fill(second);
    await expect(run).toBeEnabled();
    await activate(run);
    await expect(page.getByRole("region", { name: "Resultado da execução" })).toContainText("Resultado validado");
    await activate(page.getByRole("button", { name: "Continuar para próxima missão", exact: true }));
    const third = second + '\nlet ativo = false;\nconsole.log(ativo);';
    await editor.fill(third);
    await expect(run).toBeEnabled();
    await activate(run);
    await expect(page.locator("[data-beginner-practice]")).toBeVisible();
    await page.reload();
    await page.getByText("Rever o guia concluído e meu código", { exact: true }).waitFor({ timeout: 90000 });
    await activate(page.getByText("Rever o guia concluído e meu código", { exact: true }));
    await editor.waitFor({ state: "visible", timeout: 90000 });
    await expect(editor).toHaveValue(third, { timeout: 45000 });
    report.checks.push("personalized name, numeric age and boolean accepted through three missions; actual execution and restored draft");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const axe = await new AxeBuilder({ page }).include("[data-guided-lab]").analyze();
    report.violations = axe.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }));
    expect(report.violations).toEqual([]);
    expect(report.errors).toEqual([]);
    report.completed = true;
    console.log(`${name}: guided onboarding, mobile writing and semantic completion passed`);
  } catch (error) {
    report.failure = String(error); report.url = page.url();
    await page.screenshot({ path: `${output}/${name}-failure.jpg` }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${output}/${name}.json`, JSON.stringify(report, null, 2));
    await context.close(); await browser.close();
  }
}
