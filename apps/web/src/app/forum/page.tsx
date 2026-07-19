"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  Compass,
  Edit3,
  Lightbulb,
  LoaderCircle,
  MessageCircle,
  PenLine,
  RefreshCw,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteForumMessage,
  ForumMessage,
  getDisplayAvatarUrl,
  getForumMessages,
  postForumMessage,
  searchForumMessages,
  updateForumMessage,
  type UserId,
} from "@/lib/api";
import { formatRelativeDate, getFriendlyApiErrorMessage } from "@/lib/utils";
import UserProfileModal from "@/components/forum/UserProfileModal";

const CONTENT_LIMIT = 2000;
const TITLE_LIMIT = 100;

const TOPICS = [
  { label: "Dúvidas", emoji: "❓", color: "#00D4FF", icon: Lightbulb },
  { label: "Projetos", emoji: "🚀", color: "#8B5CF6", icon: Rocket },
  { label: "Código", emoji: "💻", color: "#38BDF8", icon: Code2 },
  { label: "Carreira", emoji: "🧭", color: "#F59E0B", icon: Compass },
  { label: "Conquistas", emoji: "✨", color: "#10B981", icon: Sparkles },
] as const;

type FeedSort = "recent" | "active";

function AuthorAvatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const displayUrl = getDisplayAvatarUrl(avatarUrl ?? undefined);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orbit-electric to-orbit-purple font-bold text-[#02050b] ring-2 ring-white/10 ${
        size === "sm" ? "h-8 w-8 text-[11px]" : "h-11 w-11 text-sm"
      }`}
    >
      {displayUrl && !imgFailed ? (
        <Image
          src={displayUrl}
          alt={`Foto de ${name}`}
          fill
          sizes={size === "sm" ? "32px" : "44px"}
          unoptimized
          className="object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
}

function locationLabel(message: ForumMessage) {
  return [message.neighborhood, message.city, message.authorState].filter(Boolean).join(" • ");
}

function categoryFor(message: ForumMessage) {
  return TOPICS.find(
    (topic) =>
      topic.emoji === message.topicEmoji ||
      topic.label.toLowerCase() === message.topicTitle?.trim().toLowerCase()
  );
}

export default function ForumPage() {
  const { token, isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [repliesByParent, setRepliesByParent] = useState<Record<number, ForumMessage[]>>({});
  const [expandedThreads, setExpandedThreads] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [sort, setSort] = useState<FeedSort>("recent");
  const [activeTopic, setActiveTopic] = useState<string>("Todos");
  const [composerOpen, setComposerOpen] = useState(false);
  const [content, setContent] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [topicColor, setTopicColor] = useState<string>(TOPICS[0].color);
  const [topicEmoji, setTopicEmoji] = useState<string>(TOPICS[0].emoji);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [profileUserId, setProfileUserId] = useState<UserId | null>(null);
  const loadedRepliesRef = useRef<Set<number>>(new Set());
  const composerRef = useRef<HTMLDivElement>(null);

  const loadReplies = useCallback(async (parentId: number) => {
    try {
      const replies = await getForumMessages(parentId);
      setRepliesByParent((current) => ({
        ...current,
        [parentId]: replies.filter((reply) => reply.parentId === parentId),
      }));
    } catch {
      setRepliesByParent((current) => ({ ...current, [parentId]: [] }));
    }
  }, []);

  const loadMessages = useCallback(
    async (searchTerm = "", isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      loadedRepliesRef.current = new Set();

      try {
        const trimmedSearch = searchTerm.trim();
        const data = trimmedSearch
          ? await searchForumMessages(trimmedSearch)
          : await getForumMessages();
        setMessages(data);
        setActiveQuery(trimmedSearch);
      } catch (loadError) {
        setError(getFriendlyApiErrorMessage(loadError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    messages
      .filter((message) => message.parentId == null && !loadedRepliesRef.current.has(message.id))
      .forEach((message) => {
        loadedRepliesRef.current.add(message.id);
        void loadReplies(message.id);
      });
  }, [loadReplies, messages]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const rootMessages = useMemo(() => messages.filter((message) => message.parentId == null), [messages]);

  const visibleMessages = useMemo(() => {
    const byTopic =
      activeTopic === "Todos"
        ? rootMessages
        : rootMessages.filter((message) => categoryFor(message)?.label === activeTopic);

    return [...byTopic].sort((left, right) => {
      if (sort === "active") {
        const replyDifference =
          (repliesByParent[right.id]?.length ?? 0) - (repliesByParent[left.id]?.length ?? 0);
        if (replyDifference !== 0) return replyDifference;
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [activeTopic, repliesByParent, rootMessages, sort]);

  const contributors = useMemo(() => {
    const people = new Map<UserId, { id: UserId; name: string; avatar?: string | null; posts: number }>();

    [...rootMessages, ...Object.values(repliesByParent).flat()].forEach((message) => {
      const current = people.get(message.userId);
      people.set(message.userId, {
        id: message.userId,
        name: message.author,
        avatar: message.authorAvatarUrl,
        posts: (current?.posts ?? 0) + 1,
      });
    });

    return [...people.values()].sort((left, right) => right.posts - left.posts).slice(0, 5);
  }, [repliesByParent, rootMessages]);

  const replyCount = useMemo(
    () => Object.values(repliesByParent).reduce((total, replies) => total + replies.length, 0),
    [repliesByParent]
  );

  const resetComposer = useCallback(() => {
    setContent("");
    setTopicTitle("");
    setTopicColor(TOPICS[0].color);
    setTopicEmoji(TOPICS[0].emoji);
    setEditingId(null);
    setReplyingToId(null);
    setError("");
  }, []);

  const openComposer = () => {
    resetComposer();
    setComposerOpen(true);
    window.setTimeout(() => composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const chooseTopic = (topic: (typeof TOPICS)[number]) => {
    setTopicColor(topic.color);
    setTopicEmoji(topic.emoji);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    void loadMessages(query);
  };

  const handleClearSearch = () => {
    setQuery("");
    void loadMessages("");
  };

  const handleSend = async () => {
    const trimmedContent = content.trim();
    if (!token || !trimmedContent || sending) return;

    setSending(true);
    setError("");

    try {
      if (editingId) {
        const updated = await updateForumMessage(
          token,
          editingId,
          trimmedContent,
          undefined,
          undefined,
          { topicTitle: topicTitle.trim(), topicColor, topicEmoji }
        );
        setMessages((current) =>
          current.map((message) => (message.id === editingId ? updated : message))
        );
        setNotice("Publicação atualizada com sucesso.");
      } else if (replyingToId) {
        const parentId = replyingToId;
        const created = await postForumMessage(token, trimmedContent, undefined, undefined, { parentId });
        setRepliesByParent((current) => ({
          ...current,
          [parentId]: [...(current[parentId] ?? []), created],
        }));
        setExpandedThreads((current) => new Set(current).add(parentId));
        setNotice("Resposta publicada na conversa.");
      } else {
        const created = await postForumMessage(token, trimmedContent, undefined, undefined, {
          topicTitle: topicTitle.trim() || undefined,
          topicColor,
          topicEmoji,
        });
        setMessages((current) => [created, ...current]);
        setNotice("Publicação enviada para a comunidade.");
      }

      resetComposer();
      setComposerOpen(false);
    } catch (sendError) {
      setError(getFriendlyApiErrorMessage(sendError));
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (message: ForumMessage) => {
    setReplyingToId(null);
    setEditingId(message.id);
    setContent(message.content);
    setTopicTitle(message.topicTitle ?? "");
    setTopicColor(message.topicColor ?? TOPICS[0].color);
    setTopicEmoji(message.topicEmoji ?? TOPICS[0].emoji);
    setComposerOpen(true);
    setError("");
    window.setTimeout(() => composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const handleReply = (message: ForumMessage) => {
    setEditingId(null);
    setReplyingToId(message.id);
    setComposerOpen(false);
    setContent("");
    setError("");
    setExpandedThreads((current) => new Set(current).add(message.id));
  };

  const handleDelete = async (id: number, parentId?: number) => {
    if (!token || sending) return;
    setSending(true);
    setError("");

    try {
      await deleteForumMessage(token, id);
      if (parentId != null) {
        setRepliesByParent((current) => ({
          ...current,
          [parentId]: (current[parentId] ?? []).filter((reply) => reply.id !== id),
        }));
        setNotice("Resposta excluída.");
      } else {
        setMessages((current) => current.filter((message) => message.id !== id));
        setNotice("Publicação excluída.");
      }
      setConfirmDeleteId(null);
    } catch (deleteError) {
      setError(getFriendlyApiErrorMessage(deleteError));
    } finally {
      setSending(false);
    }
  };

  const toggleThread = (id: number) => {
    setExpandedThreads((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03050a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(0,212,255,.10),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(139,92,246,.13),transparent_30%),linear-gradient(180deg,#03050a_0%,#050816_48%,#03050a_100%)]" />
        <div className="absolute left-[8%] top-40 h-52 w-52 rounded-full bg-orbit-electric/5 blur-3xl" />
        <div className="absolute right-[4%] top-[38rem] h-64 w-64 rounded-full bg-orbit-purple/7 blur-3xl" />
      </div>

      {notice && (
        <div
          role="status"
          className="fixed right-4 top-20 z-[70] flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-400/25 bg-[#07130f]/95 px-4 py-3 text-sm text-emerald-100 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
            <Check className="h-4 w-4" />
          </span>
          {notice}
        </div>
      )}

      <section className="relative mx-auto max-w-[1480px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <header className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] px-5 py-5 shadow-[0_20px_80px_rgba(0,0,0,.3)] backdrop-blur-xl sm:px-7 sm:py-6">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(0,212,255,.06),transparent_38%,rgba(139,92,246,.06))]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-display text-xl font-bold tracking-[-0.03em] sm:text-2xl lg:text-3xl">
                Ideias ganham força
                <span className="bg-gradient-to-r from-orbit-electric via-sky-300 to-orbit-purple bg-clip-text text-transparent">
                  {" "}quando entram em órbita.
                </span>
              </h1>
              <p className="mt-1.5 max-w-xl text-xs leading-5 text-white/50 sm:text-sm">
                Tire dúvidas, compartilhe projetos e cresça junto da comunidade.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-4 mr-4 text-xs text-white/40">
                <span><strong className="text-white font-semibold">{rootMessages.length}</strong> posts</span>
                <span><strong className="text-white font-semibold">{replyCount}</strong> respostas</span>
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <strong className="text-white font-semibold">{contributors.length}</strong> ativos
                </span>
              </div>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={openComposer}
                  className="group inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-5 text-sm font-bold text-[#02050b] shadow-[0_8px_30px_rgba(0,212,255,.15)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(139,92,246,.2)]"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Publicar
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              ) : (
                <Link
                  href="/entrar"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-5 text-sm font-bold text-[#02050b]"
                >
                  Entrar
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[230px_minmax(0,1fr)_290px]">
          <aside className="hidden xl:block">
            <div className="sticky top-24 rounded-3xl border border-white/[0.08] bg-white/[0.035] p-3 backdrop-blur-xl">
              <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Explorar
              </p>
              {["Todos", ...TOPICS.map((topic) => topic.label)].map((label) => {
                const topic = TOPICS.find((item) => item.label === label);
                const TopicIcon = topic?.icon ?? MessageCircle;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveTopic(label)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      activeTopic === label
                        ? "bg-white/10 font-semibold text-white shadow-inner"
                        : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.07] bg-black/20"
                      style={{ color: topic?.color ?? "#00D4FF" }}
                    >
                      <TopicIcon className="h-4 w-4" />
                    </span>
                    {label}
                  </button>
                );
              })}

              <div className="mx-3 my-4 h-px bg-white/[0.07]" />
              <div className="rounded-2xl border border-orbit-purple/15 bg-orbit-purple/[0.06] p-3">
                <ShieldCheck className="h-5 w-5 text-orbit-purple" />
                <p className="mt-2 text-sm font-semibold">Espaço de respeito</p>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  Compartilhe conhecimento, acolha dúvidas e preserve a boa conversa.
                </p>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-3 backdrop-blur-xl sm:p-4">
              <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar assunto, pessoa ou lugar..."
                    aria-label="Buscar no fórum"
                    className="h-12 w-full rounded-2xl border border-white/[0.08] bg-black/25 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-orbit-electric/35 focus:ring-4 focus:ring-orbit-electric/[0.06]"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => void loadMessages(activeQuery, true)}
                  disabled={refreshing}
                  className="grid h-12 w-12 place-items-center self-end rounded-2xl border border-white/10 bg-white/[0.04] text-white/55 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                  aria-label="Atualizar publicações"
                  title="Atualizar publicações"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </form>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 xl:hidden">
                {["Todos", ...TOPICS.map((topic) => topic.label)].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setActiveTopic(label)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      activeTopic === label
                        ? "border-orbit-electric/35 bg-orbit-electric/10 text-orbit-electric"
                        : "border-white/10 text-white/50 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {activeQuery && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm text-white/55">
                Resultados para <strong className="text-white">&ldquo;{activeQuery}&rdquo;</strong>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-orbit-electric hover:underline"
                >
                  <X className="h-3.5 w-3.5" />
                  Limpar busca
                </button>
              </div>
            )}

            {isAuthenticated && composerOpen && (
              <div
                ref={composerRef}
                className="mt-5 overflow-hidden rounded-3xl border border-orbit-electric/20 bg-[#07101a]/95 shadow-[0_24px_90px_rgba(0,0,0,.4)]"
              >
                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                  <div>
                    <p className="font-display font-semibold text-white">
                      {editingId ? "Editar publicação" : "Nova publicação"}
                    </p>
                    <p className="mt-0.5 text-xs text-white/40">Conte o contexto para receber respostas melhores.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetComposer();
                      setComposerOpen(false);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white"
                    aria-label="Fechar editor"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-5 p-5">
                  {error && (
                    <div role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="forum-title" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                      Título
                    </label>
                    <input
                      id="forum-title"
                      value={topicTitle}
                      maxLength={TITLE_LIMIT}
                      onChange={(event) => setTopicTitle(event.target.value)}
                      placeholder="Ex.: Como organizar meu primeiro projeto React?"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orbit-electric/40 focus:ring-4 focus:ring-orbit-electric/[0.06]"
                      disabled={sending}
                    />
                  </div>

                  <div>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                      Categoria
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((topic) => (
                        <button
                          key={topic.label}
                          type="button"
                          onClick={() => chooseTopic(topic)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                            topicEmoji === topic.emoji
                              ? "border-white/20 bg-white/10 text-white"
                              : "border-white/[0.07] text-white/45 hover:border-white/15 hover:text-white"
                          }`}
                        >
                          <span>{topic.emoji}</span>
                          {topic.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="forum-content" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                      Mensagem
                    </label>
                    <textarea
                      id="forum-content"
                      value={content}
                      maxLength={CONTENT_LIMIT}
                      rows={6}
                      onChange={(event) => setContent(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) void handleSend();
                      }}
                      placeholder="Explique sua ideia, dúvida ou descoberta. Quanto mais contexto, melhor a conversa."
                      className="w-full resize-y rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-orbit-electric/40 focus:ring-4 focus:ring-orbit-electric/[0.06]"
                      disabled={sending}
                    />
                    <div className="mt-2 flex items-center justify-between text-[11px] text-white/30">
                      <span>Ctrl + Enter para publicar</span>
                      <span>{content.length}/{CONTENT_LIMIT}</span>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        resetComposer();
                        setComposerOpen(false);
                      }}
                      className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={sending || !content.trim()}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-5 text-sm font-bold text-[#02050b] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {sending ? "Enviando..." : editingId ? "Salvar alterações" : "Publicar"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mt-5 flex flex-col gap-4 rounded-3xl border border-orbit-purple/20 bg-orbit-purple/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">A conversa está aberta para leitura.</p>
                  <p className="mt-1 text-sm text-white/50">Entre na sua conta para publicar e responder.</p>
                </div>
                <Link
                  href="/entrar"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orbit-purple/25 bg-orbit-purple/10 px-4 text-sm font-semibold text-purple-200 transition hover:bg-orbit-purple/20"
                >
                  Acessar o Portal
                </Link>
              </div>
            )}

            <div className="mt-7 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold">Conversas da comunidade</h2>
                <p className="mt-1 text-xs text-white/35">
                  {visibleMessages.length} {visibleMessages.length === 1 ? "publicação encontrada" : "publicações encontradas"}
                </p>
              </div>
              <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.035] p-1">
                <button
                  type="button"
                  onClick={() => setSort("recent")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    sort === "recent" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                  }`}
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  Recentes
                </button>
                <button
                  type="button"
                  onClick={() => setSort("active")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    sort === "active" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Ativas
                </button>
              </div>
            </div>

            {error && !composerOpen && (
              <div role="alert" className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <span>{error}</span>
                <button type="button" onClick={() => void loadMessages(activeQuery)} className="font-semibold hover:underline">
                  Tentar novamente
                </button>
              </div>
            )}

            {loading ? (
              <div className="mt-4 space-y-3" aria-label="Carregando publicações">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="animate-pulse rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5">
                    <div className="flex gap-3">
                      <div className="h-11 w-11 rounded-full bg-white/10" />
                      <div className="flex-1 space-y-3">
                        <div className="h-3 w-1/4 rounded bg-white/10" />
                        <div className="h-5 w-2/3 rounded bg-white/10" />
                        <div className="h-3 w-full rounded bg-white/[0.07]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="mt-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-14 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-orbit-electric">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {activeQuery ? "Nenhuma conversa encontrada" : "Essa órbita ainda está livre"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                  {activeQuery
                    ? "Tente buscar outro termo ou limpe os filtros para ver todas as conversas."
                    : "Comece uma conversa e ajude a comunidade a ganhar movimento."}
                </p>
                {isAuthenticated && !activeQuery && (
                  <button type="button" onClick={openComposer} className="mt-5 text-sm font-semibold text-orbit-electric hover:underline">
                    Criar a primeira publicação
                  </button>
                )}
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {visibleMessages.map((message) => {
                  const replies = repliesByParent[message.id] ?? [];
                  const threadOpen = expandedThreads.has(message.id);
                  const isReplying = replyingToId === message.id;
                  const category = categoryFor(message);

                  return (
                    <li
                      key={message.id}
                      className="group overflow-hidden rounded-3xl border border-white/[0.075] bg-[#080d17]/80 shadow-[0_18px_55px_rgba(0,0,0,.18)] transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-[0_22px_70px_rgba(0,0,0,.28)]"
                    >
                      <div className="h-px w-full opacity-70" style={{ background: `linear-gradient(90deg, ${message.topicColor || "#00D4FF"}, transparent 72%)` }} />
                      <article className="p-4 sm:p-5">
                        <div className="flex gap-3 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => setProfileUserId(message.userId)}
                            className="h-fit rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orbit-electric"
                            aria-label={`Ver perfil de ${message.author}`}
                          >
                            <AuthorAvatar name={message.author} avatarUrl={message.authorAvatarUrl} />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <button
                                    type="button"
                                    onClick={() => setProfileUserId(message.userId)}
                                    className="truncate text-sm font-semibold text-white transition hover:text-orbit-electric"
                                  >
                                    {message.author}
                                  </button>
                                  <span className="text-white/15">•</span>
                                  <time className="text-xs text-white/35" dateTime={message.createdAt}>
                                    {formatRelativeDate(message.createdAt)}
                                  </time>
                                </div>
                                {locationLabel(message) && (
                                  <p className="mt-1 truncate text-[11px] text-white/30">{locationLabel(message)}</p>
                                )}
                              </div>

                              {user?.id === message.userId && (
                                <div className="relative flex shrink-0 items-center">
                                  {confirmDeleteId === message.id ? (
                                    <div className="flex items-center gap-1 rounded-xl border border-red-400/20 bg-red-500/10 p-1">
                                      <button
                                        type="button"
                                        onClick={() => void handleDelete(message.id)}
                                        className="rounded-lg px-2 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/15"
                                      >
                                        Excluir
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="rounded-lg px-2 py-1 text-[11px] text-white/50 hover:bg-white/10"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleEdit(message)}
                                        className="grid h-8 w-8 place-items-center rounded-lg text-white/30 transition hover:bg-white/[0.07] hover:text-white"
                                        aria-label="Editar publicação"
                                        title="Editar"
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(message.id)}
                                        className="grid h-8 w-8 place-items-center rounded-lg text-white/30 transition hover:bg-red-500/10 hover:text-red-300"
                                        aria-label="Excluir publicação"
                                        title="Excluir"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {category && (
                                <span
                                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
                                  style={{
                                    color: category.color,
                                    borderColor: `${category.color}35`,
                                    backgroundColor: `${category.color}12`,
                                  }}
                                >
                                  {category.emoji} {category.label}
                                </span>
                              )}
                            </div>

                            {message.topicTitle && (
                              <h3 className="mt-3 break-words font-display text-lg font-semibold leading-snug text-white sm:text-xl">
                                {message.topicTitle}
                              </h3>
                            )}
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-white/67">
                              {message.content}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.055] pt-3">
                              {isAuthenticated && (
                                <button
                                  type="button"
                                  onClick={() => handleReply(message)}
                                  disabled={isReplying}
                                  className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-white/50 transition hover:bg-orbit-electric/[0.07] hover:text-orbit-electric disabled:opacity-50"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  Responder
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => toggleThread(message.id)}
                                className="inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-medium text-white/40 transition hover:bg-white/[0.05] hover:text-white"
                                aria-expanded={threadOpen}
                              >
                                {replies.length} {replies.length === 1 ? "resposta" : "respostas"}
                                {threadOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>
                            </div>

                            {isReplying && (
                              <div className="mt-3 rounded-2xl border border-orbit-electric/20 bg-orbit-electric/[0.045] p-3">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className="text-xs text-orbit-electric">Respondendo a {message.author}</span>
                                  <span className="text-[10px] text-white/25">{content.length}/{CONTENT_LIMIT}</span>
                                </div>
                                {error && (
                                  <div role="alert" className="mb-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                                    {error}
                                  </div>
                                )}
                                <textarea
                                  autoFocus
                                  value={content}
                                  maxLength={CONTENT_LIMIT}
                                  rows={3}
                                  onChange={(event) => setContent(event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Escape") resetComposer();
                                    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) void handleSend();
                                  }}
                                  placeholder="Escreva uma resposta útil..."
                                  className="w-full resize-y rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-orbit-electric/35"
                                  disabled={sending}
                                />
                                <div className="mt-2 flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={resetComposer}
                                    className="min-h-9 rounded-lg px-3 text-xs font-medium text-white/45 hover:bg-white/[0.06] hover:text-white"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleSend()}
                                    disabled={sending || !content.trim()}
                                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-orbit-electric to-orbit-purple px-3 text-xs font-bold text-[#02050b] disabled:opacity-40"
                                  >
                                    {sending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                    Responder
                                  </button>
                                </div>
                              </div>
                            )}

                            {threadOpen && replies.length > 0 && (
                              <div className="relative mt-4 space-y-4 border-l border-white/[0.08] pl-4 sm:pl-5">
                                {replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setProfileUserId(reply.userId)}
                                      className="h-fit rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orbit-electric"
                                      aria-label={`Ver perfil de ${reply.author}`}
                                    >
                                      <AuthorAvatar name={reply.author} avatarUrl={reply.authorAvatarUrl} size="sm" />
                                    </button>
                                    <div className="min-w-0 flex-1 rounded-2xl bg-white/[0.025] px-3 py-2.5">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setProfileUserId(reply.userId)}
                                          className="text-xs font-semibold text-white/80 transition hover:text-orbit-electric"
                                        >
                                          {reply.author}
                                        </button>
                                        <time className="text-[10px] text-white/30" dateTime={reply.createdAt}>
                                          {formatRelativeDate(reply.createdAt)}
                                        </time>
                                        {user?.id === reply.userId && (
                                          <div className="ml-auto">
                                            {confirmDeleteId === reply.id ? (
                                              <span className="flex items-center gap-2 text-[10px]">
                                                <button type="button" onClick={() => void handleDelete(reply.id, message.id)} className="text-red-300 hover:underline">
                                                  Confirmar
                                                </button>
                                                <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-white/35 hover:underline">
                                                  Cancelar
                                                </button>
                                              </span>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => setConfirmDeleteId(reply.id)}
                                                className="text-white/20 transition hover:text-red-300"
                                                aria-label="Excluir resposta"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-white/60">
                                        {reply.content}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orbit-electric" />
                  <h2 className="font-display text-sm font-semibold">Vozes da comunidade</h2>
                </div>
                {contributors.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {contributors.map((contributor) => (
                      <button
                        key={String(contributor.id)}
                        type="button"
                        onClick={() => setProfileUserId(contributor.id)}
                        className="flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-white/[0.05]"
                      >
                        <span className="relative">
                          <AuthorAvatar name={contributor.name} avatarUrl={contributor.avatar} size="sm" />
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#080d17] ring-1 ring-[#080d17]">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-xs font-semibold text-white/75">{contributor.name}</strong>
                          <span className="text-[10px] text-white/30">
                            {contributor.posts} {contributor.posts === 1 ? "contribuição" : "contribuições"}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs leading-5 text-white/35">As pessoas que participarem recentemente aparecerão aqui.</p>
                )}
              </div>

              <div className="overflow-hidden rounded-3xl border border-orbit-electric/15 bg-gradient-to-br from-orbit-electric/[0.07] to-orbit-purple/[0.07] p-5">
                <BookOpen className="h-5 w-5 text-orbit-electric" />
                <h2 className="mt-3 font-display text-sm font-semibold">Uma boa publicação</h2>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-white/45">
                  <li className="flex gap-2"><span className="text-orbit-electric">01</span> Use um título específico.</li>
                  <li className="flex gap-2"><span className="text-orbit-electric">02</span> Explique o que você já tentou.</li>
                  <li className="flex gap-2"><span className="text-orbit-electric">03</span> Responda com respeito e contexto.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {profileUserId != null && token && (
        <UserProfileModal
          userId={profileUserId}
          token={token}
          authorName={
            messages.find((message) => message.userId === profileUserId)?.author ??
            Object.values(repliesByParent).flat().find((reply) => reply.userId === profileUserId)?.author ??
            ""
          }
          onClose={() => setProfileUserId(null)}
        />
      )}
    </div>
  );
}
