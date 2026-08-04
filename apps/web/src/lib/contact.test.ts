import { describe, expect, it } from "vitest";
import {
  CONTACT_FIELD_LIMITS,
  InMemoryRateLimiter,
  cleanContactField,
  getContactClientIp,
  isValidContactEmail,
} from "./contact";

describe("contact fields", () => {
  it("trims and limits text", () => {
    expect(cleanContactField("  Orbitamos  ", 20)).toBe("Orbitamos");
    expect(cleanContactField("abcdef", 3)).toBe("abc");
  });

  it("rejects non-string values", () => {
    expect(cleanContactField(null, 10)).toBe("");
    expect(cleanContactField(123, 10)).toBe("");
    expect(cleanContactField({ value: "x" }, 10)).toBe("");
  });

  it("keeps the field limits aligned with the public contract", () => {
    expect(CONTACT_FIELD_LIMITS).toEqual({
      name: 120,
      email: 180,
      service: 80,
      message: 3000,
    });
  });
});

describe("contact email validation", () => {
  it.each([
    "pessoa@example.com",
    "nome.sobrenome+site@empresa.com.br",
    "a@b.dev",
  ])("accepts %s", (email) => {
    expect(isValidContactEmail(email)).toBe(true);
  });

  it.each([
    "",
    "sem-arroba.com",
    "@example.com",
    "nome@",
    "nome @example.com",
    "nome@example",
  ])("rejects %s", (email) => {
    expect(isValidContactEmail(email)).toBe(false);
  });
});

describe("contact client IP", () => {
  it("uses the first forwarded IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      "x-real-ip": "198.51.100.20",
    });
    expect(getContactClientIp(headers)).toBe("203.0.113.10");
  });

  it("falls back to real IP and then unknown", () => {
    expect(getContactClientIp(new Headers({ "x-real-ip": "198.51.100.20" }))).toBe(
      "198.51.100.20"
    );
    expect(getContactClientIp(new Headers())).toBe("unknown");
  });
});

describe("in-memory rate limiter", () => {
  it("blocks requests after the configured limit", () => {
    const limiter = new InMemoryRateLimiter(2, 1_000);
    expect(limiter.isLimited("ip", 0)).toBe(false);
    expect(limiter.isLimited("ip", 10)).toBe(false);
    expect(limiter.isLimited("ip", 20)).toBe(true);
  });

  it("isolates clients", () => {
    const limiter = new InMemoryRateLimiter(1, 1_000);
    expect(limiter.isLimited("ip-a", 0)).toBe(false);
    expect(limiter.isLimited("ip-a", 1)).toBe(true);
    expect(limiter.isLimited("ip-b", 1)).toBe(false);
  });

  it("resets the window and can be cleared", () => {
    const limiter = new InMemoryRateLimiter(1, 100);
    expect(limiter.isLimited("ip", 0)).toBe(false);
    expect(limiter.isLimited("ip", 99)).toBe(true);
    expect(limiter.isLimited("ip", 100)).toBe(false);
    limiter.clear();
    expect(limiter.isLimited("ip", 101)).toBe(false);
  });
});
