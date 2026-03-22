import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Threshold para considerar usuário online: 5 minutos */
export const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

/** Retorna true se o ISO timestamp está dentro do threshold de "online" */
export function isOnline(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < ONLINE_THRESHOLD_MS;
}

/**
 * Formata ISO timestamp como tempo relativo ("Agora", "5 min atrás", "2h atrás", etc.).
 * Usado em fórum e widgets.
 */
export function formatRelativeDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays} dia${diffDays !== 1 ? "s" : ""} atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Formata ISO timestamp para exibição em chat: hora (hoje) ou data (outros dias). */
export function formatChatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

/**
 * Converte erros técnicos de API/rede em mensagem amigável para o usuário.
 * Para devs: sempre use console.error(err) antes de exibir a mensagem.
 */
export function getFriendlyApiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  const lower = raw.toLowerCase()
  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("network request failed") || lower.includes("load failed")) {
    return "Não foi possível conectar. Tente novamente em instantes."
  }
  if (lower.includes("cors") || lower.includes("cross-origin")) {
    return "Conexão indisponível no momento. Tente mais tarde."
  }
  if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("aborted")) {
    return "A requisição demorou demais. Tente novamente."
  }
  if (lower.includes("iniciando") || lower.includes("servidor demorou")) {
    return "Servidor está iniciando. Aguarde alguns segundos e tente novamente."
  }
  if (lower.includes("email já") || lower.includes("already")) {
    return "Este e-mail já está cadastrado. Tente fazer login."
  }
  // Não expõe mensagem técnica bruta ao usuário
  return "Algo deu errado. Tente novamente."
}
