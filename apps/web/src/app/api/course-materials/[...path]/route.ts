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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: requestedPath } = await context.params;
  if (!requestedPath?.length || !requestedPath.every(isSafeSegment)) {
    return new Response("Arquivo invalido", { status: 400 });
  }

  const baseDir = path.join(process.cwd(), "public", "course-materials");
  const filePath = path.join(baseDir, ...requestedPath);
  const relativePath = path.relative(baseDir, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return new Response("Arquivo invalido", { status: 400 });
  }

  try {
    const file = await readFile(filePath);
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
