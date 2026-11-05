"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getChatConversations,
  getChatUsers,
  createDirectConversation,
  createGroupConversation,
  uploadGroupAvatar,
  getDisplayAvatarUrl,
  getPublicProfile,
  type ChatConversation,
  type ChatMessageItem,
  type ChatUser,
  type UserId,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatChatTime, isOnline } from "@/lib/utils";
import { MessageCircle, Users, Send, Info } from "lucide-react";
import AvatarWithPresence from "@/components/chat/AvatarWithPresence";
import GroupInfoModal from "@/components/chat/GroupInfoModal";
import NewDirectChatModal from "@/components/chat/NewDirectChatModal";
import NewGroupChatModal from "@/components/chat/NewGroupChatModal";
import { defaultPortalDestination, loginPathFor, readPortalArea, rememberPortalArea, rememberedPortalArea, type PortalArea } from "@/lib/authNavigation";
import { useChatHistory, useChatScroll } from "@/hooks/useChatHistory";

// ─── helpers locais ───────────────────────────────────────────────────────────


function formatLastSeen(iso: string | null): string {
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
}

function getDayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Hoje";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupMessagesByDay(messages: ChatMessageItem[]) {
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
}

// ─── página ───────────────────────────────────────────────────────────────────

export default function MensagensPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace(loginPathFor(window.location.pathname + window.location.search));
  }, [loading, router, user]);
  return <MensagensSession key={user?.id ?? "anonymous"} />;
}

