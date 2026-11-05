/** Isolated browser regression: all auth/data is fictional and loopback-only.
 * No .env changes, remote SQL or live account writes. Run without another Next process.
 * CSP headers are omitted only in intercepted test document responses to allow
 * the HTTP fixture origin. This does not validate or change production CSP.
 */
import assert from "node:assert/strict";
import http from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, webkit, devices, expect as baseExpect } from "@playwright/test";

const expect = baseExpect.configure({ timeout: 15000 });

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "test-results/scaling");
await mkdir(output, { recursive: true });
const A = "00000000-0000-4000-8000-000000000001";
const B = "00000000-0000-4000-8000-000000000002";
const lessonIds = ["10000000-0000-4000-8000-000000000001", "10000000-0000-4000-8000-000000000002"];
const courseSlug = "curso-escala-fixture";
const requests = [];
let rpcAvailable = false;
let failOlder = false;
let xp = 20;
const completed = new Set();
const user = (id) => ({ id, email: `${id === A ? "ana" : "bia"}@example.test`, aud: "authenticated", role: "authenticated", created_at: "2026-01-01T00:00:00Z", user_metadata: { name: id === A ? "Ana Fixture" : "Bia Fixture" } });
const profile = (id) => ({ ...user(id), name: user(id).user_metadata.name, role: "STUDENT", is_internal: false, admin_role: "none", avatar_url: null });
const token = (id) => `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: id, aud: "authenticated", role: "authenticated", exp: Math.floor(Date.now() / 1000) + 7200, iat: Math.floor(Date.now() / 1000) })).toString("base64url")}.fixture-signature`;
const actor = (req) => { try { return JSON.parse(Buffer.from(req.headers.authorization?.split(".")[1] ?? "", "base64url")).sub ?? A; } catch { return A; } };
const rows = Array.from({ length: 130 }, (_, i) => ({ id: i + 1, content: `Mensagem fixture ${i + 1}`, sender_id: i % 2 ? A : B, conversation_id: 1, created_at: new Date(Date.UTC(2026, 0, 1, 12, 0, i)).toISOString(), profiles: { name: i % 2 ? "Ana Fixture" : "Bia Fixture", avatar_url: null } }));
const course = { id: "20000000-0000-4000-8000-000000000001", slug: courseSlug, title: "Curso de escala", description: "Dados fictícios para conferir conclusão e retomada.", position: 1, course_modules: [{ id: "30000000-0000-4000-8000-000000000001", slug: `${courseSlug}-m1`, title: "Primeiros passos", position: 1, lessons: lessonIds.map((id, i) => ({ id, slug: `aula-fixture-${i + 1}`, title: `Aula de teste ${i + 1}`, position: i + 1, content: "Aprenda uma ideia e experimente no seu ritmo.", youtube_video_id: "", quiz: [], lesson_materials: [] })) }] };
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*");
  res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] ?? "authorization,apikey,content-type,x-client-info");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Expose-Headers", "content-range");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.writeHead(204).end(); return; }
  const url = new URL(req.url, "http://127.0.0.1");
  let body = "";
  for await (const chunk of req) body += chunk;
  const payload = body ? JSON.parse(body) : {};
  const id = actor(req);
  requests.push({ path: url.pathname, query: url.searchParams.toString(), method: req.method, actor: id });
  const json = (value, status = 200) => { res.writeHead(status).end(JSON.stringify(value)); };
  const selected = (value) => req.headers.accept?.includes("vnd.pgrst.object") ? value[0] ?? null : value;
  if (url.pathname === "/auth/v1/token") {
    const owner = payload.email === "bia@example.test" ? B : A;
    return json({ access_token: token(owner), refresh_token: `fixture-${owner}`, token_type: "bearer", expires_in: 7200, expires_at: Math.floor(Date.now() / 1000) + 7200, user: user(owner) });
  }
  if (url.pathname === "/auth/v1/user") return json(user(id));
  if (url.pathname === "/auth/v1/logout") { res.writeHead(204).end(); return; }
  if (url.pathname.endsWith("/rpc/v3_get_my_profile")) return json([profile(id)]);
  if (url.pathname.endsWith("/v3_profiles")) return json(selected([profile(id)]));
  if (url.pathname.endsWith("/v3_user_progress")) {
    if (req.method !== "GET") return json({ message: "Forbidden direct XP write" }, 403);
    return json(selected([{ user_id: id, xp: id === A ? xp : 70, level: 1, percent: 0, streak_days: 0, phase: "Estudando", next_goal: "Próxima aula" }]));
  }
  if (url.pathname.endsWith("/courses")) {
    const detail = url.searchParams.has("slug");
    const data = detail ? course : { ...course, course_modules: course.course_modules.map((m) => ({ ...m, lessons: m.lessons.map(({ id, slug, title, position }) => ({ id, slug, title, position })) })) };
    return json(selected([data]));
  }
  if (url.pathname.endsWith("/lesson_progress")) {
    if (req.method !== "GET") return json({ message: "Forbidden direct completion write" }, 403);
    return json([...completed].map((lesson_id) => ({ lesson_id })));
  }
  if (url.pathname.endsWith("/rpc/v3_complete_lesson")) {
    if (!rpcAvailable) return json({ code: "PGRST202", message: "Fixture RPC not installed" }, 404);
    assert.equal(payload.p_expected_user_id, id);
    const fresh = !completed.has(payload.p_lesson_id);
    completed.add(payload.p_lesson_id);
    if (fresh) xp += 10;
    return json({ lesson_id: payload.p_lesson_id, newly_completed: fresh, xp_awarded: fresh ? 10 : 0, progress: { xp, level: 1 } });
  }
  if (url.pathname.endsWith("/v3_conversations")) {
    const convs = [1, 2].map((conversationId) => ({ id: conversationId, type: "GROUP", name: conversationId === 1 ? "Equipe de estudo" : "Outra conversa", created_by_user_id: id, avatar_url: null, created_at: "2026-01-01T00:00:00Z", participants: [A, B].map((owner) => ({ profiles: profile(owner) })), last_message: [rows.at(-1)] }));
    return json(selected(url.searchParams.has("id") ? convs.filter((c) => c.id === Number(url.searchParams.get("id").slice(3))) : convs));
  }
  if (url.pathname.endsWith("/v3_chat_messages")) {
    if (req.method === "POST") {
      assert.equal(payload.sender_id, id);
      const row = { id: rows.length + 1, ...payload, created_at: new Date().toISOString(), profiles: { name: profile(id).name, avatar_url: null } };
      rows.push(row);
      return json(selected([row]), 201);
    }
    const cursorId = Number(url.searchParams.get("or")?.match(/id\.lt\.(\d+)/)?.[1] ?? Infinity);
    if (Number.isFinite(cursorId) && failOlder) return json({ message: "Fixture network failure until retry" }, 503);
    const convId = Number(url.searchParams.get("conversation_id")?.slice(3) ?? 1);
    return json(rows.filter((r) => r.conversation_id === convId && r.id < cursorId).toReversed().slice(0, Number(url.searchParams.get("limit") ?? 51)));
  }
  return json([]);
});
await new Promise((yes) => server.listen(0, "127.0.0.1", yes));
const fixtureOrigin = `http://127.0.0.1:${server.address().port}`;
const appOrigin = "http://127.0.0.1:3016";
const app = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "dev", "--port", "3016", "--hostname", "127.0.0.1"], {
  cwd: root, env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: fixtureOrigin, NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-only-key", SUPABASE_SERVICE_ROLE_KEY: "", NEXT_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
});
let appLog = "";
app.stdout.on("data", (data) => { appLog += data; });
app.stderr.on("data", (data) => { appLog += data; });
const results = [];
try {
  for (let attempt = 0; ; attempt++) {
    if (app.exitCode != null) throw new Error(`Next exited: ${appLog.slice(-5000)}`);
    try { const response = await fetch(`${appOrigin}/entrar`); if (response.ok) break; } catch { /* wait for process */ }
    if (attempt > 120) throw new Error(`Next did not start: ${appLog.slice(-5000)}`);
    await new Promise((yes) => setTimeout(yes, 1000));
  }
  for (const [name, type, options] of [["desktop", chromium, { viewport: { width: 1440, height: 1000 } }], ["iphone", webkit, devices["iPhone 13"]]]) {
    if (process.env.SCALING_BROWSER && process.env.SCALING_BROWSER !== name) continue;
    rpcAvailable = false; completed.clear(); xp = 20; rows.splice(130);
    console.log(`Starting ${name} browser flow`);
    const browser = await type.launch({ headless: true });
    let diagnosticPage;
    try {
      const context = await browser.newContext({ ...options, bypassCSP: true });
      await context.route("**/*", async (route) => {
        const origin = new URL(route.request().url()).origin;
        if (![appOrigin, fixtureOrigin].includes(origin)) return route.abort();
        if (name === "iphone" && origin === appOrigin && route.request().isNavigationRequest()) {
          const response = await route.fetch();
          const headers = response.headers();
          delete headers["content-security-policy"];
          delete headers["content-encoding"];
          delete headers["content-length"];
          delete headers["transfer-encoding"];
          return route.fulfill({ status: response.status(), headers, body: await response.body() });
        }
        return route.continue();
      });
      const page = await context.newPage();
      diagnosticPage = page;
      const errors = [];
      const fixtureAccessControlWarnings = [];
      page.on("pageerror", (error) => {
        // WebKit reports interrupted loopback CORS requests during navigation
        // as page errors. Preserve them separately; functional assertions still
        // require successful login, restore, reads and writes in each flow.
        if (/^\/127\.0\.0\.1:\d+\/.* due to access control checks\.$/.test(error.message)) fixtureAccessControlWarnings.push(error.message);
        else errors.push(error.message);
      });
      page.on("requestfailed", (request) => {
        if (request.url().startsWith(fixtureOrigin) || request.url().startsWith(appOrigin)) console.log(`${name}: request failed: ${request.url()} ${request.failure()?.errorText}`);
      });
      page.on("console", (message) => { if (message.type() === "error") console.log(`${name}: browser error: ${message.text()}`); });
      const login = async (target, email, destination) => {
        await target.goto(`${appOrigin}/entrar?redirect=${encodeURIComponent(destination)}`);
        // Wait for auth restoration/hydration before editing controlled inputs.
        await expect(target.getByRole("button", { name: "Entrar no portal", exact: true })).toBeEnabled({ timeout: 60000 });
        await target.locator('input[type="email"]').fill(email);
        await target.locator('input[type="password"]').fill("fixture-password");
        await expect(target.locator('input[type="email"]')).toHaveValue(email);
        await target.locator('form button[type="submit"]').click();
        await expect(target).toHaveURL(new RegExp(destination.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), { timeout: 60000 });
      };
      await login(page, "ana@example.test", `/estudante/cursos/${courseSlug}`);
      console.log(`${name}: signed in`);
      await expect(page.getByRole("heading", { name: "Aula de teste 1", exact: true })).toBeVisible({ timeout: 60000 });
      await page.getByRole("button", { name: "Concluir aula", exact: true }).click();
      await page.getByRole("button", { name: "Concluir e continuar", exact: true }).click();
      await expect(page.getByRole("status").filter({ hasText: "sincronização pendente" })).toBeVisible();
      await page.reload();
      await expect(page.getByRole("status").filter({ hasText: "sincronização pendente" })).toBeVisible({ timeout: 30000 });
      rpcAvailable = true;
      await page.getByRole("button", { name: /Sincronizar|Tentar sincronizar/ }).first().click();
      await expect(page.getByRole("status").filter({ hasText: "XP foi confirmado" })).toBeVisible();
      assert.equal(xp, 30);
      console.log(`${name}: pending/reload/retry passed`);
      await page.screenshot({ path: resolve(output, `${name}-course.png`), fullPage: true });
      await page.goto(`${appOrigin}/mensagens?area=student`);
      await page.getByRole("button", { name: /Equipe de estudo/ }).first().click();
      await expect(page.locator('[data-chat-message-id="130"]')).toBeVisible({ timeout: 60000 });
      assert.equal(await page.locator("[data-chat-message-id]").count(), 50);
      const history = page.locator('[data-chat-message-id="130"]').locator("..");
      // Scroll the messages container itself so the older control is reachable.
      await history.evaluate((element) => { let parent = element; while (parent && parent.scrollHeight <= parent.clientHeight) parent = parent.parentElement; if (parent) parent.scrollTop = 0; });
      failOlder = true;
      await page.getByRole("button", { name: "Carregar mensagens anteriores" }).click();
      await expect(page.getByRole("alert").filter({ hasText: "anteriores" })).toBeVisible();
      failOlder = false;
      const anchorY = (await page.locator('[data-chat-message-id="81"]').boundingBox()).y;
      await page.getByRole("button", { name: "Carregar mensagens anteriores" }).click();
      await expect(page.locator('[data-chat-message-id="31"]')).toBeAttached();
      assert.equal(await page.locator("[data-chat-message-id]").count(), 100);
      await expect.poll(async () => Math.abs((await page.locator('[data-chat-message-id="81"]').boundingBox()).y - anchorY)).toBeLessThan(4);
      console.log(`${name}: message pagination/retry passed`);
      await page.getByRole("textbox", { name: "Sua mensagem" }).fill(`Envio fixture ${name}`);
      await page.getByRole("button", { name: "Enviar mensagem", exact: true }).click();
      await expect(page.locator("[data-chat-message-id]").getByText(`Envio fixture ${name}`, { exact: true })).toBeVisible();
      await page.screenshot({ path: resolve(output, `${name}-chat.png`), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert.equal(overflow, false, `${name} horizontal overflow`);
      if (name === "iphone") {
        const reads = requests.filter((r) => r.path.endsWith("/v3_chat_messages") && r.method === "GET").length;
        await page.getByRole("link", { name: "← Voltar", exact: true }).click();
        await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
        await page.getByRole("link", { name: "Voltar ao site", exact: true }).click();
        await expect(page.getByRole("button", { name: "Abrir chat", exact: true })).toBeVisible();
        assert.equal(requests.filter((r) => r.path.endsWith("/v3_chat_messages") && r.method === "GET").length, reads);
        await page.getByRole("button", { name: "Abrir chat", exact: true }).click();
        const dialog = page.getByRole("dialog", { name: "Conversa com Equipe de estudo", exact: true });
        await expect(dialog.locator('[data-chat-message-id="131"]')).toBeAttached();
        await page.setViewportSize({ width: 320, height: 700 });
        const bounds = await dialog.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= 320 && bounds.y + bounds.height <= 700);
        await page.screenshot({ path: resolve(output, "iphone-floating320.png") });
        await page.setViewportSize(options.viewport);
        await dialog.getByRole("link", { name: "Abrir em tela cheia", exact: true }).click();
      }
      const other = await context.newPage();
      await other.goto(`${appOrigin}/estudante`);
      if (name === "iphone") await other.getByRole("button", { name: "Abrir menu", exact: true }).click();
      await other.getByRole("button", { name: "Sair da conta", exact: true }).click();
      await expect(page).toHaveURL(/\/entrar/, { timeout: 15000 });
      console.log(`${name}: cross-tab logout passed`);
      await login(other, "bia@example.test", "/estudante");
      await page.goto(`${appOrigin}/estudante`);
      await expect(page.getByText("Bia Fixture", { exact: true }).first()).toBeAttached({ timeout: 30000 });
      await page.reload();
      await expect(page.getByText("Bia Fixture", { exact: true }).first()).toBeAttached({ timeout: 30000 });
      await expect(page.getByText("70", { exact: true })).toBeVisible();
      assert.deepEqual(errors, []);
      results.push({ browser: name, coursePendingReloadRetry: true, xpAwardedOnce: true, chat50Then100: true, chatScrollAnchor: true, transientErrorRetry: true, send: true, floating320: name === "iphone", logoutAcrossTabs: true, restoreB: true, progressB: 70, overflow: false, pageErrors: errors, fixtureAccessControlWarnings });
      await context.close();
    } catch (error) {
      if (diagnosticPage && !diagnosticPage.isClosed()) {
        await diagnosticPage.screenshot({ path: resolve(output, `${name}-failure.png`) }).catch(() => {});
        await writeFile(resolve(output, `${name}-failure.html`), await diagnosticPage.content());
      }
      throw error;
    } finally { await browser.close(); }
  }
  const catalogRequests = requests.filter((r) => r.path.endsWith("/courses") && !new URLSearchParams(r.query).has("slug"));
  assert.ok(catalogRequests.length > 0);
  for (const request of catalogRequests) assert.doesNotMatch(new URLSearchParams(request.query).get("select"), /content|youtube_video_id|quiz|lesson_materials/);
  for (const request of requests.filter((r) => r.path.endsWith("/courses") && new URLSearchParams(r.query).has("slug"))) assert.equal(new URLSearchParams(request.query).get("slug"), `eq.${courseSlug}`);
  const listRequests = requests.filter((r) => r.path.endsWith("/v3_conversations"));
  assert.ok(listRequests.length > 0);
  for (const request of listRequests) assert.equal(new URLSearchParams(request.query).get("last_message.limit"), "1");
  for (const request of requests.filter((r) => r.path.endsWith("/v3_chat_messages") && r.method === "GET")) assert.equal(new URLSearchParams(request.query).get("limit"), "51");
  assert.equal(requests.filter((r) => /\/(v3_user_progress|lesson_progress)$/.test(r.path) && r.method !== "GET").length, 0);
  await writeFile(resolve(output, "report.json"), JSON.stringify({ results, requestCount: requests.length, catalogRequests: catalogRequests.length, boundedChatRequests: listRequests.length, requests }, null, 2));
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  await writeFile(resolve(output, "failure.json"), JSON.stringify({ error: String(error), results, requests, appLog: appLog.slice(-15000) }, null, 2));
  throw error;
} finally {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(app.pid), "/t", "/f"], { windowsHide: true, stdio: "ignore" });
  else app.kill("SIGTERM");
  server.closeAllConnections();
  await new Promise((yes) => server.close(yes));
  await writeFile(resolve(output, "next.log"), appLog);
}
