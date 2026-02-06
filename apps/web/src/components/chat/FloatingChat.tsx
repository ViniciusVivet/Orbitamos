"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import {
  getChatMessages,
  sendChatMessage,
  getDisplayAvatarUrl,
  type ChatMessageItem,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageCircle, Minus, X, Send, ChevronUp } from "lucide-react";

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function FloatingChat() {
  const { user, token } = useAuth();
  const {
    activeConversationId,
    activeConversation,
    floatingMinimized,
    floatingVisible,
    unreadByConv,
    floatingMessages,
    setFloatingMinimized,
    closeFloating,
    clearUnread,
    appendFloatingMessage,
    setFloatingMessages,
    addUnread,
  } = useChat();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useChatWebSocket(
    token,
    activeConversationId,
    user?.id,
    appendFloatingMessage,
    addUnread,
    floatingMinimized
  );

  useEffect(() => {
    if (!token || activeConversationId == null) return;
    setLoading(true);
    getChatMessages(token, activeConversationId)
      .then(setFloatingMessages)
      .catch(() => setFloatingMessages([]))
      .finally(() => setLoading(false));
  }, [token, activeConversationId, setFloatingMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [floatingMessages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !token || activeConversationId == null || sending) return;
    setSending(true);
    setInput("");
    try {
      const msg = await sendChatMessage(token, activeConversationId, text);
      appendFloatingMessage(msg);
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const unread = activeConversationId != null ? (unreadByConv[activeConversationId] ?? 0) : 0;

  if (!user || !floatingVisible || activeConversationId == null || activeConversation == null) {
    return null;
  }

  const displayName = activeConversation.displayName;
  const otherParticipant = activeConversation.participants.find((p) => p.id !== user.id);
  const avatarUrl = activeConversation.type === "GROUP" ? null : otherParticipant?.avatarUrl;

  if (floatingMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          type="button"
          onClick={() => {
            setFloatingMinimized(false);
            clearUnread(activeConversationId);
          }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orbit-electric to-orbit-purple shadow-xl shadow-orbit-electric/40 ring-2 ring-white/20 transition hover:scale-110 hover:shadow-2xl active:scale-95"
          aria-label="Abrir chat"
        >
          {getDisplayAvatarUrl(avatarUrl) ? (
            <img src={getDisplayAvatarUrl(avatarUrl)!} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            <MessageCircle className="h-8 w-8 text-black" />
          )}
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white ring-2 ring-black">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl" style={{ width: 380, height: 520 }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-black/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-orbit-electric to-orbit-purple">
            {getDisplayAvatarUrl(avatarUrl) ? (
              <img src={getDisplayAvatarUrl(avatarUrl)!} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-bold text-black">👥</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{displayName}</p>
            <Link href="/mensagens" className="text-xs text-orbit-electric hover:underline">
              Abrir em tela cheia
            </Link>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => setFloatingMinimized(true)}
            aria-label="Minimizar"
          >
            <Minus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/70 hover:bg-red-500/20 hover:text-red-400"
            onClick={closeFloating}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
          </div>
        ) : (
          floatingMessages.map((m) => {
            const isMe = m.senderId === user.id;
            return (
              <div
                key={m.id}
                className={cn("flex gap-2 max-w-[90%]", isMe ? "ml-auto flex-row-reverse" : "")}
              >
                {!isMe && (
                  <div className="h-6 w-6 shrink-0 rounded-full bg-white/10 overflow-hidden">
                    {m.senderAvatarUrl ? (
                      <img src={m.senderAvatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[10px] text-orbit-electric font-medium">
                        {m.senderName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2",
                    isMe
                      ? "bg-gradient-to-br from-orbit-electric to-orbit-purple text-black rounded-br-md"
                      : "bg-white/10 text-white rounded-bl-md"
                  )}
                >
                  {!isMe && activeConversation.type === "GROUP" && (
                    <p className="text-[10px] font-medium text-orbit-electric mb-0.5">{m.senderName}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{formatTime(m.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/10 p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mensagem..."
            className="flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/40"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 bg-orbit-electric text-black hover:bg-orbit-electric/90"
            disabled={sending || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
