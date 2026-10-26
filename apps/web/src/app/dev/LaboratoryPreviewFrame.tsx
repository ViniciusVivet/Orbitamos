"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";
import PracticeNavigation from "@/components/estudante/PracticeNavigation";
import AcademyMobileNav from "@/components/estudante/AcademyMobileNav";
import AcademyResumeTracker from "@/components/estudante/AcademyResumeTracker";
import type { AcademySection } from "@/lib/portalNavigation";
import s from "@/components/portal/PortalExperience.module.css";

/** Development-only shell: exercises the real sidebar and available editor width without a student account. */
export default function LaboratoryPreviewFrame({ children, title, mode = "student", section, practiceMode = "code", showDock = false, userId }: { children: ReactNode; title?: string; mode?: "student" | "work"; section?: AcademySection; practiceMode?: "code" | "games" | "english" | "review"; showDock?: boolean; userId?: string }) {
  const path = usePathname();
  const selected = section ?? (path.includes("csharp") || path.includes("sql") ? "tracks" : "practice");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => { if (root.current) root.current.dataset.labReady = "true"; }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  return <div ref={root} data-lab-ready="false" data-portal-area={mode} className={s.workspace + " min-h-screen text-white"}>
    {userId && <Suspense fallback={null}><AcademyResumeTracker userId={userId}/></Suspense>}
    <PortalSidebar mode={mode} mobileOpen={open} onCloseMobile={close} preview activeSection={selected}/>
    <div className="lg:pl-56">
      <PortalHeader mode={mode} preview section={selected} title={title} mobileOpen={open} onOpenMenu={() => setOpen(true)}/>
      <div className="px-4 py-4 sm:py-6 lg:px-6 lg:py-8">{selected === "practice" && <PracticeNavigation preview mode={practiceMode}/ >}{children}</div>
    </div>
    {mode === "student" && <AcademyMobileNav preview section={selected} visible={showDock}/ >}
  </div>;
}
