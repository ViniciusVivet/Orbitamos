import { describe, expect, it } from "vitest";
import { discordInviteUrl, discordUrl } from "./social";

describe("optional community invitation", () => {
  it("does not offer an unconfigured or placeholder Discord destination", () => {
    expect(discordUrl).toBeNull();
    for (const value of [null, undefined, "", " ", "https://discord.gg/SEU-GRUPO", "https://discord.com/invite/YOUR_INVITE"]) {
      expect(discordInviteUrl(value)).toBeNull();
    }
  });

  it("accepts only explicit HTTPS invitations on the official hosts", () => {
    expect(discordInviteUrl("https://discord.gg/actual-code")).toBe("https://discord.gg/actual-code");
    expect(discordInviteUrl(" https://discord.com/invite/abc123 ")).toBe("https://discord.com/invite/abc123");
    for (const value of ["http://discord.gg/abc", "https://discord.gg.evil.test/abc", "javascript:alert(1)", "https://discord.gg/", "https://discord.com/channels/123", "https://user:secret@discord.gg/abc", "https://discord.gg/abc?next=elsewhere", "https://discord.gg/abc#fragment"]) {
      expect(discordInviteUrl(value)).toBeNull();
    }
  });
});
