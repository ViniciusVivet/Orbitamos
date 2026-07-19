"use client";

import { useState } from "react";
import { Bell, Briefcase, CheckCircle2, FolderOpen, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Notificacao = {
  id: string;
  tipo: "vaga" | "candidatura" | "projeto" | "squad" | "sistema";
  titulo: string;
  descricao: string;
  tempo: string;
  lida: boolean;
};

// Mock notifications — será substituído por dados reais
const mockNotificacoes: Notificacao[] = [
  {
    id: "1",
    tipo: "vaga",
    titulo: "Nova vaga disponível",
    descricao: "Desenvolvedor Frontend React — Freela",
    tempo: "2h atrás",
    lida: false,
  },
  {
    id: "2",
    tipo: "candidatura",
    titulo: "Candidatura aprovada!",
    descricao: "Sua candidatura para Designer UI/UX foi aceita.",
    tempo: "5h atrás",
    lida: false,
  },
  {
    id: "3",
    tipo: "projeto",
    titulo: "Novo projeto atribuído",
    descricao: "Você foi adicionado ao projeto Landing Page X.",
    tempo: "1d atrás",
    lida: true,
  },
  {
    id: "4",
    tipo: "squad",
    titulo: "Membro entrou no squad",
    descricao: "Colaborador C se juntou à equipe.",
    tempo: "2d atrás",
    lida: true,
  },
  {
    id: "5",
    tipo: "sistema",
    titulo: "Bem-vindo à Orbitamos!",
    descricao: "Complete seu perfil para aparecer nas buscas.",
    tempo: "3d atrás",
    lida: true,
  },
];

const TIPO_CONFIG = {
  vaga: { icon: Briefcase, color: "text-orbit-purple", bg: "bg-orbit-purple/15" },
  candidatura: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  projeto: { icon: FolderOpen, color: "text-orbit-electric", bg: "bg-orbit-electric/15" },
  squad: { icon: Users, color: "text-amber-400", bg: "bg-amber-500/15" },
  sistema: { icon: Bell, color: "text-white/50", bg: "bg-white/10" },
};

interface NotificacoesPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificacoesPanel({ open, onClose }: NotificacoesPanelProps) {
  const [notificacoes, setNotificacoes] = useState(mockNotificacoes);
  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const marcarTodasLidas = () => {
    setNotificacoes(notificacoes.map((n) => ({ ...n, lida: true })));
  };

  const marcarLida = (id: string) => {
    setNotificacoes(notificacoes.map((n) => n.id === id ? { ...n, lida: true } : n));
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} aria-hidden />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-screen w-80 max-w-[90vw] flex-col border-l border-white/10 bg-[#0a0c14]/95 backdrop-blur-xl">
        {/* Header */}
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
              <button
                onClick={marcarTodasLidas}
                className="text-[11px] text-orbit-electric hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="size-8 text-white/15" />
              <p className="mt-3 text-sm text-white/40">Sem notificações.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notificacoes.map((n) => {
                const config = TIPO_CONFIG[n.tipo];
                const Icon = config.icon;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => marcarLida(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3.5 text-left transition touch-manipulation min-h-[56px]",
                      n.lida ? "opacity-60" : "bg-white/[0.02] hover:bg-white/[0.04]"
                    )}
                  >
                    <div className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg", config.bg)}>
                      <Icon className={cn("size-3.5", config.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn("truncate text-xs font-medium", n.lida ? "text-white/50" : "text-white")}>
                          {n.titulo}
                        </p>
                        {!n.lida && <span className="size-1.5 shrink-0 rounded-full bg-orbit-electric" />}
                      </div>
                      <p className="mt-0.5 text-[11px] text-white/35 line-clamp-1">{n.descricao}</p>
                      <p className="mt-1 text-[10px] text-white/20">{n.tempo}</p>
                    </div>
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
