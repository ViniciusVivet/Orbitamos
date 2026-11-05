"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { getChatMessagePage, sendChatMessage, type ChatMessageItem, type UserId } from "@/lib/api";
import { chatScrollTop, createChatHistoryStore, EMPTY_CHAT_HISTORY } from "@/lib/chatHistory";

export function useChatHistory(accountId: UserId | null, token: string | null, conversationId: number | null, enabled = true) {
  const store = useMemo(() => createChatHistoryStore({ page: getChatMessagePage, send: sendChatMessage }, accountId), [accountId]);
  const snapshot = useSyncExternalStore(store.subscribe, useCallback(() => store.get(conversationId), [store, conversationId]), () => EMPTY_CHAT_HISTORY);
  useEffect(() => {
    if (enabled && token && conversationId != null) void store.load(conversationId, token, true);
  }, [store, token, conversationId, enabled]);
  return {
    ...snapshot,
    setDraft: (draft: string) => { if (conversationId != null) store.setDraft(conversationId, draft); },
    retry: () => { if (token && conversationId != null) void store.load(conversationId, token); },
    loadOlder: () => { if (token && conversationId != null) void store.older(conversationId, token); },
    send: () => accountId != null && token && conversationId != null ? store.send(conversationId, token) : Promise.resolve(undefined),
  };
}

export function useChatScroll(conversationId: number | null, messages: ChatMessageItem[], layoutKey: unknown) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previous = useRef<{ id: number | null; first: number | undefined; last: number | undefined; height: number; top: number; atBottom: boolean; anchor: { id: string; offset: number } | null } | null>(null);
  const visibleAnchor = (element: HTMLDivElement) => {
    const rows = element.querySelectorAll<HTMLElement>("[data-chat-message-id]");
    const top = element.getBoundingClientRect().top;
    // Busca binária evita medir todo o histórico em cada scroll.
    let low = 0;
    let high = rows.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (rows[middle].getBoundingClientRect().bottom <= top) low = middle + 1;
      else high = middle;
    }
    const row = rows[low];
    return row ? { id: row.dataset.chatMessageId!, offset: row.getBoundingClientRect().top - top } : null;
  };
  const onScroll = () => {
    const element = containerRef.current;
    if (element && previous.current) {
      previous.current.top = element.scrollTop;
      previous.current.atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
      previous.current.anchor = visibleAnchor(element);
    }
  };
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) { previous.current = null; return; }
    const old = previous.current;
    const first = messages[0]?.id;
    const last = messages.at(-1)?.id;
    if (!old || old.id !== conversationId || old.first == null) {
      element.scrollTop = element.scrollHeight;
    } else if (first === old.first && last !== old.last && old.atBottom) {
      element.scrollTop = element.scrollHeight;
    } else if (old.anchor) {
      const row = element.querySelector<HTMLElement>(`[data-chat-message-id="${old.anchor.id}"]`);
      if (row) element.scrollTop += row.getBoundingClientRect().top - element.getBoundingClientRect().top - old.anchor.offset;
    } else if (first !== old.first && messages.some((message) => message.id === old.first)) {
      element.scrollTop = chatScrollTop(old, element.scrollHeight);
    }
    previous.current = { id: conversationId, first, last, height: element.scrollHeight, top: element.scrollTop, atBottom: element.scrollHeight - element.scrollTop - element.clientHeight < 80, anchor: visibleAnchor(element) };
  }, [conversationId, messages, layoutKey]);
  return { containerRef, onScroll };
}
