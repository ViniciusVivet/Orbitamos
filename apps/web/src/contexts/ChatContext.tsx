"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import type { ChatConversation } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ChatContextType {
  activeConversationId: number | null;
  activeConversation: ChatConversation | null;
  floatingMinimized: boolean;
  floatingVisible: boolean;
  unreadByConv: Record<number, number>;
  setActiveConversation: (id: number | null, conv?: ChatConversation | null) => void;
  setFloatingMinimized: (minimized: boolean) => void;
  closeFloating: () => void;
  addUnread: (conversationId: number) => void;
  clearUnread: (conversationId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const accountId = user?.id ?? null;
  const emptySession = (owner: typeof accountId) => ({
    accountId: owner,
    activeConversationId: null as number | null,
    activeConversation: null as ChatConversation | null,
    floatingMinimized: true,
    floatingVisible: false,
    unreadByConv: {} as Record<number, number>,
  });
  const [session, setSession] = useState(() => emptySession(accountId));
  // Ajusta somente o estado do chat antes de renderizar a nova conta. Os
  // demais filhos do provider mantêm seu ciclo de vida normal.
  if (session.accountId !== accountId) setSession(emptySession(accountId));
  const { activeConversationId, activeConversation, floatingMinimized, floatingVisible, unreadByConv } = session;

  const setActiveConversation = useCallback((id: number | null, conv?: ChatConversation | null) => {
    setSession((previous) => previous.accountId !== accountId ? previous : {
      ...previous, activeConversationId: id, activeConversation: conv ?? null,
      floatingVisible: id != null,
      unreadByConv: id == null ? previous.unreadByConv : { ...previous.unreadByConv, [id]: 0 },
    });
  }, [accountId]);

  const setFloatingMinimized = useCallback((minimized: boolean) => {
    setSession((previous) => previous.accountId !== accountId ? previous : { ...previous, floatingMinimized: minimized });
  }, [accountId]);

  const closeFloating = useCallback(() => {
    setSession((previous) => previous.accountId !== accountId ? previous : {
      ...previous, activeConversationId: null, activeConversation: null,
      floatingVisible: false, floatingMinimized: true,
    });
  }, [accountId]);

  const addUnread = useCallback((conversationId: number) => {
    setSession((previous) => previous.accountId !== accountId ? previous : {
      ...previous, unreadByConv: { ...previous.unreadByConv, [conversationId]: (previous.unreadByConv[conversationId] ?? 0) + 1 },
    });
  }, [accountId]);

  const clearUnread = useCallback((conversationId: number) => {
    setSession((previous) => {
      if (previous.accountId !== accountId) return previous;
      const next = { ...previous.unreadByConv };
      delete next[conversationId];
      return { ...previous, unreadByConv: next };
    });
  }, [accountId]);

  const isOnMessagesPage = pathname === "/mensagens";

  return (
    <ChatContext.Provider
      value={{
        activeConversationId,
        activeConversation,
        floatingMinimized,
        floatingVisible: isOnMessagesPage ? false : floatingVisible,
        unreadByConv,
        setActiveConversation,
        setFloatingMinimized,
        closeFloating,
        addUnread,
        clearUnread,
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
