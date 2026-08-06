import { afterEach, describe, expect, it, vi } from "vitest";

import { MAX_CODE_LENGTH, runJavaScriptInWorker, runPythonInWorker } from "./browserCodeRunner";

describe("browser code runner server fallbacks", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("does not attempt to execute JavaScript outside a browser", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("Worker", undefined);
    await expect(runJavaScriptInWorker("console.log('oi')")).resolves.toEqual({
      output: "",
      error: "Seu navegador não oferece o ambiente necessário para executar este desafio.",
      timedOut: false,
    });
  });

  it("does not attempt to load Python outside a browser", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("Worker", undefined);
    await expect(runPythonInWorker("print('oi')")).resolves.toEqual({
      output: "",
      error: "Seu navegador não oferece o ambiente necessário para executar Python.",
      timedOut: false,
    });
  });

  it.each([
    ["JavaScript", runJavaScriptInWorker],
    ["Python", runPythonInWorker],
  ])("rejects oversized %s before creating a worker", async (_language, run) => {
    vi.stubGlobal("window", {});
    const worker = vi.fn();
    vi.stubGlobal("Worker", worker);
    const result = await run("x".repeat(MAX_CODE_LENGTH + 1));
    expect(result.error).toContain("100 KB");
    expect(result.timedOut).toBe(false);
    expect(worker).not.toHaveBeenCalled();
  });
});
