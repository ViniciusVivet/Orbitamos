"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProjects, type Project } from "@/lib/api";
import ProjectWorkspace from "@/components/colaborador/ProjectWorkspace";

export default function ColaboradorProjetos() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => { setLoading(true); setError(""); setRevision(value => value + 1); }, []);
  useEffect(() => {
    if (!token) return;
    let active = true;
    getMyProjects(token).then(value => { if (active) { setProjects(value); setError(""); } }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar seus projetos."); }).finally(() => { if (active) { setLoadedToken(token); setLoading(false); } });
    return () => { active = false; };
  }, [token, revision]);
  return <ProjectWorkspace projects={loadedToken === token ? projects : []} loading={loading || loadedToken !== token} error={loadedToken === token ? error : ""} onRetry={retry}/>;
}
