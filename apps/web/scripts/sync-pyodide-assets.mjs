import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(projectRoot, "node_modules", "pyodide");
const targetDir = path.join(projectRoot, "public", "vendor", "pyodide");
const runtimeFiles = [
  "pyodide.mjs",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];

await mkdir(targetDir, { recursive: true });
await Promise.all(runtimeFiles.map((filename) => copyFile(path.join(sourceDir, filename), path.join(targetDir, filename))));
console.log(`Pyodide local preparado em public/vendor/pyodide (${runtimeFiles.length} arquivos).`);

const sqlTarget = path.join(projectRoot, "public", "vendor", "sqljs");
await mkdir(sqlTarget, { recursive: true });
await Promise.all(["sql-wasm.js", "sql-wasm.wasm"].map(filename => copyFile(path.join(projectRoot, "node_modules", "sql.js", "dist", filename), path.join(sqlTarget, filename))));
await copyFile(path.join(projectRoot, "node_modules", "sql.js", "LICENSE"), path.join(sqlTarget, "LICENSE"));
console.log("SQLite local preparado em public/vendor/sqljs.");
