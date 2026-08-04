import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const authMock = vi.hoisted(() => ({
  getUser: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: authMock.createServerClient,
}));

import { GET } from "./route";

function call(path: string[], query = "") {
  const request = new NextRequest(
    `http://localhost/api/course-materials/${path.join("/")}${query}`
  );
  return GET(request, { params: Promise.resolve({ path }) });
}

describe("GET /api/course-materials/[...path]", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    authMock.getUser.mockResolvedValue({ data: { user: null } });
    authMock.createServerClient.mockReturnValue({ auth: { getUser: authMock.getUser } });
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each([
    [".."],
    ["pasta/arquivo.docx"],
    ["pasta\\arquivo.docx"],
    [],
  ])("rejects unsafe path %j", async (...path) => {
    const response = await call(path as string[]);
    expect(response.status).toBe(400);
  });

  it("returns 404 for a safe missing file", async () => {
    const response = await call(["nao-existe", "arquivo.docx"]);
    expect(response.status).toBe(404);
  });

  it("returns metadata for an existing material", async () => {
    const response = await call(
      ["excel-procv", "01-excel-procv.docx"],
      "?meta=1"
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      filename: "01-excel-procv.docx",
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: expect.any(Number),
    });
  });

  it("falls back from a requested PDF to the matching DOCX", async () => {
    const response = await call(
      ["excel-procv", "01-excel-procv.pdf"],
      "?meta=1"
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      filename: "01-excel-procv.docx",
    });
  });

  it("sets secure download headers", async () => {
    const response = await call(
      ["excel-procv", "01-excel-procv.docx"],
      "?download=1"
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("cache-control")).toContain("immutable");
  });

  it("denies anonymous access when Supabase is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    const response = await call(["excel-procv", "01-excel-procv.docx"]);
    expect(response.status).toBe(401);
  });

  it("denies access when the auth provider fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    authMock.getUser.mockRejectedValueOnce(new Error("auth unavailable"));
    const response = await call(["excel-procv", "01-excel-procv.docx"]);
    expect(response.status).toBe(401);
  });

  it("serves a material to an authenticated user", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    authMock.getUser.mockResolvedValueOnce({ data: { user: { id: "user-id" } } });
    const response = await call(["excel-procv", "01-excel-procv.docx"], "?meta=1");
    expect(response.status).toBe(200);
  });
});
