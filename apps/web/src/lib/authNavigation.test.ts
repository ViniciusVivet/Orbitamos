import { describe, expect, it, vi } from "vitest";
import { defaultPortalDestination, loginDestination, loginPathFor, portalAreaFromPath, portalAreaKey, readPortalArea, rememberPortalArea, rememberedPortalArea, sanitizeReturnTo } from "./authNavigation";

describe("safe auth navigation", () => {
  it("keeps a mission, query and hash intact through login", () => {
    const target = "/estudante/trilhas/sql?mode=workshop&from=delivery#sql-table";
    expect(sanitizeReturnTo(target)).toBe(target);
    expect(new URL(loginPathFor(target), "https://orbitamos.invalid").searchParams.get("redirect")).toBe(target);
    expect(loginDestination(target, "FREELANCER", "work")).toBe(target);
  });

  it.each([
    null, "", "https://evil.example/", "//evil.example/", "javascript:alert(1)",
    "/\\evil.example", "/%5cevil.example", "/%2f%2fevil.example", "/%252f%252fevil.example",
    "/%09/evil", "/estudante\n", " /estudante", "/entrar?redirect=/estudante", "/ENTRAR/",
    "/estudante/../entrar", "/estudante/%2e%2e/entrar", "/estudante/%252e%252e/entrar",
    "/api/auth/callback", "/auth/callback", "/logout", "/%65ntrar", "/%zz",
    "/estudante?password=secret", "/estudante?access_token=secret", "/estudante#refresh_token=secret", "/estudante#foo=1&access_token=secret",
    "/" + "x".repeat(4096),
  ])("rejects unsafe, credential-bearing or looping return target %j", value => {
    expect(sanitizeReturnTo(value)).toBeNull();
    expect(loginPathFor(value)).toBe("/entrar");
    expect(loginDestination(value, "STUDENT", "work")).toBe("/colaborador");
  });

  it("does not confuse query values with an external navigation destination", () => {
    expect(sanitizeReturnTo("/estudante/pratica?q=console.log%28%27oi%27%29&from=english")).toBe("/estudante/pratica?q=console.log%28%27oi%27%29&from=english");
    expect(sanitizeReturnTo("/projetos?site=https%3A%2F%2Fexample.com")).toBe("/projetos?site=https%3A%2F%2Fexample.com");
  });

  it("uses remembered UI area before the registration role, without changing permissions", () => {
    expect(defaultPortalDestination("FREELANCER", "student")).toBe("/estudante");
    expect(defaultPortalDestination("STUDENT", "work")).toBe("/colaborador");
    expect(defaultPortalDestination("FREELANCER")).toBe("/colaborador");
    expect(defaultPortalDestination(undefined)).toBe("/estudante");
    expect(readPortalArea("admin")).toBeNull();
    expect(readPortalArea("work")).toBe("work");
  });

  it("maps only real portal path boundaries", () => {
    expect(portalAreaFromPath("/estudante/trilhas/csharp?view=map")).toBe("student");
    expect(portalAreaFromPath("/colaborador/projetos/2")).toBe("work");
    expect(portalAreaFromPath("/orbitacademy")).toBe("student");
    expect(portalAreaFromPath("/estudante-publico")).toBeNull();
    expect(portalAreaFromPath("/mensagens?area=work")).toBeNull();
  });

  it("isolates area by account and tolerates unavailable storage", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
    try {
      rememberPortalArea("one", "work");
      expect(rememberedPortalArea("one")).toBe("work");
      expect(rememberedPortalArea("two")).toBeNull();
      expect(portalAreaKey("a/b")).not.toBe(portalAreaKey("a%2Fb"));
      vi.stubGlobal("window", { get localStorage() { throw new Error("blocked"); } });
      expect(rememberedPortalArea("one")).toBeNull();
      expect(() => rememberPortalArea("one", "student")).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
