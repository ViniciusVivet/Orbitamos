export type PortalArea = "student" | "work";

const INTERNAL_ORIGIN = "https://orbitamos.invalid";
const AUTH_PATH = /^\/(?:entrar|auth|api|logout|sair)(?:\/|$)/i;
const CREDENTIAL_PARAM = /^(?:password|senha|access_token|refresh_token|id_token|token|secret|client_secret|authorization)$/i;

/** A return target is navigation only, never an authentication token or an external URL. */
export function sanitizeReturnTo(value: string | null): string | null {
  if (!value || value.length > 4096 || value !== value.trim() || !value.startsWith("/") || value.startsWith("//")) return null;
  if (/[\\\u0000-\u0020\u007f]/.test(value)) return null;

  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN || url.username || url.password) return null;

    // Decode paths for validation only. Never decode a whole URL or re-interpret a query as a URL.
    let path = url.pathname;
    for (let pass = 0; pass < 4; pass += 1) {
      if (path.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(path) || AUTH_PATH.test(path)) return null;
      const decoded = decodeURIComponent(path);
      if (decoded === path) break;
      path = decoded;
      if (pass === 3) return null;
    }
    const normalizedPath = new URL(path, INTERNAL_ORIGIN);
    if (normalizedPath.origin !== INTERNAL_ORIGIN || AUTH_PATH.test(normalizedPath.pathname)) return null;
    for (const key of url.searchParams.keys()) if (CREDENTIAL_PARAM.test(key)) return null;
    for (const key of new URLSearchParams(url.hash.slice(1)).keys()) if (CREDENTIAL_PARAM.test(key)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function portalAreaFromPath(path: string): PortalArea | null {
  const pathname = path.split(/[?#]/, 1)[0];
  if (pathname === "/estudante" || pathname.startsWith("/estudante/") || pathname === "/orbitacademy" || pathname.startsWith("/orbitacademy/")) return "student";
  if (pathname === "/colaborador" || pathname.startsWith("/colaborador/")) return "work";
  return null;
}

export function portalAreaKey(userId: string | number): string {
  return `orbitamos-portal-area-v1-${encodeURIComponent(String(userId))}`;
}

export function readPortalArea(value: string | null): PortalArea | null {
  return value === "student" || value === "work" ? value : null;
}

export function defaultPortalDestination(role: string | undefined, area?: PortalArea | null): string {
  return area === "work" || (!area && role === "FREELANCER") ? "/colaborador" : "/estudante";
}

export function rememberedPortalArea(userId: string | number): PortalArea | null {
  try {
    return typeof window === "undefined" ? null : readPortalArea(window.localStorage.getItem(portalAreaKey(userId)));
  } catch {
    return null;
  }
}

export function rememberPortalArea(userId: string | number, area: PortalArea): void {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(portalAreaKey(userId), area);
  } catch {
    // Remembering a UI context must never prevent login or navigation.
  }
}

export function loginPathFor(returnTo: string | null): string {
  const safe = sanitizeReturnTo(returnTo);
  return safe ? `/entrar?${new URLSearchParams({ redirect: safe })}` : "/entrar";
}

export function loginDestination(returnTo: string | null, role: string | undefined, area?: PortalArea | null): string {
  return sanitizeReturnTo(returnTo) ?? defaultPortalDestination(role, area);
}
