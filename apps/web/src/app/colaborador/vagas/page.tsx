"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Briefcase, Search, MapPin, Clock, ChevronRight, Filter } from "lucide-react";
import { getJobs, Job } from "@/lib/api";

const TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "freela", label: "Freela" },
  { value: "clt", label: "CLT" },
  { value: "estágio", label: "Estágio" },
  { value: "pj", label: "PJ" },
];

function getTypeColor(type: string) {
  switch (type?.toLowerCase()) {
    case "freela": return "bg-orbit-purple/15 text-orbit-purple border-orbit-purple/25";
    case "clt": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
    case "estágio": return "bg-amber-500/15 text-amber-400 border-amber-500/25";
    case "pj": return "bg-orbit-electric/15 text-orbit-electric border-orbit-electric/25";
    default: return "bg-white/10 text-white/60 border-white/20";
  }
}

export default function ColaboradorVagas() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    getJobs(token, typeFilter ? { type: typeFilter } : undefined)
      .then(setJobs)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar vagas"))
      .finally(() => setLoading(false));
  }, [token, typeFilter]);

  const filtered = jobs.filter((j) =>
    !search.trim() || j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-purple/70">Oportunidades</p>
        <h1 className="mt-1 text-2xl font-black text-white">Vagas disponíveis</h1>
        <p className="mt-0.5 text-sm text-white/40">Encontre projetos que combinam com suas habilidades.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-orbit-electric/50 focus:ring-2 focus:ring-orbit-electric/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-white/40" />
          <div className="flex gap-1">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value || "all"}
                onClick={() => setTypeFilter(opt.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  typeFilter === opt.value
                    ? "bg-orbit-purple/20 text-orbit-purple border border-orbit-purple/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-white/30">
          {filtered.length} {filtered.length === 1 ? "vaga encontrada" : "vagas encontradas"}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-sm text-white/40">
            <span className="size-5 animate-spin rounded-full border-2 border-orbit-purple border-t-transparent" />
            Buscando vagas...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
          <Briefcase className="mx-auto size-10 text-white/15" />
          <p className="mt-3 text-sm text-white/40">Nenhuma vaga encontrada.</p>
          <p className="mt-1 text-xs text-white/25">
            {search || typeFilter ? "Tente ajustar os filtros." : "Novas oportunidades aparecem em breve."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="group rounded-xl border border-white/8 bg-white/[0.02] p-4 transition-all hover:border-orbit-purple/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-orbit-purple/10">
                    <Briefcase className="size-4 text-orbit-purple" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-orbit-purple transition-colors">
                      {job.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${getTypeColor(job.type)}`}>
                        {job.type}
                      </span>
                      {job.status && (
                        <span className="flex items-center gap-1 text-[11px] text-white/35">
                          <Clock className="size-3" />
                          {job.status}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-white/35">
                        <MapPin className="size-3" />
                        Remoto
                      </span>
                    </div>
                    {job.description && (
                      <p className="mt-2 text-xs leading-relaxed text-white/50 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-white/20 transition-transform group-hover:translate-x-0.5 group-hover:text-orbit-purple" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
