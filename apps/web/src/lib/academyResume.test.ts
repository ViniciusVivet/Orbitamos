import { describe, expect, it } from "vitest";
import { academyResumeEntry, readAcademyResume } from "./academyResume";
import { CSHARP_METHODS_HREF } from "./portalNavigation";

describe("methods resume allowlist", () => {
  it("stores only the authored methods view and gives it priority over module", () => {
    for (const href of [
      CSHARP_METHODS_HREF,
      CSHARP_METHODS_HREF + "&module=loops&token=secret",
      "/estudante/trilhas/csharp?module=conditions&view=methods&redirect=https://evil.test",
    ]) {
      const entry = academyResumeEntry(href, 1000);
      expect(entry).toEqual({ href: CSHARP_METHODS_HREF, updatedAt: 1000 });
      expect(readAcademyResume(JSON.stringify(entry))).toEqual(entry);
    }
  });

  it("preserves the three existing modules while refusing unrecognized methods views", () => {
    for (const moduleId of ["variables", "conditions", "loops"]) {
      expect(academyResumeEntry(`/estudante/trilhas/csharp?view=unknown&module=${moduleId}`, 1000)?.href).toBe(`/estudante/trilhas/csharp?module=${moduleId}`);
    }
    for (const href of [
      "/estudante/trilhas/csharp?view=Methods",
      "/estudante/trilhas/csharp?view=methods-extra",
      "/estudante/trilhas/csharp?module=methods",
    ]) expect(academyResumeEntry(href, 1000)?.href).toBe("/estudante/trilhas/csharp");
    for (const href of [
      "https://evil.test" + CSHARP_METHODS_HREF,
      "/dev/csharp-preview?academy=1&view=methods",
      CSHARP_METHODS_HREF + "#methods",
      CSHARP_METHODS_HREF + "#redirect=https://evil.test",
    ]) expect(academyResumeEntry(href, 1000)).toBeNull();
  });
});
