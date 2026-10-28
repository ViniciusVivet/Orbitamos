import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

const output = "test-results/first-delivery-path";
await mkdir(output, { recursive: true });
const profile = 'let nome = "João";\nconsole.log(nome);';
const profileAge = profile + '\nlet idade = 28;\nconsole.log(idade);';
const profileFull = profileAge + '\nlet ativo = false;\nconsole.log(ativo);';
const data = [
  { slug: "variaveis-js", guides: [profile, profileAge, profileFull], adaptation: 'const nome = "Bia";\nconst idade = 27;\nconst ativo = false;\nconsole.log(nome);\nconsole.log(idade);\nconsole.log(ativo);', independent: 'const nome = "Caio";\nconst idade = 19;\nconst ativo = false;\nconsole.log(nome);\nconsole.log(idade);\nconsole.log(ativo);' },
  { slug: "contas-servico-js", guides: ['const valorServico = 80;\nconst custoMaterial = 25;\nconst valorDisponivel = valorServico - custoMaterial;\nconsole.log(valorDisponivel);'], adaptation: 'const valorServico = 120;\nconst custoMaterial = 35;\nconst valorDisponivel = valorServico - custoMaterial;\nconsole.log(valorDisponivel);', independent: 'const valorServico = 160;\nconst custoMaterial = 45;\nconst valorDisponivel = valorServico - custoMaterial;\nconsole.log(valorDisponivel);' },
  { slug: "decisao-servico-js", guides: ['const valorDisponivel = 55;\nconst meta = 50;\nif (valorDisponivel >= meta) {\n  console.log("Meta atingida");\n} else {\n  console.log("Falta para a meta");\n}'], adaptation: 'const valorDisponivel = 45;\nconst meta = 50;\nif (valorDisponivel >= meta) {\n  console.log("Meta atingida");\n} else {\n  console.log("Falta para a meta");\n}', independent: 'const valorDisponivel = 50;\nconst meta = 50;\nif (valorDisponivel >= meta) {\n  console.log("Meta atingida");\n} else {\n  console.log("Falta para a meta");\n}' },
  { slug: "primeiro-orcamento-js", guides: ['const cliente = "Lia";\nconst quantidade = 3;\nconst valorPorServico = 40;\nconst limite = 150;\nconst total = quantidade * valorPorServico;\nconsole.log(cliente);\nconsole.log(total);\nif (total <= limite) {\n  console.log("Dentro do limite");\n} else {\n  console.log("Acima do limite");\n}'], adaptation: 'const cliente = "Bia";\nconst quantidade = 2;\nconst valorPorServico = 55;\nconst limite = 100;\nconst total = quantidade * valorPorServico;\nconsole.log(cliente);\nconsole.log(total);\nif (total <= limite) {\n  console.log("Dentro do limite");\n} else {\n  console.log("Acima do limite");\n}', independent: 'const cliente = "Caio";\nconst quantidade = 2;\nconst valorPorServico = 50;\nconst limite = 100;\nconst total = quantidade * valorPorServico;\nconsole.log(cliente);\nconsole.log(total);\nif (total <= limite) {\n  console.log("Dentro do limite");\n} else {\n  console.log("Acima do limite");\n}' },
];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: "reduce" });
const page = await context.newPage();
page.setDefaultTimeout(60000);
const report = { completed: false, deliveries: [], errors: [] };
page.on("pageerror", error => report.errors.push(error.message));
try {
  await page.goto("http://localhost:3015/dev/academy-preview?view=home", { timeout: 180000 });
  await page.getByText("Escolher minha trilha principal", { exact: true }).click();
  await page.getByRole("button", { name: "Primeiros passos", exact: true }).click();
  await expect(page.locator("[data-academy-continue] h1")).toHaveText("Meu primeiro perfil", { timeout: 45000 });
  await page.locator("[data-academy-continue]").getByRole("link", { name: "Começar esta entrega", exact: true }).click();
  for (const item of data) {
    await expect(page).toHaveURL(new RegExp(`/dev/ide-preview/${item.slug}\\?academy=1`));
    await page.getByRole("button", { name: "Entendi, vamos construir", exact: true }).click();
    const editor = page.getByRole("textbox", { name: "Seu código", exact: true });
    for (const [index, code] of item.guides.entries()) {
      await editor.fill(code);
      await page.getByRole("button", { name: "Executar código", exact: true }).click();
      if (index < item.guides.length - 1) {
        await expect(page.getByRole("region", { name: "Resultado da execução" })).toContainText("Resultado validado", { timeout: 45000 });
        await page.getByRole("button", { name: "Continuar para próxima missão", exact: true }).click();
      }
    }
    const application = page.locator("[data-beginner-practice]");
    await expect(application).toBeVisible({ timeout: 45000 });
    await expect(page.locator("[data-learning-delivery]").getByRole("link", { name: /^Próxima entrega:/ })).toHaveCount(0);
    await expect(application.getByRole("textbox", { name: "Código da alteração" })).toHaveValue(item.guides.at(-1));
    await application.getByRole("textbox", { name: "Código da alteração" }).fill(item.adaptation);
    await application.getByRole("button", { name: "Testar minha alteração", exact: true }).click();
    await application.getByRole("button", { name: "Agora, escrever sozinho", exact: true }).click();
    const independent = application.getByRole("textbox", { name: "Código da aplicação independente" });
    await expect(independent).toHaveValue("");
    await independent.fill(item.independent);
    await application.getByRole("button", { name: "Testar minha entrega", exact: true }).click();
    await expect(application.getByText("Entrega testada.", { exact: true })).toBeVisible({ timeout: 45000 });
    await page.screenshot({ path: `${output}/${item.slug}.jpg`, fullPage: false });
    const axe = await new AxeBuilder({ page }).include("[data-learning-delivery]").analyze();
    expect(axe.violations.map(entry => entry.id)).toEqual([]);
    report.deliveries.push({ slug: item.slug, guide: true, adaptation: true, independent: true, axe: 0 });
    if (item.slug !== "primeiro-orcamento-js") await page.locator("[data-learning-delivery]").getByRole("link", { name: /^Próxima entrega:/ }).click();
  }
  await page.goto("http://localhost:3015/dev/academy-preview?view=home");
  await expect(page.locator("[data-academy-continue] h1")).toHaveText("Seu primeiro percurso está entregue.", { timeout: 45000 });
  await page.goto("http://localhost:3015/dev/academy-preview?view=progress");
  await expect(page.locator("[data-academy-evidence]")).toContainText("4 /", { timeout: 45000 });
  expect(report.errors).toEqual([]);
  report.completed = true;
  console.log("Four actual guided deliveries → adaptation → independent application → completed Home path passed");
} catch (error) {
  report.failure = String(error); report.url = page.url();
  await page.screenshot({ path: `${output}/failure.jpg`, fullPage: false }).catch(() => {});
  throw error;
} finally {
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  await context.close(); await browser.close();
}
