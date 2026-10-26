export type AcademySection = "home" | "tracks" | "practice" | "progress" | "community" | "account";

const hasPrefix = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

/** Presentation only. Authentication remains enforced by the proxy and layouts. */
export function isWorkspacePath(path: string) {
  return ["/estudante", "/colaborador", "/mensagens", "/dashboard", "/orbitacademy", "/admin", "/dev"].some(prefix => hasPrefix(path, prefix));
}

export function academySection(path: string): AcademySection {
  if (hasPrefix(path, "/estudante/conta")) return "account";
  if (hasPrefix(path, "/estudante/progresso")) return "progress";
  if (["/estudante/aulas", "/estudante/cursos", "/estudante/trilhas", "/estudante/orbita"].some(prefix => hasPrefix(path, prefix))) return "tracks";
  if (["/estudante/pratica", "/estudante/jogos"].some(prefix => hasPrefix(path, prefix))) return "practice";
  if (["/estudante/comunidade", "/estudante/mentorias", "/mensagens"].some(prefix => hasPrefix(path, prefix))) return "community";
  return "home";
}

export const academySections: { id: AcademySection; label: string; href: string }[] = [
  { id: "home", label: "Início", href: "/estudante" },
  { id: "tracks", label: "Trilhas", href: "/estudante/trilhas" },
  { id: "practice", label: "Praticar", href: "/estudante/pratica" },
  { id: "progress", label: "Progresso", href: "/estudante/progresso" },
  { id: "community", label: "Comunidade", href: "/estudante/comunidade" },
];

export function academyPreviewHref(href: string) {
  const url = new URL(href, "https://orbitamos.invalid");
  if (url.origin !== "https://orbitamos.invalid") return href;
  const path = url.pathname;
  if (path === "/estudante") return "/dev/academy-preview?view=home";
  if (path === "/estudante/trilhas") return "/dev/academy-preview?view=tracks";
  if (path === "/estudante/progresso") return "/dev/academy-preview?view=progress";
  if (path === "/estudante/comunidade") return "/dev/academy-preview?view=community";
  if (path === "/estudante/pratica") {
    const language = url.searchParams.get("linguagem");
    return `/dev/lab-preview?academy=1${language && ["javascript", "python", "csharp", "todas"].includes(language) ? `&linguagem=${language}` : ""}${url.hash}`;
  }
  if (path === "/estudante/jogos") return "/dev/academy-preview";
  if (path === "/estudante/trilhas/csharp") {
    const moduleKind = url.searchParams.get("module");
    return `/dev/csharp-preview?academy=1${moduleKind && ["variables", "conditions", "loops"].includes(moduleKind) ? `&module=${moduleKind}` : ""}`;
  }
  if (path === "/estudante/trilhas/sql") return `/dev/academy-preview?activity=sql${url.searchParams.get("mode") === "workshop" ? "&mode=workshop" : ""}`;
  const activities: Record<string, string> = { "entregas-do-orbi": "delivery", "ingles-em-cena": "english", revisao: "review", "vila-dos-blocos": "village" };
  const game = path.replace("/estudante/jogos/", "");
  if (activities[game]) return `/dev/academy-preview?activity=${activities[game]}`;
  const routePairs = [["/estudante/pratica/", "/dev/ide-preview/"], ["/estudante/jogos/orbi/", "/dev/orbi-preview/"], ["/estudante/jogos/", "/dev/monte-codigo-preview/"]] as const;
  for (const [from, to] of routePairs) {
    if (!path.startsWith(from)) continue;
    if (from === "/estudante/pratica/") url.searchParams.set("academy", "1");
    else url.searchParams.set("from", "academy");
    return `${to}${path.slice(from.length)}?${url.searchParams.toString()}${url.hash}`;
  }
  return href;
}

/** Converts a dev-only view into its real route for the shared local resume index. */
export function canonicalAcademyHref(path: string, search = ""): string | null {
  const params = new URLSearchParams(search);
  if (path.startsWith("/estudante/")) return path + search;
  if (path === "/dev/csharp-preview" && params.get("academy") === "1") {
    const moduleKind = params.get("module");
    return `/estudante/trilhas/csharp${moduleKind && ["variables", "conditions", "loops"].includes(moduleKind) ? `?module=${moduleKind}` : ""}`;
  }
  if (path === "/dev/academy-preview") {
    const activity = params.get("activity");
    const routes: Record<string, string> = { delivery: "/estudante/jogos/entregas-do-orbi", english: "/estudante/jogos/ingles-em-cena", village: "/estudante/jogos/vila-dos-blocos", review: "/estudante/jogos/revisao", sql: "/estudante/trilhas/sql" };
    return activity && routes[activity] ? routes[activity] + (activity === "sql" && params.get("mode") === "workshop" ? "?mode=workshop" : "") : null;
  }
  if (path.startsWith("/dev/ide-preview/") && params.get("academy") === "1") return path.replace("/dev/ide-preview/", "/estudante/pratica/");
  if (params.get("from") === "academy") {
    if (path.startsWith("/dev/orbi-preview/")) return path.replace("/dev/orbi-preview/", "/estudante/jogos/orbi/");
    if (path.startsWith("/dev/monte-codigo-preview/")) return path.replace("/dev/monte-codigo-preview/", "/estudante/jogos/");
  }
  return null;
}

export function practiceMode(path: string) {
  if (path.includes("ingles-em-cena")) return "english";
  if (path.endsWith("/revisao")) return "review";
  return hasPrefix(path, "/estudante/jogos") ? "games" : "code";
}
