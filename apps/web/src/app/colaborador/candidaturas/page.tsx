"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyApplications, withdrawApplication, type JobApplication } from "@/lib/api";
import ApplicationWorkspace from "@/components/colaborador/ApplicationWorkspace";

export default function ColaboradorCandidaturas() {
  const { token } = useAuth();
  const [items, setItems] = useState<JobApplication[]>([]);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [withdrawal, setWithdrawal] = useState<{ token: string; id: number } | null>(null);
  const accountEpoch = useRef(0);
  const withdrawingId = withdrawal?.token === token ? withdrawal.id : null;
  useEffect(() => { return () => { accountEpoch.current += 1; }; }, [token]);
  const reload = useCallback(() => { setLoading(true); setError(""); setRevision(value => value + 1); }, []);
  useEffect(() => {
    if (!token) return;
    let active = true;
    getMyApplications().then(value => { if (active) { setItems(value); setError(""); } }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar candidaturas."); }).finally(() => { if (active) { setLoadedToken(token); setLoading(false); } });
    return () => { active = false; };
  }, [token, revision]);
  const withdraw = async (item: JobApplication) => {
    if (!token || withdrawingId !== null || !window.confirm(`Retirar sua candidatura para ${item.jobTitle}?`)) return;
    const epoch = accountEpoch.current;
    setWithdrawal({ token, id: item.id });
    try { await withdrawApplication(item.id); if (accountEpoch.current === epoch) setItems(current => current.map(candidate => candidate.id === item.id ? { ...candidate, status: "withdrawn" } : candidate)); }
    catch (reason) { if (accountEpoch.current === epoch) setError(reason instanceof Error ? reason.message : "Não foi possível retirar sua candidatura."); }
    finally { if (accountEpoch.current === epoch) setWithdrawal(null); }
  };
  return <ApplicationWorkspace items={loadedToken === token ? items : []} loading={loading || loadedToken !== token} error={loadedToken === token ? error : ""} onReload={reload} onWithdraw={withdraw} withdrawingId={withdrawingId}/>;
}
