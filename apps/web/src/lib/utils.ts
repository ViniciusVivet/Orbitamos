import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  return raw || "Algo deu errado. Tente novamente."
}