function MensagensSession() {
  const { user, token } = useAuth();
  const { setActiveConversation, clearUnread, unreadByConv } = useChat();
  const searchParams = useSearchParams();
  const requestedArea = readPortalArea(searchParams.get("area"));
  const [savedArea, setSavedArea] = useState<{ userId: UserId; area: PortalArea | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    if (requestedArea) rememberPortalArea(user.id, requestedArea);
    let active = true;
    queueMicrotask(() => {
      if (active) setSavedArea({ userId: user.id, area: requestedArea ?? rememberedPortalArea(user.id) });
    });
    return () => { active = false; };
  }, [requestedArea, user]);

  // Estado de conversas e mensagens
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const history = useChatHistory(user?.id ?? null, token, selectedId);
  const { messages, loading: loadingMessages, sending, draft: input } = history;
  const { containerRef, onScroll } = useChatScroll(selectedId, messages, `${history.loadingOlder}:${loadingMessages}`);
  const [clickedMessageId, setClickedMessageId] = useState<number | null>(null);
  const [otherUserLastSeen, setOtherUserLastSeen] = useState<string | null>(null);

  // Estado de modais
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);

  // Estado de usuários para modais
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<UserId | null>(null);

  // Estado do novo grupo
  const [groupName, setGroupName] = useState("");
  const [groupUserIds, setGroupUserIds] = useState<UserId[]>([]);
  const [groupAvatarUrl, setGroupAvatarUrl] = useState("");
  const [groupAvatarFile, setGroupAvatarFile] = useState<File | null>(null);
  const [groupAvatarPreviewUrl, setGroupAvatarPreviewUrl] = useState<string | null>(null);
  const [uploadingGroupAvatar, setUploadingGroupAvatar] = useState(false);
  const [groupAvatarUploadError, setGroupAvatarUploadError] = useState<string | null>(null);
  const [groupAvatarUploadErrorConvId, setGroupAvatarUploadErrorConvId] = useState<number | null>(null);

  const selectedConv = conversations.find((c) => c.id === selectedId);
  const otherParticipant = selectedConv?.type === "DIRECT"
    ? selectedConv.participants.find((p) => p.id !== user?.id)
    : null;

  // ─── efeitos ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!groupAvatarFile) { setGroupAvatarPreviewUrl(null); return; }
    const url = URL.createObjectURL(groupAvatarFile);
    setGroupAvatarPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [groupAvatarFile]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    getChatConversations(token)
      .then((items) => { if (active) setConversations(items); })
      .catch(() => { if (active) setConversations([]); })
      .finally(() => { if (active) setLoadingConvs(false); });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (selectedId != null && selectedConv) {
      setActiveConversation(selectedId, selectedConv);
      clearUnread(selectedId);
    }
  }, [selectedId, selectedConv, setActiveConversation, clearUnread]);

  // Abre conversa direta via query param ?openUserId=...
  const openUserId = searchParams.get("openUserId");
  const handledOpenUser = useRef<string | null>(null);
  const pendingOpenUser = useRef<{ userId: string; token: string; promise: ReturnType<typeof createDirectConversation> } | null>(null);
  const requestedConversationId = conversations.find(
    (conversation) => conversation.type === "DIRECT" && conversation.participants.some((participant) => participant.id === openUserId)
  )?.id;
  useEffect(() => {
    if (!openUserId) { handledOpenUser.current = null; return; }
    if (!token || !openUserId || loadingConvs) return;
    if (handledOpenUser.current === openUserId) return;
    const uid = openUserId;
    if (requestedConversationId != null) {
      handledOpenUser.current = uid;
      setSelectedId(requestedConversationId);
      return;
    }
    let active = true;
    if (pendingOpenUser.current?.userId !== uid || pendingOpenUser.current?.token !== token) {
      pendingOpenUser.current = { userId: uid, token, promise: createDirectConversation(token, uid) };
    }
    pendingOpenUser.current.promise
      .then(({ conversation }) => {
        if (!active) return;
        handledOpenUser.current = uid;
        setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
        setSelectedId(conversation.id);
      })
      .catch(() => { if (active) pendingOpenUser.current = null; });
    return () => { active = false; };
  }, [token, openUserId, loadingConvs, requestedConversationId]);

  useEffect(() => {
    if (!token || !otherParticipant?.id) { setOtherUserLastSeen(null); return; }
    let active = true;
    setOtherUserLastSeen(null);
    getPublicProfile(token, otherParticipant.id)
      .then((p) => { if (active) setOtherUserLastSeen(p?.lastSeenAt ?? null); })
      .catch(() => { if (active) setOtherUserLastSeen(null); });
    return () => { active = false; };
  }, [token, otherParticipant?.id]);

  useEffect(() => {
    if (!token || (!newChatOpen && !newGroupOpen && !groupInfoOpen)) return;
    let active = true;
    getChatUsers(token).then((items) => { if (active) setUsers(items); }).catch(() => { if (active) setUsers([]); });
    return () => { active = false; };
  }, [token, newChatOpen, newGroupOpen, groupInfoOpen]);

  // ─── handlers ─────────────────────────────────────────────────────────────

  const handleSend = async () => {
    const conversationId = selectedId;
    const message = await history.send();
    if (message) setConversations((previous) => previous.map((conversation) => conversation.id === conversationId
      ? { ...conversation, lastMessage: { content: message.content, senderId: message.senderId, createdAt: message.createdAt } }
      : conversation));
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
      if (process.env.NODE_ENV !== "production") console.error("[Mensagens] Erro ao criar conversa direta:", e);
    }
  };

  const startGroup = async () => {
    const name = groupName.trim();
    if (!token || !name) return;
    setGroupAvatarUploadError(null);
    setUploadingGroupAvatar(true);
    const fileToUpload = groupAvatarFile;
    try {
      const { conversation } = await createGroupConversation(token, name, groupUserIds, groupAvatarUrl.trim() || undefined);
      setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
      setSelectedId(conversation.id);
      setNewGroupOpen(false);
      setGroupName("");
      setGroupUserIds([]);
      setGroupAvatarUrl("");
      setGroupAvatarFile(null);
      if (fileToUpload) {
        try {
          const { conversation: updated } = await uploadGroupAvatar(token, conversation.id, fileToUpload);
          setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        } catch (uploadErr) {
          const msg = uploadErr instanceof Error ? uploadErr.message : "Erro ao enviar foto do grupo";
          setGroupAvatarUploadError(msg);
          setGroupAvatarUploadErrorConvId(conversation.id);
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.error("[Mensagens] Erro ao criar grupo:", e);
    } finally {
      setUploadingGroupAvatar(false);
    }
  };

  const closeNewGroup = () => {
    setNewGroupOpen(false);
    setGroupName("");
    setGroupUserIds([]);
    setGroupAvatarUrl("");
    setGroupAvatarFile(null);
    setGroupAvatarUploadError(null);
    setGroupAvatarUploadErrorConvId(null);
  };

  // ─── render ───────────────────────────────────────────────────────────────

  if (!user) return null;

  const messagesByDay = groupMessagesByDay(messages);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-black via-gray-950 to-black text-white">
      {/* Header */}
      <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 md:gap-4 border-b border-white/10 bg-black/60 px-4 md:px-6 backdrop-blur-xl">
        <Link
          href={defaultPortalDestination(user.role, requestedArea ?? (savedArea?.userId === user.id ? savedArea.area : null))}
          className="rounded-lg px-3 py-2 min-h-[44px] flex items-center text-white/70 transition hover:bg-white/10 hover:text-white touch-manipulation"
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

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Lista de conversas */}
        <aside
          className={cn(
            "flex w-full md:w-96 shrink-0 flex-col border-r border-white/10 bg-black/30 backdrop-blur-sm",
            selectedId != null && "hidden md:flex"
          )}
        >
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
                    ) : (() => {
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
                    })()}
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
                        {formatChatTime(c.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Área da conversa */}
        <section
          className={cn(
            "flex flex-1 flex-col min-w-0 min-h-0 bg-gradient-to-b from-black/50 to-transparent",
            selectedId == null && "hidden md:flex"
          )}
        >
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
              {/* Header da conversa selecionada */}
              <div className="flex h-14 md:h-16 shrink-0 items-center gap-3 border-b border-white/10 bg-black/40 px-4 md:px-6 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="md:hidden flex h-10 min-w-[44px] items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white touch-manipulation -ml-1"
                  aria-label="Voltar para lista de conversas"
                >
                  <span className="text-lg">&#8592;</span>
                  <span className="ml-1 text-sm">Conversas</span>
                </button>
                <div className="h-10 w-10 md:h-12 md:w-12 shrink-0">
                  {selectedConv?.type === "GROUP" ? (
                    getDisplayAvatarUrl(selectedConv?.avatarUrl) ? (
                      <img src={getDisplayAvatarUrl(selectedConv.avatarUrl)!} alt="" className="h-full w-full rounded-full object-cover ring-2 ring-orbit-electric/30" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-orbit-purple/40 to-orbit-electric/40 text-2xl ring-2 ring-orbit-electric/30">👥</span>
                    )
                  ) : (() => {
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
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-lg truncate">{selectedConv?.displayName ?? "Conversa"}</p>
                  {selectedConv?.type === "GROUP" && selectedConv.createdByUserId != null && (() => {
                    const admin = selectedConv.participants.find((p) => p.id === selectedConv.createdByUserId);
                    return admin ? <p className="text-xs text-white/50 truncate">Admin: {admin.name}</p> : null;
                  })()}
                  {selectedConv?.type === "DIRECT" && (otherUserLastSeen || otherParticipant?.lastSeenAt) && (
                    <p className="text-xs text-white/50 truncate">
                      {isOnline(otherParticipant?.lastSeenAt ?? otherUserLastSeen)
                        ? "Online"
                        : `Visto por último: ${formatLastSeen(otherUserLastSeen ?? otherParticipant?.lastSeenAt ?? null)}`}
                    </p>
                  )}
                </div>
                {selectedConv?.type === "GROUP" && (
                  <button
                    type="button"
                    onClick={() => {
                      setGroupInfoOpen(true);
                      if (selectedId === groupAvatarUploadErrorConvId) {
                        setGroupAvatarUploadError(null);
                        setGroupAvatarUploadErrorConvId(null);
                      }
                    }}
                    className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                    aria-label="Info do grupo"
                  >
                    <Info className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Banner de erro no upload do avatar do grupo */}
              {groupAvatarUploadError && selectedId === groupAvatarUploadErrorConvId && (
                <div className="shrink-0 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 mx-4 mt-2 flex items-center justify-between gap-2">
                  <span>{groupAvatarUploadError} Altere em Info do grupo (ícone ao lado).</span>
                  <button
                    type="button"
                    onClick={() => { setGroupAvatarUploadError(null); setGroupAvatarUploadErrorConvId(null); }}
                    className="text-amber-300 hover:text-amber-100"
                    aria-label="Fechar"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Lista de mensagens */}
              <div ref={containerRef} onScroll={onScroll} className="flex-1 overflow-y-auto p-6 space-y-4" style={{ overflowAnchor: "none" }}>
                {history.error && <p role="alert" className="text-sm text-amber-200">{history.error}{!history.loaded && <button type="button" onClick={history.retry} className="ml-2 underline">Tentar novamente</button>}</p>}
                {history.nextCursor && <button type="button" disabled={history.loadingOlder} onClick={history.loadOlder} className="block mx-auto min-h-11 px-4 text-sm text-orbit-electric disabled:opacity-50">{history.loadingOlder ? "Carregando..." : "Carregar mensagens anteriores"}</button>}
                {loadingMessages && messages.length === 0 ? (
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
                            data-chat-message-id={m.id}
                            className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}
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
                                <p className="text-xs opacity-70">{formatChatTime(m.createdAt)}</p>
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
              </div>

              {/* Input de envio */}
              <div className="shrink-0 border-t border-white/10 bg-black/40 p-4 backdrop-blur-sm">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-3"
                >
                  <Input
                    value={input}
                    onChange={(e) => history.setDraft(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    aria-label="Sua mensagem"
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl py-6"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    aria-label="Enviar mensagem"
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

      {/* Modais */}
      {newChatOpen && (
        <NewDirectChatModal
          users={users}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
          onStart={startDirect}
          onClose={() => { setNewChatOpen(false); setSelectedUserId(null); }}
        />
      )}

      {newGroupOpen && (
        <NewGroupChatModal
          users={users}
          groupName={groupName}
          onGroupNameChange={setGroupName}
          groupUserIds={groupUserIds}
          onToggleGroupUser={(id) =>
            setGroupUserIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
          }
          groupAvatarUrl={groupAvatarUrl}
          onGroupAvatarUrlChange={setGroupAvatarUrl}
          groupAvatarFile={groupAvatarFile}
          onGroupAvatarFileChange={setGroupAvatarFile}
          groupAvatarPreviewUrl={groupAvatarPreviewUrl}
          uploading={uploadingGroupAvatar}
          onCreate={startGroup}
          onClose={closeNewGroup}
        />
      )}

      {groupInfoOpen && selectedConv?.type === "GROUP" && selectedId != null && token && (
        <GroupInfoModal
          key={`${user.id}:${selectedId}`}
          token={token}
          conversation={selectedConv}
          currentUserId={user?.id}
          users={users}
          onClose={() => setGroupInfoOpen(false)}
          onUpdate={(updated) => setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))}
          onLeave={() => {
            setGroupInfoOpen(false);
            setSelectedId(null);
            setConversations((previous) => previous.filter((conversation) => conversation.id !== selectedId));
          }}
        />
      )}
    </div>
  );
}
