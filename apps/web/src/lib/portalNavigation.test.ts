import { describe, expect, it } from "vitest";
import { academyPreviewHref, academySection, academySections, canonicalAcademyHref, isWorkspacePath, practiceMode } from "./portalNavigation";

describe("Academy navigation", () => {
  it("separates marketing from workspace with exact path boundaries", () => {
    for (const path of ["/", "/projetos/yume", "/servicos/presenca-profissional", "/entrar", "/estudante-falso"]) expect(isWorkspacePath(path)).toBe(false);
    for (const path of ["/estudante", "/estudante/trilhas/sql", "/colaborador", "/mensagens", "/dev/academy-preview"]) expect(isWorkspacePath(path)).toBe(true);
  });
  it("gives every study route exactly one clear section", () => {
    expect(academySections).toHaveLength(5);
    for (const path of ["/estudante/trilhas/csharp", "/estudante/trilhas/sql", "/estudante/cursos/sql-na-pratica", "/estudante/orbita", "/estudante/aulas"]) expect(academySection(path)).toBe("tracks");
    expect(academySection("/estudante/jogos/ingles-em-cena")).toBe("practice");
    expect(academySection("/estudante/mentorias")).toBe("community");
    expect(academySection("/estudante/conta")).toBe("account");
    expect(practiceMode("/estudante/jogos/ingles-em-cena")).toBe("english");
  });
  it("keeps preview navigation isolated and the activity origin intact", () => {
    expect(academyPreviewHref("/estudante/pratica/variaveis-js?from=english")).toBe("/dev/ide-preview/variaveis-js?from=english&academy=1");
    expect(academyPreviewHref("/estudante/trilhas/sql?mode=workshop")).toBe("/dev/academy-preview?activity=sql&mode=workshop");
    expect(academyPreviewHref("/estudante/pratica?linguagem=python#experimentos")).toBe("/dev/lab-preview?academy=1&linguagem=python#experimentos");
    expect(academyPreviewHref("/estudante/trilhas/csharp?module=conditions")).toBe("/dev/csharp-preview?academy=1&module=conditions");
    expect(academyPreviewHref("https://example.com/test")).toBe("https://example.com/test");
    expect(canonicalAcademyHref("/dev/ide-preview/variaveis-js", "?academy=1&from=english")).toBe("/estudante/pratica/variaveis-js");
    expect(canonicalAcademyHref("/dev/ide-preview/variaveis-js")).toBeNull();
    expect(canonicalAcademyHref("/dev/academy-preview", "?view=home")).toBeNull();
  });
});
