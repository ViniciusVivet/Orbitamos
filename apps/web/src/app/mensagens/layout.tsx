"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MensagensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) router.replace("/entrar");
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
