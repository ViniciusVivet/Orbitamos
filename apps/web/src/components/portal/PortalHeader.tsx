"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { academyPreviewHref, academySection, academySections, type AcademySection } from "@/lib/portalNavigation";
import s from "./PortalNavigation.module.css";

export default function PortalHeader({ mode = "student", name, mobileOpen, onOpenMenu, children, preview = false, section, title }: { mode?: "student" | "work"; name?: string; mobileOpen: boolean; onOpenMenu: () => void; children?: ReactNode; preview?: boolean; section?: AcademySection; title?: string }) {
  const path = usePathname();
  const current = section ?? academySection(path);
  const label = title ?? (mode === "work" ? "Área do colaborador" : current === "account" ? "Conta e configurações" : academySections.find(item => item.id === current)?.label ?? "Academy");
  const home = mode === "work" ? "/colaborador" : preview ? academyPreviewHref("/estudante") : "/estudante";
  return <header className={s.header} data-portal-header>
    <button type="button" className={s.menu} aria-label="Abrir menu" aria-expanded={mobileOpen} onClick={event => { event.currentTarget.focus(); onOpenMenu(); }}><Menu size={20}/></button>
    <div className={s.context}><Link href={home}>{preview ? "Prévia local · " : "Orbitamos · "}{mode === "work" ? "Colaborador" : "Academy"}</Link><p>{label}</p></div>
    <div className={s.actions}>{name && <span className={s.greeting}>Olá, {name}</span>}{children}</div>
  </header>;
}
