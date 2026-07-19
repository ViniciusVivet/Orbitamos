"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayAvatarUrl } from "@/lib/api";
import { courseTracks } from "@/lib/cursos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavChild = {
  href: string;
  label: string;
  icon: string;
};

type NavItem = NavChild & {
  children?: NavChild[];
};

const navItems: NavItem[] = [
  { href: "/estudante", label: "Início", icon: "🏠" },
  { href: "/estudante/orbita", label: "Jornada", icon: "🌌" },
  { href: "/mensagens", label: "Mensagens", icon: "💬" },
  {
    href: "/estudante/aulas",
    label: "Aulas",
    icon: "🎓",
    children: courseTracks.map((track) => ({
      href: `/estudante/cursos/${track.slugs[0]}`,
      label: track.titulo.replace(/^Trilha\s+/i, ""),
      icon: track.icon,
    })),
  },
  { href: "/estudante/pratica", label: "Prática", icon: "💻" },
  { href: "/estudante/mentorias", label: "Mentorias", icon: "👨‍🏫" },
  { href: "/estudante/progresso", label: "Progresso", icon: "📊" },
  { href: "/estudante/comunidade", label: "Comunidade", icon: "🌐" },
  { href: "/estudante/conta", label: "Configurações", icon: "⚙️" },
];

interface EstudanteSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function EstudanteSidebar({ mobileOpen = false, onCloseMobile }: EstudanteSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [aulasOpen, setAulasOpen] = useState(false);

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const asideContent = (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4">
        <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-lg font-bold text-transparent">
          Aprender
        </span>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden flex h-12 min-w-[44px] items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white touch-manipulation"
            aria-label="Fechar menu"
          >
            &#10005;
          </button>
        )}
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3 lg:space-y-0.5 lg:overflow-visible lg:px-2 lg:py-2 [@media(max-height:700px)]:py-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/estudante" && pathname.startsWith(item.href)) ||
            (item.href === "/estudante/aulas" && pathname.startsWith("/estudante/cursos"));
          const children = item.children ?? [];
          const hasChildren = children.length > 0;

          if (hasChildren) {
            return (
              <div key={item.href} className="relative">
                <div className="flex gap-1">
                  <Link
                    href={item.href}
                    onClick={() => onCloseMobile?.()}
                    className={cn(
                      "flex min-h-[44px] flex-1 touch-manipulation items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:min-h-10 lg:py-2 [@media(max-height:700px)]:min-h-9 [@media(max-height:700px)]:py-1",
                      isActive
                        ? "border border-orbit-electric/30 bg-orbit-electric/20 text-orbit-electric"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setAulasOpen((open) => !open)}
                    className={cn(
                      "flex h-11 w-10 items-center justify-center rounded-lg border border-white/10 text-white/50 transition-colors hover:bg-white/5 hover:text-white lg:h-10 [@media(max-height:700px)]:h-9",
                      aulasOpen && "border-orbit-electric/30 text-orbit-electric"
                    )}
                    aria-label={aulasOpen ? "Fechar subcategorias de aulas" : "Abrir subcategorias de aulas"}
                    aria-expanded={aulasOpen}
                  >
                    <span className={cn("text-xs transition-transform", aulasOpen && "rotate-180")}>v</span>
                  </button>
                </div>

                {aulasOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3 lg:absolute lg:left-full lg:top-0 lg:z-50 lg:ml-3 lg:mt-0 lg:w-56 lg:rounded-2xl lg:border lg:border-white/15 lg:bg-[#080a10]/95 lg:p-2 lg:shadow-[0_24px_70px_rgba(0,0,0,.55)] lg:backdrop-blur-xl">
                    <div className="hidden px-2 pb-2 pt-1 lg:block">
                      <div className="text-[10px] font-bold uppercase tracking-[.18em] text-orbit-electric">Trilhas de estudo</div>
                      <div className="mt-1 text-xs text-white/40">Acesse uma área direto</div>
                    </div>
                    {children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => onCloseMobile?.()}
                          className={cn(
                            "flex min-h-[38px] items-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-colors lg:rounded-lg",
                            childActive
                              ? "bg-white/10 text-orbit-electric"
                              : "text-white/55 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          <span className="w-5 text-center">{child.icon}</span>
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onCloseMobile?.()}
              className={cn(
                "flex min-h-[44px] touch-manipulation items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:min-h-10 lg:py-2 [@media(max-height:700px)]:min-h-9 [@media(max-height:700px)]:py-1",
                isActive
                  ? "bg-orbit-electric/20 text-orbit-electric border border-orbit-electric/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="relative z-10 shrink-0 border-t border-white/10 bg-black/95 p-3 lg:py-2 [@media(max-height:700px)]:py-1.5">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 lg:py-1.5 [@media(max-height:700px)]:hidden">
          {getDisplayAvatarUrl(user?.avatarUrl) ? (
            <img src={getDisplayAvatarUrl(user?.avatarUrl)!} alt={user?.name ?? ""} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-xs font-bold text-black">
              {initials}
            </div>
          )}
          <span className="truncate text-sm text-white/80">{user?.name}</span>
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-2 w-full border border-orbit-purple/40 text-orbit-purple hover:bg-orbit-purple/10 text-xs min-h-[40px] touch-manipulation [@media(max-height:700px)]:mb-1 [@media(max-height:700px)]:min-h-9"
        >
          <Link href="/colaborador" onClick={() => onCloseMobile?.()}>
            🚀 Ver vagas
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20 min-h-[40px] touch-manipulation [@media(max-height:700px)]:min-h-9"
          onClick={logout}
        >
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Backdrop no mobile */}
      {onCloseMobile && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden",
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          onClick={onCloseMobile}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[90vw] flex-col overflow-visible border-r border-white/10 bg-black/95 backdrop-blur-xl transition-transform duration-200 ease-out lg:top-16 lg:z-40 lg:h-[calc(100vh-4rem)] lg:w-56 lg:max-w-none lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {asideContent}
      </aside>
    </>
  );
}
