import { describe, expect, it } from "vitest";

import { whatsappFloatByPage } from "./social";

describe("floating WhatsApp links", () => {
  it.each(Object.entries(whatsappFloatByPage))(
    "keeps the %s link on HTTPS with the expected business number",
    (_page, url) => {
      const parsed = new URL(url);
      expect(parsed.protocol).toBe("https:");
      expect(parsed.hostname).toBe("wa.me");
      expect(parsed.pathname).toBe("/5511949138973");
      expect(parsed.searchParams.get("text")).toContain("Orbitamos");
    }
  );

  it("uses a different contextual message for each page", () => {
    const messages = Object.values(whatsappFloatByPage).map(
      (url) => new URL(url).searchParams.get("text")
    );
    expect(new Set(messages).size).toBe(messages.length);
  });
});
