"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { FolderOpen, Circle, ArrowRight, CheckCircle2, Users } from "lucide-react";
import { getMyProjects, Project } from "@/lib/api";
import Link from "next/link";

type KanbanColumn = "a-fazer" | "em-andamento" | "concluido";

const COLUMNS: { key: KanbanColumn; label: string; color: string; dot: string }[] = [
  { key: "a-fazer", label: "A fazer", color: "border-white/10", dot: "bg-white/40" },
  { key: "em-andamento", label: "Em andamento", color: "border-orbit-electric/30", dot: "bg-orbit-electric" },
  { key: "concluido", label: "Concluído", color: "border-emerald-500/30", dot: "bg-emerald-400" },
];

function classifyProject(p: Project): KanbanColumn {
  const status = p.status?.toLowerCase() ?? "";
  if (status.includes("encerrad") || status.includes("conclu") || status.includes("finaliz")) return "concluido";
  if (status.includes("andamento") || status.includes("ativo") || status.includes("progress")) return "em-andamento";
  return "a-fazer";
}

export default function ColaboradorProjetos() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"kanban" | "lista">("kanban");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    getMyProjects(token)
      .then(setProjects)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar projetos"))
      .finally(() => setLoading(false));
  }, [token]);

  const grouped: Record<KanbanColumn, Project[]> = {
    "a-fazer": [],
    "em-andamento": [],
    "concluido": [],
  };
  projects.forEach((p) => {
    grouped[classifyProject(p)].push(p);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-electric/70">Projetos</p>
          <h1 className="mt-1 text-2xl font-black text-white">Meus projetos</h1>
          <p className="mt-0.5 text-sm text-white/40">Acompanhe o status de cada projeto.</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          <button
            onClick={() => setView("kanban")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              view === "kanban" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView("lista")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              view === "lista" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-sm text-white/40">
            <span className="size-5 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
            Carregando projetos...
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <FolderOpen className="mx-auto size-10 text-white/15" />
          <p className="mt-3 text-sm text-white/40">Nenhum projeto conectado ainda.</p>
          <p className="mt-1 text-xs text-white/25">Candidate-se a vagas para participar de projetos.</p>
          <Link href="/colaborador/vagas" className="mt-3 inline-block text-xs text-orbit-electric hover:underline">
            Ver vagas
          </Link>
        </div>
      ) : view === "kanban" ? (
        /* Kanban view */
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.key} className={`rounded-xl border ${col.color} bg-white/[0.015] p-3`}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`size-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-bold text-white/70">{col.label}</span>
                <span className="ml-auto text-[10px] text-white/30">{grouped[col.key].length}</span>
              </div>
              <div className="space-y-2">
                {grouped[col.key].length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/8 py-6 text-center">
                    <p className="text-[11px] text-white/25">Nenhum projeto</p>
                  </div>
                ) : (
                  grouped[col.key].map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-white/8 bg-white/[0.03] p-3 transition hover:border-white/15"
                    >
                      <p className="text-sm font-medium text-white">{p.title}</p>
                      {p.description && (
                        <p className="mt-1 text-[11px] text-white/40 line-clamp-2">{p.description}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-white/25">{p.status}</span>
                        <Link
                          href="/colaborador/squad"
                          className="flex items-center gap-1 text-[10px] text-orbit-electric hover:underline"
                        >
                          <Users className="size-3" /> Equipe
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="space-y-2">
          {projects.map((p) => {
            const col = COLUMNS.find((c) => c.key === classifyProject(p))!;
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-white/15"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.05]">
                  {classifyProject(p) === "concluido" ? (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  ) : classifyProject(p) === "em-andamento" ? (
                    <ArrowRight className="size-4 text-orbit-electric" />
                  ) : (
                    <Circle className="size-4 text-white/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{p.title}</p>
                  <p className="mt-0.5 text-[11px] text-white/35">{p.description || p.status}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                  classifyProject(p) === "concluido"
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                    : classifyProject(p) === "em-andamento"
                    ? "border-orbit-electric/25 bg-orbit-electric/10 text-orbit-electric"
                    : "border-white/15 bg-white/5 text-white/50"
                }`}>
                  <span className={`size-1.5 rounded-full ${col.dot}`} />
                  {col.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
