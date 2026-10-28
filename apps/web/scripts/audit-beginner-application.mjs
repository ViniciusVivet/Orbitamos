import { chromium, webkit, devices, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "test-results/beginner-application";
await mkdir(output, { recursive: true });
const base = "http://localhost:3015";
const profileProgram = (nome, idade, ativo) => `const nome = ${JSON.stringify(nome)};\nlet idade = ${idade};\nvar ativo = ${ativo};\nconsole.log(nome);\nconsole.log(idade);\nconsole.log(ativo);`;
const mathProgram = (value, cost) => `const valorServico = ${value};\nconst custoMaterial = ${cost};\nconst valorDisponivel = valorServico - custoMaterial;\nconsole.log(valorDisponivel);`;
const decisionProgram = (value, goal) => `const valorDisponivel = ${value};\nconst meta = ${goal};\nif (valorDisponivel >= meta) {\n  console.log("Meta atingida");\n} else {\n  console.log("Falta para a meta");\n}`;
const projectProgram = (name, quantity, unit, limit) => `const cliente = ${JSON.stringify(name)};\nconst quantidade = ${quantity};\nconst valorPorServico = ${unit};\nconst limite = ${limit};\nconst total = quantidade * valorPorServico;\nconsole.log(cliente);\nconsole.log(total);\nif (total <= limite) {\n  console.log("Dentro do limite");\n} else {\n  console.log("Acima do limite");\n}`;
const tasks = [
  { slug: "variaveis-js", guided: profileProgram("João", 28, true), adapt: profileProgram("Bia", 27, false), independent: profileProgram("Caio", 19, false), hardcoded: 'const nome="Caio";\nconst idade=19;\nconst ativo=false;\nconsole.log("Caio");\nconsole.log(19);\nconsole.log(false);', mission: 2, passed: [0, 1, 2] },
  { slug: "contas-servico-js", guided: mathProgram(80, 25), adapt: mathProgram(120, 35), independent: mathProgram(160, 45), hardcoded: mathProgram(160, 45).replace("valorServico - custoMaterial", "115"), mission: 0, passed: [0] },
  { slug: "decisao-servico-js", guided: decisionProgram(55, 50), adapt: decisionProgram(45, 50), independent: decisionProgram(50, 50), hardcoded: decisionProgram(50, 50).replace("valorDisponivel >= meta", "true"), mission: 0, passed: [0] },
  { slug: "primeiro-orcamento-js", guided: projectProgram("Lia", 3, 40, 150), adapt: projectProgram("Bia", 2, 55, 100), independent: projectProgram("Caio", 2, 50, 100), hardcoded: projectProgram("Caio", 2, 50, 100).replace("quantidade * valorPorServico", "100"), mission: 0, passed: [0] },
];
const profiles = [["desktop", chromium, { viewport: { width: 1440, height: 1000 } }], ["iphone", webkit, devices["iPhone 13"]], ["small", chromium, { viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true }]].filter(([name]) => !process.argv[2] || process.argv[2] === name);
for (const [name, engine, options] of profiles) {
  const browser = await engine.launch();
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" });
  const report = { completed: false, checks: [], accessibility: [], errors: [], failedRequests: [] };
  const page = await context.newPage(); page.setDefaultTimeout(60000);
  page.on("pageerror", error => report.errors.push(error.message));
  page.on("requestfailed", request => report.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  const activate = locator => options.hasTouch ? locator.tap() : locator.click();
  try {
    for (const task of tasks) {
      const guideKey = `orbitamos-guided-v1-academy-preview-${task.slug}`;
      const applicationKey = `orbitamos-beginner-practice-v1-academy-preview-${task.slug}`;
      const guide = JSON.stringify({ version: 1, code: task.guided, mission: task.mission, line: 0, passed: task.passed, started: true });
      await context.addInitScript(({ guideKey, guide }) => { if (!localStorage.getItem(guideKey)) localStorage.setItem(guideKey, guide); localStorage.setItem("beginner-unrelated-account-sentinel", "unchanged"); }, { guideKey, guide });
      await page.goto(`${base}/dev/ide-preview/${task.slug}?academy=1`, { waitUntil: "domcontentloaded", timeout: 180000 });
      const area = page.locator("[data-beginner-practice]");
      await expect(area).toHaveAttribute("data-stage", "adaptation", { timeout: 90000 });
      const alteration = area.getByRole("textbox", { name: "Código da alteração", exact: true });
      await expect(alteration).toHaveValue(task.guided);
      await expect(page.getByRole("region", { name: "Seu próximo passo", exact: true })).toHaveCount(0);
      await activate(area.getByRole("button", { name: "Testar minha alteração", exact: true }));
      await expect(area.getByRole("button", { name: "Testar minha alteração", exact: true })).toBeVisible({ timeout: 45000 });
      await expect(area.getByRole("button", { name: "Agora, escrever sozinho", exact: true })).toHaveCount(0);
      await alteration.fill(task.adapt);
      await activate(area.getByRole("button", { name: "Testar minha alteração", exact: true }));
      await expect(area.getByRole("button", { name: "Agora, escrever sozinho", exact: true })).toBeVisible({ timeout: 45000 });
      await page.screenshot({ path: `${output}/${name}-${task.slug}-alteration.jpg`, fullPage: false });
      await activate(area.getByRole("button", { name: "Agora, escrever sozinho", exact: true }));
      const independent = area.getByRole("textbox", { name: "Código da aplicação independente", exact: true });
      await expect(independent).toHaveValue("");
      await page.reload();
      await expect(independent).toHaveValue("", { timeout: 90000 });
      await independent.fill(task.hardcoded);
      await activate(area.getByRole("button", { name: "Testar minha entrega", exact: true }));
      await expect(area.getByText("O primeiro resultado apareceu, mas a regra precisa acompanhar outros dados.", { exact: false })).toBeVisible({ timeout: 45000 });
      await expect(page.getByRole("region", { name: "Seu próximo passo", exact: true })).toHaveCount(0);
      await independent.fill(task.independent);
      await activate(area.getByRole("button", { name: "Testar minha entrega", exact: true }));
      await expect(area.getByRole("heading", { name: "Entrega testada.", exact: true })).toBeVisible({ timeout: 45000 });
      await expect(page.getByRole("region", { name: "Seu próximo passo", exact: true })).toBeVisible();
      await page.reload();
      await expect(independent).toHaveValue(task.independent, { timeout: 90000 });
      await expect(page.getByRole("region", { name: "Seu próximo passo", exact: true })).toBeVisible();
      if (task.slug === "variaveis-js") {
        await activate(area.getByRole("button", { name: "Recomeçar esta parte", exact: true }));
        await activate(area.getByRole("button", { name: "Sim, limpar esta parte", exact: true }));
        await expect(independent).toHaveValue("");
        await independent.fill(task.independent + "\nwhile (true) {}");
        await activate(area.getByRole("button", { name: "Testar minha entrega", exact: true }));
        await expect(area.getByRole("button", { name: "Parar teste", exact: true })).toBeVisible();
        await activate(area.getByRole("button", { name: "Recuperar código anterior ao reinício", exact: true }));
        await expect(independent).toHaveValue(task.independent);
        await expect(page.getByRole("region", { name: "Seu próximo passo", exact: true })).toBeVisible();
        await page.waitForTimeout(2800); // A cancelled worker must never revoke the recovered proof.
        expect(JSON.parse(await page.evaluate(key => localStorage.getItem(key), applicationKey)).validated).toBe(true);
        await expect(page.getByRole("region", { name: "Seu próximo passo", exact: true })).toBeVisible();
        report.checks.push("recovering a validated program cancels the pending worker; its late response cannot invalidate recovered proof");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      const axe = await new AxeBuilder({ page }).include("[data-beginner-practice]").analyze();
      const violations = axe.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }));
      report.accessibility.push({ slug: task.slug, violations }); expect(violations).toEqual([]);
      await independent.fill(task.independent + "\n// minha edição");
      await expect(page.getByRole("region", { name: "Seu próximo passo", exact: true })).toHaveCount(0);
      expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).validated, applicationKey)).toBe(false);
      expect(await page.evaluate(key => localStorage.getItem(key), guideKey)).toBe(guide);
      expect(await page.evaluate(() => localStorage.getItem("beginner-unrelated-account-sentinel"))).toBe("unchanged");
      report.checks.push(`${task.slug}: original copy is not an alteration; new inputs validated; independent starts blank and reloads; fixed answers rejected; variants pass; final gate and invalidation work; guide preserved`);
      console.log(`${name}/${task.slug}: progressive practice passed`);
    }
    expect(report.errors).toEqual([]); report.completed = true;
  } catch (error) { report.failure = String(error); report.url = page.url(); await page.screenshot({ path: `${output}/${name}-failure.jpg` }).catch(() => {}); throw error; }
  finally { await writeFile(`${output}/${name}.json`, JSON.stringify(report, null, 2)); await context.close(); await browser.close(); }
}
