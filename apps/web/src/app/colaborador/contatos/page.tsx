"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getContacts,
  markContactAsRead,
  type ContactItem,
} from "@/lib/api";

function formatDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

export default function ColaboradorContatos() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState<number | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    setError("");
    getContacts(token)
      .then(setContacts)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar contatos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token]);

  const handleMarkAsRead = async (c: ContactItem) => {
    if (!token || c.read) return;
    setMarkingId(c.id);
    try {
      const updated = await markContactAsRead(token, c.id);
      setContacts((prev) =>
        prev.map((x) => (x.id === updated.id ? { ...x, read: updated.read } : x))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = contacts.filter((c) => !c.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Contatos</h1>
        <p className="mt-1 text-white/60">
          Mensagens enviadas pelo formulário do site. Marque como lido após responder.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
        </div>
      ) : contacts.length === 0 ? (
        <Card className="border-white/10 bg-gray-900/50">
          <CardContent className="py-12 text-center text-white/60">
            Nenhuma mensagem de contato no momento.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {unreadCount > 0 && (
            <p className="text-sm text-orbit-electric">
              {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
            </p>
          )}
          <div className="grid gap-4">
            {contacts.map((c) => (
              <Card
                key={c.id}
                className={
                  c.read
                    ? "border-white/10 bg-gray-900/50"
                    : "border-orbit-purple/30 bg-gray-900/70"
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg text-white">
                      {c.name}
                      {!c.read && (
                        <span className="ml-2 rounded bg-orbit-purple/30 px-1.5 py-0.5 text-xs font-normal text-orbit-purple">
                          Nova
                        </span>
                      )}
                    </CardTitle>
                    <span className="text-xs text-white/50">{formatDate(c.createdAt)}</span>
                  </div>
                  <CardDescription className="text-white/70">{c.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="whitespace-pre-wrap text-sm text-white/80">{c.message}</p>
                  {!c.read && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orbit-electric/50 text-orbit-electric hover:bg-orbit-electric/10"
                      onClick={() => handleMarkAsRead(c)}
                      disabled={markingId === c.id}
                    >
                      {markingId === c.id ? "Marcando..." : "Marcar como lido"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
