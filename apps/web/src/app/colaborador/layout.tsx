"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ColaboradorSidebar from "@/components/colaborador/ColaboradorSidebar";
import NotificacoesPanel, { NotificacaoBadge } from "@/components/colaborador/NotificacoesPanel";
import { listNotifications, type NotificationItem } from "@/lib/workspace";

export default function ColaboradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const loadNotifications = () => listNotifications().then(setNotifications).catch(() => setNotifications([]));

  useEffect(() => { if (isAuthenticated) loadNotifications(); }, [isAuthenticated]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/entrar");
      return;
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <ColaboradorSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      <main className="min-h-screen pl-0 lg:pl-56">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-black/40 backdrop-blur-md px-4 py-3 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex h-12 min-w-[44px] shrink-0 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white touch-manipulation"
            aria-label="Abrir menu"
          >
            <span className="text-xl">&#9776;</span>
          </button>
          <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-sm font-semibold uppercase tracking-wider text-transparent">
            Colaborador
          </span>
          <div className="ml-auto">
            <NotificacaoBadge count={notifications.filter((item) => !item.readAt).length} onClick={() => setNotifOpen(true)} />
          </div>
        </header>
        <div className="container mx-auto px-4 py-4 sm:py-6 lg:px-6 lg:py-8 max-w-full">
          {children}
        </div>
      </main>

      <NotificacoesPanel open={notifOpen} onClose={() => setNotifOpen(false)} items={notifications} onChange={loadNotifications} />
    </div>
  );
}
