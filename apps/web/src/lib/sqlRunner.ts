import type { SqlSnapshot } from "./sqlJourney";

export function runSql(history: string[], code: string, signal?: AbortSignal): Promise<SqlSnapshot> {
  return new Promise(resolve => {
    let worker: Worker;
    let timer: ReturnType<typeof setTimeout>;
    let settled = false;
    const failure = (error: string): SqlSnapshot => ({ table: null, schema: [], strict: false, query: null, error });
    const finish = (result: SqlSnapshot) => { if (settled) return; settled = true; clearTimeout(timer); worker?.terminate(); signal?.removeEventListener("abort", abort); resolve(result); };
    const abort = () => finish(failure("Execução interrompida. Seu código foi preservado."));
    if (signal?.aborted) { abort(); return; }
    try { worker = new Worker("/workers/sql-studio.js"); } catch { finish(failure("Não foi possível abrir o banco neste navegador.")); return; }
    timer = setTimeout(() => finish(failure("O banco demorou para carregar. Confira a conexão e tente novamente.")), 30000);
    signal?.addEventListener("abort", abort, { once: true });
    worker.onmessage = ({ data }) => {
      if (data.type === "ready") { clearTimeout(timer); timer = setTimeout(() => finish(failure("Limite de execução atingido. Simplifique a consulta e tente novamente.")), 4000); }
      if (data.type === "result") finish(data.snapshot);
    };
    worker.onerror = () => finish(failure("O ambiente SQL não carregou. Recarregue a página e tente novamente."));
    worker.postMessage({ history, code });
  });
}
