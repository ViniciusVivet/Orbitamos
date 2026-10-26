import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const dir = "test-results/sql-studio";
await mkdir(dir, { recursive: true });
const missions = [
  ["CREATE TABLE produtos (", "id INTEGER PRIMARY KEY,", "nome TEXT NOT NULL,", "estoque INTEGER NOT NULL", ") STRICT;"],
  ["INSERT INTO produtos (id, nome, estoque)", "VALUES", "(1, 'Caderno', 12),", "(2, 'Caneta', 3);"],
  ["SELECT nome, estoque", "FROM produtos", "ORDER BY id;"],
  ["SELECT nome, estoque", "FROM produtos", "WHERE estoque < 5", "ORDER BY id;"],
  ["UPDATE produtos", "SET estoque = 8", "WHERE id = 2;"],
];
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 1000 } }], ["iphone", webkit, devices["iPhone 13"]], ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }]];
for (const [name, engine, device] of profiles.filter(([name]) => !process.env.SQL_PROFILE || name === process.env.SQL_PROFILE)) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...device, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [], requests = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("request", r => { if (r.url().includes("sql-wasm")) requests.push(r.url()); });
  const line = n => page.getByRole("textbox", { name: `SQL linha ${n}`, exact: true });
  const execute = () => page.getByRole("button", { name: "Executar SQL", exact: false });
  async function capture(label) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect((await new AxeBuilder({ page }).include("[data-sql-studio]").analyze()).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
    await page.screenshot({ path: `${dir}/${name}-${label}.jpg`, fullPage: true });
  }
  try {
    await page.goto("http://localhost:3015/dev/sql-preview", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.getByLabel("Opções da aventura", { exact: true }).click();
    await page.getByRole("button", { name: "Abrir oficina de criação", exact: true }).click();
    await page.getByRole("button", { name: "Construir com o Orbi" }).waitFor({ timeout: 90000 });
    await capture("intro");
    await page.getByRole("button", { name: "Construir com o Orbi" }).click();
    await expect(execute()).toBeVisible({ timeout: 45000 });
    await line(1).fill("CREATE TABLE"); await execute().click();
    await expect(page.getByText("O banco não executou.", { exact: false })).toBeVisible({ timeout: 15000 });
    await expect(line(1)).toHaveValue("CREATE TABLE");
    for (let m = 0; m < missions.length; m++) {
      await expect(execute()).toBeVisible({ timeout: 15000 });
      for (let i = 0; i < missions[m].length; i++) await line(i + 1).fill(missions[m][i]);
      await expect(page.getByText("Escrita conferida.", { exact: false })).toBeVisible();
      await expect(page.getByRole("button", { name: "Próxima missão" })).toHaveCount(0);
      if (m === 0) {
        await line(1).press("Enter"); await expect(line(2)).toBeFocused();
        await line(2).press("Tab"); await expect(line(3)).toBeFocused();
        expect(await line(1).evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
        await capture("writing");
      }
      if (m === 4) {
        await line(3).fill(";"); await execute().click();
        await expect(page.getByText("O SQL executou, mas a missão", { exact: false })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "A loja tem memória!" })).toHaveCount(0);
        await line(3).fill(missions[4][2]);
      }
      await execute().click();
      await expect(page.getByText("Missão validada no banco!", { exact: false })).toBeVisible({ timeout: 15000 });
      const table = page.getByRole("table", { name: "Tabela produtos · dados armazenados", exact: true });
      await expect(table).toContainText(m === 0 ? "Nenhum registro" : "Caderno");
      if (m === 3) {
        const query = page.getByRole("table", { name: "Resultado da consulta · não altera a tabela", exact: true });
        await expect(query).toContainText("Caneta"); await expect(query).not.toContainText("Caderno");
        await expect(table).toContainText("Caderno"); await capture("filter");
      }
      if (m < missions.length - 1) await page.getByRole("button", { name: "Próxima missão" }).click();
    }
    await capture("complete");
    await page.reload();
    await page.getByLabel("Opções da aventura", { exact: true }).click();
    await page.getByRole("button", { name: "Abrir oficina de criação", exact: true }).click();
    await page.getByRole("button", { name: "Retomar minha construção" }).click();
    await expect(page.getByRole("heading", { name: "A loja tem memória!" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("table", { name: "Tabela produtos · dados armazenados", exact: true })).toContainText("Caneta");
    await page.getByRole("button", { name: "Recomeçar missão", exact: true }).click();
    await page.getByRole("button", { name: "Sim, limpar esta missão" }).click(); await expect(line(1)).toHaveValue("");
    await page.getByRole("button", { name: "Recuperar rascunho anterior" }).click();
    await expect(line(1)).toHaveValue("UPDATE produtos");
    await expect(execute()).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "A planta da loja", exact: false }).click();
    await expect(execute()).toBeVisible({ timeout: 15000 });
    await line(1).fill("CREATE TABLE errado (");
    await expect(page.getByRole("button", { name: "As primeiras entregas", exact: false })).toBeDisabled();
    expect(errors).toEqual([]);
    expect(requests.some(url => url.includes("/vendor/sqljs/sql-wasm.wasm"))).toBe(true);
    await writeFile(`${dir}/${name}.json`, JSON.stringify({ errors, requests, completed: true }, null, 2));
    console.log(`${name}: SQL missions, errors, storage, reset, navigation, accessibility and layout passed`);
  } finally { await browser.close(); }
}
