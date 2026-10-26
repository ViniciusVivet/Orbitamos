"use client";

import s from "@/components/portal/PortalExperience.module.css";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import EstudanteSidebar from "@/components/estudante/EstudanteSidebar";
import NotificacoesPanel, { NotificacaoBadge } from "@/components/estudante/NotificacoesPanel";
import { listNotifications, type NotificationItem } from "@/lib/workspace";
import PortalHeader from "@/components/portal/PortalHeader";
import PracticeNavigation from "@/components/estudante/PracticeNavigation";
import AcademyMobileNav from "@/components/estudante/AcademyMobileNav";
import AcademyResumeTracker from "@/components/estudante/AcademyResumeTracker";
import { academySection } from "@/lib/portalNavigation";
import { loginPathFor } from "@/lib/authNavigation";

export default function EstudanteLayout({
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

  useEffect(() => {
    if (isAuthenticated) loadNotifications();
  }, [isAuthenticated]);

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
    <div className={s.workspace + " min-h-screen text-white"} data-portal-area="student">
      <Suspense fallback={null}><AcademyResumeTracker userId={user?.id}/></Suspense>
      <EstudanteSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={closeMobileMenu}
      />
      <div className="min-h-screen pl-0 lg:pl-56">
        <PortalHeader mode="student" name={firstName} mobileOpen={mobileMenuOpen} onOpenMenu={() => setMobileMenuOpen(true)}>
          <NotificacaoBadge count={notifications.filter((item) => !item.readAt).length} onClick={() => setNotifOpen(true)} />
        </PortalHeader>
        <div className="container mx-auto px-4 py-4 sm:py-6 lg:px-6 lg:py-8 max-w-full">
          {academySection(pathname) === "practice" && <PracticeNavigation/>}
          {children}
        </div>
      </div>

      <AcademyMobileNav/>
      <NotificacoesPanel open={notifOpen} onClose={() => setNotifOpen(false)} items={notifications} onChange={loadNotifications} />
    </div>
  );
}
