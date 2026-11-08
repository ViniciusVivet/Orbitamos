import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const webRoot = fileURLToPath(new URL("../", import.meta.url));
const publicRoot = path.join(webRoot, "public");
const requireMedia = process.argv.includes("--require-media");
const moduleUrls = new Map();

// The data modules have no framework side effects. Transpile only these small local
// TypeScript modules so this contract audit runs directly in Node, without a build.
async function moduleUrl(relativePath) {
  if (moduleUrls.has(relativePath)) return moduleUrls.get(relativePath);
  const absolute = path.resolve(webRoot, relativePath);
  assert.ok(absolute.startsWith(`${path.join(webRoot, "src")}${path.sep}`), "Data module must stay inside src");
  const source = await readFile(absolute, "utf8");
  let code = ts.transpileModule(source, {
    fileName: absolute,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  const aliases = [...code.matchAll(/(?:from\s+|import\s*)(["'])(@\/[^"']+)\1/g)];
  for (const [, quote, specifier] of aliases) {
    const dependency = await moduleUrl(`src/${specifier.slice(2)}.ts`);
    code = code.replaceAll(`${quote}${specifier}${quote}`, JSON.stringify(dependency));
  }
  const url = `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
  moduleUrls.set(relativePath, url);
  return url;
}

const load = async (relativePath) => import(await moduleUrl(relativePath));
const { CATEGORIAS } = await load("src/types/projeto.ts");
const { projetos } = await load("src/data/projetos.ts");
const { servicos } = await load("src/data/servicos.ts");
const { orderProjectsForPortfolio, projectCatalogPresentation } = await load("src/lib/projectCatalog.ts");
const { PROJECT_ENVIRONMENTS, getProjectEnvironment } = await load("src/lib/projectEnvironments.ts");

const categories = ["todos", ...CATEGORIAS.map(({ slug }) => slug)];
const approvedOrder = ["sabrina-lashes", "radar-da-rima", "yume-moda-disruptiva", "mb-multimarcas-infantil", "sensimilla-records", "orbitamos-portal-tech", "orbicore-gestao", "palladinos-assessoria", "fast-comunicacao-design", "kitcerto", "destaque-multimarcas"];
const originalProjects = JSON.stringify(projetos);
const originalReferences = [...projetos];
const validCtas = new Set(["/contato", ...servicos.map(({ slug }) => `/servicos/${slug}`)]);
const mediaKinds = ["poster", "posterMobile", "video", "videoMobile"];
const mediaUrls = new Set();
const report = { strictMedia: requireMedia, categories: [], media: [], pendingMedia: [] };

assert.deepEqual(Object.keys(PROJECT_ENVIRONMENTS).sort(), [...categories].sort(), "Every public filter needs one environment");
assert.equal(projetos.length, 11, "The environment rollout must preserve the eleven approved projects");
assert.deepEqual(orderProjectsForPortfolio(projetos).map(({ slug }) => slug), approvedOrder, "Environment rollout must preserve the commercial order");

for (const category of categories) {
  const environment = getProjectEnvironment(category);
  assert.equal(environment.id, category, `Wrong environment for ${category}`);
  for (const field of ["label", "title", "description", "ctaLabel", "objectPosition"]) {
    assert.equal(typeof environment[field], "string", `${category}.${field} must be readable text`);
    assert.ok(environment[field].trim(), `${category}.${field} must not be empty`);
  }
  assert.ok(validCtas.has(environment.ctaHref), `${category} points at an unknown service/contact route`);
  assert.match(environment.accent, /^#[\da-f]{6}$/i, `${category} needs a valid accent`);
  assert.match(environment.secondary, /^#[\da-f]{6}$/i, `${category} needs a valid secondary color`);
  const accentChannels = environment.accent.match(/[\da-f]{2}/gi).map((channel) => parseInt(channel, 16));
  assert.deepEqual(environment.accentRgb.trim().split(/\s+/).map(Number), accentChannels, `${category} RGB and hex accents disagree`);

  const presentation = projectCatalogPresentation(projetos, category, "");
  const displayed = [...presentation.featured, ...presentation.remaining];
  assert.equal(new Set(displayed.map(({ slug }) => slug)).size, displayed.length, `${category} repeats a project`);
  assert.deepEqual(displayed.map(({ slug }) => slug), presentation.filtered.map(({ slug }) => slug), `${category} changes filtered project order`);
  if (category !== "todos") assert.ok(displayed.every((project) => project.categoria === category), `${category} leaks another category`);
  report.categories.push({ category, cta: environment.ctaHref, projects: displayed.map(({ slug }) => slug) });

  for (const kind of mediaKinds) {
    const url = environment.media[kind];
    assert.equal(typeof url, "string", `${category}.${kind} needs a local asset URL`);
    assert.ok(url.startsWith(kind.startsWith("poster") ? "/images/project-worlds/" : "/videos/project-worlds/"), `${category}.${kind} is outside the project-world asset folder`);
    assert.equal(path.posix.extname(url), kind.startsWith("poster") ? ".webp" : ".mp4", `${category}.${kind} has an unsupported format`);
    assert.ok(!mediaUrls.has(url), `${category}.${kind} reuses another environment asset`);
    mediaUrls.add(url);
    const absolute = path.resolve(publicRoot, url.slice(1));
    assert.ok(absolute.startsWith(`${publicRoot}${path.sep}`), `${category}.${kind} escapes public`);
    let info;
    try { info = await stat(absolute); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      report.pendingMedia.push({ category, kind, url });
      continue;
    }
    assert.ok(info.isFile() && info.size > 0, `${url} must be a non-empty file`);
    const isPoster = kind.startsWith("poster");
    const budget = isPoster ? (kind === "poster" ? 400 : 250) * 1024 : (kind === "video" ? 1024 : 600) * 1024;
    assert.ok(info.size <= budget, `${url} exceeds its ${Math.round(budget / 1024)} KiB media budget`);
    const bytes = await readFile(absolute);
    if (isPoster) {
      assert.equal(bytes.toString("ascii", 0, 4), "RIFF", `${url} is not a WebP container`);
      assert.equal(bytes.toString("ascii", 8, 12), "WEBP", `${url} is not WebP`);
    } else {
      const atoms = readAtoms(bytes, 0, bytes.length);
      const moov = atoms.find(({ type }) => type === "moov");
      const mdat = atoms.find(({ type }) => type === "mdat");
      assert.ok(atoms.some(({ type }) => type === "ftyp") && moov && mdat, `${url} is not a complete MP4`);
      assert.ok(moov.start < mdat.start, `${url} needs faststart metadata before video data`);
      const handlers = mediaHandlers(bytes, moov);
      assert.ok(handlers.includes("vide"), `${url} has no video track`);
      assert.ok(!handlers.includes("soun"), `${url} contains an unnecessary audio track`);
    }
    report.media.push({ category, kind, url, bytes: info.size, budgetBytes: budget, sha256: createHash("sha256").update(bytes).digest("hex") });
  }
}

assert.equal(JSON.stringify(projetos), originalProjects, "Reading scene configuration must not mutate projects");
assert.ok(projetos.every((project, index) => project === originalReferences[index]), "Reading scenes must preserve original project references/order");
for (const kind of mediaKinds) {
  const present = report.media.filter((item) => item.kind === kind);
  assert.equal(new Set(present.map(({ sha256 }) => sha256)).size, present.length, `Different categories have identical ${kind} files`);
}
if (requireMedia) assert.equal(report.pendingMedia.length, 0, `Release still misses ${report.pendingMedia.length} media files`);

console.log(JSON.stringify({
  ...report,
  commercialOrder: approvedOrder,
  projectsPreserved: true,
  completeMedia: report.pendingMedia.length === 0,
  totalMediaBytes: report.media.reduce((sum, item) => sum + item.bytes, 0),
}, null, 2));

function readAtoms(buffer, start, end) {
  const atoms = [];
  for (let cursor = start; cursor + 8 <= end;) {
    let size = buffer.readUInt32BE(cursor);
    const type = buffer.toString("ascii", cursor + 4, cursor + 8);
    let header = 8;
    if (size === 1) {
      if (cursor + 16 > end) break;
      size = Number(buffer.readBigUInt64BE(cursor + 8));
      header = 16;
    } else if (size === 0) size = end - cursor;
    if (size < header || cursor + size > end) break;
    atoms.push({ type, start: cursor, data: cursor + header, end: cursor + size });
    cursor += size;
  }
  return atoms;
}

function mediaHandlers(buffer, moov) {
  const handlers = [];
  for (const track of readAtoms(buffer, moov.data, moov.end).filter(({ type }) => type === "trak")) {
    for (const media of readAtoms(buffer, track.data, track.end).filter(({ type }) => type === "mdia")) {
      for (const handler of readAtoms(buffer, media.data, media.end).filter(({ type }) => type === "hdlr")) {
        if (handler.data + 12 <= handler.end) handlers.push(buffer.toString("ascii", handler.data + 8, handler.data + 12));
      }
    }
  }
  return handlers;
}
