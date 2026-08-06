import { afterEach, describe, expect, it, vi } from "vitest";

import { getChatWsUrl } from "./chatWs";

describe("chat websocket URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns an empty URL during server rendering", () => {
    vi.stubGlobal("window", undefined);
    expect(getChatWsUrl()).toBe("");
  });

  it("uses the local API fallback in the browser", () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    expect(getChatWsUrl()).toBe("ws://localhost:8080/ws");
  });

  it.each([
    ["https://api.orbitamosbr.com/api", "wss://api.orbitamosbr.com/ws"],
    ["https://api.orbitamosbr.com/api/", "wss://api.orbitamosbr.com/ws"],
    ["http://localhost:9090/api", "ws://localhost:9090/ws"],
  ])("maps %s to %s", (apiUrl, expected) => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_API_URL", apiUrl);
    expect(getChatWsUrl()).toBe(expected);
  });
});
