import { chromium, webkit, devices, expect as playwrightExpect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.ACADEMY_AUDIT_URL || "http://localhost:3015";
const expect = playwrightExpect.configure({ timeout: 60000 });
const out = path.resolve(process.env.ACADEMY_AUDIT_OUTPUT || "test-results/academy-first-session");
await mkdir(out, { recursive: true });
const results = { kind: "Isolated development preview; not a learner trial or physical iPhone test", profiles: [], expectedWorkerSyntaxErrors: [], errors: [] };
const profiles = [
  ["iphone-webkit", webkit, { ...devices["iPhone 13"], viewport: { width: 390, height: 664 } }],
  ["narrow-webkit", webkit, { ...devices["iPhone SE"], viewport: { width: 320, height: 640 } }],
  ["desktop", chromium, { viewport: { width: 1366, height: 620 } }],
];

async function frame(page, name) {
  await page.evaluate(async () => {
    const visible = [...document.images].filter(img => { const r = img.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
    await Promise.race([Promise.all(visible.map(img => img.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 2000))]);
  });
  await page.screenshot({ path: path.join(out, name + ".png") });
  return page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth }));
}

try {
  for (const [name, engine, settings] of profiles) {
    const browser = await engine.launch();
    try {
      const context = await browser.newContext({ ...settings, reducedMotion: "reduce" });
      const page = await context.newPage();
      page.setDefaultTimeout(60000);
      let testingSyntaxError = false;
      page.on("pageerror", error => {
        // WebKit reports a worker's parse error here even when worker.onerror handles it.
        const entry = { name, error: String(error) };
        if (testingSyntaxError && error.name === "SyntaxError" && /Unexpected token/.test(error.message)) results.expectedWorkerSyntaxErrors.push(entry);
        else results.errors.push(entry);
      });
      const result = { name, checks: [] };
      results.profiles.push(result);
      await page.goto(base + "/dev/academy-preview?view=home", { waitUntil: "domcontentloaded", timeout: 120000 });
      await expect(page.locator('[data-academy-continue][aria-busy="false"]')).toBeVisible();
      await page.evaluate(() => scrollTo(0, 0));
      const first = page.getByRole("link", { name: "Escrever minha primeira linha", exact: true }).first();
      const bounds = await first.boundingBox();
      const scene = await page.locator('[data-academy-continue] aside img').boundingBox();
      result.home = { ...await frame(page, name + "-home"), action: bounds, scene };
      const summary = page.locator('[data-academy-continue] dl[aria-label="Seu progresso"]');
      await expect(summary).toContainText("Aulas restantes");
      await expect(summary).toContainText("XP");
      await expect(summary).toContainText("Nível");
      const progress = await summary.boundingBox();
      expect(progress.y + progress.height).toBeLessThan(settings.viewport.height - (settings.isMobile ? 64 : 0));
      expect(bounds.y + bounds.height).toBeLessThan(settings.viewport.height - (settings.isMobile ? 64 : 0));
      expect(Math.min(scene.y + scene.height, settings.viewport.height - (settings.isMobile ? 64 : 0)) - Math.max(0, scene.y)).toBeGreaterThan(60);
      expect(result.home.scrollWidth).toBe(result.home.width);
      await first.click();
      const editor = page.getByRole("textbox", { name: "Seu código", exact: true });
      await expect(editor).toHaveValue("");
      await expect(page.locator("[data-practice-navigation]")).toHaveCount(0);
      await expect(page.getByRole("region", { name: "Resultado da execução" })).toHaveCount(0);
      await page.evaluate(() => scrollTo(0, 0));
      result.entry = { ...await frame(page, name + "-first-code"), editor: await editor.boundingBox() };
      expect(result.entry.editor.y + Math.min(result.entry.editor.height, 44)).toBeLessThan(settings.viewport.height);
      expect(result.entry.scrollWidth).toBe(result.entry.width);
      await editor.focus();
      await page.keyboard.press("Tab");
      await expect(editor).not.toBeFocused();
      const prompt = page.locator('section[aria-label="Escreva e execute"] code').first();
      const source = await prompt.innerText();
      await editor.fill(source);
      await expect(page.getByRole("status").filter({ hasText: "Linha conferida." })).toBeVisible();
      await page.waitForTimeout(1100);
      await expect(prompt).not.toHaveText(source);
      await expect(page.getByText("Resultado validado.", { exact: true })).toHaveCount(0);
      const saved = await editor.inputValue();
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(editor).toHaveValue(saved);
      result.checks.push("Initial empty editor, learner entry, pause, exact draft reload");
      result.editor = await frame(page, name + "-editor");
      await editor.fill("const nome =");
      await page.getByText("Ajuda e ferramentas", { exact: true }).click();
      await page.getByRole("button", { name: "Testar código incompleto", exact: true }).click();
      testingSyntaxError = true;
      await page.getByRole("button", { name: "Executar código", exact: true }).click();
      await expect(page.getByText("Ainda não rodou", { exact: true })).toBeVisible();
      testingSyntaxError = false;
      await expect(editor).toHaveValue("const nome =");
      result.checks.push("Exploratory syntax error preserves draft and does not award mission");
      await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
      await page.getByRole("button", { name: "Sim, reiniciar", exact: true }).click();
      await expect(editor).toHaveValue("");
      await page.getByRole("button", { name: "Recuperar código anterior ao reinício", exact: true }).click();
      await expect(editor).toHaveValue("const nome =");
      result.checks.push("Confirmed reset and recovery preserve previous work");
      await editor.fill(source + "\nconsole.log(nome);");
      await page.getByRole("button", { name: "Executar código", exact: true }).click();
      await expect(page.getByText("Resultado validado.", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Próxima missão", exact: true })).toHaveCount(1);
      await page.getByRole("button", { name: "Próxima missão", exact: true }).click();
      await expect(prompt).toBeVisible();
      await expect(editor).toHaveValue(source + "\nconsole.log(nome);");
      result.checks.push("Positive worker execution, single next-mission action, code retained in next mission");
      const axe = await new AxeBuilder({ page }).include("[data-guided-lab]").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      result.accessibility = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, count: nodes.length }));
      expect(result.accessibility).toEqual([]);
      expect((await frame(page, name + "-error-recovery")).scrollWidth).toBe(settings.viewport.width);
      if (name !== "narrow-webkit") {
        await page.goto(base + "/dev/csharp-preview?academy=1&module=variables&view=pilot", { waitUntil: "domcontentloaded", timeout: 120000 });
        const module = page.locator("[data-variables-module]");
        await expect(module).toBeVisible();
        await module.getByRole("button", { name: /Prática .*Atividades/ }).click();
        await module.getByRole("dialog", { name: "Suas atividades" }).getByRole("button", { name: /Conte os serviços pendentes/ }).click();
        const cs = page.getByRole("textbox", { name: "Seu código C#", exact: true });
        await expect(cs).toHaveValue("");
        await cs.fill('int servicosPendentes = 3;\nservicosPendentes = "5";\nConsole.WriteLine(servicosPendentes);');
        await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
        await expect(page.locator('[data-csharp-run-evidence]')).toContainText("a revisar");
        await expect(page.getByRole("button", { name: "Próxima atividade", exact: true })).toHaveCount(0);
        await page.getByRole("button", { name: "Preciso de uma pista", exact: true }).click();
        await cs.fill('int servicosPendentes = 5;\nConsole.WriteLine(servicosPendentes);');
        await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
        await expect(page.locator('[data-csharp-run-evidence]')).toContainText("aprovada · após consulta à ajuda");
        await expect(page.locator('[data-csharp-run-evidence]')).toContainText("2 verificações");
        await page.reload({ waitUntil: "domcontentloaded" });
        await expect(cs).toHaveValue('int servicosPendentes = 5;\nConsole.WriteLine(servicosPendentes);');
        await expect(page.locator('[data-csharp-run-evidence]')).toContainText("após consulta à ajuda");
        result.checks.push("C# real UI rejects old coercion, validates correct program, persists help and two verification records");
        await frame(page, name + "-csharp-evidence");
      }
      if (name === "desktop") {
        await page.evaluate(() => {
          const owner = "academy-preview", suffix = "s-" + encodeURIComponent(JSON.stringify(owner));
          localStorage.setItem("orbitamos-english-speaking-v1-" + suffix, JSON.stringify({ version: 1, current: "word-file", completed: ["word-file"], attempts: { "word-file": 1 } }));
          localStorage.setItem("orbitamos-english-use-v1-" + suffix, JSON.stringify({ version: 1, active: false, current: "word-file", completed: ["word-file"], attempts: { "word-file": 1 } }));
          localStorage.setItem("orbitamos-english-review-v1-" + suffix, JSON.stringify({ version: 1, active: false, history: { "word-file": { reviews: 1, helped: 0, lastAt: Date.now() } } }));
          localStorage.setItem("orbitamos-academy-resume-v1-" + owner, JSON.stringify({ href: "/estudante/jogos/ingles-em-cena#falar", updatedAt: Date.now() }));
        });
        await page.goto(base + "/dev/academy-preview?view=progress", { waitUntil: "domcontentloaded", timeout: 120000 });
        const english = page.getByRole("region", { name: "Suas práticas de inglês", exact: true });
        await expect(english.getByRole("link")).toHaveCount(3);
        await expect(english).toContainText("1 de 12 itens praticados");
        await expect(english).toContainText("1 de 12 respostas corretas");
        await expect(english).toContainText("1 de 12 expressões revisadas");
        await page.goto(base + "/dev/academy-preview", { waitUntil: "domcontentloaded", timeout: 120000 });
        await expect(page.locator('[data-practice-station] a[href="/dev/academy-preview?activity=english#falar"]')).toHaveCount(1);
        result.checks.push("English's three records render independently; Games retains the speaking destination");
      }
      await context.close();
      console.log(name + " passed");
    } finally { await browser.close(); }
  }
  expect(results.errors).toEqual([]);
  results.completed = true;
} finally { await writeFile(path.join(out, "report.json"), JSON.stringify(results, null, 2)); }
