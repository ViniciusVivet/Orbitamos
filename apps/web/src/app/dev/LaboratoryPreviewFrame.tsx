"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import PortalSidebar from "@/components/portal/PortalSidebar";
import s from "@/components/portal/PortalExperience.module.css";

/** Development-only shell: exercises the real sidebar and available editor width without a student account. */
export default function LaboratoryPreviewFrame({ children, title = "Laboratório Academy", mode = "student" }: { children: ReactNode; title?: string; mode?: "student" | "work" }) {
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
  return <div ref={root} data-lab-ready="false" className={s.workspace + " min-h-screen text-white"}>
    <PortalSidebar mode={mode} mobileOpen={open} onCloseMobile={close}/>
    <div className="lg:pl-56">
      <header className={s.workspaceHeader + " sticky top-0 z-30 flex min-h-16 items-center gap-3 px-4 lg:px-6"}>
        <button type="button" className="grid size-11 place-items-center lg:hidden" aria-label="Abrir menu do laboratório" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={20}/></button>
        <span className="text-xs text-slate-300">Prévia local · {title}</span>
      </header>
      <div className="px-4 py-4 sm:py-6 lg:px-6 lg:py-8">{children}</div>
    </div>
  </div>;
}
