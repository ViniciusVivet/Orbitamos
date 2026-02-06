"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  ForumMessage,
  getForumMessages,
  searchForumMessages,
  postForumMessage,
  updateForumMessage,
  deleteForumMessage,
} from "@/lib/api";
import { getFriendlyApiErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays} dia${diffDays !== 1 ? "s" : ""} atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function AuthorAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orbit-electric to-orbit-purple text-sm font-bold text-black">
      {initials || "?"}
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
  const [content, setContent] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadMessages = useCallback(async (searchTerm?: string) => {
    setLoading(true);
    setError("");
    try {
      const data = searchTerm?.trim()
        ? await searchForumMessages(searchTerm.trim())
        : await getForumMessages();
      setMessages(data);
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMessages(query);
  };

  const handleSend = async () => {
    if (!token || !content.trim()) return;
    setSending(true);
    setError("");
    try {
      if (editingId) {
        const updated = await updateForumMessage(token, editingId, content.trim(), city, neighborhood);
        setMessages((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
        setEditingId(null);
      } else {
        const created = await postForumMessage(token, content.trim(), city, neighborhood);
        setMessages((prev) => [created, ...prev]);
      }
      setContent("");
      setCity("");
      setNeighborhood("");
    } catch (err) {
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
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(getFriendlyApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900/50 to-black text-white">
      <section className="container mx-auto px-4 py-10 md:py-14">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Fórum da <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">Comunidade</span>
          </h1>
          <p className="mt-3 max-w-2xl text-white/70">
            Dúvidas, dicas e troca de experiências. Conecte-se com quem está na mesma jornada.
          </p>
        </header>

        <div className="mx-auto max-w-3xl space-y-8">
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

          {isAuthenticated ? (
            <Card className="border-orbit-electric/20 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-orbit-electric">Nova publicação</CardTitle>
                <CardDescription>
                  {editingId ? "Editando sua mensagem" : "Compartilhe uma dúvida ou dica"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade (opcional)"
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                    disabled={sending}
                  />
                  <Input
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Bairro (opcional)"
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                    disabled={sending}
                  />
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="O que você quer compartilhar?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-orbit-electric/50 focus:outline-none focus:ring-1 focus:ring-orbit-electric/30 disabled:opacity-50"
                  disabled={sending}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !content.trim()}
                    className="bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {sending ? "Enviando..." : editingId ? "Salvar" : "Publicar"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={() => { setEditingId(null); setContent(""); setCity(""); setNeighborhood(""); }} className="border-white/20 text-white hover:bg-white/10">
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
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
          )}

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
            ) : messages.length === 0 ? (
              <Card className="border-white/10 bg-white/5">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-4xl opacity-50">💬</span>
                  <p className="mt-3 font-medium text-white/80">Nenhuma publicação ainda</p>
                  <p className="mt-1 text-sm text-white/50">Seja o primeiro a compartilhar uma dúvida ou dica.</p>
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-4">
                {messages.map((message) => (
                  <li key={message.id}>
                    <Card className="border-white/10 bg-gray-900/40 transition-colors hover:border-white/15 hover:bg-gray-900/60">
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          <AuthorAvatar name={message.author} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold text-white/95">{message.author}</span>
                              <span className="text-xs text-white/50">{formatDate(message.createdAt)}</span>
                            </div>
                            {(message.city || message.neighborhood) && (
                              <p className="mt-0.5 text-xs text-white/50">
                                {[message.neighborhood, message.city].filter(Boolean).join(" • ")}
                              </p>
                            )}
                            <p className="mt-3 whitespace-pre-wrap text-white/90">{message.content}</p>
                            {user?.id === message.userId && (
                              <div className="mt-4 flex gap-3 text-sm">
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
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
