import type { ChatMessageCursor, ChatMessageItem, ChatMessagePage } from "./api";

export interface ChatHistorySnapshot {
  messages: ChatMessageItem[];
  nextCursor: ChatMessageCursor | null;
  loaded: boolean;
  loading: boolean;
  loadingOlder: boolean;
  sending: boolean;
  draft: string;
  error: string | null;
}

export const EMPTY_CHAT_HISTORY: ChatHistorySnapshot = {
  messages: [], nextCursor: null, loaded: false, loading: false,
  loadingOlder: false, sending: false, draft: "", error: null,
};

/** A mesma mensagem pode chegar pelo envio e pela página em andamento. */
export function mergeChatMessages(...pages: ChatMessageItem[][]): ChatMessageItem[] {
  const unique = new Map<number, ChatMessageItem>();
  for (const page of pages) for (const message of page) unique.set(message.id, message);
  return [...unique.values()].sort((a, b) => {
    // Preserva microssegundos do Postgres (Date trunca para milissegundos).
    const timestamp = (value: string) => {
      const fraction = value.match(/\.(\d+)(?:Z|[+-]\d{2}:\d{2})$/)?.[1] ?? "";
      return Date.parse(value) * 1000 + Number(fraction.padEnd(6, "0").slice(3, 6));
    };
    return timestamp(a.createdAt) - timestamp(b.createdAt) || a.id - b.id;
  });
}

interface ChatHistoryTransport {
  page: (token: string, id: number, options?: { before?: ChatMessageCursor | null }) => Promise<ChatMessagePage>;
  send: (token: string, id: number, text: string, expectedAccountId: ChatMessageItem["senderId"]) => Promise<ChatMessageItem>;
}

/** Uma instância por conta; cada resposta altera somente sua conversa de origem. */
export function createChatHistoryStore(transport: ChatHistoryTransport, accountId: ChatMessageItem["senderId"] | null = null) {
  const snapshots = new Map<number, ChatHistorySnapshot>();
  const listeners = new Set<() => void>();
  const get = (id: number | null) => id == null ? EMPTY_CHAT_HISTORY : snapshots.get(id) ?? EMPTY_CHAT_HISTORY;
  const update = (id: number, patch: Partial<ChatHistorySnapshot>) => {
    snapshots.set(id, { ...get(id), ...patch });
    for (const listener of listeners) listener();
  };
  return {
    accountId,
    get,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    setDraft(id: number, draft: string) { update(id, { draft }); },
    async load(id: number, token: string, refresh = false) {
      if (get(id).loading || (get(id).loaded && !refresh)) return;
      const wasLoaded = get(id).loaded;
      update(id, { loading: true, error: null });
      try {
        const page = await transport.page(token, id);
        const current = get(id);
        const knownIds = new Set(current.messages.map((message) => message.id));
        const overlaps = page.messages.some((message) => knownIds.has(message.id));
        update(id, {
          messages: mergeChatMessages(page.messages, current.messages),
          // Uma volta após muitas mensagens novas pode não sobrepor a página
          // anterior. Retome o cursor recente para não pular esse intervalo.
          nextCursor: wasLoaded && overlaps ? current.nextCursor : page.nextCursor,
          loaded: true,
        });
      } catch {
        update(id, { error: "Não foi possível carregar as mensagens. Tente novamente." });
      } finally { update(id, { loading: false }); }
    },
    async older(id: number, token: string) {
      const cursor = get(id).nextCursor;
      if (!cursor || get(id).loadingOlder || get(id).loading) return;
      update(id, { loadingOlder: true, error: null });
      try {
        const page = await transport.page(token, id, { before: cursor });
        const current = get(id);
        const cursorStillCurrent = current.nextCursor?.id === cursor.id && current.nextCursor?.createdAt === cursor.createdAt;
        update(id, {
          messages: mergeChatMessages(page.messages, current.messages),
          nextCursor: cursorStillCurrent ? page.nextCursor : current.nextCursor,
        });
      } catch {
        update(id, { error: "Não foi possível carregar as mensagens anteriores. Tente novamente." });
      } finally { update(id, { loadingOlder: false }); }
    },
    async send(id: number, token: string) {
      const text = get(id).draft.trim();
      if (accountId == null || !text || get(id).sending) return;
      update(id, { sending: true, draft: "", error: null });
      try {
        const message = await transport.send(token, id, text, accountId);
        update(id, { messages: mergeChatMessages(get(id).messages, [message]) });
        return message;
      } catch {
        update(id, { draft: get(id).draft || text, error: "A mensagem não foi enviada. Tente novamente." });
      } finally { update(id, { sending: false }); }
    },
  };
}

/** Mantém a mesma posição visual quando uma página é acrescentada acima. */
export function chatScrollTop(previous: { height: number; top: number }, nextHeight: number): number {
  return previous.top + nextHeight - previous.height;
}
