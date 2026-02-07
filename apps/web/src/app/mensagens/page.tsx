"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getChatConversations,
  getChatMessages,
  sendChatMessage,
  getChatUsers,
  createDirectConversation,
  createGroupConversation,
  updateGroupConversation,
  removeGroupParticipant,
  uploadGroupAvatar,
  getDisplayAvatarUrl,
  getPublicProfile,
  type ChatConversation,
  type ChatMessageItem,
  type ChatUser,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageCircle, Users, Send, Info } from "lucide-react";
import AvatarWithPresence from "@/components/chat/AvatarWithPresence";
import GroupInfoModal from "@/components/chat/GroupInfoModal";

const POLL_INTERVAL_MS = 5000;

export default function MensagensPage() {
  const { user, token } = useAuth();
  const { setActiveConversation, clearUnread, unreadByConv } = useChat();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupUserIds, setGroupUserIds] = useState<number[]>([]);
  const [groupAvatarUrl, setGroupAvatarUrl] = useState("");
  const [groupAvatarFile, setGroupAvatarFile] = useState<File | null>(null);
  const [uploadingGroupAvatar, setUploadingGroupAvatar] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [clickedMessageId, setClickedMessageId] = useState<number | null>(null);
  const [otherUserLastSeen, setOtherUserLastSeen] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const selectedConv = conversations.find((c) => c.id === selectedId);
  const otherParticipant = selectedConv?.type === "DIRECT" ? selectedConv.participants.find((p) => p.id !== user?.id) : null;

  const appendMessage = useCallback((msg: ChatMessageItem) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useChatWebSocket(token, selectedId, user?.id, appendMessage, () => {}, false);

  useEffect(() => {
    if (!token) return;
    const load = () => {
      getChatConversations(token)
        .then(setConversations)
        .catch(() => setConversations([]))
        .finally(() => setLoadingConvs(false));
    };
    load();
    const t = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [token]);

  useEffect(() => {
    if (selectedId != null && selectedConv) {
      setActiveConversation(selectedId, selectedConv);
      clearUnread(selectedId);
    }
  }, [selectedId, selectedConv, setActiveConversation, clearUnread]);

  const openUserId = searchParams.get("openUserId");
  useEffect(() => {
    if (!token || !openUserId || loadingConvs) return;
    const uid = parseInt(openUserId, 10);
    if (Number.isNaN(uid)) return;
    const existing = conversations.find(
      (c) => c.type === "DIRECT" && c.participants.some((p) => p.id === uid)
    );
    if (existing) {
      setSelectedId(existing.id);
      return;
    }
    createDirectConversation(token, uid)
      .then(({ conversation }) => {
        setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
        setSelectedId(conversation.id);
      })
      .catch(() => {});
  }, [token, openUserId, loadingConvs, conversations]);

  useEffect(() => {
    if (!token || !otherParticipant?.id) {
      setOtherUserLastSeen(null);
      return;
    }
    getPublicProfile(token, otherParticipant.id).then((p) =>
      setOtherUserLastSeen(p?.lastSeenAt ?? null)
    );
  }, [token, otherParticipant?.id]);

  useEffect(() => {
    if (!token || selectedId == null) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    getChatMessages(token, selectedId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [token, selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!token || (!newChatOpen && !newGroupOpen && !groupInfoOpen)) return;
    getChatUsers(token).then(setUsers).catch(() => setUsers([]));
  }, [token, newChatOpen, newGroupOpen, groupInfoOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !token || selectedId == null || sending) return;
    setSending(true);
    setInput("");
    try {
      const msg = await sendChatMessage(token, selectedId, text);
      setMessages((prev) => [...prev, msg]);
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const startDirect = async () => {
    if (!token || selectedUserId == null) return;
    try {
      const { conversation } = await createDirectConversation(token, selectedUserId);
      setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
      setSelectedId(conversation.id);
      setNewChatOpen(false);
      setSelectedUserId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const startGroup = async () => {
    const name = groupName.trim();
    if (!token || !name) return;
    setUploadingGroupAvatar(!!groupAvatarFile);
    try {
      const { conversation } = await createGroupConversation(token, name, groupUserIds, groupAvatarUrl.trim() || undefined);
      let finalConv = conversation;
      if (groupAvatarFile) {
        const { conversation: updated } = await uploadGroupAvatar(token, conversation.id, groupAvatarFile);
        finalConv = updated;
      }
      setConversations((prev) => [finalConv, ...prev.filter((c) => c.id !== finalConv.id)]);
      setSelectedId(finalConv.id);
      setNewGroupOpen(false);
      setGroupName("");
      setGroupUserIds([]);
      setGroupAvatarUrl("");
      setGroupAvatarFile(null);
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingGroupAvatar(false);
    }
  };

  const toggleGroupUser = (id: number) => {
    setGroupUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const formatFullDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 min
  const isOnline = (iso: string | null | undefined): boolean => {
    if (!iso) return false;
    return Date.now() - new Date(iso).getTime() < ONLINE_THRESHOLD_MS;
  };

  const formatLastSeen = (iso: string | null): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays} dia${diffDays !== 1 ? "s" : ""}`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const getDayLabel = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "Hoje";
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Ontem";
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" });
  };

  const messagesByDay = (() => {
    const groups: { day: string; messages: ChatMessageItem[] }[] = [];
    let currentDay = "";
    messages.forEach((m) => {
      const day = getDayLabel(m.createdAt);
      if (day !== currentDay) {
        currentDay = day;
        groups.push({ day, messages: [m] });
      } else {
        groups[groups.length - 1].messages.push(m);
      }
    });
    return groups;
  })();

  if (!user) return null;

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-black via-gray-950 to-black text-white">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/10 bg-black/60 px-6 backdrop-blur-xl">
        <Link
          href={user.role === "FREELANCER" ? "/colaborador" : "/estudante"}
          className="rounded-lg px-3 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          ← Voltar
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple">
          <MessageCircle className="h-5 w-5 text-black" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">
          Mensagens
        </h1>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Lista de conversas */}
        <aside className="flex w-96 shrink-0 flex-col border-r border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="flex gap-2 p-3 border-b border-white/10">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:opacity-90"
              onClick={() => { setNewChatOpen(true); setNewGroupOpen(false); }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Nova conversa
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-orbit-purple/50 text-orbit-purple hover:bg-orbit-purple/20"
              onClick={() => { setNewGroupOpen(true); setNewChatOpen(false); }}
            >
              <Users className="h-4 w-4 mr-2" />
              Novo grupo
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-white/30 mb-3" />
                <p className="text-sm text-white/50">Nenhuma conversa ainda.</p>
                <p className="text-xs text-white/40 mt-1">Inicie uma nova conversa ou crie um grupo.</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "flex w-full items-center gap-4 px-4 py-3.5 text-left transition",
                    selectedId === c.id
                      ? "bg-gradient-to-r from-orbit-electric/20 to-orbit-purple/10 border-l-4 border-orbit-electric"
                      : "hover:bg-white/5 border-l-4 border-transparent"
                  )}
                >
                  <div className="h-14 w-14 shrink-0 relative">
                    {c.type === "GROUP" ? (
                      getDisplayAvatarUrl(c.avatarUrl) ? (
                        <img src={getDisplayAvatarUrl(c.avatarUrl)!} alt="" className="h-full w-full rounded-full object-cover ring-2 ring-white/10" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-orbit-purple/30 to-orbit-electric/30 text-2xl ring-2 ring-white/10">👥</span>
                      )
                    ) : (
                      (() => {
                        const other = c.participants.find((p) => p.id !== user.id);
                        return (
                          <AvatarWithPresence
                            avatarUrl={other?.avatarUrl}
                            name={other?.name ?? "?"}
                            lastSeenAt={other?.lastSeenAt}
                            size="lg"
                            className="h-14 w-14"
                          />
                        );
                      })()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{c.displayName}</p>
                    {c.lastMessage && (
                      <p className="truncate text-sm text-white/50">{c.lastMessage.content}</p>
                    )}
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-0.5">
                    {(unreadByConv[c.id] ?? 0) > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orbit-electric px-1.5 text-xs font-bold text-black">
                        {unreadByConv[c.id]! > 99 ? "99+" : unreadByConv[c.id]}
                      </span>
                    )}
                    {c.lastMessage && (
                      <span className="text-xs text-white/40">
                        {formatTime(c.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Área da conversa */}
        <section className="flex flex-1 flex-col min-w-0 bg-gradient-to-b from-black/50 to-transparent">
          {selectedId == null ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-white/60">
              <div className="rounded-full bg-white/5 p-6">
                <MessageCircle className="h-16 w-16 text-orbit-electric/50" />
              </div>
              <p className="text-lg font-medium">Selecione uma conversa ou inicie uma nova</p>
              <div className="flex gap-3">
                <Button
                  className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold"
                  onClick={() => { setNewChatOpen(true); setNewGroupOpen(false); }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Nova conversa
                </Button>
                <Button
                  variant="outline"
                  className="border-orbit-purple/50 text-orbit-purple hover:bg-orbit-purple/20"
                  onClick={() => { setNewGroupOpen(true); setNewChatOpen(false); }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Novo grupo
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-16 shrink-0 items-center gap-4 border-b border-white/10 bg-black/40 px-6 backdrop-blur-sm">
                <div className="h-12 w-12 shrink-0">
                  {selectedConv?.type === "GROUP" ? (
                    getDisplayAvatarUrl(selectedConv?.avatarUrl) ? (
                      <img src={getDisplayAvatarUrl(selectedConv.avatarUrl)!} alt="" className="h-full w-full rounded-full object-cover ring-2 ring-orbit-electric/30" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-orbit-purple/40 to-orbit-electric/40 text-2xl ring-2 ring-orbit-electric/30">👥</span>
                    )
                  ) : (
                    (() => {
                      const other = selectedConv?.participants.find((p) => p.id !== user.id);
                      return (
                        <AvatarWithPresence
                          avatarUrl={other?.avatarUrl}
                          name={other?.name ?? "?"}
                          lastSeenAt={other?.lastSeenAt ?? otherUserLastSeen}
                          size="lg"
                          className="h-12 w-12 ring-2 ring-orbit-electric/30"
                        />
                      );
                    })()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-lg truncate">{selectedConv?.displayName ?? "Conversa"}</p>
                  {selectedConv?.type === "DIRECT" && (otherUserLastSeen || otherParticipant?.lastSeenAt) && (
                    <p className="text-xs text-white/50 truncate" title={isOnline(otherParticipant?.lastSeenAt ?? otherUserLastSeen) ? "Online" : `Offline: ${formatLastSeen(otherUserLastSeen ?? otherParticipant?.lastSeenAt ?? null)}`}>
                      {isOnline(otherParticipant?.lastSeenAt ?? otherUserLastSeen) ? "Online" : `Visto por último: ${formatLastSeen(otherUserLastSeen ?? otherParticipant?.lastSeenAt ?? null)}`}
                    </p>
                  )}
                </div>
                {selectedConv?.type === "GROUP" && (
                  <button type="button" onClick={() => setGroupInfoOpen(true)} className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Info do grupo">
                    <Info className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex justify-center py-12">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
                  </div>
                ) : (
                  messagesByDay.map(({ day, messages: dayMessages }) => (
                    <div key={day}>
                      <p className="text-center text-xs text-white/50 py-2 sticky top-0 bg-black/60 backdrop-blur-sm rounded-full w-fit mx-auto px-3">
                        {day}
                      </p>
                      {dayMessages.map((m) => {
                        const isMe = m.senderId === user.id;
                        const showFullDate = clickedMessageId === m.id;
                        return (
                          <div
                            key={m.id}
                            className={cn(
                              "flex gap-3 max-w-[80%]",
                              isMe ? "ml-auto flex-row-reverse" : ""
                            )}
                          >
                            {!isMe && (
                              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden ring-2 ring-white/10">
                                {getDisplayAvatarUrl(m.senderAvatarUrl) ? (
                                  <img src={getDisplayAvatarUrl(m.senderAvatarUrl)!} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span className="flex h-full w-full items-center justify-center bg-orbit-electric/20 text-orbit-electric font-semibold">
                                    {m.senderName.slice(0, 1).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            )}
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-3 shadow-lg cursor-pointer select-none",
                                isMe
                                  ? "bg-gradient-to-br from-orbit-electric to-orbit-purple text-black rounded-br-md"
                                  : "bg-white/10 text-white rounded-bl-md border border-white/5"
                              )}
                              onClick={() => setClickedMessageId((prev) => (prev === m.id ? null : m.id))}
                              title={formatFullDate(m.createdAt)}
                            >
                              {!isMe && selectedConv?.type === "GROUP" && (
                                <p className="text-xs font-semibold text-orbit-electric mb-1">{m.senderName}</p>
                              )}
                              <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                              <div className="flex items-center justify-end gap-1.5 mt-1.5">
                                <p className="text-xs opacity-70">{formatTime(m.createdAt)}</p>
                                {isMe && m.readAt && (
                                  <span className="text-xs opacity-80" title="Visualizado">✓✓</span>
                                )}
                              </div>
                              {showFullDate && (
                                <p className="text-xs opacity-80 mt-1 border-t border-white/10 pt-1">
                                  Enviado em {formatFullDate(m.createdAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="shrink-0 border-t border-white/10 bg-black/40 p-4 backdrop-blur-sm">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-3"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl py-6"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 h-12 w-12 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple text-black hover:opacity-90"
                    disabled={sending || !input.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Modal Nova conversa */}
      {newChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-orbit-electric/30 bg-gray-900/95 p-5 shadow-2xl shadow-orbit-electric/10">
            <h2 className="text-lg font-semibold mb-3">Nova conversa</h2>
            <p className="text-sm text-white/60 mb-3">Escolha um usuário para conversar:</p>
            <div className="max-h-60 overflow-y-auto space-y-1 mb-4">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUserId(u.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/10",
                    selectedUserId === u.id && "bg-orbit-electric/20"
                  )}
                >
                  <AvatarWithPresence avatarUrl={u.avatarUrl} name={u.name} lastSeenAt={u.lastSeenAt} size="md" />
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-white/50">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setNewChatOpen(false); setSelectedUserId(null); }}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-orbit-electric text-black" onClick={startDirect} disabled={selectedUserId == null}>
                Iniciar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo grupo */}
      {newGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-orbit-purple/30 bg-gray-900/95 p-5 shadow-2xl shadow-orbit-purple/10">
            <h2 className="text-lg font-semibold mb-3">Novo grupo</h2>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nome do grupo"
              className="mb-3 bg-white/10 border-white/20 text-white"
            />
            <p className="text-sm text-white/60 mb-1">Foto do grupo (opcional)</p>
            <div className="flex flex-col gap-2 mb-3">
              <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-white/30 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={(e) => setGroupAvatarFile(e.target.files?.[0] ?? null)} />
                {groupAvatarFile ? `📷 ${groupAvatarFile.name}` : "📷 Enviar imagem (JPG, PNG, GIF, WebP)"}
              </label>
              <span className="text-xs text-white/50">ou URL:</span>
              <Input value={groupAvatarUrl} onChange={(e) => setGroupAvatarUrl(e.target.value)} placeholder="https://..." className="bg-white/10 border-white/20 text-white" disabled={!!groupAvatarFile} />
            </div>
            <p className="text-sm text-white/60 mb-2">Adicione participantes:</p>
            <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupUserIds.includes(u.id)}
                    onChange={() => toggleGroupUser(u.id)}
                    className="rounded border-white/30"
                  />
                  <div className="h-8 w-8 shrink-0 rounded-full bg-white/10 overflow-hidden">
                    {getDisplayAvatarUrl(u.avatarUrl) ? (
                      <img src={getDisplayAvatarUrl(u.avatarUrl)!} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-orbit-electric">{u.name.slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="font-medium">{u.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setNewGroupOpen(false); setGroupName(""); setGroupUserIds([]); setGroupAvatarUrl(""); setGroupAvatarFile(null); }}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-orbit-purple" onClick={startGroup} disabled={!groupName.trim() || uploadingGroupAvatar}>
                {uploadingGroupAvatar ? "Criando e enviando foto..." : "Criar grupo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {groupInfoOpen && selectedConv?.type === "GROUP" && selectedId != null && token && (
        <GroupInfoModal
          token={token}
          conversation={selectedConv}
          currentUserId={user?.id}
          users={users}
          onClose={() => setGroupInfoOpen(false)}
          onUpdate={(updated) => {
            setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }}
          onLeave={() => {
            setGroupInfoOpen(false);
            setSelectedId(null);
            getChatConversations(token).then(setConversations);
          }}
        />
      )}
    </div>
  );
}
