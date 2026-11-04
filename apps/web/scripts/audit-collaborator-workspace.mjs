import { chromium, webkit, devices } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

const baseURL = process.env.COLLABORATOR_AUDIT_URL || "http://localhost:3015";
const output = path.resolve("test-results", "collaborator-workspace");
await mkdir(output, { recursive: true });
const results = [];
const profiles = [
  { name: "desktop", type: chromium, context: { viewport: { width: 1440, height: 950 } } },
  { name: "iphone-safari", type: webkit, context: { ...devices["iPhone 13"] } },
  { name: "small-mobile", type: chromium, context: { viewport: { width: 320, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
];

for (const profile of profiles) {
  const browser = await profile.type.launch({ headless: true });
  const context = await browser.newContext({ ...profile.context, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const visit = async route => {
    await page.goto(baseURL + route, { waitUntil: "domcontentloaded", timeout: 180000 });
    await page.locator("h1").first().waitFor({ timeout: 120000 });
    await page.evaluate(() => document.fonts.ready);
  };
  const check = async (name, scope) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `${profile.name} ${name}: horizontal overflow ${overflow}`);
    const axe = await new AxeBuilder({ page }).include(scope).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    assert.deepEqual(axe.violations.map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target), summary: violation.nodes.map(node => node.failureSummary) })), [], `${profile.name} ${name}: accessibility`);
    await page.screenshot({ path: path.join(output, `${profile.name}-${name}.png`), fullPage: true });
    results.push({ profile: profile.name, view: name, horizontalOverflow: overflow, accessibilityViolations: axe.violations.length });
  };
  try {
    console.log(`Checking collaborator workspace: ${profile.name}`);
    await visit("/dev/portal-preview?role=work");
    await page.locator('[data-preview-ready="true"]').waitFor();
    await page.evaluate(() => localStorage.setItem("collaborator-audit-sentinel", "preserved"));
    const home = page.locator("[data-collaborator-home]");
    assert.equal(await home.locator("h1").innerText(), "Seu trabalho, hoje.");
    const heading = await home.locator("h2").first().innerText();
    assert.equal(heading, "Uma nova experiência para a comunidade");
    const primary = home.getByRole("link", { name: "Abrir este projeto", exact: true });
    assert.equal(await primary.getAttribute("href"), "/dev/workspace-preview?view=projects&projeto=1");
    const photo = home.locator("img").first();
    await photo.evaluate(image => image.decode());
    assert.ok(await photo.evaluate(image => image.naturalWidth > 100), "Home uses a decoded contextual photo");
    await check("home", "[data-collaborator-home]");
    await primary.click();
    const detail = page.locator("[data-project-detail]");
    await detail.waitFor();
    assert.equal(await detail.locator("h1").innerText(), heading, "Home opens the same project with its full briefing");
    assert.ok((await detail.getByText(/Criar a página inicial/).innerText()).includes("Este é um briefing demonstrativo."));
    assert.equal(await detail.locator('a[target="_blank"]').count(), 1, "Unsafe resource links are omitted");
    assert.equal(await detail.locator('a[target="_blank"]').getAttribute("rel"), "noopener noreferrer");
    assert.equal(await detail.getByRole("link", { name: /Abrir conversas do trabalho/ }).getAttribute("href"), "/mensagens?area=work");
    assert.equal(await page.locator('a[href^="javascript:"]').count(), 0);
    await check("project-detail", "[data-project-workspace]");
    await detail.getByRole("link", { name: "Todos os meus projetos", exact: true }).click();
    const workspace = page.locator("[data-project-workspace]");
    await workspace.getByRole("heading", { name: "Meus projetos", exact: true }).waitFor();
    assert.equal(await workspace.locator("[data-project-id]").count(), 4);
    await check("projects", "[data-project-workspace]");
    await workspace.getByRole("button", { name: /Concluído/ }).click();
    assert.deepEqual(await workspace.locator("[data-project-id]").evaluateAll(nodes => nodes.map(node => node.dataset.projectId)), ["4"], "Completed project does not appear as todo");
    await workspace.getByRole("button", { name: /Todos/ }).click();
    await workspace.getByRole("button", { name: "Quadro", exact: true }).click();
    assert.equal(await workspace.locator("[data-project-id]").count(), 4);
    assert.equal(await workspace.getByRole("heading", { name: "Pausado", exact: true }).count(), 1);
    await check("project-board", "[data-project-workspace]");
    await visit("/dev/workspace-preview?view=projects&projeto=4");
    assert.equal(await page.locator("[data-project-detail] h1").innerText(), "Site da Loja Horizonte");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: "Site da Loja Horizonte", exact: true }).waitFor();
    for (const id of ["999", "02", "1e2"]) {
      await visit(`/dev/workspace-preview?view=projects&projeto=${id}`);
      assert.equal(await page.locator("[data-project-detail]").count(), 0);
      assert.equal(await page.getByRole("heading", { name: "Projeto não disponível nesta lista.", exact: true }).count(), 1);
    }
    await visit("/dev/workspace-preview?view=applications");
    const applications = page.locator("[data-application-workspace]");
    const buttons = applications.getByRole("group", { name: "Filtrar candidaturas" }).getByRole("button");
    assert.deepEqual(await buttons.locator("strong").allTextContents(), ["5", "2", "1", "2"]);
    assert.equal(await applications.locator("[data-application-status]").count(), 5);
    assert.equal(await applications.getByRole("button", { name: /Retirar candidatura/ }).count(), 0, "Preview cannot mutate actual applications");
    await applications.locator("summary").first().click();
    assert.ok(await applications.locator("details").first().getAttribute("open") !== null, "Presentation is available on demand");
    await check("applications", "[data-application-workspace]");
    await buttons.nth(1).click();
    assert.deepEqual(await applications.locator("[data-application-status]").evaluateAll(nodes => nodes.map(node => node.dataset.applicationStatus)), ["pending", "reviewing"]);
    await buttons.nth(2).click();
    assert.equal(await applications.locator("[data-application-status]").getAttribute("data-application-status"), "accepted");
    assert.ok(await applications.getByText("Retorno da equipe", { exact: true }).isVisible());
    await buttons.nth(3).click();
    assert.deepEqual(await applications.locator("[data-application-status]").evaluateAll(nodes => nodes.map(node => node.dataset.applicationStatus)), ["declined", "withdrawn"]);
    await visit("/dev/workspace-preview?view=projects&state=empty");
    assert.equal(await page.locator("[data-project-workspace]").getByRole("link", { name: "Ver oportunidades", exact: true }).getAttribute("href"), "/colaborador/vagas");
    await check("projects-empty", "[data-project-workspace]");
    await visit("/dev/workspace-preview?view=applications&state=empty");
    assert.equal(await page.locator("[data-application-workspace]").getByRole("link", { name: "Ver oportunidades", exact: true }).getAttribute("href"), "/colaborador/vagas");
    await check("applications-empty", "[data-application-workspace]");
    for (const view of ["projects", "applications"]) {
      await visit(`/dev/workspace-preview?view=${view}&state=error`);
      const scope = page.locator(view === "projects" ? "[data-project-workspace]" : "[data-application-workspace]");
      await scope.getByRole("alert").waitFor();
      assert.equal(await scope.getByRole("link", { name: "Ver oportunidades", exact: true }).count(), 0, "A failed fetch does not masquerade as a first visit");
      await scope.getByRole("button", { name: view === "projects" ? "Tentar novamente" : "Atualizar", exact: true }).click();
      await scope.getByRole("alert").waitFor({ state: "hidden" });
      assert.equal(await scope.locator(view === "projects" ? "[data-project-id]" : "[data-application-status]").count(), view === "projects" ? 4 : 5);
      results.push({ profile: profile.name, view, errorRecovery: "passed" });
    }
    await visit("/dev/portal-preview?role=work&state=loading");
    await page.locator("[data-collaborator-home]").getByRole("status", { name: "Carregando dados", exact: true }).waitFor();
    await visit("/dev/workspace-preview?view=applications&state=empty");
    if (profile.name !== "desktop") {
      await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
      await page.getByRole("button", { name: "Fechar menu", exact: true }).waitFor({ state: "visible" });
      const projectsLink = page.getByRole("link", { name: "Meus projetos", exact: true });
      await projectsLink.click();
      await page.locator("[data-project-workspace] h1").waitFor();
      await page.getByRole("button", { name: "Fechar menu", exact: true }).waitFor({ state: "hidden" });
    }
    assert.equal(await page.evaluate(() => localStorage.getItem("collaborator-audit-sentinel")), "preserved");
    assert.deepEqual(errors, [], `${profile.name}: browser runtime errors`);
    results.push({ profile: profile.name, functionalChecks: "passed", runtimeErrors: errors.length });
  } finally {
    await context.close();
    await browser.close();
  }
}
await writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ passed: results.length, results }, null, 2));
