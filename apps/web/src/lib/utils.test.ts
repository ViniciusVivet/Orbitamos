import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ONLINE_THRESHOLD_MS,
  cn,
  formatChatTime,
  formatRelativeDate,
  getFriendlyApiErrorMessage,
  isOnline,
} from "./utils";

describe("UI utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-06T15:00:00.000Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("merges conditional and conflicting Tailwind classes", () => {
    expect(cn("px-2", false && "hidden", "px-4", { block: true })).toBe("px-4 block");
  });

  it("uses a strict five-minute online threshold", () => {
    expect(isOnline(null)).toBe(false);
    expect(isOnline(new Date(Date.now() - ONLINE_THRESHOLD_MS + 1).toISOString())).toBe(true);
    expect(isOnline(new Date(Date.now() - ONLINE_THRESHOLD_MS).toISOString())).toBe(false);
  });

  it.each([
    [30_000, "Agora"],
    [5 * 60_000, "5 min atrás"],
    [2 * 3_600_000, "2h atrás"],
    [24 * 3_600_000, "1 dia atrás"],
    [2 * 24 * 3_600_000, "2 dias atrás"],
  ])("formats a timestamp %i ms ago", (elapsed, expected) => {
    expect(formatRelativeDate(new Date(Date.now() - elapsed).toISOString())).toBe(expected);
  });

  it("preserves invalid relative dates", () => {
    expect(formatRelativeDate("not-a-date")).toBe("not-a-date");
  });

  it("formats chat timestamps differently for today and previous days", () => {
    expect(formatChatTime("2026-08-06T14:05:00.000Z")).toMatch(/11:05|14:05/);
    expect(formatChatTime("2026-08-05T14:05:00.000Z")).toMatch(/05\/08/);
  });
});

describe("friendly API errors", () => {
  it.each([
    [new Error("Failed to fetch"), "Não foi possível conectar. Tente novamente em instantes."],
    [new Error("CORS blocked"), "Conexão indisponível no momento. Tente mais tarde."],
    [new Error("request timed out"), "A requisição demorou demais. Tente novamente."],
    [new Error("Servidor iniciando"), "Servidor está iniciando. Aguarde alguns segundos e tente novamente."],
    [new Error("email já cadastrado"), "Este e-mail já está cadastrado. Tente fazer login."],
    [new Error("database password exposed"), "Algo deu errado. Tente novamente."],
  ])("maps technical failures without leaking details", (error, expected) => {
    expect(getFriendlyApiErrorMessage(error)).toBe(expected);
  });
});
