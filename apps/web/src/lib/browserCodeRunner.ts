export type BrowserCodeResult = {
  output: string;
  error: string | null;
  timedOut: boolean;
  durationMs?: number;
};

const WORKER_SOURCE = `
self.onmessage = async function (event) {
  const logs = [];
  const stringify = function (value) {
    if (typeof value === "object" && value !== null) {
      try { return JSON.stringify(value); } catch { return String(value); }
    }
    return String(value);
  };
  const safeConsole = {
    log: function () { logs.push(Array.from(arguments).map(stringify).join(" ")); },
    error: function () { logs.push(Array.from(arguments).map(stringify).join(" ")); },
    warn: function () { logs.push(Array.from(arguments).map(stringify).join(" ")); }
  };

  try {
    self.fetch = undefined;
    self.XMLHttpRequest = undefined;
    self.WebSocket = undefined;
    self.EventSource = undefined;
    self.importScripts = undefined;

    const execute = new Function(
      "console",
      "fetch",
      "XMLHttpRequest",
      "WebSocket",
      "EventSource",
      "importScripts",
      '"use strict";\\nreturn (async function () {\\n' + event.data.code + '\\n})();'
    );
    await execute(safeConsole, undefined, undefined, undefined, undefined, undefined);
    self.postMessage({ output: logs.join("\\n"), error: null, timedOut: false });
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    self.postMessage({
      output: logs.join("\\n"),
      error: message,
      timedOut: false
    });
  }
};
`;

export function runJavaScriptInWorker(code: string, timeoutMs = 2500): Promise<BrowserCodeResult> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.resolve({
      output: "",
      error: "Seu navegador não oferece o ambiente necessário para executar este desafio.",
      timedOut: false,
    });
  }

  return new Promise((resolve) => {
    const blob = new Blob([WORKER_SOURCE], { type: "text/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    let settled = false;
    const startedAt = performance.now();

    const finish = (result: BrowserCodeResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({ ...result, durationMs: Math.round(performance.now() - startedAt) });
    };

    const timer = window.setTimeout(() => {
      finish({
        output: "",
        error: "A execução ultrapassou o limite de tempo. Verifique se existe um loop infinito.",
        timedOut: true,
      });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<BrowserCodeResult>) => finish(event.data);
    worker.onerror = () =>
      finish({
        output: "",
        error: "Não foi possível executar este código com segurança.",
        timedOut: false,
      });
    worker.postMessage({ code });
  });
}

const PYODIDE_VERSION = "0.27.7";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const PYTHON_WORKER_SOURCE = `
import { loadPyodide } from "${PYODIDE_BASE_URL}pyodide.mjs";

const pyodideReady = loadPyodide({ indexURL: "${PYODIDE_BASE_URL}" });

self.onmessage = async function (event) {
  const logs = [];
  try {
    const pyodide = await pyodideReady;
    pyodide.setStdout({ batched: (message) => logs.push(String(message)) });
    pyodide.setStderr({ batched: (message) => logs.push(String(message)) });
    await pyodide.runPythonAsync(event.data.code);
    self.postMessage({ output: logs.join("\\n"), error: null, timedOut: false });
  } catch (error) {
    self.postMessage({
      output: logs.join("\\n"),
      error: error && error.message ? error.message : String(error),
      timedOut: false
    });
  }
};
`;

export function runPythonInWorker(code: string, timeoutMs = 20000): Promise<BrowserCodeResult> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.resolve({
      output: "",
      error: "Seu navegador não oferece o ambiente necessário para executar Python.",
      timedOut: false,
    });
  }

  return new Promise((resolve) => {
    const blob = new Blob([PYTHON_WORKER_SOURCE], { type: "text/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl, { type: "module" });
    const startedAt = performance.now();
    let settled = false;

    const finish = (result: BrowserCodeResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({ ...result, durationMs: Math.round(performance.now() - startedAt) });
    };

    const timer = window.setTimeout(() => {
      finish({
        output: "",
        error: "O ambiente Python demorou demais ou encontrou um loop infinito. Tente novamente.",
        timedOut: true,
      });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<BrowserCodeResult>) => finish(event.data);
    worker.onerror = () =>
      finish({
        output: "",
        error: "Não foi possível iniciar o Python. Verifique sua conexão e tente novamente.",
        timedOut: false,
      });
    worker.postMessage({ code });
  });
}
