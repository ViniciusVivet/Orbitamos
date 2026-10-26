"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Code2, Home } from "lucide-react";
import { academyPreviewHref, academySection, type AcademySection } from "@/lib/portalNavigation";
import s from "@/components/portal/PortalNavigation.module.css";

const catalogPaths = new Set(["/estudante", "/estudante/trilhas", "/estudante/aulas", "/estudante/orbita", "/estudante/pratica", "/estudante/jogos", "/estudante/progresso", "/estudante/comunidade"]);
export default function AcademyMobileNav({ preview = false, section, visible }: { preview?: boolean; section?: AcademySection; visible?: boolean }) {
  const path = usePathname();
  if (!(visible ?? catalogPaths.has(path))) return null;
  const active = section ?? academySection(path);
  const entries = [{ id: "home", title: "Início", href: "/estudante", icon: Home }, { id: "tracks", title: "Trilhas", href: "/estudante/trilhas", icon: BookOpen }, { id: "practice", title: "Praticar", href: "/estudante/pratica", icon: Code2 }];
  return <><div className={s.spacer} aria-hidden="true"/><nav className={s.dock} aria-label="Atalhos da Academy" data-academy-dock>{entries.map(({ id, title, href, icon: Icon }) => <Link key={id} href={preview ? academyPreviewHref(href) : href} aria-current={active === id ? "page" : undefined}><Icon aria-hidden="true"/>{title}</Link>)}</nav></>;
}
