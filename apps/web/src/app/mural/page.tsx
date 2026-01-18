"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ForumMessage, getForumMessages, searchForumMessages } from "@/lib/api";

export default function MuralPage() {
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = query.trim()
        ? await searchForumMessages(query.trim())
        : await getForumMessages();
      setMessages(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold">
              Rede <span className="gradient-text">Global</span>
            </h1>
            <p className="mt-2 text-white/70">
              Um mural vivo com mensagens de toda a comunidade.
            </p>
          </div>
          <Link
            href="/entrar"
            className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-5 py-3 text-sm font-semibold text-black"
          >
            Entrar para publicar
          </Link>
        </div>

        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por pessoa, cidade ou bairro..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={loadMessages}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20"
            >
              Filtrar
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">
              Carregando mensagens...
            </div>
          )}
          {!loading && messages.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">
              Ainda não há mensagens.
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>{message.author}</span>
                <span>
                  {new Date(message.createdAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {(message.city || message.neighborhood) && (
                <div className="text-xs text-white/50">
                  {[message.neighborhood, message.city].filter(Boolean).join(" • ")}
                </div>
              )}
              <p className="mt-3 text-white/80">{message.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
