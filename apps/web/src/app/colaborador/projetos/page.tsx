"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyProjects, Project } from "@/lib/api";

export default function ColaboradorProjetos() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    getMyProjects(token)
      .then(setProjects)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar projetos"))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Meus Projetos</h1>
        <p className="mt-1 text-white/60">Projetos reais em que você está conectado</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-white/10 bg-gray-900/50">
          <CardContent className="py-12 text-center text-white/60">
            Nenhum projeto conectado ainda. Quando você for atribuído a um projeto, ele aparecerá aqui.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="border-orbit-purple/20 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">{p.title}</CardTitle>
                <CardDescription>
                  <span className="rounded-full bg-orbit-electric/20 px-2 py-0.5 text-xs text-orbit-electric">
                    {p.status}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {p.description && (
                  <p className="text-sm text-white/80 line-clamp-3">{p.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
