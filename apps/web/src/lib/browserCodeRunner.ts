export type BrowserCodeResult = {
  output: string;
  error: string | null;
  timedOut: boolean;
  cancelled?: boolean;
  truncated?: boolean;
  verificationOutput?: string;
  durationMs?: number;
  /** Linha do código do aluno onde o erro ocorreu (1-indexada), quando identificável */
  errorLine?: number | null;
};

export const MAX_CODE_LENGTH = 100_000;
export const MAX_OUTPUT_LENGTH = 100_000;
export const MAX_OUTPUT_LINES = 500;

function codeTooLargeResult(): BrowserCodeResult {
  return {
    output: "",
    error: "O código ultrapassou o limite de 100 KB. Divida a solução em uma versão menor.",
    timedOut: false,
  };
}

const JAVASCRIPT_WORKER_START = `
(async function () {
  const logs = [];
  const verificationLogs = [];
  let verifying = false;
  let outputLength = 0;
  let truncated = false;
  const sendResult = self.postMessage.bind(self);
  const stringify = function (value) {
    if (typeof value === "object" && value !== null) {
      try { return JSON.stringify(value); } catch { return String(value); }
    }
    return String(value);
  };
  const capture = function (args) {
    if (truncated) return;
    const line = Array.from(args).map(stringify).join(" ");
    const target = verifying ? verificationLogs : logs;
    if (target.length >= ${MAX_OUTPUT_LINES} || outputLength + line.length > ${MAX_OUTPUT_LENGTH}) {
      target.push("[Saída truncada: limite do console atingido]");
      truncated = true;
      return;
    }
    target.push(line);
    outputLength += line.length + 1;
  };
  const safeConsole = {
    log: function () { capture(arguments); },
    error: function () { capture(arguments); },
    warn: function () { capture(arguments); }
  };
  const beginVerification = function () { verifying = true; };

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
    sendResult({ output: logs.join("\\n"), verificationOutput: verificationLogs.join("\\n"), error: null, timedOut: false, truncated });
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
      rawLine: rawLine,
      truncated: truncated
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

export function runJavaScriptInWorker(code: string, timeoutMs = 2500, signal?: AbortSignal, verificationCode = ""): Promise<BrowserCodeResult> {
  if (code.length + verificationCode.length > MAX_CODE_LENGTH) return Promise.resolve(codeTooLargeResult());
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
      const verificationSource = verificationCode ? `\nbeginVerification();\n${verificationCode}\n` : "";
      const blob = new Blob([JAVASCRIPT_WORKER_START, code, verificationSource, JAVASCRIPT_WORKER_END], {
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
      signal?.removeEventListener("abort", abortRun);
      resolve({ ...result, durationMs: Math.round(performance.now() - startedAt) });
    };

    const abortRun = () => finish({
      output: "",
      error: "Execução interrompida pelo estudante.",
      timedOut: false,
      cancelled: true,
    });

    const timer = window.setTimeout(() => {
      finish({
        output: "",
        error: "A execução ultrapassou o limite de tempo. Verifique se existe um loop infinito.",
        timedOut: true,
      });
    }, timeoutMs);
    signal?.addEventListener("abort", abortRun, { once: true });
    if (signal?.aborted) abortRun();

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

/**
 * Executor educacional para o subconjunto de C# usado nas missões iniciais.
 * Mantém tudo gratuito e isolado no navegador sem carregar o runtime .NET.
 * Não pretende substituir Roslyn: rejeita recursos fora de variáveis, console,
 * condicionais, arrays e laços básicos com uma mensagem clara para o aluno.
 */
export function runCSharpInWorker(code: string, timeoutMs = 2500, signal?: AbortSignal, verificationCode = ""): Promise<BrowserCodeResult> {
  const unsupported = /\b(namespace|using|class|interface|record|struct|async|await|Task|LINQ|System\.IO|System\.Net)\b/;
  if (unsupported.test(code)) {
    return Promise.resolve({
      output: "",
      error: "Este laboratório C# inicial executa Console.WriteLine, variáveis, condições, arrays e laços. Recursos avançados serão liberados na trilha .NET.",
      timedOut: false,
    });
  }

  const transpile = (source: string) => source
    .replace(/\/\/.*$/gm, (comment) => comment)
    .replace(/\bConsole\.WriteLine\s*\(/g, "console.log(")
    .replace(/\bforeach\s*\(\s*var\s+(\w+)\s+in\s+([^\)]+)\)/g, "for (const $1 of $2)")
    .replace(/new\s+(?:int|string|double|decimal|bool)\s*\[\s*\]\s*{([^}]*)}/g, "[$1]")
    .replace(/\bint\s+(\w+)\s*=\s*([^;\n]+?)\s*\/\s*([^;\n]+);/g, "let $1 = Math.trunc($2 / $3);")
    .replace(/\b(?:int|string|double|decimal|bool|long|var)\s+(\w+)\s*=/g, "let $1 =")
    .replace(/\b(?:int|string|double|decimal|bool|long)\s+(\w+)\s*;/g, "let $1;")
    .replace(/\$"([^"\\]*(?:\\.[^"\\]*)*)"/g, (_, content: string) => `\`${content.replace(/{([^}]+)}/g, "\${$1}")}\``)
    .replace(/\bMathF?\./g, "Math.");

  return runJavaScriptInWorker(transpile(code), timeoutMs, signal, transpile(verificationCode));
}

