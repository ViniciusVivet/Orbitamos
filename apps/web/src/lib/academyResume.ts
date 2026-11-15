import { desafios } from "./desafios";
import { fasesMonteCodigo } from "./jogoMonteCodigo";
import { niveisGuiaOrbi } from "./jogoGuiaOrbi";
import { ENGLISH_SPEAKING_HASH, ORBI_DELIVERY_HREF, ORBI_PULSE_HASH, WORK_DELIVERY_HASH, WORK_INCIDENT_HASH, WORK_SIMULATION_HREF } from "./portalNavigation";

export type AcademyResumeEntry = { href: string; updatedAt: number };
export const resumeStorageKey = (userId: string | number) => `orbitamos-academy-resume-v1-${userId}`;

/** Only authored learning routes. Discard arbitrary query strings and never store external URLs. */
export function academyResumeEntry(href: string, now = Date.now()): AcademyResumeEntry | null {
  if (!href.startsWith("/") || href.startsWith("//") || !Number.isSafeInteger(now) || now <= 0 || now > Date.now() + 300000) return null;
  try {
    const url = new URL(href, "https://academy.invalid");
    const fragment = href.includes("#") ? href.slice(href.indexOf("#")) : "";
    if (url.pathname === "/estudante/jogos/ingles-em-cena" && fragment && fragment !== ENGLISH_SPEAKING_HASH) return null;
    const pulse = url.pathname === ORBI_DELIVERY_HREF && url.hash === ORBI_PULSE_HASH;
    const workPhaseHash = url.pathname === WORK_SIMULATION_HREF && [WORK_DELIVERY_HASH, WORK_INCIDENT_HASH].includes(url.hash) ? url.hash : "";
    const speaking = url.pathname === "/estudante/jogos/ingles-em-cena" && url.hash === ENGLISH_SPEAKING_HASH && fragment === ENGLISH_SPEAKING_HASH;
    if (url.origin !== "https://academy.invalid" || (url.hash && !pulse && !workPhaseHash && !speaking)) return null;
    const path = url.pathname;
    const code = desafios.some(challenge => path === `/estudante/pratica/${challenge.slug}`);
    const assembly = fasesMonteCodigo.some(phase => path === `/estudante/jogos/${phase.slug}`);
    const orbi = niveisGuiaOrbi.some(level => path === `/estudante/jogos/orbi/${level.slug}`);
    const standalone = ["/estudante/jogos/entregas-do-orbi", "/estudante/jogos/ingles-em-cena", "/estudante/jogos/vila-dos-blocos", WORK_SIMULATION_HREF, "/estudante/trilhas/csharp", "/estudante/trilhas/sql"].includes(path);
    if (!code && !assembly && !orbi && !standalone) return null;
    const moduleId = url.searchParams.get("module");
    const query = path === "/estudante/trilhas/sql" && url.searchParams.get("mode") === "workshop" ? "?mode=workshop" : path === "/estudante/trilhas/csharp" && url.searchParams.get("view") === "methods" ? "?view=methods" : path === "/estudante/trilhas/csharp" && moduleId && ["variables", "conditions", "loops"].includes(moduleId) ? `?module=${moduleId}` : "";
    return { href: path + query + (pulse ? ORBI_PULSE_HASH : workPhaseHash || (speaking ? ENGLISH_SPEAKING_HASH : "")), updatedAt: now };
  } catch { return null; }
}
export function readAcademyResume(raw: string | null): AcademyResumeEntry | null {
  let value: Record<string, unknown> | null = null;
  try { const parsed: unknown = JSON.parse(raw ?? "null"); if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) value = parsed as Record<string, unknown>; } catch { return null; }
  return typeof value?.href === "string" && typeof value.updatedAt === "number" ? academyResumeEntry(value.href, value.updatedAt) : null;
}
