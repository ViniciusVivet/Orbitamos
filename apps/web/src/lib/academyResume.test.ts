import { describe, expect, it } from "vitest";
import { academyResumeEntry, readAcademyResume } from "./academyResume";
import { CSHARP_METHODS_HREF, CSHARP_OBJECTS_HREF } from "./portalNavigation";

describe("SDK units resume allowlist", () => {
  it.each([["methods", CSHARP_METHODS_HREF], ["objects", CSHARP_OBJECTS_HREF]])("stores only the authored %s view and gives it priority over module", (view, expected) => {
    for (const href of [
      expected,
      expected + "&module=loops&token=secret",
      `/estudante/trilhas/csharp?module=conditions&view=${view}&redirect=https://evil.test`,
    ]) {
      const entry = academyResumeEntry(href, 1000);
      expect(entry).toEqual({ href: expected, updatedAt: 1000 });
      expect(readAcademyResume(JSON.stringify(entry))).toEqual(entry);
    }
  });

  it("preserves the three existing modules while refusing unrecognized SDK views", () => {
    for (const moduleId of ["variables", "conditions", "loops"]) {
      expect(academyResumeEntry(`/estudante/trilhas/csharp?view=unknown&module=${moduleId}`, 1000)?.href).toBe(`/estudante/trilhas/csharp?module=${moduleId}`);
    }
    for (const href of [
      "/estudante/trilhas/csharp?view=Methods",
      "/estudante/trilhas/csharp?view=methods-extra",
      "/estudante/trilhas/csharp?module=methods",
      "/estudante/trilhas/csharp?view=Objects",
      "/estudante/trilhas/csharp?view=objects-extra",
      "/estudante/trilhas/csharp?module=objects",
    ]) expect(academyResumeEntry(href, 1000)?.href).toBe("/estudante/trilhas/csharp");
    for (const href of [
      "https://evil.test" + CSHARP_METHODS_HREF,
      "/dev/csharp-preview?academy=1&view=methods",
      CSHARP_METHODS_HREF + "#methods",
      CSHARP_METHODS_HREF + "#redirect=https://evil.test",
      "https://evil.test" + CSHARP_OBJECTS_HREF,
      "/dev/csharp-preview?academy=1&view=objects",
      CSHARP_OBJECTS_HREF + "#objects",
    ]) expect(academyResumeEntry(href, 1000)).toBeNull();
  });
});
