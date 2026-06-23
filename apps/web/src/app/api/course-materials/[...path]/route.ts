import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
  ".pdf": "application/pdf",
};

type ResolvedMaterial = {
  file: Buffer;
  filename: string;
};

function isSafeSegment(segment: string): boolean {
  return Boolean(segment) && segment !== "." && segment !== ".." && !segment.includes("/") && !segment.includes("\\");
}

function candidateFilenames(filename: string): string[] {
  const parsed = path.parse(filename);
  const candidates = [filename];

  if (parsed.ext.toLowerCase() === ".pdf") {
    candidates.push(`${parsed.name}.docx`, `${parsed.name}.xlsx`, `${parsed.name}.xlsm`);
  }

  return Array.from(new Set(candidates));
}

function normalizeFileStem(filename: string): string {
  return path
    .parse(filename)
    .name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^\d+[-_\s]+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fuzzyFilenames(baseDir: string, parentSegments: string[], requestedFilename: string): Promise<string[]> {
  const directory = path.join(baseDir, ...parentSegments);
  const relativePath = path.relative(baseDir, directory);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return [];

  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const requestedStem = normalizeFileStem(requestedFilename);
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((filename) => {
        const stem = normalizeFileStem(filename);
        return stem.includes(requestedStem) || requestedStem.includes(stem);
      });
  } catch {
    return [];
  }
}

async function readCourseMaterial(requestedPath: string[]): Promise<ResolvedMaterial> {
  const candidateBaseDirs = [
    path.join(process.cwd(), "public", "course-materials"),
    path.join(process.cwd(), "apps", "web", "public", "course-materials"),
  ];
  const parentSegments = requestedPath.slice(0, -1);
  const filenameCandidates = candidateFilenames(requestedPath[requestedPath.length - 1]);

  let lastError: unknown;
  for (const baseDir of candidateBaseDirs) {
    const allFilenameCandidates = [
      ...filenameCandidates,
      ...(await fuzzyFilenames(baseDir, parentSegments, requestedPath[requestedPath.length - 1])),
    ];

    for (const filename of Array.from(new Set(allFilenameCandidates))) {
      const candidatePath = [...parentSegments, filename];
      const filePath = path.join(baseDir, ...candidatePath);
      const relativePath = path.relative(baseDir, filePath);

      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        continue;
      }

      try {
        return {
          file: await readFile(filePath),
          filename,
        };
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: requestedPath } = await context.params;
  if (!requestedPath?.length || !requestedPath.every(isSafeSegment)) {
    return new Response("Arquivo invalido", { status: 400 });
  }

  try {
    const { file, filename } = await readCourseMaterial(requestedPath);
    const contentType = CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream";
    const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${filename.replaceAll("\"", "")}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Arquivo nao encontrado", { status: 404 });
  }
}
