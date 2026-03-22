"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  ForumMessage,
  getForumMessages,
  searchForumMessages,
  postForumMessage,
  updateForumMessage,
  deleteForumMessage,
  getDisplayAvatarUrl,
} from "@/lib/api";
import { getFriendlyApiErrorMessage, formatRelativeDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import UserProfileModal from "@/components/forum/UserProfileModal";


function AuthorAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const displayUrl = getDisplayAvatarUrl(avatarUrl ?? undefined);
  const showImg = displayUrl && !imgFailed;
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orbit-electric to-orbit-purple text-sm font-bold text-black ring-2 ring-white/10">
      {showImg ? (
        <img
          src={displayUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
}

export default function ForumPage() {
  const { token, isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState(""); // query that produced current results
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicColor, setTopicColor] = useState("#00D4FF");
  const [topicEmoji, setTopicEmoji] = useState("💬");
  const [profileUserId, setProfileUserId] = useState<number | null>(null);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [repliesByParent, setRepliesByParent] = useState<Record<number, ForumMessage[]>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const loadedRepliesRef = useRef<Set<number>>(new Set());

  const loadMessages = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    setError("");
    loadedRepliesRef.current = new Set();
    try {
      const data = searchTerm?.trim()
        ? await searchForumMessages(searchTerm.trim())
        : await getForumMessages();
      setMessages(data);
      setActiveQuery(searchTerm?.trim() ?? "");
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReplies = useCallback(async (parentId: number) => {
    try {
      const replies = await getForumMessages(parentId);
      setRepliesByParent((prev) => ({
        ...prev,
        [parentId]: replies.filter((r) => r.parentId === parentId),
      }));
    } catch {
      setRepliesByParent((prev) => ({ ...prev, [parentId]: [] }));
    }
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    messages
      .filter((m) => m.parentId == null && !loadedRepliesRef.current.has(m.id))
      .forEach((m) => {
        loadedRepliesRef.current.add(m.id);
        loadReplies(m.id);
      });
  }, [messages, loadReplies]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMessages(query);
  };

  const handleClearSearch = () => {
    setQuery("");
    loadMessages("");
  };

  // Unified send handler: new post, reply, or edit
  const handleSend = async () => {
    if (!token || !content.trim()) return;
    setSending(true);
    setError("");
    try {
      if (editingId) {
        const updated = await updateForumMessage(
          token,
          editingId,
          content.trim(),
          undefined,
          undefined,
          { topicTitle, topicColor, topicEmoji }
        );
        setMessages((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
        setEditingId(null);
      } else if (replyingToId) {
        const created = await postForumMessage(token, content.trim(), undefined, undefined, {
          parentId: replyingToId,
        });
        setRepliesByParent((prev) => ({
          ...prev,
          [replyingToId]: [...(prev[replyingToId] ?? []), created],
        }));
        setReplyingToId(null);
      } else {
        const created = await postForumMessage(token, content.trim(), undefined, undefined, {
          topicTitle: topicTitle || undefined,
          topicColor: topicColor || undefined,
          topicEmoji: topicEmoji || undefined,
        });
        setMessages((prev) => [created, ...prev]);
        setTopicTitle("");
        setTopicColor("#00D4FF");
        setTopicEmoji("💬");
      }
      setContent("");
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (message: ForumMessage) => {
    setEditingId(message.id);
    setReplyingToId(null);
    setContent(message.content);
    setTopicTitle(message.topicTitle || "");
    setTopicColor(message.topicColor || "#00D4FF");
    setTopicEmoji(message.topicEmoji || "💬");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReply = (message: ForumMessage) => {
    setReplyingToId(message.id);
    setEditingId(null);
    setContent("");
    setError("");
  };

  const handleCancelCompose = () => {
    setEditingId(null);
    setReplyingToId(null);
    setContent("");
    setError("");
    setTopicTitle("");
    setTopicColor("#00D4FF");
    setTopicEmoji("💬");
  };

  const handleDeleteReply = async (replyId: number, parentId: number) => {
    if (!token) return;
    setSending(true);
    setError("");
    try {
      await deleteForumMessage(token, replyId);
      setRepliesByParent((prev) => ({
        ...prev,
        [parentId]: (prev[parentId] ?? []).filter((r) => r.id !== replyId),
      }));
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    setConfirmDeleteId(null);
    setSending(true);
    setError("");
    try {
      await deleteForumMessage(token, id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  // Show top compose card when: logged in AND not in reply mode (reply is inline)
  const showComposeCard = isAuthenticated && !replyingToId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900/50 to-black text-white">
      <section className="container mx-auto max-w-full px-4 py-8 sm:py-10 md:py-14">
        <header className="mb-8 sm:mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Fórum da <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">Comunidade</span>
          </h1>
          <p className="mt-3 max-w-2xl text-white/70">
            Dúvidas, dicas e troca de experiências. Conecte-se com quem está na mesma jornada.
          </p>
        </header>

        <div className="mx-auto max-w-3xl space-y-8">

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por autor, cidade ou bairro..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:border-orbit-electric/50 focus:outline-none focus:ring-1 focus:ring-orbit-electric/30"
              />
            </div>
            <Button type="submit" variant="outline" className="border-white/20 text-white hover:bg-white/10 sm:shrink-0">
              Buscar
            </Button>
          </form>

          {/* Active search indicator */}
          {activeQuery && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>Resultados para: <strong className="text-white/90">"{activeQuery}"</strong></span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                ✕ Limpar
              </button>
            </div>
          )}

          {/* Compose card — new post or edit (hidden during inline reply) */}
          {showComposeCard ? (
            <Card className="border-orbit-electric/20 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-orbit-electric">
                  {editingId ? "Editando mensagem" : "Nova publicação"}
                </CardTitle>
                <CardDescription>
                  {editingId ? "Altere o conteúdo abaixo e salve" : "Compartilhe uma dúvida ou dica com a comunidade"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </div>
                )}
                {!editingId && (
                  <>
                    <div>
                      <label className="text-xs text-white/60">Título do tópico (opcional)</label>
                      <Input
                        value={topicTitle}
                        onChange={(e) => setTopicTitle(e.target.value)}
                        placeholder="Ex: Dúvida sobre HTML"
                        className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/40"
                        disabled={sending}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <label className="text-xs text-white/60 mr-2">Cor</label>
                        <input
                          type="color"
                          value={topicColor}
                          onChange={(e) => setTopicColor(e.target.value)}
                          className="h-10 w-14 cursor-pointer rounded border border-white/20 bg-white/5"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 mr-2">Emoji</label>
                        <Input
                          value={topicEmoji}
                          onChange={(e) => setTopicEmoji(e.target.value.slice(0, 4))}
                          placeholder="💬"
                          className="w-16 text-center text-2xl border-white/10 bg-white/5 text-white"
                          disabled={sending}
                        />
                      </div>
                    </div>
                  </>
                )}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend(); }}
                  placeholder="O que você quer compartilhar?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-orbit-electric/50 focus:outline-none focus:ring-1 focus:ring-orbit-electric/30 disabled:opacity-50"
                  disabled={sending}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !content.trim()}
                    className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {sending ? "Enviando..." : editingId ? "Salvar" : "Publicar"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelCompose}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                  )}
                  <span className="ml-auto text-[11px] text-white/25 hidden sm:block">Ctrl+Enter para enviar</span>
                </div>
              </CardContent>
            </Card>
          ) : !isAuthenticated ? (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                <p className="text-sm text-white/70">Faça login para publicar. Você pode ler todas as mensagens.</p>
                <Link href="/entrar">
                  <Button className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:opacity-90">
                    Entrar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {/* Message list */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white/90">Publicações</h2>
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded bg-white/10" />
                        <div className="h-3 w-full rounded bg-white/10" />
                        <div className="h-3 w-2/3 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.filter((m) => m.parentId == null).length === 0 ? (
              <Card className="border-white/10 bg-white/5">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-4xl opacity-50">💬</span>
                  <p className="mt-3 font-medium text-white/80">
                    {activeQuery ? "Nenhum resultado encontrado" : "Nenhuma publicação ainda"}
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {activeQuery ? "Tente outro termo de busca." : "Seja o primeiro a compartilhar uma dúvida ou dica."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-4">
                {messages
                  .filter((m) => m.parentId == null)
                  .map((message) => {
                    const replies = repliesByParent[message.id] ?? [];
                    const isReplying = replyingToId === message.id;

                    return (
                      <li key={message.id}>
                        <Card
                          className="border-l-4 transition-colors hover:opacity-95"
                          style={{
                            backgroundColor: message.topicColor
                              ? `${message.topicColor}50`
                              : "rgba(17, 24, 39, 0.4)",
                            borderLeftColor: message.topicColor || "#00D4FF",
                            borderTopColor: "rgba(255,255,255,0.1)",
                            borderRightColor: "rgba(255,255,255,0.1)",
                            borderBottomColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          {(message.topicTitle || message.topicEmoji) && (
                            <div
                              className="flex items-center gap-3 rounded-t-xl border-b border-white/10 px-5 py-3"
                              style={{
                                backgroundColor: message.topicColor
                                  ? `${message.topicColor}70`
                                  : "rgba(0,212,255,0.15)",
                              }}
                            >
                              {message.topicEmoji && (
                                <span className="text-3xl" role="img" aria-hidden>
                                  {message.topicEmoji}
                                </span>
                              )}
                              {message.topicTitle && (
                                <span className="font-semibold text-white/95">{message.topicTitle}</span>
                              )}
                            </div>
                          )}

                          <CardContent className="p-5">
                            <div className="flex gap-4">
                              <AuthorAvatar name={message.author} avatarUrl={message.authorAvatarUrl} />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setProfileUserId(message.userId)}
                                    className="font-semibold text-white/95 hover:text-orbit-electric hover:underline text-left"
                                  >
                                    {message.author}
                                  </button>
                                  <span className="text-xs text-white/50">{formatRelativeDate(message.createdAt)}</span>
                                </div>
                                <p className="mt-0.5 text-xs text-white/50">
                                  {[
                                    message.neighborhood,
                                    message.city,
                                    message.authorState,
                                    message.authorAge != null ? `${message.authorAge} anos` : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" • ") || "—"}
                                </p>
                                <p className="mt-3 whitespace-pre-wrap text-white/90">{message.content}</p>

                                {/* Action buttons */}
                                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                  {isAuthenticated && !isReplying && (
                                    <button
                                      type="button"
                                      onClick={() => handleReply(message)}
                                      className="text-orbit-electric hover:underline"
                                    >
                                      ↩ Responder
                                    </button>
                                  )}
                                  {user?.id === message.userId && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleEdit(message)}
                                        className="text-orbit-electric hover:underline"
                                      >
                                        Editar
                                      </button>
                                      {confirmDeleteId === message.id ? (
                                        <span className="flex items-center gap-2">
                                          <span className="text-xs text-white/60">Confirmar?</span>
                                          <button type="button" onClick={() => handleDelete(message.id)} className="text-red-400 hover:underline">Sim</button>
                                          <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-white/50 hover:underline">Não</button>
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteId(message.id)}
                                          className="text-red-400 hover:underline"
                                        >
                                          Excluir
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* Inline reply form */}
                                {isReplying && (
                                  <div className="mt-3 rounded-xl border border-orbit-electric/30 bg-orbit-electric/5 p-3">
                                    <div className="mb-2 flex items-center gap-1.5 text-xs text-orbit-electric/80">
                                      <span>↩</span>
                                      <span>Respondendo a <strong>{message.author}</strong></span>
                                    </div>
                                    {error && (
                                      <div className="mb-2 rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-xs text-red-200">
                                        {error}
                                      </div>
                                    )}
                                    <textarea
                                      autoFocus
                                      value={content}
                                      onChange={(e) => setContent(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend(); }}
                                      placeholder="Sua resposta..."
                                      rows={2}
                                      className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-orbit-electric/40 focus:outline-none focus:ring-1 focus:ring-orbit-electric/20 disabled:opacity-50"
                                      disabled={sending}
                                    />
                                    <div className="mt-2 flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={handleSend}
                                        disabled={sending || !content.trim()}
                                        className="rounded-lg bg-gradient-to-r from-orbit-electric to-orbit-purple px-3 py-1.5 text-xs font-bold text-black disabled:opacity-50 hover:opacity-90 transition-opacity"
                                      >
                                        {sending ? "Enviando..." : "Responder"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleCancelCompose}
                                        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 transition-colors"
                                      >
                                        Cancelar
                                      </button>
                                      <span className="ml-auto text-[10px] text-white/25 hidden sm:block">Ctrl+Enter para enviar</span>
                                    </div>
                                  </div>
                                )}

                                {/* Replies thread */}
                                {replies.length > 0 && (
                                  <div className="mt-4 space-y-3 border-l-2 border-white/10 pl-4">
                                    {replies.map((reply) => (
                                      <div key={reply.id} className="flex gap-3">
                                        <AuthorAvatar name={reply.author} avatarUrl={reply.authorAvatarUrl} />
                                        <div className="min-w-0 flex-1">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => setProfileUserId(reply.userId)}
                                              className="text-sm font-medium text-white/90 hover:text-orbit-electric hover:underline"
                                            >
                                              {reply.author}
                                            </button>
                                            <span className="text-xs text-white/50">{formatRelativeDate(reply.createdAt)}</span>
                                          </div>
                                          <p className="mt-0.5 text-xs text-white/50">
                                            {[
                                              reply.neighborhood,
                                              reply.city,
                                              reply.authorState,
                                              reply.authorAge != null ? `${reply.authorAge} anos` : "",
                                            ]
                                              .filter(Boolean)
                                              .join(" • ") || "—"}
                                          </p>
                                          <p className="mt-1 whitespace-pre-wrap text-sm text-white/80">{reply.content}</p>
                                          {user?.id === reply.userId && (
                                            <div className="mt-1.5 text-xs">
                                              {confirmDeleteId === reply.id ? (
                                                <span className="flex items-center gap-2">
                                                  <span className="text-white/50">Confirmar?</span>
                                                  <button type="button" onClick={() => handleDeleteReply(reply.id, message.id)} className="text-red-400 hover:underline">Sim</button>
                                                  <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-white/40 hover:underline">Não</button>
                                                </span>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => setConfirmDeleteId(reply.id)}
                                                  className="text-red-400/70 hover:underline hover:text-red-400"
                                                >
                                                  Excluir
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </section>

      {profileUserId != null && token && (
        <UserProfileModal
          userId={profileUserId}
          token={token}
          authorName={
            messages.find((m) => m.userId === profileUserId)?.author ??
            Object.values(repliesByParent).flat().find((r) => r.userId === profileUserId)?.author ??
            ""
          }
          onClose={() => setProfileUserId(null)}
        />
      )}
    </div>
  );
}
