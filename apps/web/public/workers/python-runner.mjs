import { loadPyodide } from "/vendor/pyodide/pyodide.mjs";

const MAX_OUTPUT_LENGTH = 100000;
const MAX_OUTPUT_LINES = 500;
const pyodideReady = loadPyodide({ indexURL: "/vendor/pyodide/" });

self.onmessage = async (event) => {
  const { id, code, verificationCode = "", warmup = false } = event.data;
  const logs = [];
  const verificationLogs = [];
  let target = logs;
  let outputLength = 0;
  let truncated = false;

  const capture = (message) => {
    if (truncated) return;
    const line = String(message);
    if (target.length >= MAX_OUTPUT_LINES || outputLength + line.length > MAX_OUTPUT_LENGTH) {
      target.push("[Saída truncada: limite do console atingido]");
      truncated = true;
      return;
    }
    target.push(line);
    outputLength += line.length + 1;
  };

  try {
    const pyodide = await pyodideReady;
    if (warmup) {
      self.postMessage({ id, ready: true });
      return;
    }

    // Os desafios não precisam de rede. Removê-la reduz a superfície disponível ao código do aluno.
    self.fetch = undefined;
    self.XMLHttpRequest = undefined;
    self.WebSocket = undefined;
    self.EventSource = undefined;

    // O runtime é reaproveitado, mas cada execução recebe um namespace limpo.
    const globals = pyodide.globals.get("dict")();
    try {
      pyodide.setStdout({ batched: capture });
      pyodide.setStderr({ batched: capture });
      await pyodide.runPythonAsync(code, { globals });
      const visibleOutput = logs.join("\n");
      if (verificationCode) {
        target = verificationLogs;
        await pyodide.runPythonAsync(verificationCode, { globals });
      }
      self.postMessage({ id, output: visibleOutput, verificationOutput: verificationLogs.join("\n"), error: null, timedOut: false, truncated });
    } finally {
      globals.destroy();
    }
  } catch (error) {
    self.postMessage({ id, output: logs.join("\n"), error: error?.message || String(error), timedOut: false, truncated });
  }
};
