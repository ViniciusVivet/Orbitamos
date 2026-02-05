"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getJobs, Job } from "@/lib/api";

export default function ColaboradorVagas() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    getJobs(token)
      .then(setJobs)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar vagas"))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Vagas</h1>
        <p className="mt-1 text-white/60">Oportunidades de freela e trampos que batem com seu perfil</p>
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
      ) : jobs.length === 0 ? (
        <Card className="border-white/10 bg-gray-900/50">
          <CardContent className="py-12 text-center text-white/60">
            Nenhuma vaga aberta no momento. Volte em breve ou entre em contato com o squad.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="border-orbit-electric/20 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-lg text-white">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span className="rounded-full bg-orbit-purple/20 px-2 py-0.5 text-xs text-orbit-purple">
                    {job.type}
                  </span>
                  <span className="text-white/50 text-xs">{job.status}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {job.description && (
                  <p className="text-sm text-white/80 line-clamp-3">{job.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
