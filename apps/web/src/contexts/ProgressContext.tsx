"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getDashboardSummary } from "@/lib/api";
import type { DashboardProgress, UserId } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { createProgressRequestGuard } from "@/lib/progressRequestGuard";

interface ProgressContextType {
  progress: DashboardProgress | null;
  loading: boolean;
  refetchProgress: () => Promise<void>;
}

const defaultProgress: DashboardProgress = {
  percent: 0,
  phase: "",
  nextGoal: "",
  level: 1,
  xp: 0,
  streakDays: 0,
  lastLesson: "",
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({
  children,
  token,
  userId,
}: {
  children: React.ReactNode;
  token: string | null;
  userId: UserId | null;
}) {
  const owner = userId == null ? null : String(userId);
  const [state, setState] = useState<{ owner: string | null; progress: DashboardProgress | null; loading: boolean }>({ owner: null, progress: null, loading: true });
  const [requestGuard] = useState(createProgressRequestGuard);

  const refetchProgress = useCallback(async () => {
    // Um callback retido por uma aula da conta anterior nao pode iniciar outra
    // requisicao depois da troca de sessao.
    if (!requestGuard.sameIdentity(owner, token)) return;
    if (!token || owner == null) {
      setState({ owner, progress: null, loading: false });
      return;
    }
    const ticket = requestGuard.begin(owner, token);
    if (!ticket) return;
    setState((current) => ({ owner, progress: current.owner === owner ? current.progress : null, loading: true }));
    try {
      const result = await getDashboardSummary(token);
      if (!requestGuard.current(ticket, result.user.id)) return;
      setState({ owner, progress: result.progress ?? defaultProgress, loading: false });
    } catch {
      if (requestGuard.current(ticket)) setState({ owner, progress: defaultProgress, loading: false });
    } finally {
      if (requestGuard.current(ticket)) setState((current) => ({ ...current, loading: false }));
    }
  }, [owner, requestGuard, token]);

  useEffect(() => {
    requestGuard.observe(owner, token);
    requestGuard.start();
    queueMicrotask(() => { void refetchProgress(); });
    return () => requestGuard.stop();
  }, [owner, refetchProgress, requestGuard, token]);

  // A identidade muda antes do efeito de limpeza. Nessa renderizacao ja esconder
  // o snapshot anterior evita mostrar XP da outra conta durante a nova leitura.
  const progress = token && owner != null && state.owner === owner ? state.progress : null;
  const loading = Boolean(token && owner != null && (state.owner !== owner || state.loading));

  return (
    <ProgressContext.Provider value={{ progress, loading, refetchProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}

/** Usar no layout: dentro de AuthProvider, envolve a app com ProgressProvider usando o token. */
export function ProgressProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  return <ProgressProvider token={token} userId={user?.id ?? null}>{children}</ProgressProvider>;
}

export { defaultProgress };
