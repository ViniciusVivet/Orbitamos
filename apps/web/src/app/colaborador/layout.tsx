"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import ColaboradorSidebar from "@/components/colaborador/ColaboradorSidebar";

export default function ColaboradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/entrar");
      return;
    }
    if (user?.role !== "FREELANCER") {
      router.replace(user?.role === "STUDENT" ? "/estudante" : "/dashboard");
    }
  }, [loading, isAuthenticated, user?.role, router]);

  if (loading || !isAuthenticated || user?.role !== "FREELANCER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <ColaboradorSidebar />
      <main className="pl-56 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
