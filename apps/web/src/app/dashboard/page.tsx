"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * /dashboard é um redirecionador: envia cada role para sua área dedicada.
 * Estudante → /estudante | Colaborador → /colaborador
 * Assim não duplicamos conteúdo e mantemos o projeto organizado.
 */
export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/entrar");
      return;
    }
    if (user?.role === "FREELANCER") {
      router.replace("/colaborador");
      return;
    }
    if (user?.role === "STUDENT") {
      router.replace("/estudante");
      return;
    }
    router.replace("/estudante");
  }, [loading, isAuthenticated, user?.role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orbit-electric border-t-transparent" />
        <p className="text-white">Redirecionando...</p>
      </div>
    </div>
  );
}
