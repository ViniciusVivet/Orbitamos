import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.IDE_AUDIT_URL || "http://localhost:3015";
const dir = "test-results/practice-onboarding";
await mkdir(dir, { recursive: true });
const discount = "function precoFinal(preco, desconto) {\n  return preco - preco * (desconto / 100);\n}\nconsole.log(precoFinal(200, 15));";
const profiles = [
  ["desktop", chromium, { viewport: { width: 1440, height: 1000 } }],
  ["iphone-webkit", webkit, devices["iPhone 13"]],
  ["small-phone", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }],
];
for (const [name, engine, options] of profiles.filter(([name]) => !process.env.PRACTICE_PROFILE || process.env.PRACTICE_PROFILE === name)) {
  const browser = await engine.launch();
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  const results = [];
  page.on("pageerror", error => errors.push({ message: error.message, stack: error.stack, url: page.url() }));
  async function check(label, selector = "[data-guided-lab]") {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${label} overflow`).toBe(true);
    const axe = await new AxeBuilder({ page }).include(selector).analyze();
    expect(axe.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), `${name}/${label} accessibility`).toEqual([]);
    await page.screenshot({ path: `${dir}/${name}-${label}.jpg`, fullPage: true, type: "jpeg", quality: 75 });
    results.push(label);
  }
  const editor = page.getByRole("textbox", { name: "Seu código", exact: true });
  const run = page.getByRole("button", { name: "Executar código", exact: true });
  const stage = page.getByRole("group", { name: /^Missão 1 de 1, etapa/ });
  const toggle = page.getByRole("checkbox", { name: "Avanço automático", exact: true });
  try {
    await page.goto(`${base}/dev/ide-preview/operadores-js`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await expect(page.getByRole("region", { name: "Antes de começar", exact: true })).toBeVisible({ timeout: 90000 });
    await expect(editor).toHaveCount(0);
    await expect(page.getByText("R$ 200 · desconto de 15%", { exact: true })).toBeVisible();
    await check("intro");
    await page.getByRole("button", { name: "Entendi, vamos construir" }).click();
    await expect(editor).toHaveValue("");
    await expect(toggle).toBeChecked();
    await expect(run).toBeDisabled();
    await editor.fill("function precoFinal(preco, desconto) {");
    await expect(stage).toHaveAttribute("aria-label", "Missão 1 de 1, etapa 2 de 4", { timeout: 5000 });
    await expect(editor).toBeFocused();
    await expect(page.getByRole("heading", { name: "Calcule o desconto e devolva o preço", exact: true })).toBeVisible();
    await expect(run).toBeDisabled();
    await check("writing");

    // Revisit must not bounce forward just because the old prefix still matches.
    await page.getByRole("button", { name: "Rever etapa anterior" }).click();
    await editor.focus();
    await page.waitForTimeout(1200);
    await expect(stage).toHaveAttribute("aria-label", "Missão 1 de 1, etapa 1 de 4");
    await toggle.uncheck();
    await editor.fill(discount.split("\n").slice(0, 2).join("\n"));
    await page.waitForTimeout(1200);
    await expect(stage).toHaveAttribute("aria-label", "Missão 1 de 1, etapa 1 de 4");
    await toggle.check();
    await editor.focus();
    await page.waitForTimeout(1200);
    await expect(stage).toHaveAttribute("aria-label", "Missão 1 de 1, etapa 1 de 4");

    // IME/composition must finish before the timer is armed.
    await editor.fill("");
    await editor.dispatchEvent("compositionstart");
    await editor.fill(discount);
    await page.waitForTimeout(1200);
    await expect(stage).toHaveAttribute("aria-label", "Missão 1 de 1, etapa 1 de 4");
    await editor.dispatchEvent("compositionend");
    await expect(stage).toHaveAttribute("aria-label", "Missão 1 de 1, etapa 2 de 4", { timeout: 5000 });
    await page.waitForTimeout(1200);
    await expect(stage).toHaveAttribute("aria-label", "Missão 1 de 1, etapa 2 de 4");
    await expect(editor).toBeFocused();
    await expect(page.getByText("Resultado validado. Boa!", { exact: true })).toHaveCount(0);
    await expect(run).toBeEnabled();

    await page.getByRole("button", { name: "Rever a história da missão" }).click();
    await page.getByRole("button", { name: "Entendi, vamos construir" }).click();
    await expect(editor).toHaveValue(discount);
    await page.waitForTimeout(350);
    await page.reload();
    await expect(editor).toHaveValue(discount, { timeout: 60000 });
    await expect(page.getByRole("region", { name: "Antes de começar", exact: true })).toHaveCount(0);
    await editor.focus();
    await page.waitForTimeout(1200);
    await expect(stage).toHaveAttribute("aria-label", "Missão 1 de 1, etapa 2 de 4");
    await run.click();
    await expect(page.getByText("Resultado validado. Boa!", { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("region", { name: "Resultado da execução" })).toContainText("170");
    await check("completed");

    await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
    await page.getByRole("button", { name: "Sim, reiniciar", exact: true }).click();
    await expect(editor).toHaveValue("");
    await expect(run).toBeDisabled();
    await page.getByRole("button", { name: "Recuperar código anterior ao reinício" }).click();
    await expect(editor).toHaveValue(discount);
    await editor.fill('console.log("explorando");');
    await expect(run).toBeDisabled();
    await page.getByRole("button", { name: "Quero testar meu código mesmo assim" }).click();
    await run.click();
    await expect(page.getByRole("region", { name: "Resultado da execução" })).toContainText("explorando");
    await expect(page.getByText("Resultado validado. Boa!", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Modo livre", exact: true }).click();
    await page.getByRole("button", { name: "Voltar ao passo a passo", exact: true }).click();
    await expect(editor).toHaveValue('console.log("explorando");');
    await page.setViewportSize({ width: options.viewport.width, height: 440 });
    await editor.focus();
    expect(await editor.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    await check("short-viewport");
    await page.setViewportSize(options.viewport);

    await page.goto(`${base}/dev/lab-preview`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.getByRole("button", { name: "Python", exact: true }).click();
    await page.getByRole("button", { name: /2\. Lógica e decisões/ }).click();
    const cards = page.locator("[data-language]");
    await expect(cards).toHaveCount(3);
    expect(await cards.evaluateAll(elements => elements.every(el => el.dataset.language === "python"))).toBe(true);
    await expect(page.getByRole("link", { name: /Trilha C# & .NET/ })).toHaveCount(0);
    await check("catalog-python", "[data-lab-catalog]");
    await page.getByRole("button", { name: "C#", exact: true }).click();
    await expect(cards).toHaveCount(2);
    await expect(page.getByRole("link", { name: /Trilha C# & .NET/ })).toHaveAttribute("href", "/estudante/trilhas/csharp");
    await page.getByRole("button", { name: /3\. Funções e dados/ }).click();
    await expect(cards).toHaveCount(0);
    await page.getByText("Depois dos fundamentos: projetos profissionais", { exact: false }).click();
    await expect(page.getByText("Em preparação", { exact: true })).toBeVisible();
    await check("catalog-roadmap", "[data-lab-catalog]");
    await page.getByRole("button", { name: "Mostrar todos os experimentos" }).click();
    await expect(cards).toHaveCount(32);

    // Embedded C# module must remain usable without a second intro gate.
    await page.goto(`${base}/dev/csharp-preview`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.getByRole("button", { name: "Começar a codar · variáveis", exact: true }).click();
    await expect(editor).toBeVisible();
    await expect(page.getByRole("region", { name: "Antes de começar", exact: true })).toHaveCount(0);
    await check("embedded-csharp");
    expect(errors).toEqual([]);
    console.log(`PASS ${name}: ${results.join(", ")}; auto/manual/IME/resume/reset/free mode passed`);
  } catch (error) {
    await page.screenshot({ path: `${dir}/${name}-failure.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${dir}/${name}-report.json`, JSON.stringify({ passed: results, errors, physicalKeyboard: "Not tested; short viewport and WebKit emulation only." }, null, 2));
    await browser.close();
  }
}
