"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  ForumMessage,
  getForumMessages,
  postForumMessage,
  updateForumMessage,
  deleteForumMessage,
  searchForumMessages,
} from "@/lib/api";
import { getFriendlyApiErrorMessage } from "@/lib/utils";

export default function ForumWidget() {
  const { token, isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const loadMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const data = query.trim()
        ? await searchForumMessages(query.trim())
        : await getForumMessages();
      setMessages(data);
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
        const updated = await updateForumMessage(token, editingId, content.trim(), city, neighborhood);
        setMessages((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        setEditingId(null);
      } else {
        const created = await postForumMessage(token, content.trim(), city, neighborhood);
        setMessages((prev) => [created, ...prev]);
      }
      setContent("");
      setCity("");
      setNeighborhood("");
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
    setCity(message.city || "");
    setNeighborhood(message.neighborhood || "");
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

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-3 text-black font-semibold shadow-lg"
        >
          💬 Fórum
        </button>
      )}

      {open && (
        <div className="resize both overflow-auto rounded-2xl border border-white/10 bg-black/85 backdrop-blur-xl shadow-xl w-96 h-[520px] min-w-[280px] min-h-[360px]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <div className="text-sm font-semibold text-white">Fórum</div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <button type="button" onClick={loadMessages} className="hover:text-white">
                Atualizar
              </button>
              <Link href="/forum" className="hover:text-white">
                Abrir
              </Link>
              <button type="button" onClick={() => setOpen(false)} className="hover:text-white">
                Fechar
              </button>
            </div>
          </div>

          <div className="px-4 py-3">
            {!isAuthenticated && (
              <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/70">
                Faça login para publicar. Você pode ler todas as mensagens.
                <Link href="/entrar" className="ml-2 text-orbit-electric hover:underline">
                  Entrar
                </Link>
              </div>
            )}

            {error && (
              <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200">
                {error}
              </div>
            )}

            <div className="mb-3 space-y-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadMessages();
                  }
                }}
                placeholder="Buscar por pessoa ou cidade..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder:text-white/40 focus:outline-none"
              />
              {loading ? (
                <div className="text-xs text-white/60">Carregando mensagens...</div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="text-xs text-white/60">Ainda não há mensagens.</div>
                  )}
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/80">
                      <div className="flex items-center justify-between text-[10px] text-white/50">
                        <span>{message.author}</span>
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                      {(message.city || message.neighborhood) && (
                        <div className="text-[10px] text-white/40">
                          {[message.neighborhood, message.city].filter(Boolean).join(" • ")}
                        </div>
                      )}
                      <div className="mt-1">{message.content}</div>
                      {user?.id === message.userId && (
                        <div className="mt-2 flex gap-2 text-[10px] text-white/50">
                          <button type="button" onClick={() => handleEdit(message)} className="hover:text-white">
                            Editar
                          </button>
                          <button type="button" onClick={() => handleDelete(message.id)} className="hover:text-white">
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Cidade"
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white placeholder:text-white/40 focus:outline-none"
                  disabled={!isAuthenticated || sending}
                />
                <input
                  value={neighborhood}
                  onChange={(event) => setNeighborhood(event.target.value)}
                  placeholder="Bairro"
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white placeholder:text-white/40 focus:outline-none"
                  disabled={!isAuthenticated || sending}
                />
              </div>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={isAuthenticated ? "Escreva sua mensagem..." : "Faça login para postar"}
                className="h-16 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white placeholder:text-white/40 focus:outline-none"
                disabled={!isAuthenticated || sending}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!isAuthenticated || sending || !content.trim()}
                className="w-full rounded-lg bg-gradient-to-r from-orbit-electric to-orbit-purple py-2 text-xs font-semibold text-black disabled:opacity-50"
              >
                {sending ? "Enviando..." : editingId ? "Salvar" : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
