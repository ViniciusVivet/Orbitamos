import { describe, expect, it } from "vitest";
import { createAuthSessionGuard } from "./authSessionGuard";

describe("sincronização da identidade da sessão", () => {
  it("descarta restauração atrasada após sair da conta", async () => {
    const guard = createAuthSessionGuard();
    guard.observe("a", "token-a");
    const ticket = guard.beginProfile()!;
    let resolve!: (owner: string) => void;
    const profile = new Promise<string>((yes) => { resolve = yes; });
    const applied = profile.then((owner) => guard.profileCurrent(ticket, owner));
    guard.observe(null, null, true);
    resolve("a");
    expect(await applied).toBe(false);
    expect(guard.owner).toBeNull();
    expect(guard.token).toBeNull();
  });

  it("aplica somente o perfil B após troca de conta e não aceita perfil de outro owner", () => {
    const guard = createAuthSessionGuard();
    guard.observe("a", "ta");
    const old = guard.beginProfile()!;
    guard.observe("b", "tb");
    const current = guard.beginProfile()!;
    expect(guard.profileCurrent(old, "a")).toBe(false);
    expect(guard.profileCurrent(current, "a")).toBe(false);
    expect(guard.profileCurrent(current, "b")).toBe(true);
  });

  it("atualiza token sem invalidar perfil no refresh da mesma conta", () => {
    const guard = createAuthSessionGuard();
    guard.observe("a", "old");
    const ticket = guard.beginProfile()!;
    guard.finishProfile(ticket, true);
    expect(guard.observe("a", "new")).toBe(false);
    expect(guard.profileReady).toBe(true);
    expect(guard.profileCurrent(ticket, "a")).toBe(true);
    expect(guard.token).toBe("new");
  });

  it("deduplica perfil em andamento e permite repetir uma leitura falha", () => {
    const guard = createAuthSessionGuard();
    guard.observe("a", "t");
    const ticket = guard.beginProfile()!;
    expect(guard.beginProfile()).toBeNull();
    guard.finishProfile(ticket, false);
    expect(guard.beginProfile()).not.toBeNull();
    expect(guard.profileReady).toBe(false);
  });

  it("permite o SIGNED_IN da própria operação e rejeita resultado após outra conta entrar", () => {
    const guard = createAuthSessionGuard();
    const login = guard.beginOperation();
    guard.observe("a", "ta");
    expect(guard.adoptOperation(login, "a", "ta")).toBe(true);
    const fullProfile = guard.identity();
    guard.observe("b", "tb");
    expect(guard.operationCurrent(login, "a")).toBe(false);
    expect(guard.current(fullProfile, "a")).toBe(false);
    expect(guard.adoptOperation(login, "a", "ta")).toBe(false);
    expect(guard.owner).toBe("b");
  });

  it("rejeita login/register antigos após logout ou nova tentativa", () => {
    const guard = createAuthSessionGuard();
    const register = guard.beginOperation();
    const login = guard.beginOperation();
    expect(guard.adoptOperation(register, "a", "ta")).toBe(false);
    guard.observe("b", "tb");
    expect(guard.adoptOperation(login, "b", "tb")).toBe(true);
    guard.observe(null, null, true);
    expect(guard.adoptOperation(login, "b", "tb")).toBe(false);
  });

  it("resposta do login não rebaixa token já renovado pelo SDK", () => {
    const guard = createAuthSessionGuard();
    const login = guard.beginOperation();
    guard.observe("a", "old");
    guard.observe("a", "refreshed");
    expect(guard.adoptOperation(login, "a", "old")).toBe(true);
    expect(guard.token).toBe("refreshed");
  });

  it("não adota uma resposta de perfil B misturada à operação solicitada para email A", () => {
    const guard = createAuthSessionGuard();
    const login = guard.beginOperation(" A@example.test ");
    guard.observe("b", "token-b");
    expect(guard.adoptOperation(login, "b", "token-a", "b@example.test")).toBe(false);
    expect(guard.owner).toBe("b");
    expect(guard.token).toBe("token-b");
    const ownLogin = guard.beginOperation("B@example.test");
    expect(guard.adoptOperation(ownLogin, "b", "token-b", "b@example.test")).toBe(true);
  });

  it("perfil da operação explícita invalida restauração anterior e cleanup invalida tudo", () => {
    const guard = createAuthSessionGuard();
    guard.observe("a", "t");
    const restore = guard.beginProfile()!;
    const login = guard.beginOperation();
    guard.adoptOperation(login, "a", "t");
    expect(guard.profileCurrent(restore)).toBe(false);
    const identity = guard.identity();
    guard.stop();
    guard.start();
    expect(guard.current(identity)).toBe(false);
    expect(guard.operationCurrent(login, "a")).toBe(false);
  });
});
