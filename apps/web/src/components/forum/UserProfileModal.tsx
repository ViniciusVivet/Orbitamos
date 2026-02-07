"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicProfile, getDisplayAvatarUrl, type PublicProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge, BookOpen, MessageCircle, X } from "lucide-react";

interface UserProfileModalProps {
  userId: number;
  token: string | null;
  authorName: string;
  onClose: () => void;
}

function formatLastSeen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays < 7) return `Há ${diffDays} dia${diffDays !== 1 ? "s" : ""}`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function UserProfileModal({ userId, token, authorName, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getPublicProfile(token, userId)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [token, userId]);

  const displayName = profile?.name ?? authorName;
  const isColaborador = profile?.role === "FREELANCER";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Perfil do usuário"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/20 bg-gray-900/95 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-5 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4 ring-orbit-electric/30">
                  {profile?.avatarUrl && getDisplayAvatarUrl(profile.avatarUrl) ? (
                    <img
                      src={getDisplayAvatarUrl(profile.avatarUrl)!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orbit-electric to-orbit-purple text-3xl font-bold text-black">
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-xl font-bold text-white">{displayName}</h2>
                {(profile?.city || profile?.state) && (
                  <p className="mt-0.5 text-sm text-white/60">
                    {[profile.city, profile.state].filter(Boolean).join(", ")}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-center gap-2">
                  {isColaborador ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orbit-purple/20 px-2.5 py-1 text-xs font-medium text-orbit-purple">
                      <Badge className="h-3.5 w-3.5" />
                      Colaborador
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orbit-electric/20 px-2.5 py-1 text-xs font-medium text-orbit-electric">
                      <BookOpen className="h-3.5 w-3.5" />
                      Estudante
                    </span>
                  )}
                </div>
                {profile?.lastSeenAt && (
                  <p className="mt-2 text-xs text-white/50">
                    Visto por último: {formatLastSeen(profile.lastSeenAt)}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button asChild className="w-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-black font-semibold hover:opacity-90">
                  <Link href={`/mensagens?openUserId=${userId}`} onClick={onClose}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chamar no PV
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
