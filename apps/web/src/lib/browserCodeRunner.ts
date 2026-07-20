export type BrowserCodeResult = {
  output: string;
  error: string | null;
  timedOut: boolean;
  durationMs?: number;
  /** Linha do código do aluno onde o erro ocorreu (1-indexada), quando identificável */
  errorLine?: number | null;
};

const JAVASCRIPT_WORKER_START = `
(async function () {
  const logs = [];
  const sendResult = self.postMessage.bind(self);
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

    const console = safeConsole;
    await (async function () {
`;

const JAVASCRIPT_WORKER_END = `
    })();
    sendResult({ output: logs.join("\\n"), error: null, timedOut: false });
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    let rawLine = null;
    if (error && error.stack) {
      const stackMatch = String(error.stack).match(/:(\\d+):\\d+/);
      if (stackMatch) rawLine = parseInt(stackMatch[1], 10);
    }
    sendResult({
      output: logs.join("\\n"),
      error: message,
      timedOut: false,
      rawLine: rawLine
    });
  }
})();
`;

/** Linhas do prelúdio do worker antes do código do aluno, para mapear linha de erro. */
const JS_PRELUDE_LINES = JAVASCRIPT_WORKER_START.split("\n").length - 1;

function mapJsErrorLine(rawLine: number | null | undefined, code: string): number | null {
  if (!rawLine || !Number.isFinite(rawLine)) return null;
  const userLine = rawLine - JS_PRELUDE_LINES;
  const totalLines = code.split("\n").length;
  if (userLine < 1 || userLine > totalLines) return null;
  return userLine;
}

export function runJavaScriptInWorker(code: string, timeoutMs = 2500): Promise<BrowserCodeResult> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.resolve({
      output: "",
      error: "Seu navegador não oferece o ambiente necessário para executar este desafio.",
      timedOut: false,
    });
  }

  return new Promise((resolve) => {
    let workerUrl = "";
    let worker: Worker;
    try {
      const blob = new Blob([JAVASCRIPT_WORKER_START, code, JAVASCRIPT_WORKER_END], {
        type: "text/javascript",
      });
      workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);
    } catch {
      if (workerUrl) URL.revokeObjectURL(workerUrl);
      resolve({
        output: "",
        error: "O navegador bloqueou a inicialização do ambiente JavaScript. Recarregue a página ou use outro navegador.",
        timedOut: false,
      });
      return;
    }
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

    worker.onmessage = (event: MessageEvent<BrowserCodeResult & { rawLine?: number | null }>) => {
      const { rawLine, ...result } = event.data;
      finish({ ...result, errorLine: mapJsErrorLine(rawLine, code) });
    };
    worker.onerror = (event: ErrorEvent) => {
      event.preventDefault?.();
      const message = event.message
        ? event.message.replace(/^Uncaught\s+/i, "")
        : "Não foi possível executar este código com segurança.";
      finish({
        output: "",
        error: message,
        timedOut: false,
        errorLine: mapJsErrorLine(event.lineno, code),
      });
    };
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
    self.fetch = undefined;
    self.XMLHttpRequest = undefined;
    self.WebSocket = undefined;
    self.EventSource = undefined;
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

/**
 * Tracebacks do Pyodide são longos; extrai a última linha (ex.: "NameError: ...")
 * e a linha do código do aluno apontada em `File "<exec>", line N`.
 */
function extractPythonError(error: string | null, code: string): { message: string | null; line: number | null } {
  if (!error) return { message: null, line: null };
  const lineMatches = Array.from(error.matchAll(/File "<exec>", line (\d+)/g));
  let line: number | null = lineMatches.length
    ? parseInt(lineMatches[lineMatches.length - 1][1], 10)
    : null;
  if (line !== null && (line < 1 || line > code.split("\n").length)) line = null;
  const lines = error.trim().split("\n");
  const message = lines[lines.length - 1]?.trim() || error;
  return { message, line };
}

export function runPythonInWorker(code: string, timeoutMs = 20000): Promise<BrowserCodeResult> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.resolve({
      output: "",
      error: "Seu navegador não oferece o ambiente necessário para executar Python.",
      timedOut: false,
    });
  }

  return new Promise((resolve) => {
    let workerUrl = "";
    let worker: Worker;
    try {
      const blob = new Blob([PYTHON_WORKER_SOURCE], { type: "text/javascript" });
      workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl, { type: "module" });
    } catch {
      if (workerUrl) URL.revokeObjectURL(workerUrl);
      resolve({
        output: "",
        error: "O navegador bloqueou a inicialização do Python. Recarregue a página ou use um navegador atualizado.",
        timedOut: false,
      });
      return;
    }
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

    worker.onmessage = (event: MessageEvent<BrowserCodeResult>) => {
      const { message, line } = extractPythonError(event.data.error, code);
      finish({ ...event.data, error: message, errorLine: line });
    };
    worker.onerror = () =>
      finish({
        output: "",
        error: "Não foi possível iniciar o Python. Verifique sua conexão e tente novamente.",
        timedOut: false,
      });
    worker.postMessage({ code });
  });
}
