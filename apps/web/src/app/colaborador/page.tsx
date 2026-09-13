"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyApplications, getMyProjects, getJobs, type Project, type Job, type JobApplication } from "@/lib/api";
import CollaboratorHome from "@/components/portal/CollaboratorHome";

export default function ColaboradorInicio() {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string[]>([]);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!token) return;
    let active = true;
    async function loadWorkspace() {
      setLoading(true);
      const [projectResult, jobResult, applicationResult] = await Promise.allSettled([
        getMyProjects(token!), getJobs(token!), getMyApplications(),
      ]);
      if (!active) return;
      const errors: string[] = [];
      if (projectResult.status === "fulfilled") setProjects(projectResult.value);
      else errors.push("projetos");
      if (jobResult.status === "fulfilled") setJobs(jobResult.value);
      else errors.push("vagas");
      if (applicationResult.status === "fulfilled") setApplications(applicationResult.value);
      else errors.push("candidaturas");
      setFailed(errors);
      setLoading(false);
    }
    void loadWorkspace();
    return () => { active = false; };
  }, [token, revision]);

  return <CollaboratorHome name={user?.name?.trim().split(" ")[0] || "colaborador"}
    projects={projects} jobs={jobs} applications={applications} loading={loading}
    failed={failed} retry={() => setRevision(value => value + 1)}/>;
}
