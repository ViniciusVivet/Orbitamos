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
  assert.equal(files.length, 14);
  assert.deepEqual(
    files.map((name) => name.match(/(\d{3})00_/u)?.[1]),
    Array.from({ length: 14 }, (_, index) => String(index + 5).padStart(3, "0"))
  );
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
