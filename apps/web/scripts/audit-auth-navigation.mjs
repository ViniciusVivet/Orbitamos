import { chromium, webkit, devices, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.AUTH_AUDIT_BASE ?? "http://localhost:3015";
const iphone = process.env.AUTH_AUDIT_PROFILE === "iphone";
const engine = iphone ? webkit : chromium;
const browser = await engine.launch();
const dir = "test-results/auth-navigation";
await mkdir(dir, { recursive: true });
const report = { profile: iphone ? "iphone" : "desktop", completed: false, checks: [], interceptedWrites: [], unexpectedRequests: [], errors: [] };
const fixtureId = "00000000-0000-4000-8000-000000000042";
const fixtureEmail = "auth-audit@example.invalid";
const encode = object => Buffer.from(JSON.stringify(object)).toString("base64url");
const fixtureUser = { id: fixtureId, aud: "authenticated", role: "authenticated", email: fixtureEmail, email_confirmed_at: new Date().toISOString(), user_metadata: { name: "Pessoa de teste", role: "STUDENT" }, app_metadata: { provider: "email", providers: ["email"] }, created_at: new Date().toISOString() };
const fixtureSession = { access_token: `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: fixtureId, aud: "authenticated", role: "authenticated", exp: Math.floor(Date.now() / 1000) + 86400 })}.local-test-signature`, token_type: "bearer", expires_in: 86400, expires_at: Math.floor(Date.now() / 1000) + 86400, refresh_token: "local-fixture-only", user: fixtureUser };
const fixtureProfile = { id: fixtureId, name: "Pessoa de teste", email: fixtureEmail, role: "STUDENT", is_internal: false, admin_role: "none", created_at: new Date().toISOString(), avatar_url: null };

async function run(mode) {
  const context = await browser.newContext({ ...(iphone ? devices["iPhone 13"] : { viewport: { width: 1366, height: 900 } }), reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on("pageerror", error => report.errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" && /Supabase não configurado|NEXT_PUBLIC_SUPABASE/.test(message.text())) {
      report.configMissing = true;
      report.blockedReason = "Local browser auth is not configured; no real account or environment was changed.";
    }
  });
  await context.addInitScript(() => {
    const nativeInterval = window.setInterval;
    window.setInterval = (handler, delay, ...args) => {
      if (delay === 20 * 60 * 60 * 1000 && typeof handler === "function") window.__auditExpireAuth = handler;
      return nativeInterval(handler, delay, ...args);
    };
  });
  // All non-local requests are intercepted. No account, profile, chat or real auth mutation is sent.
  await context.route("**/*", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === new URL(base).origin) {
      if (request.method() !== "GET" && request.method() !== "HEAD" && !url.pathname.startsWith("/_next/") && url.pathname !== "/__nextjs_original-stack-frames") {
        report.unexpectedRequests.push({ path: url.pathname, method: request.method() });
        return route.abort();
      }
      return route.continue();
    }
    const json = body => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS" } });
    if (url.pathname === "/auth/v1/token") {
      report.interceptedWrites.push({ mode, path: url.pathname, grant: url.searchParams.get("grant_type") });
      if (url.searchParams.get("grant_type") === "refresh_token") return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ code: "refresh_token_not_found", message: "Fixture expired" }) });
      return json(fixtureSession);
    }
    if (url.pathname === "/auth/v1/signup") { report.interceptedWrites.push({ mode, path: url.pathname }); return json(fixtureSession); }
    if (url.pathname === "/auth/v1/user") return json(fixtureUser);
    if (url.pathname === "/rest/v1/rpc/v3_get_my_profile") return json([fixtureProfile]);
    if (url.pathname.startsWith("/rest/v1/")) {
      if (!["GET", "HEAD"].includes(request.method())) report.interceptedWrites.push({ mode, path: url.pathname });
      return json([]);
    }
    if (url.pathname.startsWith("/auth/v1/")) return json({});
    return route.abort();
  });

  try {
    const target = `/projetos?from=auth-${mode}&categoria=web#cases`;
    await page.goto(`${base}/entrar?${new URLSearchParams({ redirect: target })}`, { waitUntil: "domcontentloaded", timeout: 240000 });
    // Inputs are SSR-controlled. Wait for AuthProvider hydration before typing into them.
    await expect(page.getByRole("button", { name: "Entrar no portal", exact: true })).toBeEnabled({ timeout: 120000 });
    if (mode === "register") {
      await page.getByRole("button", { name: "Criar conta", exact: true }).click();
      await page.locator("#reg-email").fill(fixtureEmail);
      await page.locator("#reg-password").fill("fixture-password-only");
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await page.locator("#name").fill("Pessoa de teste");
      await page.getByRole("button", { name: "Criar acesso", exact: true }).click();
    } else {
      await page.locator("#email").fill(fixtureEmail);
      await page.locator("#password").fill("fixture-password-only");
      await expect(page.locator("#email")).toHaveValue(fixtureEmail);
      await expect(page.locator("#password")).toHaveValue("fixture-password-only");
      await page.getByRole("button", { name: "Entrar no portal", exact: true }).click();
    }
    await Promise.race([
      page.waitForURL(`${base}${target}`, { timeout: 120000 }),
      page.getByText("Algo deu errado. Tente novamente.", { exact: true }).waitFor({ state: "visible", timeout: 120000 }).then(() => { throw new Error("Login fixture did not start: the form reported a local authentication error."); }),
    ]);
    expect(new URL(page.url()).searchParams.get("from")).toBe(`auth-${mode}`);
    expect(new URL(page.url()).hash).toBe("#cases");
    report.checks.push(`${mode}: real form preserves safe destination, query and hash with fixture-only auth`);
    if (mode === "login") {
      const restoredTarget = "/projetos?from=auth-restored#cases";
      const authWritesBeforeRestore = report.interceptedWrites.filter(entry => entry.path === "/auth/v1/token").length;
      await page.goto(`${base}/entrar?${new URLSearchParams({ redirect: restoredTarget })}`, { waitUntil: "domcontentloaded", timeout: 240000 });
      await page.waitForURL(`${base}${restoredTarget}`, { timeout: 60000 });
      expect(report.interceptedWrites.filter(entry => entry.path === "/auth/v1/token")).toHaveLength(authWritesBeforeRestore);
      report.checks.push("already authenticated entry respects safe destination without another login");
      await page.waitForFunction(() => typeof window.__auditExpireAuth === "function");
      await page.evaluate(() => window.__auditExpireAuth());
      await page.waitForURL(url => url.pathname === "/entrar" && url.searchParams.get("redirect") === restoredTarget, { timeout: 60000 });
      report.checks.push("expired refresh keeps the current safe destination for re-entry");
    }
    await page.screenshot({ path: `${dir}/${report.profile}-${mode}.jpg`, fullPage: false });
  } catch (error) {
    report.failureContext = { mode, url: page.url(), text: (await page.locator("body").innerText().catch(() => "")).slice(-6000) };
    if (/Supabase não configurado|NEXT_PUBLIC_SUPABASE/.test(report.failureContext.text)) {
      report.configMissing = true;
      report.blockedReason = "Local browser auth is not configured; no real account or environment was changed.";
    }
    await page.screenshot({ path: `${dir}/${report.profile}-${mode}-failure.jpg`, fullPage: false }).catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}

try {
  await run("login");
  await run("register");
  expect(report.unexpectedRequests).toEqual([]);
  expect(report.errors).toEqual([]);
  report.completed = true;
  console.log(`${report.profile}: login, registration and expiry returned correctly; all auth writes intercepted`);
} catch (error) {
  report.failure = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await writeFile(`${dir}/${report.profile}.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
