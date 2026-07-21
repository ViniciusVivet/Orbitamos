"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle2, Clock, RefreshCw, Send, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyApplications, type ApplicationStatus, type JobApplication } from "@/lib/api";

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, className: "border-amber-500/25 bg-amber-500/10 text-amber-300" },
  reviewing: { label: "Em análise", icon: Clock, className: "border-sky-500/25 bg-sky-500/10 text-sky-300" },
  accepted: { label: "Aceita", icon: CheckCircle2, className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" },
  declined: { label: "Não selecionada", icon: XCircle, className: "border-red-500/25 bg-red-500/10 text-red-300" },
  withdrawn: { label: "Retirada", icon: XCircle, className: "border-white/15 bg-white/5 text-white/50" },
};

export default function ColaboradorCandidaturas() {
  const { token } = useAuth();
  const [items, setItems] = useState<JobApplication[]>([]);
  const [filter, setFilter] = useState<ApplicationStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    if (!token) return;
    setLoading(true); setError("");
    getMyApplications().then(setItems).catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar candidaturas")).finally(() => setLoading(false));
  };
  useEffect(() => {
    if (!token) return;
    getMyApplications().then(setItems).catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar candidaturas")).finally(() => setLoading(false));
  }, [token]);
  const visible = items.filter((item) => !filter || item.status === filter);

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300/70">Pipeline</p><h1 className="mt-1 text-2xl font-black text-white">Minhas candidaturas</h1><p className="mt-1 text-sm text-white/45">Acompanhe cada oportunidade sem perder o próximo passo.</p></div>
      <button onClick={load} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />Atualizar</button>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[["Todas", items.length, ""], ["Em andamento", items.filter(i => i.status === "pending" || i.status === "reviewing").length, "pending"], ["Aceitas", items.filter(i => i.status === "accepted").length, "accepted"], ["Encerradas", items.filter(i => i.status === "declined" || i.status === "withdrawn").length, "declined"]].map(([label,count,value]) => <button key={String(label)} onClick={() => setFilter(value as ApplicationStatus | "")} className={`rounded-xl border p-3 text-left transition ${filter === value ? "border-orbit-electric/40 bg-orbit-electric/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}><span className="block text-xl font-black text-white">{count}</span><span className="text-[11px] text-white/45">{label}</span></button>)}
    </div>
    {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
    {loading ? <div className="py-20 text-center text-sm text-white/40">Carregando candidaturas...</div> : visible.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center"><Send className="mx-auto size-10 text-white/15" /><h2 className="mt-4 font-bold text-white">{items.length ? "Nenhuma candidatura neste filtro" : "Seu pipeline começa aqui"}</h2><p className="mx-auto mt-2 max-w-md text-sm text-white/40">{items.length ? "Escolha outro status para visualizar suas candidaturas." : "Quando você se candidatar a uma vaga, o andamento real aparecerá nesta página."}</p><Link href="/colaborador/vagas" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-orbit-electric px-5 text-xs font-bold text-black">Explorar oportunidades</Link></div> : <div className="space-y-3">{visible.map(item => { const config = statusConfig[item.status]; const Icon = config.icon; return <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/5"><Briefcase className="size-5 text-white/40" /></div><div className="min-w-0 flex-1"><h2 className="font-bold text-white">{item.jobTitle}</h2><p className="mt-1 text-xs text-white/35">{item.jobType} · enviada em {new Date(item.createdAt).toLocaleDateString("pt-BR")}</p>{item.coverLetter && <p className="mt-3 line-clamp-2 text-sm text-white/50">{item.coverLetter}</p>}{item.feedback && <div className="mt-3 rounded-lg border border-white/8 bg-black/20 p-3 text-xs text-white/55"><strong className="text-white/75">Retorno da equipe:</strong> {item.feedback}</div>}</div><span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase ${config.className}`}><Icon className="size-3" />{config.label}</span></div></article>})}</div>}
  </div>;
}
