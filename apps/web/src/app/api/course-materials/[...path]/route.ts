import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import {
  candidateCourseMaterialFilenames,
  getCourseMaterialContentType,
  isSafeCourseMaterialSegment,
  normalizeCourseMaterialStem,
} from "@/lib/courseMaterials";

export const runtime = "nodejs";

type ResolvedMaterial = {
  file: Buffer;
  filename: string;
};

async function fuzzyFilenames(baseDir: string, parentSegments: string[], requestedFilename: string): Promise<string[]> {
  const directory = path.join(baseDir, ...parentSegments);
  const relativePath = path.relative(baseDir, directory);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return [];

  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const requestedStem = normalizeCourseMaterialStem(requestedFilename);
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((filename) => {
        const stem = normalizeCourseMaterialStem(filename);
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
  const filenameCandidates = candidateCourseMaterialFilenames(requestedPath[requestedPath.length - 1]);

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

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return process.env.NODE_ENV !== "production";
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!(await isAuthenticated(request))) {
    return new Response("Não autorizado", { status: 401 });
  }

  const { path: requestedPath } = await context.params;
  if (!requestedPath?.length || !requestedPath.every(isSafeCourseMaterialSegment)) {
    return new Response("Arquivo invalido", { status: 400 });
  }

  try {
    const { file, filename } = await readCourseMaterial(requestedPath);
    const contentType = getCourseMaterialContentType(filename);
    const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";

    if (request.nextUrl.searchParams.get("meta") === "1") {
      return Response.json({
        filename,
        contentType,
        size: file.byteLength,
      });
    }

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${filename.replaceAll("\"", "")}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Arquivo não encontrado", { status: 404 });
  }
}
