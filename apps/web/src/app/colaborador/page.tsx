"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyProjects, getJobs, Project, Job } from "@/lib/api";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Olá, <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">{user?.name}</span>
        </h1>
        <p className="mt-1 text-white/60">Resumo da sua área de colaborador</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-orbit-purple/20 bg-gray-900/50">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-orbit-purple">{loading ? "—" : vagasAbertas}</p>
            <p className="text-sm text-white/60">Vagas abertas</p>
          </CardContent>
        </Card>
        <Card className="border-orbit-electric/20 bg-gray-900/50">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-orbit-electric">{loading ? "—" : projetosAtivos}</p>
            <p className="text-sm text-white/60">Projetos ativos</p>
          </CardContent>
        </Card>
        <Link href="/colaborador/candidaturas">
          <Card className="border-white/10 bg-gray-900/50 transition-colors hover:border-white/20 hover:bg-white/5">
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-white/90">0</p>
              <p className="text-sm text-white/60">Candidaturas (mês)</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="border-white/10 bg-gray-900/50">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-white/90">—</p>
            <p className="text-sm text-white/60">Reuniões hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo do dia */}
      <Card className="border-orbit-purple/20 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-orbit-purple">📅 Hoje</CardTitle>
          <CardDescription>Resumo do dia</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/70 text-sm">Nenhuma reunião ou tarefa agendada para hoje.</p>
          <Link href="/colaborador/squad">
            <Button variant="outline" size="sm" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
              Ver squad
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-orbit-purple/20 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-orbit-purple">💼 Vagas em destaque</CardTitle>
            <CardDescription>Oportunidades abertas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-white/50">Carregando...</p>
            ) : jobs.length === 0 ? (
              <p className="text-sm text-white/60">Nenhuma vaga aberta no momento.</p>
            ) : (
              <ul className="space-y-2">
                {jobs.slice(0, 3).map((j) => (
                  <li key={j.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/90">
                    <span>
                      <span className="font-medium">{j.title}</span>
                      <span className="ml-2 text-white/50 text-xs">— {j.type}</span>
                    </span>
                    <span className="text-white/50 text-xs">0 candidaturas</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/colaborador/vagas" className="mt-4 block">
              <Button variant="outline" size="sm" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
                Ver todas as vagas
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-orbit-electric/20 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-orbit-electric">📂 Meus projetos</CardTitle>
            <CardDescription>Projetos que você está conectado</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-white/50">Carregando...</p>
            ) : projects.length === 0 ? (
              <p className="text-sm text-white/60">Nenhum projeto conectado ainda.</p>
            ) : (
              <ul className="space-y-2">
                {projects.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/90">
                    <span>
                      <span className="font-medium">{p.title}</span>
                      <span className="ml-2 text-white/50 text-xs">— {p.status}</span>
                    </span>
                    <Link href="/colaborador/squad" className="text-xs text-orbit-electric hover:underline">
                      Equipe
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/colaborador/projetos" className="mt-4 block">
              <Button variant="outline" size="sm" className="border-orbit-electric text-orbit-electric hover:bg-orbit-electric hover:text-black">
                Ver projetos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Links do time / Onboarding */}
      <Card className="border-white/10 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-white">🔗 Links do time</CardTitle>
          <CardDescription>Onboarding e documentação</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a href="/contato" className="inline-flex">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              📋 Contato / Dúvidas
            </Button>
          </a>
          <Link href="/sobre">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              🌐 Sobre o Orbitamos
            </Button>
          </Link>
          <Link href="/colaborador/conta">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              ⚙️ Sua conta
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-white">Atalhos</CardTitle>
          <CardDescription>Navegue rápido</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/colaborador/vagas">
            <Button variant="outline" className="border-orbit-purple text-orbit-purple hover:bg-orbit-purple hover:text-white">
              💼 Vagas
            </Button>
          </Link>
          <Link href="/colaborador/projetos">
            <Button variant="outline" className="border-orbit-electric text-orbit-electric hover:bg-orbit-electric hover:text-black">
              📂 Projetos
            </Button>
          </Link>
          <Link href="/colaborador/squad">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              👥 Squad
            </Button>
          </Link>
          <Link href="/colaborador/conta">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              ⚙️ Configurações
            </Button>
          </Link>
          <Link href="/contato">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              📞 Contato
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
