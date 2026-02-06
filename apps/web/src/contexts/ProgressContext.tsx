"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getDashboardSummary } from "@/lib/api";
import type { DashboardProgress } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
}: {
  children: React.ReactNode;
  token: string | null;
}) {
  const [progress, setProgress] = useState<DashboardProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchProgress = useCallback(async () => {
    if (!token) {
      setProgress(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getDashboardSummary(token);
      setProgress(result.progress ?? defaultProgress);
    } catch {
      setProgress(defaultProgress);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refetchProgress();
  }, [refetchProgress]);

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
  const { token } = useAuth();
  return <ProgressProvider token={token}>{children}</ProgressProvider>;
}

export { defaultProgress };
