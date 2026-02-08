"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import {
  ForumMessage,
  getForumMessages,
  postForumMessage,
  updateForumMessage,
  deleteForumMessage,
  searchForumMessages,
  getDisplayAvatarUrl,
  createDirectConversation,
} from "@/lib/api";
import { getFriendlyApiErrorMessage } from "@/lib/utils";
import { Minus, X, RefreshCw, ExternalLink, Maximize2 } from "lucide-react";

export default function ForumWidget() {
  const { token, isAuthenticated, user } = useAuth();
  const { setActiveConversation } = useChat();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [openingChat, setOpeningChat] = useState<number | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const data = query.trim()
        ? await searchForumMessages(query.trim())
        : await getForumMessages();
      const onlyRoot = (data || []).filter((m) => m.parentId == null);
      setMessages(onlyRoot);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[ForumWidget] Erro ao carregar mensagens:", err);
      }
      setError(getFriendlyApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadMessages();
  }, [open]);

  const handleSend = async () => {
    if (!token || !content.trim()) return;
    setSending(true);
    setError("");
    try {
      if (editingId) {
        const updated = await updateForumMessage(token, editingId, content.trim());
        setMessages((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        setEditingId(null);
      } else {
        const created = await postForumMessage(token, content.trim());
        setMessages((prev) => [created, ...prev]);
      }
      setContent("");
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[ForumWidget] Erro ao enviar mensagem:", err);
      }
      setError(getFriendlyApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (message: ForumMessage) => {
    setEditingId(message.id);
    setContent(message.content);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    setSending(true);
    setError("");
    try {
      await deleteForumMessage(token, id);
      setMessages((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[ForumWidget] Erro ao excluir mensagem:", err);
      }
      setError(getFriendlyApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const openChatWithUser = async (userId: number) => {
    if (!token || !user || userId === user.id) return;
    setOpeningChat(userId);
    try {
      const { conversation } = await createDirectConversation(token, userId);
      setActiveConversation(conversation.id, conversation);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[ForumWidget] Erro ao abrir conversa:", err);
      }
    } finally {
      setOpeningChat(null);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const rootMessages = messages.filter((m) => m.parentId == null);

  return (
    <div className={`fixed right-5 z-50 ${minimized ? "bottom-0" : "bottom-5"}`}>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-3 text-black font-semibold shadow-lg shadow-orbit-purple/30 hover:opacity-95 transition"
        >
          💬 Fórum
        </button>
      )}

      {open && (
        <div
          className={`flex flex-col overflow-hidden border border-orbit-purple/30 shadow-2xl shadow-orbit-purple/20 ${minimized ? "rounded-t-2xl w-72 min-w-[200px]" : "rounded-2xl w-96 min-w-[300px] min-h-[360px]"}`}
          style={{
            height: minimized ? undefined : 520,
            minHeight: minimized ? 0 : undefined,
            background: "linear-gradient(160deg, rgba(88, 28, 135, 0.35) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(30, 27, 75, 0.4) 100%)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Header — quando minimizado é só a barrinha; clicar em Expandir volta */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-orbit-purple/20 px-4 py-2.5 bg-orbit-purple/15">
            <span className="text-sm font-bold text-white/95">Fórum</span>
            <div className="flex items-center gap-1">
              {!minimized && (
                <>
                  <button
                    type="button"
                    onClick={loadMessages}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-orbit-electric hover:bg-orbit-electric/20 transition"
                    title="Atualizar"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Atualizar</span>
                  </button>
                  <Link
                    href="/forum"
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-blue-300 hover:bg-blue-500/20 transition"
                    title="Abrir em página cheia"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline">Abrir</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMinimized(true)}
                    className="rounded-lg p-1.5 text-blue-300 hover:bg-blue-500/20 transition"
                    title="Minimizar"
                    aria-label="Minimizar"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </>
              )}
              {minimized && (
                <button
                  type="button"
                  onClick={() => setMinimized(false)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-blue-300 hover:bg-blue-500/20 transition"
                  title="Expandir"
                  aria-label="Expandir"
                >
                  <Maximize2 className="h-5 w-5" />
                  <span className="hidden sm:inline">Expandir</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => { setOpen(false); setMinimized(false); }}
                className="rounded-lg p-1.5 text-red-300 hover:bg-red-500/20 transition"
                title="Fechar"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
                {!isAuthenticated && (
                  <div className="rounded-xl border border-orbit-purple/30 bg-orbit-purple/10 p-3 text-xs text-white/80">
                    Faça login para publicar.
                    <Link href="/entrar" className="ml-2 text-orbit-electric hover:underline font-medium">
                      Entrar
                    </Link>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200">
                    {error}
                  </div>
                )}

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadMessages()}
                  placeholder="Buscar por pessoa ou cidade..."
                  className="w-full rounded-xl border border-orbit-purple/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-orbit-purple/50 focus:outline-none"
                />

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-orbit-purple border-t-transparent" />
                  </div>
                ) : rootMessages.length === 0 ? (
                  <div className="py-6 text-center text-sm text-white/50">Nenhuma publicação ainda.</div>
                ) : (
                  <div className="space-y-3">
                    {rootMessages.map((message) => (
                      <div
                        key={message.id}
                        className="rounded-xl border border-orbit-purple/20 p-3 transition hover:opacity-95"
                        style={{
                          backgroundColor: message.topicColor
                            ? `${message.topicColor}50`
                            : "rgba(255,255,255,0.05)",
                          borderLeftColor: message.topicColor || undefined,
                          borderLeftWidth: message.topicColor ? 4 : undefined,
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-orbit-electric to-orbit-purple ring-2 ring-orbit-purple/30">
                            {getDisplayAvatarUrl(message.authorAvatarUrl) ? (
                              <img
                                src={getDisplayAvatarUrl(message.authorAvatarUrl)!}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-sm font-bold text-black">
                                {message.author.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <button
                                type="button"
                                onClick={() => openChatWithUser(message.userId)}
                                disabled={!user || message.userId === user.id || openingChat === message.userId}
                                className="font-semibold text-white/95 hover:text-orbit-electric hover:underline text-left disabled:opacity-60 disabled:no-underline"
                              >
                                {message.author}
                              </button>
                              <span className="text-[10px] text-white/50">{formatDate(message.createdAt)}</span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-white/50">
                              {[
                                message.neighborhood,
                                message.city,
                                message.authorState,
                                message.authorAge != null ? `${message.authorAge} anos` : "",
                              ]
                                .filter(Boolean)
                                .join(" • ") || "—"}
                            </p>
                            <p className="mt-1.5 text-sm text-white/90 whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            {user?.id === message.userId && (
                              <div className="mt-2 flex gap-3 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(message)}
                                  className="text-orbit-electric hover:underline"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(message.id)}
                                  className="text-red-400 hover:underline"
                                >
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={isAuthenticated ? "Escreva sua mensagem..." : "Faça login para postar"}
                    className="min-h-[80px] w-full resize-none rounded-xl border border-orbit-purple/20 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 focus:border-orbit-purple/50 focus:outline-none disabled:opacity-50"
                    disabled={!isAuthenticated || sending}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!isAuthenticated || sending || !content.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple py-2.5 text-sm font-semibold text-black shadow-lg shadow-orbit-purple/30 disabled:opacity-50 hover:opacity-95 transition"
                  >
                    {sending ? "Enviando..." : editingId ? "Salvar" : "Publicar"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
