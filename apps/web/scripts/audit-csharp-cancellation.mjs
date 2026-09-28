import { webkit, devices, expect } from "@playwright/test";
const browser = await webkit.launch();
try {
  const page = await browser.newPage(devices["iPhone 13"]);
  await page.goto("http://localhost:3015/dev/csharp-preview", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.getByRole("button", { name: "Começar a codar · variáveis", exact: true }).click();
  await page.getByRole("button", { name: "02.2 · Laços", exact: true }).click();
  await page.getByText("Atividades do módulo · 0/10", { exact: true }).click();
  await page.getByRole("button", { name: /Esvazie a fila com while/ }).filter({ visible: true }).click();
  const code = "int pendentes = 3;\nwhile (pendentes > 0) {\n    pendentes += 0;\n}";
  await page.locator("#variables-code").fill(code);
  await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
  await page.getByText("programa levou tempo demais", { exact: false }).waitFor({ timeout: 15000 });
  const start = Date.now();
  await page.getByRole("button", { name: "Executar e verificar", exact: true }).click();
  console.log("run click resolved after", Date.now() - start);
  await page.getByRole("button", { name: "Parar execução", exact: true }).click();
  console.log("stop click resolved after", Date.now() - start);
  try {
    await expect(page.getByText("Execução interrompida. Seu código está preservado.", { exact: true })).toBeVisible();
    await expect(page.locator("#variables-code")).toHaveValue(code);
    console.log("iPhone WebKit cancellation passed");
  } finally {
    console.log(await page.locator('[role="status"]').allTextContents());
    await page.screenshot({ path: "test-results/csharp-loops/cancellation-webkit.png" });
  }
} finally { await browser.close(); }
