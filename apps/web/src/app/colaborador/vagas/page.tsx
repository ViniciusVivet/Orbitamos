"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Search, MapPin, Clock, Filter, Send, X } from "lucide-react";
import { applyToJob, getCollaboratorProfile, getJobs, getMyApplications, Job, type CollaboratorProfile } from "@/lib/api";

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
  const [selected, setSelected] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [profile, setProfile] = useState<CollaboratorProfile | null>(null);

  const submitApplication = async () => {
    if (!selected) return;
    setSubmitting(true); setError("");
    try { await applyToJob(selected.id, coverLetter); setAppliedJobIds((ids) => [...ids, selected.id]); setSuccess(`Candidatura enviada para ${selected.title}.`); setSelected(null); setCoverLetter(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Erro ao enviar candidatura"); }
    finally { setSubmitting(false); }
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    Promise.all([getJobs(token, typeFilter ? { type: typeFilter } : undefined), getMyApplications(), getCollaboratorProfile()])
      .then(([availableJobs, applications, professionalProfile]) => {
        setJobs(availableJobs);
        setProfile(professionalProfile);
        setAppliedJobIds(applications.filter((item) => item.status !== "withdrawn").map((item) => item.jobId));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar vagas"))
      .finally(() => setLoading(false));
  }, [token, typeFilter]);

  const matchScore = (job: Job) => {
    if (!profile) return 0;
    const profileSkills = profile.skills.map((skill) => skill.toLowerCase());
    const overlap = (job.skills ?? []).filter((skill) => profileSkills.includes(skill.toLowerCase())).length;
    const skillScore = job.skills?.length ? Math.round((overlap / job.skills.length) * 60) : 20;
    const typeScore = !profile.preferredJobTypes.length || profile.preferredJobTypes.includes(job.type.toLowerCase()) ? 20 : 0;
    const modelScore = !profile.preferredWorkModels.length || profile.preferredWorkModels.includes((job.workModel ?? "remoto").toLowerCase()) ? 20 : 0;
    return Math.min(100, skillScore + typeScore + modelScore);
  };

  const filtered = jobs.filter((j) =>
    !search.trim() || j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.description?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => matchScore(b) - matchScore(a));

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
            placeholder="Buscar vagas..."
            className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-orbit-electric/50 focus:ring-2 focus:ring-orbit-electric/10"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <Filter className="size-3.5 shrink-0 text-white/40" />
          <div className="flex gap-1">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value || "all"}
                onClick={() => setTypeFilter(opt.value)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition touch-manipulation min-h-[36px] ${
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
      {success && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>}

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
                    {matchScore(job) >= 40 && <span className="mt-1 inline-block text-[10px] font-bold text-emerald-300">{matchScore(job)}% compatível com seu perfil</span>}
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
                    <Link href={`/colaborador/vagas/${job.id}`} className="mt-3 inline-block text-xs font-semibold text-orbit-electric hover:underline">Ver detalhes completos</Link>
                  </div>
                </div>
                {appliedJobIds.includes(job.id) ? <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-300"><Send className="size-3.5"/>Já enviada</span> : <button onClick={() => { setSelected(job); setError(""); setSuccess(""); }} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-orbit-purple px-3 text-xs font-bold text-white transition hover:brightness-110"><Send className="size-3.5"/>Candidatar</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0e17] p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-orbit-purple">Candidatura</p><h2 className="mt-1 text-lg font-black text-white">{selected.title}</h2><p className="mt-1 text-xs text-white/40">{selected.type} · {selected.workModel || "Remoto"}</p></div><button onClick={() => setSelected(null)} className="grid size-10 place-items-center rounded-lg text-white/40 hover:bg-white/10" aria-label="Fechar"><X className="size-4"/></button></div><label className="mt-5 block text-xs font-semibold text-white/60">Apresentação <span className="font-normal text-white/30">(opcional)</span></label><textarea value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} rows={6} maxLength={1500} placeholder="Conte brevemente por que esta oportunidade combina com você..." className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-orbit-purple/50"/><p className="mt-1 text-right text-[10px] text-white/25">{coverLetter.length}/1500</p><div className="mt-5 flex justify-end gap-2"><button onClick={()=>setSelected(null)} className="min-h-11 rounded-xl border border-white/10 px-4 text-xs text-white/60">Cancelar</button><button onClick={submitApplication} disabled={submitting} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-orbit-electric to-orbit-purple px-5 text-xs font-bold text-black disabled:opacity-50"><Send className="size-4"/>{submitting?"Enviando...":"Enviar candidatura"}</button></div></div></div>}
    </div>
  );
}
