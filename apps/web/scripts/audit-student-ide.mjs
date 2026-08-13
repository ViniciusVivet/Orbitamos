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

async function openEditorTab(page) {
  const codeTab = page.getByRole("tab", { name: "Código", exact: true });
  if (await codeTab.isVisible()) await codeTab.click();
}

async function setEditorCode(page, code) {
  const mobileEditor = page.getByLabel("Editor de código");
  if (await mobileEditor.isVisible()) {
    await mobileEditor.fill(code);
    return mobileEditor;
  }
  const monacoEditor = page.locator(".monaco-editor");
  await monacoEditor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
  return monacoEditor;
}

async function auditConsoleControls(page, context, name) {
  // A resposta pedagógica troca automaticamente para o Guia após o acerto.
  await page.waitForTimeout(1_200);
  await openEditorTab(page);
  const consoleOutput = page.locator('#practice-editor-panel [role="status"]');
  const initialHeight = await consoleOutput.evaluate((element) => element.getBoundingClientRect().height);
  const expandButton = page.getByRole("button", { name: "Expandir console", exact: true });
  if (await expandButton.isVisible()) {
    await expandButton.click();
    await page.waitForTimeout(350);
    const expandedHeight = await consoleOutput.evaluate((element) => element.getBoundingClientRect().height);
    if (expandedHeight <= initialHeight) throw new Error(`${name}: console não expandiu`);
    await page.getByRole("button", { name: "Reduzir console", exact: true }).click();
    await page.waitForTimeout(350);
  }

  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
  await page.getByRole("button", { name: "Copiar saída do console", exact: true }).click();
  const copiedOutput = await page.evaluate(() => navigator.clipboard.readText());
  if (!copiedOutput.trim()) throw new Error(`${name}: copiar saída produziu clipboard vazio`);

  await page.getByRole("button", { name: "Limpar console", exact: true }).click();
  await page.getByText('Clique em "Executar" para ver o resultado...', { exact: true }).waitFor();
}

async function auditStopButton(page, name) {
  await openEditorTab(page);
  await setEditorCode(page, "while (true) {}");
  await page.getByRole("button", { name: "Executar", exact: false }).click();
  const stopButton = page.getByRole("button", { name: "Interromper execução", exact: true });
  await stopButton.waitFor({ state: "visible", timeout: 2_000 });
  await stopButton.click();
  await page.getByText("Execução interrompida. Seu código continua salvo para você ajustar e tentar novamente.", { exact: true }).waitFor({ state: "attached" });
  if (await stopButton.isVisible()) throw new Error(`${name}: botão Parar continuou visível após cancelamento`);
}

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

    const guideTab = page.getByRole("tab", { name: "Guia", exact: true });
    if (await guideTab.isVisible()) {
      await guideTab.click();
      if ((await guideTab.getAttribute("aria-selected")) !== "true") throw new Error(`${name}: aba Guia não foi selecionada`);
      await openEditorTab(page);
    }

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
    await auditConsoleControls(page, context, name);
    if (name !== "desktop") await auditStopButton(page, name);
    await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });

    results.push({
      name,
      ...metrics,
      runButton: runButtonBox && { width: Math.round(runButtonBox.width), height: Math.round(runButtonBox.height) },
      pageErrors: errors,
    });
    await context.close();
  }

  const pythonContext = await browser.newContext(devices["Pixel 7"]);
  const pythonPage = await pythonContext.newPage();
  const pythonErrors = [];
  pythonPage.on("pageerror", (error) => pythonErrors.push(error.message));
  await pythonPage.goto(`${baseURL}/dev/ide-preview/variaveis-python`, { waitUntil: "networkidle" });
  await pythonPage.getByText("Ficha do Aluno", { exact: true }).waitFor({ timeout: 15_000 });
  await setEditorCode(pythonPage, "nome = 'Ana'\nidade = 20\nestudando = True\nprint(nome)\nprint(idade)\nprint(estudando)");
  const pythonStartedAt = Date.now();
  await pythonPage.getByRole("button", { name: "Executar", exact: false }).click();
  const pythonConsole = pythonPage.locator('#practice-editor-panel [role="status"]');
  await pythonPage.waitForTimeout(25_000);
  const firstPythonOutput = await pythonConsole.innerText();
  const pythonAvailable = firstPythonOutput.split("\n").includes("True");
  if (!pythonAvailable && process.env.IDE_AUDIT_REQUIRE_PYTHON === "1") {
    throw new Error(`python-pixel-7: execução falhou. Console: ${firstPythonOutput}`);
  }

  if (pythonAvailable) {
    await setEditorCode(pythonPage, "if True:\nprint('erro')");
    await pythonPage.getByRole("button", { name: "Executar", exact: false }).click();
    await pythonPage.getByText("IndentationError", { exact: false }).waitFor({ state: "attached", timeout: 30_000 });

    await openEditorTab(pythonPage);
    await setEditorCode(pythonPage, "while True:\n    pass");
    await pythonPage.getByRole("button", { name: "Executar", exact: false }).click();
    const pythonStop = pythonPage.getByRole("button", { name: "Interromper execução", exact: true });
    await pythonStop.waitFor({ state: "visible", timeout: 2_000 });
    await pythonStop.click();
    await pythonPage.getByText("Execução interrompida. Seu código continua salvo para você ajustar e tentar novamente.", { exact: true }).waitFor({ state: "attached" });
  }
  await pythonPage.screenshot({ path: path.join(outputDir, "python-pixel-7.png"), fullPage: true });
  results.push({
    name: "python-pixel-7",
    pythonAvailable,
    firstPythonRunMs: Date.now() - pythonStartedAt,
    consoleText: (await pythonConsole.innerText()).slice(0, 200),
    pageErrors: pythonErrors,
    hasHorizontalOverflow: await pythonPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
  });
  await pythonContext.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));

if (results.some((result) => result.hasHorizontalOverflow || result.pageErrors.length)) {
  process.exitCode = 1;
}

if (results.filter((result) => result.name !== "desktop" && result.runButton).some((result) => result.runButton.height < 44)) {
  throw new Error("Controles principais precisam ter ao menos 44px no mobile.");
}
