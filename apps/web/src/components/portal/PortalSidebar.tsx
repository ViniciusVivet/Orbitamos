"use client";

import Link from "next/link";
import Image from "next/image";
import { getDisplayAvatarUrl } from "@/lib/api";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Briefcase, Code2, FolderOpen, Home, Layers, LockKeyhole, MessageSquare, Settings2, Shield, TrendingUp, UserRound, Users, X, type LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { academyPreviewHref, academySection, academySections, type AcademySection } from "@/lib/portalNavigation";
import s from "./PortalExperience.module.css";

type Item = { href: string; label: string; icon: LucideIcon };
type Group = { label: string; items: Item[] };
export type PortalSidebarProps = { mobileOpen?: boolean; onCloseMobile?: () => void; preview?: boolean; activeSection?: AcademySection };

export default function PortalSidebar({ mode, mobileOpen = false, onCloseMobile, preview = false, activeSection }: PortalSidebarProps & { mode: "student" | "work" }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const avatarSrc = getDisplayAvatarUrl(user?.avatarUrl);
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const work = mode === "work";
  const root = work ? "/colaborador" : "/estudante";
  const studentIcons = { home: Home, tracks: BookOpen, practice: Code2, progress: TrendingUp, community: Users, account: Settings2 };
  const selected = activeSection ?? academySection(pathname);
  const studentHref = (href: string) => preview ? academyPreviewHref(href) : href;
  const groups: Group[] = work ? [
    { label: "Seu trabalho", items: [
      { href: root, label: "Visão geral", icon: Home },
      { href: `${root}/projetos`, label: "Meus projetos", icon: FolderOpen },
      { href: `${root}/vagas`, label: "Oportunidades", icon: Briefcase },
      { href: `${root}/candidaturas`, label: "Candidaturas", icon: Layers },
    ] },
    { label: "Conexões", items: [
      { href: "/mensagens?area=work", label: "Mensagens", icon: MessageSquare },
      { href: `${root}/squad`, label: "Meu squad", icon: Users },
      ...(user?.isInternal ? [{ href: `${root}/contatos`, label: "Contatos", icon: UserRound }] : []),
    ] },
    { label: "Sua presença", items: [
      { href: `${root}/perfil`, label: "Meu perfil", icon: UserRound },
      { href: `${root}/portfolio`, label: "Portfólio", icon: Layers },
      { href: `${root}/conta`, label: "Configurações", icon: Settings2 },
      { href: `${root}/privacidade`, label: "Privacidade", icon: LockKeyhole },
      ...(user?.adminRole === "staff" || user?.adminRole === "admin" ? [{ href: "/admin", label: "Painel interno", icon: Shield }] : []),
    ] },
  ] : [{ label: "Seu aprendizado", items: academySections.map(item => ({ href: item.href, label: item.label, icon: studentIcons[item.id] })) }];

  useEffect(() => {
    if (!mobileOpen || !window.matchMedia("(max-width: 1023px)").matches) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []).filter(el => el.getClientRects().length > 0);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onCloseMobile?.(); }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    const viewport = window.matchMedia("(max-width: 1023px)");
    const resize = () => { if (!viewport.matches) onCloseMobile?.(); };
    viewport.addEventListener("change", resize);
    return () => { document.removeEventListener("keydown", handleKey); viewport.removeEventListener("change", resize); previous?.focus(); };
  }, [mobileOpen, onCloseMobile]);

  return <>
    {mobileOpen && <button className={s.backdrop} onClick={onCloseMobile} aria-label="Fechar navegação" tabIndex={-1}/>}
    <aside ref={sidebarRef} aria-label={work ? "Navegação do colaborador" : "Navegação do estudante"} aria-modal={mobileOpen || undefined} role={mobileOpen ? "dialog" : undefined} className={`${s.sidebar} ${work ? s.sidebarWork : ""} ${mobileOpen ? s.sidebarOpen : ""}`}>
      <div className={s.brand}><div><small>ORBITAMOS</small><span>{work ? "Studio" : "Academy"}</span></div><button className={s.close} aria-label="Fechar menu" onClick={onCloseMobile}><X size={20}/></button></div>
      <nav>{groups.map(group => <div key={group.label}><p className={s.navGroup}>{group.label}</p>{group.items.map(item => {
        const active = work ? pathname === item.href.split("?")[0] || (item.href !== root && pathname.startsWith(`${item.href}/`)) : selected === academySections.find(section => section.href === item.href)?.id;
        const Icon = item.icon;
        return <div key={item.href}>
          <Link href={work ? item.href : studentHref(item.href)} onClick={onCloseMobile} aria-current={active ? "page" : undefined} className={`${s.navLink} ${active ? s.active : ""}`}><Icon aria-hidden="true"/>{item.label}</Link>
        </div>;
      })}</div>)}</nav>
      <div className={s.account}><Link className={s.person} href={`${root}/conta`} onClick={onCloseMobile} aria-label="Conta e configurações" aria-current={!work && selected === "account" ? "page" : undefined}><span className={s.avatar}>{avatarSrc && failedAvatar !== avatarSrc ? <Image src={avatarSrc} alt="" width={32} height={32} unoptimized className="h-full w-full rounded-full object-cover" onError={() => setFailedAvatar(avatarSrc)}/> : user?.name?.trim()[0]?.toUpperCase() || "O"}</span><span>{user?.name || "Conta e configurações"}</span><Settings2 size={15} aria-hidden="true"/></Link><Link className={s.switch} href={work ? "/estudante" : "/colaborador"} onClick={onCloseMobile}>{work ? "Ir para a Academy" : "Área do colaborador"}<ArrowRight size={15}/></Link><Link className={s.publicSite} href="/" onClick={onCloseMobile}>Voltar ao site</Link><button onClick={logout} className={s.logout}>Sair da conta</button></div>
    </aside>
  </>;
}
