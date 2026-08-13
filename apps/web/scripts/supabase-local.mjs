import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const cli = require.resolve("supabase/dist/supabase.js");
const webDir = dirname(dirname(fileURLToPath(import.meta.url)));
const rootDir = realpathSync.native(resolve(webDir, "../.."));
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Uso: node scripts/supabase-local.mjs <start|stop|status|db reset|test db>");
  process.exit(1);
}

const result = spawnSync(process.execPath, [cli, ...args], {
  cwd: rootDir,
  env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "true" },
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
