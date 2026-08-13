import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const canonicalCwd = realpathSync.native(process.cwd());
const nextBin = realpathSync.native(require.resolve("next/dist/bin/next"));

const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd: canonicalCwd,
  env: process.env,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
