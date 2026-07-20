"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, FolderOpen, Send, Clock, TrendingUp, Users, ChevronRight, Zap } from "lucide-react";
import { getMyProjects, getJobs, Project, Job } from "@/lib/api";

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: "electric" | "purple" | "emerald" | "amber";
  href?: string;
}) {
  const colorMap = {
    electric: "from-orbit-electric/20 to-orbit-electric/5 border-orbit-electric/25 text-orbit-electric",
    purple: "from-orbit-purple/20 to-orbit-purple/5 border-orbit-purple/25 text-orbit-purple",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/25 text-emerald-400",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/25 text-amber-400",
  };
  const iconBg = {
    electric: "bg-orbit-electric/15 text-orbit-electric",
    purple: "bg-orbit-purple/15 text-orbit-purple",
    emerald: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400",
  };

  const content = (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-black">{value}</p>
          <p className="mt-0.5 text-xs font-medium text-white/50">{label}</p>
        </div>
        <div className={`grid size-9 place-items-center rounded-lg ${iconBg[color]}`}>
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function ColaboradorInicio() {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([getMyProjects(token), getJobs(token)])
      .then(([p, j]) => {
        setProjects(p);
        setJobs(j);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const vagasAbertas = jobs.length;
  const projetosAtivos = projects.filter((p) => p.status?.toLowerCase() !== "encerrado").length;
  const projetosConcluidos = projects.filter((p) => p.status?.toLowerCase() === "encerrado").length;

  // Mock activity feed
  const atividades = [
    { texto: "Nova vaga disponível: Desenvolvedor Frontend", tempo: "2h atrás", tipo: "vaga" as const },
    { texto: "Seu perfil foi visualizado 3 vezes", tempo: "5h atrás", tipo: "perfil" as const },
    { texto: "Bem-vindo à área do colaborador!", tempo: "Hoje", tipo: "sistema" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-electric/70">Dashboard</p>
          <h1 className="mt-1 text-xl font-black text-white sm:text-3xl">
            Olá, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-white/40">Aqui está o resumo da sua área.</p>
        </div>
        <Link
          href="/colaborador/vagas"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-2.5 text-xs font-bold text-black transition hover:opacity-90 touch-manipulation min-h-[44px]"
        >
          <Zap className="size-3.5" />
          Ver vagas disponíveis
        </Link>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          icon={Briefcase}
          label="Vagas abertas"
          value={loading ? "—" : vagasAbertas}
          color="purple"
          href="/colaborador/vagas"
        />
        <MetricCard
          icon={FolderOpen}
          label="Projetos ativos"
          value={loading ? "—" : projetosAtivos}
          color="electric"
          href="/colaborador/projetos"
        />
        <MetricCard
          icon={Send}
          label="Candidaturas"
          value={loading ? "—" : 0}
          color="amber"
          href="/colaborador/candidaturas"
        />
        <MetricCard
          icon={TrendingUp}
          label="Concluídos"
          value={loading ? "—" : projetosConcluidos}
          color="emerald"
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Vagas em destaque — 2 cols */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Vagas em destaque</h2>
            <Link href="/colaborador/vagas" className="text-[11px] text-orbit-electric hover:underline">
              Ver todas
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-xs text-white/40">
              <span className="size-4 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
              Carregando...
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 py-8 text-center">
              <Briefcase className="mx-auto size-8 text-white/20" />
              <p className="mt-2 text-sm text-white/40">Nenhuma vaga aberta no momento.</p>
              <p className="mt-1 text-xs text-white/25">Novas oportunidades aparecem aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 4).map((j) => (
                <Link
                  key={j.id}
                  href="/colaborador/vagas"
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-3 transition hover:border-orbit-purple/30 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-orbit-purple/15">
                      <Briefcase className="size-3.5 text-orbit-purple" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{j.title}</p>
                      <p className="text-[11px] text-white/40">{j.type}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-white/20" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Atividade recente — 1 col */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="mb-3 text-sm font-bold text-white">Atividade recente</h2>
          <div className="space-y-3">
            {atividades.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`size-2 rounded-full ${
                    a.tipo === "vaga" ? "bg-orbit-purple" : a.tipo === "perfil" ? "bg-orbit-electric" : "bg-white/30"
                  }`} />
                  {i < atividades.length - 1 && <div className="mt-1 h-full w-px bg-white/10" />}
                </div>
                <div className="pb-3">
                  <p className="text-xs text-white/70 leading-relaxed">{a.texto}</p>
                  <p className="mt-0.5 text-[10px] text-white/30">{a.tempo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projetos */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Meus projetos</h2>
          <Link href="/colaborador/projetos" className="text-[11px] text-orbit-electric hover:underline">
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-xs text-white/40">
            <span className="size-4 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
            Carregando...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 py-8 text-center">
            <FolderOpen className="mx-auto size-8 text-white/20" />
            <p className="mt-2 text-sm text-white/40">Nenhum projeto conectado ainda.</p>
            <p className="mt-1 text-xs text-white/25">Candidate-se a vagas para participar de projetos.</p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3"
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-orbit-electric/15">
                  <FolderOpen className="size-3.5 text-orbit-electric" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{p.title}</p>
                  <span className={`inline-block mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    p.status?.toLowerCase() === "encerrado"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-orbit-electric/15 text-orbit-electric"
                  }`}>
                    {p.status || "Ativo"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/colaborador/squad"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition hover:border-white/20 hover:text-white"
        >
          <Users className="size-3.5" /> Squad
        </Link>
        <Link
          href="/colaborador/contatos"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition hover:border-white/20 hover:text-white"
        >
          <Send className="size-3.5" /> Contatos
        </Link>
        <Link
          href="/colaborador/conta"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition hover:border-white/20 hover:text-white"
        >
          <Clock className="size-3.5" /> Configurações
        </Link>
      </div>
    </div>
  );
}
