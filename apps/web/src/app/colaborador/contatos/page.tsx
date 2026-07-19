"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Mail, Search, Check, Inbox, Clock } from "lucide-react";
import {
  getContacts,
  markContactAsRead,
  type ContactItem,
} from "@/lib/api";

function formatDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return s;
  }
}

function timeAgo(s: string) {
  try {
    const diff = Date.now() - new Date(s).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  } catch {
    return s;
  }
}

export default function ColaboradorContatos() {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const load = () => {
    if (!token || !user?.isInternal) return;
    setLoading(true);
    setError("");
    getContacts(token)
      .then(setContacts)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar contatos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token, user?.isInternal]);

  const handleMarkAsRead = async (c: ContactItem) => {
    if (!token || c.read) return;
    setMarkingId(c.id);
    try {
      const updated = await markContactAsRead(token, c.id);
      setContacts((prev) => prev.map((x) => (x.id === updated.id ? { ...x, read: updated.read } : x)));
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = contacts.filter((c) => !c.read).length;

  const filtered = contacts
    .filter((c) => {
      if (filter === "unread") return !c.read;
      if (filter === "read") return c.read;
      return true;
    })
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.message.toLowerCase().includes(q);
    });

  if (!user?.isInternal) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-white/40">Restrito</p>
          <h1 className="mt-1 text-2xl font-black text-white">Contatos</h1>
          <p className="mt-0.5 text-sm text-white/40">Acesso restrito a perfis internos da Orbitamos.</p>
        </div>
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <Inbox className="mx-auto size-10 text-white/15" />
          <p className="mt-3 text-sm text-white/40">Sem permissão para visualizar contatos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-electric/70">Inbox</p>
          <h1 className="mt-1 text-2xl font-black text-white">Contatos</h1>
          <p className="mt-0.5 text-sm text-white/40">Mensagens do formulário do site.</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-orbit-electric/25 bg-orbit-electric/10 px-3 py-1.5">
            <span className="size-2 rounded-full bg-orbit-electric animate-pulse" />
            <span className="text-xs font-bold text-orbit-electric">{unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}</span>
          </div>
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou mensagem..."
            className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-orbit-electric/50"
          />
        </div>
        <div className="flex gap-1">
          {([["all", "Todos"], ["unread", "Não lidos"], ["read", "Lidos"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === val
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-sm text-white/40">
            <span className="size-5 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
            Carregando...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <Mail className="mx-auto size-10 text-white/15" />
          <p className="mt-3 text-sm text-white/40">Nenhum contato encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl border p-4 transition ${
                c.read
                  ? "border-white/5 bg-white/[0.01]"
                  : "border-orbit-electric/20 bg-orbit-electric/[0.03]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${
                    c.read ? "bg-white/[0.06]" : "bg-orbit-electric/15"
                  }`}>
                    <Mail className={`size-4 ${c.read ? "text-white/30" : "text-orbit-electric"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${c.read ? "text-white/60" : "text-white"}`}>
                        {c.name}
                      </p>
                      {!c.read && (
                        <span className="rounded-full bg-orbit-electric/20 px-1.5 py-0.5 text-[9px] font-bold text-orbit-electric">
                          NOVA
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/35">{c.email}</p>
                    <p className="mt-1.5 text-xs text-white/50 line-clamp-2 leading-relaxed">{c.message}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-white/25">
                    <Clock className="size-3" />
                    {timeAgo(c.createdAt)}
                  </span>
                  {!c.read && (
                    <button
                      onClick={() => handleMarkAsRead(c)}
                      disabled={markingId === c.id}
                      className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      <Check className="size-3" />
                      {markingId === c.id ? "..." : "Lido"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
