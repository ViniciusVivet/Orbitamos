import path from "node:path";

export const COURSE_MATERIAL_CONTENT_TYPES: Record<string, string> = {
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
  ".pdf": "application/pdf",
};

export function isSafeCourseMaterialSegment(segment: string): boolean {
  return (
    Boolean(segment) &&
    segment.length <= 255 &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("/") &&
    !segment.includes("\\") &&
    !/[\x00-\x1f\x7f]/.test(segment)
  );
}

export function candidateCourseMaterialFilenames(filename: string): string[] {
  const parsed = path.parse(filename);
  const candidates = [filename];

  if (parsed.ext.toLowerCase() === ".pdf") {
    candidates.push(
      `${parsed.name}.docx`,
      `${parsed.name}.xlsx`,
      `${parsed.name}.xlsm`
    );
  }

  return Array.from(new Set(candidates));
}

export function normalizeCourseMaterialStem(filename: string): string {
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

export function getCourseMaterialContentType(filename: string): string {
  return (
    COURSE_MATERIAL_CONTENT_TYPES[path.extname(filename).toLowerCase()] ??
    "application/octet-stream"
  );
}
