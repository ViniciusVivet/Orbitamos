import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostgrestClient } from "@supabase/postgrest-js";
import { getChatConversations, getChatMessagePage, getChatMessages, sendChatMessage } from "./api";

const mocked = vi.hoisted(() => ({ requireSupabase: vi.fn() }));
vi.mock("./supabase", () => ({ requireSupabase: mocked.requireSupabase }));

const requests: URL[] = [];
let response: unknown = [];
const session = vi.fn(async () => ({ data: { session: { user: { id: "me" } } } }));

beforeEach(() => {
  requests.length = 0;
  response = [];
  const rest = new PostgrestClient("https://chat.test/rest/v1", {
    fetch: async (input) => {
      requests.push(new URL(String(input)));
      return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
    },
  });
  mocked.requireSupabase.mockReturnValue({ auth: { getSession: session }, from: rest.from.bind(rest) });
});

const row = (id: number, created_at = "2026-11-04T10:00:00.000001Z") => ({ id, content: `${id}`, sender_id: "me", created_at, profiles: { name: "Pessoa", avatar_url: "" } });

function pendingSession() {
  let resolve!: (value: { data: { session: { user: { id: string } } } }) => void;
  const promise = new Promise<{ data: { session: { user: { id: string } } } }>((yes) => { resolve = yes; });
  return { promise, resolve };
}

describe("consultas limitadas de chat", () => {
  it("lista muitas conversas com uma única consulta e uma única leitura da sessão", async () => {
    response = Array.from({ length: 80 }, (_, id) => ({ id, type: id % 2 ? "GROUP" : "DIRECT", name: id % 2 ? "Equipe" : null, created_at: "2026-11-04T10:00:00Z", participants: [{ profiles: { id: "me", name: "Eu" } }, { profiles: [{ id: "other", name: "Outra pessoa" }] }], last_message: id === 0 ? [] : [row(id)] }));
    const result = await getChatConversations("token");
    expect(requests).toHaveLength(1);
    expect(session).toHaveBeenCalledTimes(1);
    expect(requests[0].pathname).toBe("/rest/v1/v3_conversations");
    expect(requests[0].searchParams.get("last_message.limit")).toBe("1");
    expect(requests[0].searchParams.get("last_message.order")).toBe("created_at.desc,id.desc");
    expect(requests[0].searchParams.get("select")).toContain("participants:v3_conversation_participants");
    expect(result).toHaveLength(80);
    expect(result[0]).toMatchObject({ displayName: "Outra pessoa", lastMessage: null });
    expect(result[1]).toMatchObject({ displayName: "Equipe", lastMessage: { content: "1" } });
  });

  it("busca as últimas mensagens, desempata id e devolve a página crescente", async () => {
    response = [row(8), row(7), row(6)];
    const result = await getChatMessagePage("t", 4, { limit: 2 });
    expect(requests[0].searchParams.get("order")).toBe("created_at.desc,id.desc");
    expect(requests[0].searchParams.get("conversation_id")).toBe("eq.4");
    expect(requests[0].searchParams.get("limit")).toBe("3");
    expect(result.messages.map((item) => item.id)).toEqual([7, 8]);
    expect(result.nextCursor).toEqual({ id: 7, createdAt: row(7).created_at });
  });

  it("usa cursor exclusivo com created_at e id, sem offset e sem truncar microssegundos", async () => {
    response = [row(6), row(5)];
    const before = { id: 7, createdAt: row(7).created_at };
    const result = await getChatMessagePage("t", 4, { before, limit: 2 });
    expect(requests[0].searchParams.get("or")).toBe(`(created_at.lt.${before.createdAt},and(created_at.eq.${before.createdAt},id.lt.7))`);
    expect(requests[0].searchParams.has("offset")).toBe(false);
    expect(result.messages.map((item) => item.id)).toEqual([5, 6]);
    expect(result.nextCursor).toBeNull();
  });

  it("limita tamanho, mantém legado em array e informa fim de histórico vazio", async () => {
    expect(await getChatMessages("t", 1)).toEqual([]);
    expect(requests[0].searchParams.get("limit")).toBe("51");
    expect(await getChatMessagePage("t", 1, { limit: 10000 })).toEqual({ messages: [], nextCursor: null });
    expect(requests[1].searchParams.get("limit")).toBe("101");
  });

  it("recusa cursor inválido antes de consultar a rede", async () => {
    await expect(getChatMessagePage("t", 1, { before: { id: 4, createdAt: "invalid),id.gt.0" } })).rejects.toThrow("Cursor");
    expect(requests).toHaveLength(0);
  });

  it("não publica draft de A como B quando a conta troca durante getSession", async () => {
    const pending = pendingSession();
    session.mockReturnValueOnce(pending.promise);
    const sending = sendChatMessage("token-a", 40, "draft de A", "account-a");
    pending.resolve({ data: { session: { user: { id: "account-b" } } } });
    await expect(sending).rejects.toThrow("A conta mudou");
    expect(requests).toHaveLength(0);
  });

  it("mantém sender A para RLS recusar quando JWT troca para B após a leitura de auth", async () => {
    const pending = pendingSession();
    session.mockReturnValueOnce(pending.promise);
    let activeJwtAccount = "account-a";
    let inserted: { sender_id: string; content: string } | undefined;
    const rest = new PostgrestClient("https://chat.test/rest/v1", {
      fetch: async (_input, init) => {
        inserted = JSON.parse(String(init?.body));
        if (inserted?.sender_id !== activeJwtAccount) {
          return new Response(JSON.stringify({ code: "42501", message: "RLS sender differs from auth.uid" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify(row(99)), { status: 200, headers: { "Content-Type": "application/json" } });
      },
    });
    mocked.requireSupabase.mockReturnValue({ auth: { getSession: session }, from: rest.from.bind(rest) });
    const sending = sendChatMessage("token-a", 40, "draft de A", "account-a");
    pending.resolve({ data: { session: { user: { id: "account-a" } } } });
    activeJwtAccount = "account-b";
    await expect(sending).rejects.toThrow("RLS");
    expect(inserted).toMatchObject({ sender_id: "account-a", content: "draft de A" });
  });
});
