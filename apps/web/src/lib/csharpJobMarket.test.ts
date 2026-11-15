import { describe, expect, it } from "vitest";
import { csharpJobSources, csharpMarketCheckedAt } from "./csharpJobMarket";

describe("public C# job references", () => {
  it("keeps dated primary sources separate from a hiring guarantee", () => {
    expect(csharpMarketCheckedAt).toBe("15/11/2026");
    expect(csharpJobSources.length).toBeGreaterThanOrEqual(4);
    expect(csharpJobSources.length).toBeLessThanOrEqual(6);
    expect(new Set(csharpJobSources.map(source => source.url)).size).toBe(csharpJobSources.length);

    const allowedHosts = new Set([
      "br.linkedin.com",
      "stefanini.gupy.io",
      "vagasstefanini.gupy.io",
      "bemobi.gupy.io",
    ]);
    for (const source of csharpJobSources) {
      const url = new URL(source.url);
      expect(url.protocol).toBe("https:");
      expect(allowedHosts.has(url.hostname)).toBe(true);
      expect(url.username || url.password || url.hash).toBe("");
      expect(url.pathname).toMatch(/\/(?:jobs\/view|jobs|job)\/.+/);
      expect(source.observedAt).toBe("2026-11-15");
      // This is a dated editorial observation, not an automated live-status test.
      expect(source.status).toBe("application-link-visible");
    }
    expect(csharpJobSources.filter(source => source.level === "Pleno")).toHaveLength(1);
    expect(csharpJobSources.find(source => source.level === "Pleno")?.kind).toContain("contraste");
    expect(csharpJobSources.some(source => source.level === "Estágio")).toBe(true);
  });
});
