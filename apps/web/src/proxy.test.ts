import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const authMock = vi.hoisted(() => ({
  getUser: vi.fn(),
  createServerClient: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: authMock.createServerClient,
}));

import { proxy } from "./proxy";

describe("authentication proxy", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    authMock.getUser.mockResolvedValue({ data: { user: null } });
    authMock.createServerClient.mockReturnValue({
      auth: { getUser: authMock.getUser },
    });
  });

  it("does not consult auth for public routes", async () => {
    const response = await proxy(new NextRequest("http://localhost/projetos"));
    expect(response.status).toBe(200);
    expect(authMock.createServerClient).not.toHaveBeenCalled();
  });

  it.each([
    "/estudante",
    "/colaborador/vagas",
    "/orbitacademy",
    "/dashboard",
    "/mensagens",
    "/admin/cursos",
  ])("redirects anonymous access to %s", async (pathname) => {
    const response = await proxy(
      new NextRequest(`http://localhost${pathname}?from=test`)
    );
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/entrar");
    expect(location.searchParams.get("redirect")).toBe(pathname);
  });

  it("allows an authenticated user into protected routes", async () => {
    authMock.getUser.mockResolvedValueOnce({
      data: { user: { id: "user-id" } },
    });
    const response = await proxy(
      new NextRequest("http://localhost/estudante/aulas")
    );
    expect(response.status).toBe(200);
  });

  it("fails closed when the auth provider throws", async () => {
    authMock.getUser.mockRejectedValueOnce(new Error("auth unavailable"));
    const response = await proxy(new NextRequest("http://localhost/admin"));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/entrar");
  });

  it("does not treat a similarly-prefixed public path as protected", async () => {
    const response = await proxy(new NextRequest("http://localhost/admin-publico"));
    expect(response.status).toBe(200);
    expect(authMock.createServerClient).not.toHaveBeenCalled();
  });

  it("keeps local fallback behavior when Supabase is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const response = await proxy(new NextRequest("http://localhost/admin"));
    expect(response.status).toBe(200);
    expect(authMock.createServerClient).not.toHaveBeenCalled();
  });
});
