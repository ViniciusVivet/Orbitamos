import { describe, expect, it } from "vitest";
import { academyPreviewHref, academySection, academySections, canonicalAcademyHref, ENGLISH_SPEAKING_HASH, ENGLISH_SPEAKING_HREF, isWorkspacePath, practiceMode, WORK_DELIVERY_HASH, WORK_DELIVERY_HREF, WORK_INCIDENT_HASH, WORK_INCIDENT_HREF, WORK_SIMULATION_HREF } from "./portalNavigation";

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
  it("round-trips only the authored pulse sub-adventure, without saving arbitrary anchors", () => {
    const pulse = "/estudante/jogos/entregas-do-orbi#oficina-do-pulso";
    expect(academyPreviewHref(pulse)).toBe("/dev/academy-preview?activity=delivery#oficina-do-pulso");
    expect(canonicalAcademyHref("/dev/academy-preview", "?activity=delivery&token=secret", "#oficina-do-pulso")).toBe(pulse);
    expect(canonicalAcademyHref("/estudante/jogos/entregas-do-orbi", "", "#oficina-do-pulso")).toBe(pulse);
    expect(canonicalAcademyHref("/dev/academy-preview", "?activity=sql", "#oficina-do-pulso")).toBe("/estudante/trilhas/sql");
    expect(canonicalAcademyHref("/estudante/jogos/entregas-do-orbi", "", "#redirect=https://evil.test")).toBe("/estudante/jogos/entregas-do-orbi");
    expect(academyPreviewHref("/estudante/jogos/entregas-do-orbi#unknown")).toBe("/dev/academy-preview?activity=delivery");
    expect(canonicalAcademyHref("/dev/academy-preview", "?view=home", "#oficina-do-pulso")).toBeNull();
  });
  it("round-trips the spoken English branch without adding a navigation section", () => {
    const english = "/estudante/jogos/ingles-em-cena";
    expect(ENGLISH_SPEAKING_HASH).toBe("#falar");
    expect(ENGLISH_SPEAKING_HREF).toBe(english + ENGLISH_SPEAKING_HASH);
    expect(academyPreviewHref(ENGLISH_SPEAKING_HREF)).toBe("/dev/academy-preview?activity=english#falar");
    expect(academyPreviewHref(english + "?token=secret#falar")).toBe("/dev/academy-preview?activity=english#falar");
    expect(academyPreviewHref(english)).toBe("/dev/academy-preview?activity=english");
    expect(canonicalAcademyHref(english, "", ENGLISH_SPEAKING_HASH)).toBe(ENGLISH_SPEAKING_HREF);
    expect(canonicalAcademyHref("/dev/academy-preview", "?activity=english&token=secret", ENGLISH_SPEAKING_HASH)).toBe(ENGLISH_SPEAKING_HREF);
    expect(canonicalAcademyHref("/dev/academy-preview", "?activity=english")).toBe(english);
    expect(canonicalAcademyHref("/dev/academy-preview", "?activity=sql", ENGLISH_SPEAKING_HASH)).toBe("/estudante/trilhas/sql");
    expect(canonicalAcademyHref("/dev/academy-preview", "?view=home", ENGLISH_SPEAKING_HASH)).toBeNull();
    expect(academySection(english)).toBe("practice");
    expect(practiceMode(english)).toBe("english");
    expect(academySections).toHaveLength(5);
  });
  it("does not save unknown or contaminated spoken English fragments", () => {
    const english = "/estudante/jogos/ingles-em-cena";
    for (const hash of ["#unknown", "#Falar", "#%66alar", "#falar?token=secret", "#falar&redirect=https://evil.test", "#falar#other", "#fa\nlar", "#falar "]) {
      expect(canonicalAcademyHref(english, "", hash)).toBeNull();
      expect(canonicalAcademyHref("/dev/academy-preview", "?activity=english", hash)).toBeNull();
      expect(academyPreviewHref(english + hash)).toBe("/dev/academy-preview?activity=english");
    }
  });
  it("routes the work collection to its own preview and canonical continuation", () => {
    expect(academySection(WORK_SIMULATION_HREF)).toBe("practice");
    expect(practiceMode(WORK_SIMULATION_HREF)).toBe("games");
    expect(academyPreviewHref(WORK_SIMULATION_HREF)).toBe("/dev/work-simulation-preview?from=academy");
    expect(academyPreviewHref(WORK_SIMULATION_HREF + "?token=secret#unknown")).toBe("/dev/work-simulation-preview?from=academy");
    expect(canonicalAcademyHref("/dev/work-simulation-preview", "?from=academy&token=secret")).toBe(WORK_SIMULATION_HREF);
    expect(canonicalAcademyHref("/dev/work-simulation-preview")).toBeNull();
    expect(canonicalAcademyHref("/dev/work-simulation-preview", "?from=other")).toBeNull();
    expect(canonicalAcademyHref("/dev/monte-codigo-preview/simulador", "?from=academy")).toBeNull();
    expect(academySections).toHaveLength(5);
  });
  it("round-trips only the authored delivery phase in the simulator", () => {
    expect(academyPreviewHref(WORK_DELIVERY_HREF)).toBe("/dev/work-simulation-preview?from=academy#esteira");
    expect(academyPreviewHref(WORK_SIMULATION_HREF + "?token=secret" + WORK_DELIVERY_HASH)).toBe("/dev/work-simulation-preview?from=academy#esteira");
    expect(canonicalAcademyHref(WORK_SIMULATION_HREF, "", WORK_DELIVERY_HASH)).toBe(WORK_DELIVERY_HREF);
    expect(canonicalAcademyHref("/dev/work-simulation-preview", "?from=academy&token=secret", WORK_DELIVERY_HASH)).toBe(WORK_DELIVERY_HREF);
    expect(canonicalAcademyHref("/dev/work-simulation-preview", "", WORK_DELIVERY_HASH)).toBeNull();
    for (const hash of ["#unknown", "#Esteira", "#%65steira", "#esteira?token=secret", "#esteira&redirect=https://evil.test", "#esteira#other"]) {
      expect(canonicalAcademyHref(WORK_SIMULATION_HREF, "", hash)).toBeNull();
      expect(canonicalAcademyHref("/dev/work-simulation-preview", "?from=academy", hash)).toBeNull();
      expect(academyPreviewHref(WORK_SIMULATION_HREF + hash)).toBe("/dev/work-simulation-preview?from=academy");
    }
    expect(canonicalAcademyHref("/dev/monte-codigo-preview/simulador", "?from=academy", WORK_DELIVERY_HASH)).toBeNull();
    expect(canonicalAcademyHref("/dev/academy-preview", "?activity=delivery", WORK_DELIVERY_HASH)).toBe("/estudante/jogos/entregas-do-orbi");
  });
  it("round-trips the exact incident phase without changing delivery navigation", () => {
    expect(academyPreviewHref(WORK_INCIDENT_HREF)).toBe("/dev/work-simulation-preview?from=academy#incidente");
    expect(academyPreviewHref(WORK_SIMULATION_HREF + "?token=secret" + WORK_INCIDENT_HASH)).toBe("/dev/work-simulation-preview?from=academy#incidente");
    expect(canonicalAcademyHref(WORK_SIMULATION_HREF, "", WORK_INCIDENT_HASH)).toBe(WORK_INCIDENT_HREF);
    expect(canonicalAcademyHref("/dev/work-simulation-preview", "?from=academy&token=secret", WORK_INCIDENT_HASH)).toBe(WORK_INCIDENT_HREF);
    expect(canonicalAcademyHref("/dev/work-simulation-preview", "", WORK_INCIDENT_HASH)).toBeNull();
    for (const hash of ["#Incidente", "#%69ncidente", "#incidente?token=secret", "#incidente&redirect=https://evil.test", "#incidente#esteira", "#esteira#incidente"]) {
      expect(canonicalAcademyHref(WORK_SIMULATION_HREF, "", hash)).toBeNull();
      expect(canonicalAcademyHref("/dev/work-simulation-preview", "?from=academy", hash)).toBeNull();
      expect(academyPreviewHref(WORK_SIMULATION_HREF + hash)).toBe("/dev/work-simulation-preview?from=academy");
    }
    expect(canonicalAcademyHref("/dev/monte-codigo-preview/simulador", "?from=academy", WORK_INCIDENT_HASH)).toBeNull();
    expect(academyPreviewHref(WORK_DELIVERY_HREF)).toBe("/dev/work-simulation-preview?from=academy#esteira");
    expect(canonicalAcademyHref(WORK_SIMULATION_HREF, "", WORK_DELIVERY_HASH)).toBe(WORK_DELIVERY_HREF);
  });
});
