import { afterEach, describe, expect, it, vi } from "vitest";

import { runJavaScriptInWorker, runPythonInWorker } from "./browserCodeRunner";

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
});
