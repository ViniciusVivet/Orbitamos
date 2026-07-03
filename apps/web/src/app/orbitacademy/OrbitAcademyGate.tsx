"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function OrbitAcademyGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/entrar");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) return null;

  return <>{children}</>;
}
