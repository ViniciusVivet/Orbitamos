"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ForumMessage, getForumMessages, postForumMessage } from "@/lib/api";

export default function ForumWidget() {
  const { token, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");

  const loadMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getForumMessages();
      setMessages(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar mensagens";
      setError(message);
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
      const created = await postForumMessage(token, content.trim());
      setMessages((prev) => [created, ...prev]);
      setContent("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar mensagem";
      setError(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-3 text-black font-semibold shadow-lg"
        >
          💬 Mural
        </button>
      )}

      {open && (
        <div className="resize both overflow-auto rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-xl w-80 h-96 min-w-[260px] min-h-[300px]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <div className="text-sm font-semibold text-white">Mural Global</div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <button type="button" onClick={loadMessages} className="hover:text-white">
                Atualizar
              </button>
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
              {loading ? (
                <div className="text-xs text-white/60">Carregando mensagens...</div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="text-xs text-white/60">Ainda não há mensagens.</div>
                  )}
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/80">
                      <div className="text-[10px] text-white/50">{message.author}</div>
                      <div className="mt-1">{message.content}</div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="space-y-2">
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
                {sending ? "Enviando..." : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