type PythonWorkerMessage = BrowserCodeResult & { id: number; ready?: boolean };
type PythonPendingRun = { finish: (result: BrowserCodeResult) => void };

let pythonWorker: Worker | null = null;
let pythonRequestId = 0;
let pythonRuntimeReady = false;
let pythonWarmupPromise: Promise<boolean> | null = null;
const pythonPendingRuns = new Map<number, PythonPendingRun>();

function resetPythonWorker(fallback: BrowserCodeResult) {
  pythonWorker?.terminate();
  pythonWorker = null;
  pythonRuntimeReady = false;
  for (const pending of pythonPendingRuns.values()) pending.finish(fallback);
  pythonPendingRuns.clear();
}

function getPythonWorker(): Worker {
  if (pythonWorker) return pythonWorker;
  const worker = new Worker("/workers/python-runner.mjs", { type: "module", name: "orbitamos-python" });
  worker.onmessage = (event: MessageEvent<PythonWorkerMessage>) => {
    pythonRuntimeReady = true;
    const pending = pythonPendingRuns.get(event.data.id);
    if (!pending) return;
    pythonPendingRuns.delete(event.data.id);
    pending.finish(event.data.ready ? { output: "", error: null, timedOut: false } : event.data);
  };
  worker.onerror = () => resetPythonWorker({ output: "", error: "Não foi possível iniciar o Python. Verifique sua conexão e tente novamente.", timedOut: false });
  pythonWorker = worker;
  return worker;
}

/** Começa a baixar/inicializar o Python antes do primeiro clique em Executar. */
export function warmPythonRuntime(): Promise<boolean> {
  if (pythonRuntimeReady) return Promise.resolve(true);
  if (pythonWarmupPromise) return pythonWarmupPromise;
  if (typeof window === "undefined" || typeof Worker === "undefined") return Promise.resolve(false);
  pythonWarmupPromise = new Promise<boolean>((resolve) => {
    try {
      const worker = getPythonWorker();
      const id = ++pythonRequestId;
      pythonPendingRuns.set(id, {
        finish: (result) => resolve(!result.error),
      });
      worker.postMessage({ id, warmup: true });
    } catch {
      resolve(false);
    }
  }).finally(() => {
    if (!pythonRuntimeReady) pythonWarmupPromise = null;
  });
  return pythonWarmupPromise;
}

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

export function runPythonInWorker(code: string, timeoutMs = 20000, signal?: AbortSignal, verificationCode = ""): Promise<BrowserCodeResult> {
  if (code.length + verificationCode.length > MAX_CODE_LENGTH) return Promise.resolve(codeTooLargeResult());
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.resolve({
      output: "",
      error: "Seu navegador não oferece o ambiente necessário para executar Python.",
      timedOut: false,
    });
  }

  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = getPythonWorker();
    } catch {
      resolve({
        output: "",
        error: "O navegador bloqueou a inicialização do Python. Recarregue a página ou use um navegador atualizado.",
        timedOut: false,
      });
      return;
    }
    const startedAt = performance.now();
    let settled = false;
    const id = ++pythonRequestId;

    const finish = (result: BrowserCodeResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      pythonPendingRuns.delete(id);
      signal?.removeEventListener("abort", abortRun);
      resolve({ ...result, durationMs: Math.round(performance.now() - startedAt) });
    };

    const abortRun = () => resetPythonWorker({ output: "", error: "Execução interrompida pelo estudante.", timedOut: false, cancelled: true });

    const effectiveTimeoutMs = pythonRuntimeReady ? timeoutMs : Math.max(timeoutMs, 60000);
    const timer = window.setTimeout(() => {
      resetPythonWorker({
        output: "",
        error: "O ambiente Python demorou demais ou encontrou um loop infinito. Tente novamente.",
        timedOut: true,
      });
    }, effectiveTimeoutMs);
    signal?.addEventListener("abort", abortRun, { once: true });
    pythonPendingRuns.set(id, { finish: (result) => {
      const { message, line } = extractPythonError(result.error, code);
      finish({ ...result, error: message, errorLine: line });
    } });
    if (signal?.aborted) abortRun();
    else worker.postMessage({ id, code, verificationCode });
  });
}
