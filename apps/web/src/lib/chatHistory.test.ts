import { describe, expect, it, vi } from "vitest";
import { chatScrollTop, createChatHistoryStore, mergeChatMessages } from "./chatHistory";
import type { ChatMessageItem, ChatMessagePage } from "./api";

const message = (id: number, createdAt = "2026-11-04T10:00:00.000001Z"): ChatMessageItem => ({ id, createdAt, content: `m${id}`, senderId: "u", senderName: "U", senderAvatarUrl: "" });
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

describe("histórico do chat", () => {
  it("ordena por timestamp com microssegundos e id, removendo sobreposição", () => {
    expect(mergeChatMessages([message(9), message(1, "2026-11-04T10:00:00.000002Z")], [message(3), message(9)])
      .map((item) => item.id)).toEqual([3, 9, 1]);
  });

  it("preserva envio confirmado quando a página inicial chega atrasada", async () => {
    const initial = deferred<ChatMessagePage>();
    const transport = { page: vi.fn(() => initial.promise), send: vi.fn(async () => message(4)) };
    const store = createChatHistoryStore(transport, "u");
    const pending = store.load(10, "token");
    await store.load(10, "token");
    store.setDraft(10, "olá");
    await store.send(10, "token");
    initial.resolve({ messages: [message(2), message(4)], nextCursor: { id: 2, createdAt: message(2).createdAt } });
    await pending;
    expect(store.get(10).messages.map((item) => item.id)).toEqual([2, 4]);
    expect(transport.page).toHaveBeenCalledTimes(1);
    expect(store.get(10).draft).toBe("");
    expect(transport.send).toHaveBeenCalledWith("token", 10, "olá", "u");
  });

  it("mantém páginas, rascunhos e envios da conversa de origem durante troca", async () => {
    const old = deferred<ChatMessagePage>();
    const sent = deferred<ChatMessageItem>();
    const store = createChatHistoryStore({ page: async (_token, id) => id === 10 ? old.promise : { messages: [message(30)], nextCursor: null }, send: () => sent.promise }, "u");
    const loading = store.load(10, "t");
    store.setDraft(10, "origem");
    const sending = store.send(10, "t");
    await store.load(20, "t");
    store.setDraft(20, "outra conversa");
    sent.resolve(message(12));
    old.resolve({ messages: [message(11)], nextCursor: null });
    await Promise.all([loading, sending]);
    expect(store.get(10).messages.map((item) => item.id)).toEqual([11, 12]);
    expect(store.get(20).messages.map((item) => item.id)).toEqual([30]);
    expect(store.get(20).draft).toBe("outra conversa");
  });

  it("mescla envio enquanto busca antigas e bloqueia paginação duplicada", async () => {
    const older = deferred<ChatMessagePage>();
    const page = vi.fn().mockResolvedValueOnce({ messages: [message(5)], nextCursor: { id: 5, createdAt: message(5).createdAt } }).mockReturnValue(older.promise);
    const store = createChatHistoryStore({ page, send: async () => message(6) }, "u");
    await store.load(1, "t");
    const pending = store.older(1, "t");
    await store.older(1, "t");
    store.setDraft(1, "nova");
    await store.send(1, "t");
    older.resolve({ messages: [message(2), message(5)], nextCursor: null });
    await pending;
    expect(store.get(1).messages.map((item) => item.id)).toEqual([2, 5, 6]);
    expect(store.get(1).nextCursor).toBeNull();
    expect(page).toHaveBeenCalledTimes(2);
    expect(page.mock.calls[1][2]).toEqual({ before: { id: 5, createdAt: message(5).createdAt } });
  });

  it("permite repetir uma busca falha, preserva cursor e rascunho no erro", async () => {
    const page = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ messages: [message(8)], nextCursor: { id: 8, createdAt: message(8).createdAt } }).mockRejectedValue(new Error("offline"));
    const store = createChatHistoryStore({ page, send: async () => { throw new Error("offline"); } }, "u");
    await store.load(1, "t");
    expect(store.get(1).loaded).toBe(false);
    await store.load(1, "t");
    await store.older(1, "t");
    expect(store.get(1).messages).toEqual([message(8)]);
    expect(store.get(1).nextCursor?.id).toBe(8);
    store.setDraft(1, "tentar de novo");
    await store.send(1, "t");
    expect(store.get(1).draft).toBe("tentar de novo");
    expect(store.get(1).sending).toBe(false);
  });

  it("não mistura respostas atrasadas da conta anterior", async () => {
    const old = deferred<ChatMessagePage>();
    const accountA = createChatHistoryStore({ page: () => old.promise, send: async () => message(1) });
    const accountB = createChatHistoryStore({ page: async () => ({ messages: [message(20)], nextCursor: null }), send: async () => message(21) });
    const pending = accountA.load(1, "a");
    await accountB.load(1, "b");
    old.resolve({ messages: [message(10)], nextCursor: null });
    await pending;
    expect(accountB.get(1).messages.map((item) => item.id)).toEqual([20]);
  });

  it("reabre a página recente sem perder o cursor de antigas já carregadas", async () => {
    const firstCursor = { id: 5, createdAt: message(5).createdAt };
    const page = vi.fn().mockResolvedValueOnce({ messages: [message(5), message(6)], nextCursor: firstCursor })
      .mockResolvedValueOnce({ messages: [message(6), message(7)], nextCursor: { id: 6, createdAt: message(6).createdAt } })
      .mockResolvedValueOnce({ messages: [message(90), message(91)], nextCursor: { id: 90, createdAt: message(90).createdAt } });
    const store = createChatHistoryStore({ page, send: async () => message(8) });
    await store.load(1, "t");
    await store.load(1, "t", true);
    expect(store.get(1).nextCursor).toEqual(firstCursor);
    await store.load(1, "t", true);
    expect(store.get(1).nextCursor?.id).toBe(90);
    expect(store.get(1).messages.map((item) => item.id)).toEqual([5, 6, 7, 90, 91]);
  });

  it("uma página antiga atrasada não substitui o cursor recente após voltar à conversa", async () => {
    const older = deferred<ChatMessagePage>();
    const page = vi.fn().mockResolvedValueOnce({ messages: [message(5)], nextCursor: { id: 5, createdAt: message(5).createdAt } })
      .mockReturnValueOnce(older.promise)
      .mockResolvedValueOnce({ messages: [message(90)], nextCursor: { id: 90, createdAt: message(90).createdAt } });
    const store = createChatHistoryStore({ page, send: async () => message(8) });
    await store.load(1, "t");
    const pending = store.older(1, "t");
    await store.load(1, "t", true);
    older.resolve({ messages: [message(1)], nextCursor: null });
    await pending;
    expect(store.get(1).nextCursor?.id).toBe(90);
    expect(store.get(1).messages.map((item) => item.id)).toEqual([1, 5, 90]);
  });

  it("mantém a mensagem visível na mesma posição ao inserir uma página acima", () => {
    expect(chatScrollTop({ height: 1000, top: 120 }, 1700)).toBe(820);
  });

  it("não envia nem apaga o rascunho quando não há conta vinculada", async () => {
    const send = vi.fn(async () => message(1));
    const store = createChatHistoryStore({ page: async () => ({ messages: [], nextCursor: null }), send }, null);
    store.setDraft(10, "rascunho");
    await store.send(10, "token");
    expect(send).not.toHaveBeenCalled();
    expect(store.get(10).draft).toBe("rascunho");
  });
});
