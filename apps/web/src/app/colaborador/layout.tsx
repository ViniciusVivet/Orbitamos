"use client";

import s from "@/components/portal/PortalExperience.module.css";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import PortalHeader from "@/components/portal/PortalHeader";
import { useCallback, useEffect, useState } from "react";
import ColaboradorSidebar from "@/components/colaborador/ColaboradorSidebar";
import NotificacoesPanel, { NotificacaoBadge } from "@/components/colaborador/NotificacoesPanel";
import { listNotifications, type NotificationItem } from "@/lib/workspace";
import { loginPathFor } from "@/lib/authNavigation";

export default function ColaboradorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const firstName = user?.name?.trim().split(" ")[0] ?? "";
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const loadNotifications = () => listNotifications().then(setNotifications).catch(() => setNotifications([]));

  useEffect(() => { if (isAuthenticated) loadNotifications(); }, [isAuthenticated]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace(loginPathFor(pathname + window.location.search + window.location.hash));
      return;
    }
  }, [loading, isAuthenticated, router, pathname]);

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
    <div className={s.workspace + " min-h-screen text-white"} data-portal-area="work">
      <ColaboradorSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={closeMobileMenu}
      />
      <div className="min-h-screen pl-0 lg:pl-56">
        <PortalHeader mode="work" name={firstName} mobileOpen={mobileMenuOpen} onOpenMenu={() => setMobileMenuOpen(true)}>
          <NotificacaoBadge count={notifications.filter((item) => !item.readAt).length} onClick={() => setNotifOpen(true)} />
        </PortalHeader>
        <div className="container mx-auto px-4 py-4 sm:py-6 lg:px-6 lg:py-8 max-w-full">
          {children}
        </div>
      </div>

      <NotificacoesPanel open={notifOpen} onClose={() => setNotifOpen(false)} items={notifications} onChange={loadNotifications} />
    </div>
  );
}
