import { chromium, webkit, devices, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const directory = "test-results/game-continuity";
await mkdir(directory, { recursive: true });
const base = process.env.IDE_AUDIT_URL || "http://localhost:3015";
const profiles = [
  ["small", chromium, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
  ["iphone", webkit, devices["iPhone 13"]],
].filter(([name]) => !process.env.GAME_PROFILE || process.env.GAME_PROFILE === name);

for (const [name, engine, device] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...device, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [], checks = [];
  page.on("pageerror", error => errors.push(error.message));
  const visit = path => page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  async function capture(label) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `${directory}/${name}-${label}.jpg`, fullPage: true });
    checks.push(label);
  }

  try {
    await visit("/dev/monte-codigo-preview/ola-orbi-js");
    await page.getByRole("heading", { name: "Blocos disponíveis", exact: true }).waitFor({ timeout: 90000 });
    await page.getByRole("heading", { name: "Blocos disponíveis", exact: true }).locator("..").getByRole("button").first().click();
    const firstBlock = await page.getByRole("button", { name: "Remover linha 1", exact: true }).innerText();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Remover linha 1", exact: true })).toHaveText(firstBlock);
    await page.getByRole("button", { name: "Embaralhar", exact: true }).click();
    for (const code of ['let nome = "Orbi";', 'let mensagem = "Olá, " + nome + "!";', "console.log(mensagem);"]) await page.getByRole("button", { name: code, exact: true }).click();
    await page.getByRole("button", { name: "Verificar programa", exact: true }).click();
    await page.getByRole("button", { name: "undefined", exact: true }).click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "undefined", exact: true })).toHaveClass(/border-red/);
    await page.getByRole("button", { name: "Olá, Orbi!", exact: true }).click();
    await expect(page.locator("[data-learning-bridge]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Experimentar no código", exact: true })).toHaveAttribute("href", /variaveis-js/);
    await capture("assembly-bridge");
    await page.getByRole("button", { name: "Jogar de novo", exact: true }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-jogo-monte-monte-codigo-preview-ola-orbi-js")).concluido)).toBe(true);
    checks.push("assembly-partial-and-prediction-reload-reset-preserves-achievement");

    await visit("/dev/vila-preview");
    await page.getByRole("button", { name: /Entrar na vila|Voltar à aventura/ }).waitFor({ timeout: 90000 });
    await page.getByRole("button", { name: /Entrar na vila|Voltar à aventura/ }).click();
    await page.getByRole("button", { name: /Escolher Lili/ }).click();
    await page.getByRole("button", { name: "Encaixar personagem no código", exact: true }).click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /Entrar na vila|Voltar à aventura/ }).click();
    await expect(page.getByRole("button", { name: /Escolher Lili/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Encaixar personagem no código", exact: true })).toContainText("Lili no encaixe");
    await page.getByRole("button", { name: /^Fase 7:/ }).click();
    await page.getByRole("button", { name: "Adicionar 4 espaços à linha 3", exact: true }).click();
    await page.getByRole("button", { name: /^Fase 1:/ }).click();
    await expect(page.getByRole("button", { name: "Encaixar personagem no código", exact: true })).toContainText("Lili no encaixe");
    await page.getByRole("button", { name: /^Fase 7:/ }).click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /Entrar na vila|Voltar à aventura/ }).click();
    await expect(page.locator("[data-indent]").nth(2)).toHaveAttribute("data-indent", "1");
    await page.getByRole("button", { name: "Testar na vila", exact: false }).click();
    await expect(page.locator("[data-learning-bridge]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Experimentar no código", exact: true })).toHaveAttribute("href", /condicionais-python/);
    const lights = await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-vila-v1-vila-preview")).completed);
    await capture("village-bridge");
    await page.getByRole("button", { name: "Recomeçar esta fase", exact: true }).click();
    await expect(page.locator("[data-indent]").nth(2)).toHaveAttribute("data-indent", "0");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-vila-v1-vila-preview")).completed)).toEqual(lights);
    checks.push("village-socket-indent-phase-switch-reload-reset-preserves-lights");

    await visit("/dev/orbi-preview/funcao-f");
    await page.getByRole("heading", { name: "A Função F", exact: true }).waitFor({ timeout: 90000 });
    await page.getByRole("button", { name: /Chamar F$/ }).click();
    await page.getByRole("button", { name: /Chamar F$/ }).click();
    await page.getByRole("button", { name: "Função F", exact: true }).click();
    await page.getByRole("button", { name: "Avançar", exact: true }).click();
    await page.getByRole("button", { name: "Avançar", exact: true }).click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("group", { name: "Programa principal", exact: true }).getByRole("button", { name: /^Selecionar Chamar F/ })).toHaveCount(2);
    await expect(page.getByRole("group", { name: "Função F", exact: true }).getByRole("button", { name: /^Selecionar Avançar/ })).toHaveCount(2);
    await expect(page.locator("[data-learning-bridge]")).toHaveCount(0);
    await page.getByRole("button", { name: "Executar programa", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Portal alcançado!", exact: true })).toBeVisible();
    await expect(page.locator("[data-learning-bridge]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Experimentar no código", exact: true })).toHaveAttribute("href", /funcoes-js/);
    await capture("orbi-bridge");
    await page.getByRole("button", { name: "Tentar com menos comandos", exact: true }).click();
    await page.getByRole("button", { name: "Limpar", exact: true }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-jogo-orbi-orbi-preview-funcao-f")).concluido)).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem("orbitamos-orbi-draft-v1-orbi-preview-funcao-f"))).toBeNull();
    checks.push("orbi-both-tracks-reload-validated-portal-reset-preserves-achievement");
    expect(errors).toEqual([]);
    console.log(`PASS ${name}: game drafts, targeted bridges, reload and reset preserve achievements`);
  } catch (error) {
    await page.screenshot({ path: `${directory}/${name}-failure.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${directory}/${name}-report.json`, JSON.stringify({ checks, errors, physicalDevice: false }, null, 2));
    await browser.close();
  }
}
