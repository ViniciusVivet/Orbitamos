"use client";

import Link from "next/link";
import { Bell, BookOpen, Award, Users, Sparkles, Send, FolderKanban, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { markAllNotificationsRead, markNotificationRead, type NotificationItem } from "@/lib/workspace";

// Mapeia o `type` cru vindo de v3_notifications para um visual (icone + cor).
const TIPO_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  aula: { icon: BookOpen, color: "text-orbit-electric", bg: "bg-orbit-electric/15" },
  lesson: { icon: BookOpen, color: "text-orbit-electric", bg: "bg-orbit-electric/15" },
  conquista: { icon: Award, color: "text-amber-400", bg: "bg-amber-500/15" },
  achievement: { icon: Award, color: "text-amber-400", bg: "bg-amber-500/15" },
  comunidade: { icon: Users, color: "text-orbit-purple", bg: "bg-orbit-purple/15" },
  application: { icon: Send, color: "text-orbit-purple", bg: "bg-orbit-purple/15" },
  project: { icon: FolderKanban, color: "text-orbit-electric", bg: "bg-orbit-electric/15" },
  sistema: { icon: Sparkles, color: "text-white/50", bg: "bg-white/10" },
  system: { icon: Sparkles, color: "text-white/50", bg: "bg-white/10" },
};

function configFor(type: string) {
  return TIPO_CONFIG[type] ?? TIPO_CONFIG.system;
}

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min atrás`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface NotificacoesPanelProps {
  open: boolean;
  onClose: () => void;
  items: NotificationItem[];
  onChange: () => void;
}

export default function NotificacoesPanel({ open, onClose, items, onChange }: NotificacoesPanelProps) {
  if (!open) return null;
  const naoLidas = items.filter((n) => !n.readAt).length;

  const marcarTodasLidas = async () => {
    await markAllNotificationsRead();
    onChange();
  };

  const abrir = async (item: NotificationItem) => {
    if (!item.readAt) {
      await markNotificationRead(item.id);
      onChange();
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} aria-hidden />
      <div className="fixed right-0 top-0 z-50 flex h-screen w-80 max-w-[90vw] flex-col border-l border-white/10 bg-[#0a0c14]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-orbit-electric" />
            <span className="text-sm font-bold text-white">Notificações</span>
            {naoLidas > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-orbit-electric text-[10px] font-bold text-black">
                {naoLidas}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {naoLidas > 0 && (
              <button onClick={marcarTodasLidas} className="text-[11px] text-orbit-electric hover:underline">
                Marcar todas
              </button>
            )}
            <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="size-8 text-white/15" />
              <p className="mt-3 text-sm text-white/40">Sem notificações.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {items.map((n) => {
                const config = configFor(n.type);
                const Icon = config.icon;
                const inner = (
                  <div
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3.5 text-left transition touch-manipulation min-h-[56px]",
                      n.readAt ? "opacity-60" : "bg-white/[0.02] hover:bg-white/[0.04]"
                    )}
                  >
                    <div className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg", config.bg)}>
                      <Icon className={cn("size-3.5", config.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn("truncate text-xs font-medium", n.readAt ? "text-white/50" : "text-white")}>
                          {n.title}
                        </p>
                        {!n.readAt && <span className="size-1.5 shrink-0 rounded-full bg-orbit-electric" />}
                      </div>
                      <p className="mt-0.5 text-[11px] text-white/35 line-clamp-1">{n.body}</p>
                      <p className="mt-1 text-[10px] text-white/20">{tempoRelativo(n.createdAt)}</p>
                    </div>
                  </div>
                );
                return n.href ? (
                  <Link key={n.id} href={n.href} onClick={() => abrir(n)} className="block">
                    {inner}
                  </Link>
                ) : (
                  <button key={n.id} type="button" onClick={() => abrir(n)} className="w-full">
                    {inner}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function NotificacaoBadge({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative grid size-10 place-items-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white touch-manipulation"
      aria-label="Notificações"
    >
      <Bell className="size-4" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-orbit-electric text-[9px] font-bold text-black">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
