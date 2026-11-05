import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("local Supabase is isolated from production", async () => {
  const config = await read("supabase/config.toml");
  assert.match(config, /project_id = "orbitamos-local"/);
  assert.doesNotMatch(config, /orbitamosbr|project_ref|db\.push/iu);
});

test("all v3 migrations have ordered Supabase filenames", async () => {
  const files = (await readdir(new URL("supabase/migrations/", root))).sort();
  assert.equal(files.length, 15);
  assert.deepEqual(
    files.map((name) => name.match(/(\d{3})00_/u)?.[1]),
    Array.from({ length: 15 }, (_, index) => String(index + 5).padStart(3, "0"))
  );
});

test("lesson completion is atomic, authenticated and preserves legacy achievements", async () => {
  const sql = await read("supabase/migrations/20260619001900_atomic_lesson_completion.sql");
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/);
  assert.match(sql, /security definer\s+set search_path = ''/);
  assert.match(sql, /where public\.lesson_progress\.completed_at is null/);
  assert.match(sql, /set xp = \(xp \+ 10\) % 100/);
  assert.match(sql, /c\.is_published and l\.is_published/);
  assert.match(sql, /revoke insert, update, delete, truncate, references, trigger/);
  assert.doesNotMatch(sql, /drop policy|truncate table|delete from/iu);
  const suite = await read("supabase/tests/database/lesson_completion.test.sql");
  assert.match(suite, /preexisting completed row never invents retroactive XP/);
  assert.match(suite, /failed transaction leaves no completed lesson/);
  assert.match(suite, /lesson history isolated by account/);
  assert.match(suite, /rollback;/);
});

test("RLS suite covers negative and privileged access", async () => {
  const sql = await read("supabase/tests/database/rls.test.sql");
  assert.match(sql, /select plan\(14\)/);
  assert.match(sql, /cannot read another progress/);
  assert.match(sql, /cannot list contacts/);
  assert.match(sql, /cannot select protected PII/);
  assert.match(sql, /staff creates jobs/);
  assert.match(sql, /admin reads account requests/);
  assert.match(sql, /rollback;/);
});
