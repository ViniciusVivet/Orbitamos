import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.IDE_AUDIT_URL || "http://localhost:3015";
const dir = "test-results/practice-continuity";
await mkdir(dir, { recursive: true });
const code = "function precoFinal(preco, desconto) {\n  return preco - preco * (desconto / 100);\n}\nconsole.log(precoFinal(200, 15));";
const profiles = [
  ["desktop", chromium, { viewport: { width: 1440, height: 1000 } }],
  ["iphone-webkit", webkit, devices["iPhone 13"]],
  ["small-phone", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }],
];
for (const [name, engine, options] of profiles.filter(([name]) => !process.env.PRACTICE_PROFILE || name === process.env.PRACTICE_PROFILE)) {
  const browser = await engine.launch();
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  const checks = [];
  page.on("pageerror", error => errors.push(error.message));
  async function capture(label, root = "[data-guided-lab]") {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${label} overflow`).toBe(true);
    const axe = await new AxeBuilder({ page }).include(root).analyze();
    expect(axe.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) })), `${name}/${label} axe`).toEqual([]);
    await page.screenshot({ path: `${dir}/${name}-${label}.jpg`, fullPage: true, type: "jpeg", quality: 75 });
    checks.push(label);
  }
  try {
    await page.goto(`${base}/dev/ide-preview/operadores-js`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.getByRole("button", { name: "Entendi, vamos construir" }).click({ timeout: 90000 });
    const map = page.locator("[data-practice-map]");
    await map.locator("summary").click();
    await expect(map.locator("li")).toHaveCount(14);
    await expect(map.locator('[aria-current="step"]')).toContainText("Calculadora de Desconto");
    await expect(map.getByRole("link", { name: /Classificador de Nota/ })).toHaveAttribute("href", "/estudante/pratica/condicionais-js");
    await expect(map.getByRole("link", { name: /Explorar o catálogo/ })).toHaveAttribute("href", "/estudante/pratica?linguagem=javascript#experimentos");
    await capture("map");
    await map.locator("summary").click();
    const editor = page.getByRole("textbox", { name: "Seu código", exact: true });
    const toggle = page.getByRole("button", { name: /^Foco no código/ });
    await page.getByRole("checkbox", { name: "Avanço automático", exact: true }).uncheck();
    await editor.fill("function precoFinal(preco, desconto) {");
    const handle = await editor.elementHandle();
    await editor.evaluate(el => { el.focus(); el.setSelectionRange(9, 18); });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(editor).toBeFocused();
    expect(await handle.evaluate(el => el.isConnected)).toBe(true);
    expect(await editor.evaluate(el => [el.selectionStart, el.selectionEnd])).toEqual([9, 18]);
    await expect(map).toBeHidden();
    await page.getByText("Entender esta linha", { exact: true }).click();
    await expect(page.getByText(/preco e desconto são parâmetros/, { exact: false }).filter({ visible: true })).toBeVisible();
    await capture("focus");
    await page.getByText("Entender esta linha", { exact: true }).click();
    await editor.fill("const valores = ");
    await editor.focus();
    await editor.press("ControlOrMeta+End");
    await page.getByRole("button", { name: "Inserir [", exact: true }).click();
    await page.getByRole("button", { name: "Inserir ]", exact: true }).click();
    await page.getByRole("button", { name: "Inserir ;", exact: true }).click();
    await expect(editor).toHaveValue("const valores = [];");
    await expect(editor).toBeFocused();
    await toggle.click();
    await expect(map).toBeVisible();
    expect(await handle.evaluate(el => el.isConnected)).toBe(true);
    await editor.fill(code);
    await page.getByRole("button", { name: "Executar código", exact: true }).click();
    await page.getByRole("heading", { name: "Você escreveu. E fez funcionar.", exact: true }).waitFor({ timeout: 15000 });
    const question = page.getByRole("region", { name: "Conferir entendimento", exact: true });
    await expect(page.getByRole("link", { name: /Aplicar o que aprendi/ })).toHaveAttribute("href", "#practice-check");
    await page.getByRole("link", { name: /Aplicar o que aprendi/ }).click();
    await expect(question).toHaveAttribute("id", "practice-check");
    await question.getByRole("radio", { name: "55", exact: true }).check();
    await expect(question).toContainText("25 é uma porcentagem");
    await expect(page.getByRole("heading", { name: "Você escreveu. E fez funcionar.", exact: true })).toBeVisible();
    await question.getByRole("radio", { name: "60", exact: true }).check();
    await expect(question).toContainText("80 − 20 = 60");
    await capture("check");
    await page.reload();
    await expect(editor).toHaveValue(code);
    await expect(question.getByRole("radio", { name: "60", exact: true })).toBeChecked();
    await question.getByRole("button", { name: "Experimentar no modo livre" }).click();
    await page.getByRole("button", { name: "Voltar ao passo a passo", exact: true }).click();
    await expect(editor).toHaveValue(code);
    await editor.fill(code.replace("200, 15", "200, 10"));
    await expect(question).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Você escreveu. E fez funcionar.", exact: true })).toHaveCount(0);

    await page.goto(`${base}/dev/lab-preview`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.getByRole("button", { name: "Python", exact: true }).click();
    await page.getByRole("button", { name: /2\. Lógica e decisões/ }).click();
    await expect(page.locator("[data-language]")).toHaveCount(3);
    await page.reload();
    await expect(page.getByRole("button", { name: "Python", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: /2\. Lógica e decisões/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-language]")).toHaveCount(3);
    await capture("catalog-restored", "[data-lab-catalog]");
    await page.goto(`${base}/dev/lab-preview?linguagem=csharp`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await expect(page.getByRole("button", { name: "C#", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-language]")).toHaveCount(4);
    await expect(page.getByRole("button", { name: /Explorar tudo/ })).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
    console.log(`PASS ${name}: ${checks.join(", ")}; caret, punctuation, check persistence, free draft isolation, filters`);
  } catch (error) {
    await page.screenshot({ path: `${dir}/${name}-failure.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${dir}/${name}-report.json`, JSON.stringify({ checks, errors, physicalKeyboard: "Requires manual iPhone test; emulation only" }, null, 2));
    await browser.close();
  }
}
