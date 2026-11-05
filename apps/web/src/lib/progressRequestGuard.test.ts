import { describe, expect, it } from "vitest";
import { createProgressRequestGuard } from "./progressRequestGuard";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((finish) => { resolve = finish; });
  return { promise, resolve };
}

describe("respostas de progresso vinculadas a conta", () => {
  it("descarta resposta A que chega depois da resposta B", async () => {
    const guard = createProgressRequestGuard();
    const published: number[] = [];
    const first = deferred<{ userId: string; xp: number }>();
    const second = deferred<{ userId: string; xp: number }>();
    guard.observe("a", "token-a");
    const a = guard.begin("a", "token-a")!;
    const pendingA = first.promise.then((result) => { if (guard.current(a, result.userId)) published.push(result.xp); });
    guard.observe("b", "token-b");
    const b = guard.begin("b", "token-b")!;
    const pendingB = second.promise.then((result) => { if (guard.current(b, result.userId)) published.push(result.xp); });
    second.resolve({ userId: "b", xp: 20 });
    await pendingB;
    first.resolve({ userId: "a", xp: 90 });
    await pendingA;
    expect(published).toEqual([20]);
  });

  it("logout invalida sucesso, erro e finally da leitura anterior", () => {
    const guard = createProgressRequestGuard();
    guard.observe("a", "token-a");
    const ticket = guard.begin("a", "token-a")!;
    guard.observe(null, null);
    expect(guard.current(ticket)).toBe(false);
    expect(guard.begin("a", "token-a")).toBeNull();
  });

  it("exige que o dono da resposta corresponda a conta solicitada", () => {
    const guard = createProgressRequestGuard();
    guard.observe("a", "token-a");
    const ticket = guard.begin("a", "token-a")!;
    expect(guard.current(ticket, "b")).toBe(false);
    expect(guard.current(ticket, "a")).toBe(true);
  });

  it("a ultima leitura prevalece entre refetchs da mesma conta", () => {
    const guard = createProgressRequestGuard();
    guard.observe("a", "token-a");
    const old = guard.begin("a", "token-a")!;
    const latest = guard.begin("a", "token-a")!;
    expect(guard.current(old)).toBe(false);
    expect(guard.current(latest)).toBe(true);
  });

  it("renovacao de token invalida callbacks capturados com token antigo", () => {
    const guard = createProgressRequestGuard();
    guard.observe("a", "old-token");
    const old = guard.begin("a", "old-token")!;
    guard.observe("a", "new-token");
    expect(guard.current(old)).toBe(false);
    expect(guard.begin("a", "old-token")).toBeNull();
    expect(guard.begin("a", "new-token")).not.toBeNull();
  });

  it("nao ressuscita request de montagem anterior depois de stop/start", () => {
    const guard = createProgressRequestGuard();
    guard.observe("a", "token-a");
    const beforeUnmount = guard.begin("a", "token-a")!;
    guard.stop();
    guard.start();
    expect(guard.current(beforeUnmount)).toBe(false);
    expect(guard.current(guard.begin("a", "token-a")!, "a")).toBe(true);
  });
});
