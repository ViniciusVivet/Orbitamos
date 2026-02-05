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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Olá, <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">{user?.name}</span>
        </h1>
        <p className="mt-1 text-white/60">Resumo da sua área de colaborador</p>
      </div>

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
                  <li key={j.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/90">
                    <span className="font-medium">{j.title}</span>
                    <span className="ml-2 text-white/50 text-xs">— {j.type}</span>
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
                  <li key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/90">
                    <span className="font-medium">{p.title}</span>
                    <span className="ml-2 text-white/50 text-xs">— {p.status}</span>
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
          <Link href="/colaborador/squad">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              💬 Squad
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
