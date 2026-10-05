import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const dir = "test-results/vila";
await mkdir(dir, { recursive: true });
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 1000 } }], ["iphone", webkit, devices["iPhone 13"]], ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }]];
for (const [name, engine, device] of profiles.filter(([name]) => !process.env.VILA_PROFILE || process.env.VILA_PROFILE === name)) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...device, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push({ message: error.message, stack: error.stack }));
  const checks = [];
  async function capture(label) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect((await new AxeBuilder({ page }).include("[data-village]").analyze()).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
    await page.screenshot({ path: `${dir}/${name}-${label}.jpg`, fullPage: true, type: "jpeg", quality: 80 });
    checks.push(label);
  }
  try {
    await page.goto(`${process.env.IDE_AUDIT_URL || "http://localhost:3015"}/dev/vila-preview`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.getByRole("button", { name: "Entrar na vila" }).waitFor({ timeout: 90000 });
    await capture("welcome");
    await page.getByRole("button", { name: "Álbum da turma", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Passaportes da vila" })).toBeFocused();
    await page.getByRole("button", { name: "Nino", exact: true }).click();
    await expect(page.getByRole("region", { name: "Álbum da turma" })).toContainText("Não misture tabs e espaços");
    await capture("album");
    await page.getByRole("button", { name: "Fechar álbum" }).click();
    await expect(page.getByRole("button", { name: "Álbum da turma", exact: true })).toBeFocused();
    await page.getByRole("button", { name: "Entrar na vila" }).click();
    const board = page.getByRole("region", { name: "Tabuleiro de código" });
    const test = page.getByRole("button", { name: "Testar na vila" });
    const place = page.getByRole("button", { name: "Encaixar personagem no código" });
    await expect(place).toBeDisabled();
    await page.getByRole("button", { name: /Escolher Cora/ }).click();
    await place.click(); await test.click();
    await expect(board).toContainText("Vamos olhar juntos?");
    expect(await page.evaluate(() => localStorage.getItem("orbitamos-vila-v1-vila-preview"))).not.toContain('"correio"');
    const pairs = ["Pipo & Pop", "Lili", "Lili", "Cora", "Pipo & Pop", "Cora"];
    for (let i = 0; i < 6; i++) {
      const buddy = page.getByRole("button", { name: new RegExp(`Escolher ${pairs[i]}`) });
      await buddy.focus(); await buddy.press("Enter"); await place.click(); await test.click();
      await expect(board).toContainText("Mais uma luz na vila!");
      if (i === 3) await capture("socket");
      await page.getByRole("button", { name: "Próximo encontro" }).click();
    }
    await page.getByRole("button", { name: "Adicionar 4 espaços à linha 3", exact: true }).click();
    await test.click(); await expect(board).toContainText("Mais uma luz na vila!");
    await page.getByRole("button", { name: "Próximo encontro" }).click();
    await page.getByRole("button", { name: "Adicionar 4 espaços à linha 2", exact: true }).click();
    await test.click(); await expect(board).toContainText("O anúncio repetiu três vezes!");
    await page.getByRole("button", { name: "Retirar 4 espaços da linha 3", exact: true }).click();
    await test.click(); await expect(board).toContainText("Mais uma luz na vila!");
    await capture("indent");
    await page.getByRole("button", { name: "Próximo encontro" }).click();
    await page.getByRole("button", { name: "Adicionar 4 espaços à linha 3", exact: true }).click();
    await page.getByRole("button", { name: "Adicionar 4 espaços à linha 4", exact: true }).click();
    await page.getByRole("button", { name: "Adicionar 4 espaços à linha 4", exact: true }).click();
    await test.click(); await expect(board).toContainText("Mais uma luz na vila!");
    await page.getByRole("button", { name: "Próximo encontro" }).click();
    await test.click(); await expect(board).toContainText("Não é erro de sintaxe");
    await page.getByRole("button", { name: "Retirar 4 espaços da linha 4", exact: true }).click();
    await test.click(); await expect(board).toContainText("Mais uma luz na vila!");
    await expect(page.getByRole("heading", { name: "O festival está aceso. E você fez parte disso." })).toBeVisible();
    await test.click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-vila-v1-vila-preview")).completed.length)).toBe(10);
    await capture("festival");
    await page.reload(); await page.getByRole("button", { name: "Voltar à aventura" }).click();
    await expect(page.locator("[data-village]")).toHaveAttribute("data-level-id", "festa-sem-chuva");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-vila-v1-vila-preview")).completed.length)).toBe(10);
    await page.getByRole("button", { name: /Fase 1: O correio/ }).click();
    await page.getByRole("button", { name: "Recomeçar esta fase" }).click();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("orbitamos-vila-v1-vila-preview")).completed.length)).toBe(10);
    expect(errors).toEqual([]);
    console.log(`PASS ${name}: ten puzzles, mistakes, keyboard, album focus, persistence, replay, axe and overflow`);
  } catch (error) {
    await page.screenshot({ path: `${dir}/${name}-failure.jpg`, fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await writeFile(`${dir}/${name}-report.json`, JSON.stringify({ checks, errors, physicalDevice: false }, null, 2));
    await browser.close();
  }
}
