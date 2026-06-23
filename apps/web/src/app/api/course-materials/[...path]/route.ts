import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
  ".pdf": "application/pdf",
};

function isSafeSegment(segment: string): boolean {
  return Boolean(segment) && segment !== "." && segment !== ".." && !segment.includes("/") && !segment.includes("\\");
}

async function readCourseMaterial(requestedPath: string[]): Promise<Buffer> {
  const candidateBaseDirs = [
    path.join(process.cwd(), "public", "course-materials"),
    path.join(process.cwd(), "apps", "web", "public", "course-materials"),
  ];

  let lastError: unknown;
  for (const baseDir of candidateBaseDirs) {
    const filePath = path.join(baseDir, ...requestedPath);
    const relativePath = path.relative(baseDir, filePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      continue;
    }

    try {
      return await readFile(filePath);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: requestedPath } = await context.params;
  if (!requestedPath?.length || !requestedPath.every(isSafeSegment)) {
    return new Response("Arquivo invalido", { status: 400 });
  }

  try {
    const file = await readCourseMaterial(requestedPath);
    const filename = requestedPath[requestedPath.length - 1];
    const contentType = CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream";

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Arquivo nao encontrado", { status: 404 });
  }
}
