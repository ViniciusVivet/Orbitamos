"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { ChatConversation, ChatMessageItem } from "@/lib/api";

interface ChatContextType {
  activeConversationId: number | null;
  activeConversation: ChatConversation | null;
  floatingMinimized: boolean;
  floatingVisible: boolean;
  unreadByConv: Record<number, number>;
  floatingMessages: ChatMessageItem[];
  setActiveConversation: (id: number | null, conv?: ChatConversation | null) => void;
  setFloatingMinimized: (minimized: boolean) => void;
  closeFloating: () => void;
  addUnread: (conversationId: number) => void;
  clearUnread: (conversationId: number) => void;
  appendFloatingMessage: (msg: ChatMessageItem) => void;
  setFloatingMessages: (msgs: ChatMessageItem[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeConversationId, setActiveConversationIdState] = useState<number | null>(null);
  const [activeConversation, setActiveConversationData] = useState<ChatConversation | null>(null);
  const [floatingMinimized, setFloatingMinimized] = useState(true);
  const [floatingVisible, setFloatingVisible] = useState(false);
  const [unreadByConv, setUnreadByConv] = useState<Record<number, number>>({});
  const [floatingMessages, setFloatingMessages] = useState<ChatMessageItem[]>([]);

  const setActiveConversation = useCallback((id: number | null, conv?: ChatConversation | null) => {
    setActiveConversationIdState(id);
    setActiveConversationData(conv ?? null);
    if (id != null) setFloatingMessages([]);
    if (id != null) setUnreadByConv((prev) => ({ ...prev, [id]: 0 }));
  }, []);

  const closeFloating = useCallback(() => {
    setActiveConversationIdState(null);
    setActiveConversationData(null);
    setFloatingVisible(false);
    setFloatingMinimized(true);
    setFloatingMessages([]);
  }, []);

  const addUnread = useCallback((conversationId: number) => {
    setUnreadByConv((prev) => ({ ...prev, [conversationId]: (prev[conversationId] ?? 0) + 1 }));
  }, []);

  const clearUnread = useCallback((conversationId: number) => {
    setUnreadByConv((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
  }, []);

  const appendFloatingMessage = useCallback((msg: ChatMessageItem) => {
    setFloatingMessages((prev) => [...prev, msg]);
  }, []);

  const isOnMessagesPage = pathname === "/mensagens";

  useEffect(() => {
    if (isOnMessagesPage && activeConversationId != null) {
      setFloatingVisible(false);
    } else if (activeConversationId != null) {
      setFloatingVisible(true);
    }
  }, [isOnMessagesPage, activeConversationId]);

  return (
    <ChatContext.Provider
      value={{
        activeConversationId,
        activeConversation,
        floatingMinimized,
        floatingVisible,
        unreadByConv,
        floatingMessages,
        setActiveConversation,
        setFloatingMinimized,
        closeFloating,
        addUnread,
        clearUnread,
        appendFloatingMessage,
        setFloatingMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (ctx === undefined) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
