export const CONTACT_FIELD_LIMITS = {
  name: 120,
  email: 180,
  service: 80,
  message: 3000,
} as const;

export const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const CONTACT_RATE_LIMIT_MAX = 5;

export function cleanContactField(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function isValidContactEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getContactClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

type RateLimitEntry = { count: number; resetAt: number };

export class InMemoryRateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();

  constructor(
    private readonly max = CONTACT_RATE_LIMIT_MAX,
    private readonly windowMs = CONTACT_RATE_LIMIT_WINDOW_MS
  ) {}

  isLimited(key: string, now = Date.now()): boolean {
    const current = this.entries.get(key);

    if (!current || current.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + this.windowMs });
      return false;
    }

    if (current.count >= this.max) return true;
    current.count += 1;
    return false;
  }

  clear(): void {
    this.entries.clear();
  }
}
