"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EstudanteSidebar from "@/components/estudante/EstudanteSidebar";

export default function EstudanteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/entrar");
      return;
    }
    if (user?.role !== "STUDENT") {
      router.replace(user?.role === "FREELANCER" ? "/colaborador" : "/dashboard");
    }
  }, [loading, isAuthenticated, user?.role, router]);

  if (loading || !isAuthenticated || user?.role !== "STUDENT") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <EstudanteSidebar />
      <main className="pl-56 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
