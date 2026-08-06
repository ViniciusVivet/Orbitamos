import { chromium, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.IDE_AUDIT_URL || "http://localhost:3000";
const outputDir = path.resolve("test-results", "student-ide");
await mkdir(outputDir, { recursive: true });

const profiles = [
  ["iphone-13", devices["iPhone 13"]],
  ["pixel-7", devices["Pixel 7"]],
  ["desktop", { viewport: { width: 1440, height: 900 } }],
];

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const [name, options] of profiles) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`${baseURL}/dev/ide-preview/operadores-js`, { waitUntil: "networkidle" });
    const challengeTitle = page.getByText("Calculadora de Desconto", { exact: true });
    try {
      await challengeTitle.waitFor({ timeout: 15_000 });
    } catch {
      const visibleText = await page.locator("main").innerText();
      throw new Error(`${name}: IDE não abriu em ${page.url()}. Conteúdo: ${visibleText.slice(0, 500)}`);
    }
    await page.locator('.monaco-editor, textarea[aria-label="Editor de código"]').waitFor({ timeout: 12_000 });

    const metrics = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      activeElement: document.activeElement?.tagName || null,
    }));

    const runButton = page.getByRole("button", { name: "Executar", exact: false });
    const runButtonBox = await runButton.boundingBox();
    const editor = page.getByLabel("Editor de código");
    const validCode = 'function precoFinal(preco, desconto) {\n  return preco - preco * (desconto / 100);\n}\n\nconsole.log(precoFinal(200, 15));';
    if (await editor.isVisible()) {
      await editor.fill(validCode);
      const equalsKey = page.getByRole("button", { name: "Inserir =", exact: true });
      if (await equalsKey.isVisible()) {
        await editor.press("End");
        await equalsKey.click();
        if (!(await editor.inputValue()).endsWith("=")) throw new Error(`${name}: barra de símbolos não inseriu texto`);
        await editor.fill(validCode);
      }
    }

    await runButton.click();
    const consoleOutput = page.locator('#practice-editor-panel [role="status"]');
    await consoleOutput.waitFor({ state: "attached" });
    await page.waitForTimeout(500);
    const consoleText = await consoleOutput.innerText();
    const expectedOutput = name === "desktop" ? "undefined" : "170";
    if (!consoleText.split("\n").includes(expectedOutput)) {
      throw new Error(`${name}: execução não retornou ${expectedOutput}. Console: ${consoleText}`);
    }
    await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });

    results.push({
      name,
      ...metrics,
      runButton: runButtonBox && { width: Math.round(runButtonBox.width), height: Math.round(runButtonBox.height) },
      pageErrors: errors,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));

if (results.some((result) => result.hasHorizontalOverflow || result.pageErrors.length)) {
  process.exitCode = 1;
}

if (results.filter((result) => result.name !== "desktop").some((result) => (result.runButton?.height ?? 0) < 44)) {
  throw new Error("Controles principais precisam ter ao menos 44px no mobile.");
}
