"use client";

import Link from "next/link";
import Image from "next/image";
import { getDisplayAvatarUrl } from "@/lib/api";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Briefcase, ChevronDown, Code2, FolderOpen, Gamepad2, Globe2, GraduationCap, Home, Layers, LockKeyhole, MessageSquare, Settings2, Shield, TrendingUp, UserRound, Users, X, type LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { courseTracks } from "@/lib/cursos";
import s from "./PortalExperience.module.css";

type Item = { href: string; label: string; icon: LucideIcon };
type Group = { label: string; items: Item[] };
export type PortalSidebarProps = { mobileOpen?: boolean; onCloseMobile?: () => void };

export default function PortalSidebar({ mode, mobileOpen = false, onCloseMobile }: PortalSidebarProps & { mode: "student" | "work" }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const avatarSrc = getDisplayAvatarUrl(user?.avatarUrl);
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [tracksOpen, setTracksOpen] = useState(false);
  const work = mode === "work";
  const root = work ? "/colaborador" : "/estudante";
  const groups: Group[] = work ? [
    { label: "Seu trabalho", items: [
      { href: root, label: "Visão geral", icon: Home },
      { href: `${root}/projetos`, label: "Meus projetos", icon: FolderOpen },
      { href: `${root}/vagas`, label: "Oportunidades", icon: Briefcase },
      { href: `${root}/candidaturas`, label: "Candidaturas", icon: Layers },
    ] },
    { label: "Conexões", items: [
      { href: "/mensagens", label: "Mensagens", icon: MessageSquare },
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
  ] : [
    { label: "Seu aprendizado", items: [
      { href: root, label: "Visão geral", icon: Home },
      { href: `${root}/aulas`, label: "Aulas e trilhas", icon: BookOpen },
      { href: `${root}/pratica`, label: "Laboratório", icon: Code2 },
      { href: `${root}/jogos`, label: "Jogos de lógica", icon: Gamepad2 },
      { href: `${root}/orbita`, label: "Minha jornada", icon: Globe2 },
      { href: `${root}/progresso`, label: "Meu progresso", icon: TrendingUp },
    ] },
    { label: "Aprender junto", items: [
      { href: "/mensagens", label: "Mensagens", icon: MessageSquare },
      { href: `${root}/mentorias`, label: "Mentorias", icon: GraduationCap },
      { href: `${root}/comunidade`, label: "Comunidade", icon: Users },
      { href: `${root}/conta`, label: "Configurações", icon: Settings2 },
    ] },
  ];

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
    return () => { document.removeEventListener("keydown", handleKey); previous?.focus(); };
  }, [mobileOpen, onCloseMobile]);

  return <>
    {mobileOpen && <button className={s.backdrop} onClick={onCloseMobile} aria-label="Fechar navegação" tabIndex={-1}/>}
    <aside ref={sidebarRef} aria-label={work ? "Navegação do colaborador" : "Navegação do estudante"} className={`${s.sidebar} ${work ? s.sidebarWork : ""} ${mobileOpen ? s.sidebarOpen : ""}`}>
      <div className={s.brand}><div><small>ORBITAMOS</small><span>{work ? "Studio" : "Academy"}</span></div><button className={s.close} aria-label="Fechar menu" onClick={onCloseMobile}><X size={20}/></button></div>
      <nav>{groups.map(group => <div key={group.label}><p className={s.navGroup}>{group.label}</p>{group.items.map(item => {
        const active = pathname === item.href || (item.href !== root && pathname.startsWith(`${item.href}/`)) || (item.href === "/estudante/aulas" && pathname.startsWith("/estudante/cursos/"));
        const Icon = item.icon;
        return <div key={item.href}>
          <div className="flex items-center gap-1"><Link href={item.href} onClick={onCloseMobile} aria-current={active ? "page" : undefined} className={`${s.navLink} ${active ? s.active : ""} flex-1`}><Icon aria-hidden="true"/>{item.label}</Link>
            {item.href === "/estudante/aulas" && <button className="grid h-11 w-9 place-items-center rounded-md text-slate-400" aria-label="Trilhas de estudo" aria-expanded={tracksOpen} onClick={() => setTracksOpen(value => !value)}><ChevronDown size={15} className={tracksOpen ? "rotate-180" : ""}/></button>}
          </div>
          {item.href === "/estudante/aulas" && tracksOpen && <div className="ml-7 border-l border-white/10 pl-2">{courseTracks.map(track => <Link key={track.id} className={s.navLink} href={`/estudante/cursos/${track.slugs[0]}`} onClick={onCloseMobile}>{track.titulo.replace(/^Trilha\s+/i, "")}</Link>)}</div>}
        </div>;
      })}</div>)}</nav>
      <div className={s.account}><div className={s.person}><span className={s.avatar}>{avatarSrc && failedAvatar !== avatarSrc ? <Image src={avatarSrc} alt="" width={32} height={32} unoptimized className="h-full w-full rounded-full object-cover" onError={() => setFailedAvatar(avatarSrc)}/> : user?.name?.trim()[0]?.toUpperCase() || "O"}</span><span>{user?.name || "Sua conta"}</span></div><Link className={s.switch} href={work ? "/estudante" : "/colaborador"} onClick={onCloseMobile}>{work ? "Ir para a Academy" : "Ir para o Studio"}<ArrowRight size={15}/></Link><button onClick={logout} className={s.logout}>Sair da conta</button></div>
    </aside>
  </>;
}
