"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayAvatarUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/colaborador", label: "Início", icon: "🏠" },
  { href: "/mensagens", label: "Mensagens", icon: "💬" },
  { href: "/colaborador/vagas", label: "Vagas", icon: "💼" },
  { href: "/colaborador/candidaturas", label: "Candidaturas", icon: "📋" },
  { href: "/colaborador/projetos", label: "Projetos", icon: "📂" },
  { href: "/colaborador/squad", label: "Squad", icon: "👥" },
  { href: "/colaborador/conta", label: "Configurações", icon: "⚙️" },
];

export default function ColaboradorSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-4">
        <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-lg font-bold text-transparent">
          Colaborador
        </span>
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Notificações"
          >
            <span className="text-lg">🔔</span>
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-white/10 bg-gray-900 py-2 shadow-xl">
              <p className="px-3 py-2 text-xs font-medium text-white/50">Notificações</p>
              <p className="px-3 py-4 text-center text-sm text-white/60">Nenhuma notificação no momento.</p>
              <p className="px-3 pb-2 text-[10px] text-white/40">Novas candidaturas e atualizações aparecerão aqui.</p>
            </div>
          )}
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/colaborador" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-orbit-purple/20 text-orbit-purple border border-orbit-purple/30"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          {getDisplayAvatarUrl(user?.avatarUrl) ? (
            <img src={getDisplayAvatarUrl(user?.avatarUrl)!} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-xs font-bold text-black">
              {initials}
            </div>
          )}
          <span className="truncate text-sm text-white/80">{user?.name}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
          onClick={logout}
        >
          Sair
        </Button>
      </div>
    </aside>
  );
}
