import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const directory = "test-results/game-preview-handoff";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
page.setDefaultTimeout(20000);
const base = process.env.IDE_AUDIT_URL || "http://localhost:3015";
const visit = path => page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: 120000 });
const errors = [], checks = [];
page.on("pageerror", error => errors.push(error.message));
const openCard = title => page.locator("[data-practice-station] a").filter({ has: page.getByRole("heading", { name: title, exact: true }) }).click();

try {
  // Independent previews keep their established identities and drafts.
  await visit("/dev/monte-codigo-preview/ola-orbi-js");
  await page.getByRole("heading", { name: "Blocos disponíveis", exact: true }).waitFor({ timeout: 90000 });
  await page.getByRole("heading", { name: "Blocos disponíveis", exact: true }).locator("..").getByRole("button").first().click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("orbitamos-monte-draft-v1-monte-codigo-preview-ola-orbi-js"))).not.toBeNull();
  const independentMonte = await page.evaluate(() => localStorage.getItem("orbitamos-monte-draft-v1-monte-codigo-preview-ola-orbi-js"));
  await visit("/dev/academy-preview");
  await openCard("Monte o Código");
  await expect(page).toHaveURL(/monte-codigo-preview\/ola-orbi-js\?from=academy/);
  await page.getByRole("heading", { name: "Blocos disponíveis", exact: true }).waitFor();
  await expect(page.getByRole("button", { name: "Remover linha 1", exact: true })).toHaveCount(0);
  await page.getByRole("heading", { name: "Blocos disponíveis", exact: true }).locator("..").getByRole("button").first().click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("orbitamos-monte-draft-v1-academy-preview-ola-orbi-js"))).not.toBeNull();
  await page.getByRole("link", { name: "Voltar para os jogos", exact: true }).click();
  await page.getByRole("link", { name: /^Retomar: Monte o Código/ }).click();
  await expect(page.getByRole("button", { name: "Remover linha 1", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Embaralhar", exact: true }).click();
  for (const code of ['let nome = "Orbi";', 'let mensagem = "Olá, " + nome + "!";', "console.log(mensagem);"]) await page.getByRole("button", { name: code, exact: true }).click();
  await page.getByRole("button", { name: "Verificar programa", exact: true }).click();
  await page.getByRole("button", { name: "Olá, Orbi!", exact: true }).click();
  await expect(page.getByRole("link", { name: /^Próxima fase:/ })).toHaveAttribute("href", "/dev/monte-codigo-preview/par-ou-impar-js?from=academy");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-jogo-monte-academy-preview-ola-orbi-js")).concluido)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("orbitamos-monte-draft-v1-monte-codigo-preview-ola-orbi-js"))).toBe(independentMonte);
  await page.getByRole("link", { name: /^Próxima fase:/ }).click();
  await expect(page.getByRole("heading", { name: "Par ou Ímpar?", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Voltar para os jogos", exact: true }).click();
  await expect(page.getByRole("link", { name: /^Retomar: Monte o Código/ })).toHaveAttribute("href", "/dev/monte-codigo-preview/par-ou-impar-js?from=academy");
  await expect(page.getByText("0 de 6 experiências praticadas neste navegador", { exact: true })).toBeVisible();
  checks.push("academy-monte-shared-draft-progress-next-phase-and-independent-save-preserved");

  await visit("/dev/orbi-preview/decolagem");
  await page.getByRole("heading", { name: "Decolagem", exact: true }).waitFor({ timeout: 90000 });
  await page.getByRole("button", { name: "Avançar", exact: true }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("orbitamos-orbi-draft-v1-orbi-preview-decolagem"))).not.toBeNull();
  const independentOrbi = await page.evaluate(() => localStorage.getItem("orbitamos-orbi-draft-v1-orbi-preview-decolagem"));
  await visit("/dev/academy-preview");
  await openCard("Guia o Orbi");
  await expect(page).toHaveURL(/orbi-preview\/decolagem\?from=academy/);
  await expect(page.getByRole("group", { name: "Programa principal", exact: true }).getByRole("button", { name: /^Selecionar Avançar/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Avançar", exact: true }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("orbitamos-orbi-draft-v1-academy-preview-decolagem"))).not.toBeNull();
  await page.getByRole("link", { name: "Voltar para o mapa de níveis", exact: true }).click();
  await page.getByRole("link", { name: /^Retomar: Guia o Orbi/ }).click();
  await expect(page.getByRole("group", { name: "Programa principal", exact: true }).getByRole("button", { name: /^Selecionar Avançar/ })).toHaveCount(1);
  await page.getByRole("button", { name: "Avançar", exact: true }).click();
  await page.getByRole("button", { name: "Avançar", exact: true }).click();
  await page.getByRole("button", { name: "Executar programa", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Portal alcançado!", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Próximo nível:/ })).toHaveAttribute("href", "/dev/orbi-preview/primeira-curva?from=academy");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-jogo-orbi-academy-preview-decolagem")).concluido)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("orbitamos-orbi-draft-v1-orbi-preview-decolagem"))).toBe(independentOrbi);
  await page.getByRole("link", { name: /^Próximo nível:/ }).click();
  await expect(page.getByRole("heading", { name: "Primeira Curva", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Voltar para o mapa de níveis", exact: true }).click();
  await expect(page.getByRole("link", { name: /^Retomar: Guia o Orbi/ })).toHaveAttribute("href", "/dev/orbi-preview/primeira-curva?from=academy");
  await expect(page.getByText("0 de 6 experiências praticadas neste navegador", { exact: true })).toBeVisible();
  checks.push("academy-orbi-shared-draft-progress-next-level-and-independent-save-preserved");
  expect(errors).toEqual([]);
  console.log("PASS academy game handoff: shared identity, independent saves, resume and subsequent phases");
} catch (error) {
  await page.screenshot({ path: `${directory}/failure.jpg`, fullPage: true }).catch(() => {});
  throw error;
} finally {
  await writeFile(`${directory}/report.json`, JSON.stringify({ checks, errors }, null, 2));
  await browser.close();
}
