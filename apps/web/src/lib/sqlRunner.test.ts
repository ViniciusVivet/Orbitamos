import { afterEach, expect, it, vi } from "vitest";
import { runSql } from "./sqlRunner";

class TestWorker {
  static last: TestWorker;
  onmessage?: (event: { data: unknown }) => void;
  onerror?: () => void;
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() { TestWorker.last = this; }
}
function setup() { vi.useFakeTimers(); vi.stubGlobal("Worker", TestWorker); }
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it("terminates on abort without waiting for SQL", async () => {
  setup(); const controller = new AbortController();
  const result = runSql([], "SELECT 1", controller.signal);
  controller.abort();
  expect((await result).error).toContain("interrompida");
  expect(TestWorker.last.terminate).toHaveBeenCalledOnce();
});
it("bounds runtime loading", async () => {
  setup(); const result = runSql([], "SELECT 1");
  await vi.advanceTimersByTimeAsync(30000);
  expect((await result).error).toContain("carregar");
  expect(TestWorker.last.terminate).toHaveBeenCalledOnce();
});
it("bounds SQL execution separately from loading", async () => {
  setup(); const result = runSql([], "SELECT 1");
  TestWorker.last.onmessage?.({ data: { type: "ready" } });
  await vi.advanceTimersByTimeAsync(4000);
  expect((await result).error).toContain("Limite de execução");
  expect(TestWorker.last.terminate).toHaveBeenCalledOnce();
});
it("returns actual snapshots and releases worker", async () => {
  setup(); const snapshot = { table: null, schema: [], strict: false, query: null };
  const result = runSql([], "SELECT 1");
  TestWorker.last.onmessage?.({ data: { type: "result", snapshot } });
  expect(await result).toEqual(snapshot);
  expect(TestWorker.last.terminate).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
});
