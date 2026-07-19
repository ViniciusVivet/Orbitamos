"use client";

import { useState } from "react";
import { Send, Clock, CheckCircle2, XCircle, ChevronDown, Briefcase } from "lucide-react";
import Link from "next/link";

type Status = "pendente" | "aceita" | "recusada";

type Candidatura = {
  id: string;
  vaga: string;
  tipo: string;
  dataEnvio: string;
  status: Status;
  feedback?: string;
};

// Mock data — será substituído por dados reais do Supabase
const mockCandidaturas: Candidatura[] = [
  {
    id: "1",
    vaga: "Desenvolvedor Frontend React",
    tipo: "Freela",
    dataEnvio: "2026-07-15",
    status: "pendente",
  },
  {
    id: "2",
    vaga: "Designer UI/UX para MVP",
    tipo: "PJ",
    dataEnvio: "2026-07-10",
    status: "aceita",
    feedback: "Parabéns! Entraremos em contato para alinhar escopo.",
  },
  {
    id: "3",
    vaga: "Backend Node.js - API REST",
    tipo: "Freela",
    dataEnvio: "2026-07-05",
    status: "recusada",
    feedback: "O perfil não atendeu os requisitos técnicos desta vez.",
  },
];

const STATUS_CONFIG = {
  pendente: {
    label: "Pendente",
    icon: Clock,
    classes: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    dot: "bg-amber-400",
  },
  aceita: {
    label: "Aceita",
    icon: CheckCircle2,
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-400",
  },
  recusada: {
    label: "Recusada",
    icon: XCircle,
    classes: "bg-red-500/15 text-red-400 border-red-500/25",
    dot: "bg-red-400",
  },
};

const FILTER_OPTIONS: { value: Status | ""; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "pendente", label: "Pendentes" },
  { value: "aceita", label: "Aceitas" },
  { value: "recusada", label: "Recusadas" },
];

export default function ColaboradorCandidaturas() {
  const [filter, setFilter] = useState<Status | "">("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const candidaturas = mockCandidaturas.filter((c) => !filter || c.status === filter);

  const counts = {
    total: mockCandidaturas.length,
    pendente: mockCandidaturas.filter((c) => c.status === "pendente").length,
    aceita: mockCandidaturas.filter((c) => c.status === "aceita").length,
    recusada: mockCandidaturas.filter((c) => c.status === "recusada").length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-400/70">Pipeline</p>
        <h1 className="mt-1 text-2xl font-black text-white">Minhas candidaturas</h1>
        <p className="mt-0.5 text-sm text-white/40">Acompanhe o status de cada candidatura enviada.</p>
      </div>

      {/* Stats mini */}
      <div className="flex flex-wrap gap-2">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs">
          <span className="text-white/40">Total:</span>{" "}
          <span className="font-bold text-white">{counts.total}</span>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs">
          <span className="text-amber-400/60">Pendentes:</span>{" "}
          <span className="font-bold text-amber-400">{counts.pendente}</span>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs">
          <span className="text-emerald-400/60">Aceitas:</span>{" "}
          <span className="font-bold text-emerald-400">{counts.aceita}</span>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs">
          <span className="text-red-400/60">Recusadas:</span>{" "}
          <span className="font-bold text-red-400">{counts.recusada}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value || "all"}
            onClick={() => setFilter(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === opt.value
                ? "bg-white/10 text-white border border-white/20"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* List */}
      {candidaturas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <Send className="mx-auto size-10 text-white/15" />
          <p className="mt-3 text-sm text-white/40">Nenhuma candidatura {filter ? `com status "${filter}"` : "ainda"}.</p>
          <Link href="/colaborador/vagas" className="mt-2 inline-block text-xs text-orbit-electric hover:underline">
            Ver vagas disponíveis
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {candidaturas.map((c) => {
            const config = STATUS_CONFIG[c.status];
            const StatusIcon = config.icon;
            const isExpanded = expanded === c.id;

            return (
              <div
                key={c.id}
                className="rounded-xl border border-white/8 bg-white/[0.02] transition-all hover:border-white/15"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : c.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.05]">
                    <Briefcase className="size-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{c.vaga}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] text-white/30">{c.tipo}</span>
                      <span className="text-[11px] text-white/20">·</span>
                      <span className="text-[11px] text-white/30">
                        Enviada em {new Date(c.dataEnvio).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${config.classes}`}>
                    <StatusIcon className="size-3" />
                    {config.label}
                  </span>
                  <ChevronDown className={`size-4 text-white/20 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-white/5 px-4 pb-4 pt-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 size-2 rounded-full ${config.dot}`} />
                      <div>
                        <p className="text-xs font-medium text-white/60">
                          {c.status === "pendente" && "Aguardando análise da equipe."}
                          {c.status === "aceita" && "Sua candidatura foi aprovada!"}
                          {c.status === "recusada" && "Candidatura não selecionada."}
                        </p>
                        {c.feedback && (
                          <p className="mt-1.5 text-xs text-white/40 leading-relaxed italic">
                            &ldquo;{c.feedback}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
