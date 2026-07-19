"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, ChevronDown, User } from "lucide-react";
import { useState, useRef } from "react";
import LogoOrbitamos from "@/components/LogoOrbitamos";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayAvatarUrl } from "@/lib/api";
import { cursos } from "@/lib/cursos";
import { whatsappProjetosUrl } from "@/lib/social";
import { CATEGORIAS } from "@/types/projeto";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [projetosOpen, setProjetosOpen] = useState(false);

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  // Nav links — Portal removed from here (moved to right side)
  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/projetos", label: "Projetos", hasDropdown: true },
    { href: "/contato", label: "Contato" },
    { href: "/forum", label: "Fórum" },
    ...(!loading && isAuthenticated && user?.role === "STUDENT"
      ? [{ href: cursos.length > 0 ? `/estudante/cursos/${cursos[0].slug}` : "/estudante/aulas", label: "Sala de Aula" }]
      : []),
    ...(!loading && isAuthenticated && user
      ? [{ href: user.role === "FREELANCER" ? "/colaborador" : "/estudante", label: user.role === "FREELANCER" ? "Área Colaborador" : "Área do Estudante", isProfile: true }]
      : []),
  ];

  // Portal link for the right side
  const portalHref = !loading && isAuthenticated && user
    ? (user.role === "FREELANCER" ? "/colaborador" : "/estudante")
    : "/entrar";
  const portalLabel = !loading && isAuthenticated && user
    ? (user.role === "FREELANCER" ? "Área Colaborador" : "Área do Estudante")
    : "Portal";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function handleDropdownEnter() {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setProjetosOpen(true);
  }

  function handleDropdownLeave() {
    dropdownTimeout.current = setTimeout(() => setProjetosOpen(false), 150);
  }

  return (
    <nav className="site-navigation fixed top-0 w-full z-50 bg-[rgba(2,4,14,0.18)] backdrop-blur-2xl">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="relative flex items-center h-14 md:h-16">
          {/* ── Left: Logo + Nav links ── */}
          <div className="flex items-center">
            <Link href="/" className="relative z-10 flex items-center space-x-2">
              <LogoOrbitamos size={30} />
            </Link>

            <div className="hidden md:flex items-center gap-7 ml-10">
              {navLinks.map((link) => {
                if ((link as { isProfile?: boolean }).isProfile) {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="relative flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors duration-150"
                    >
                      {getDisplayAvatarUrl(user!.avatarUrl) ? (
                        <img src={getDisplayAvatarUrl(user!.avatarUrl)!} alt={user!.name} className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-[10px] font-bold text-black">
                          {initials}
                        </span>
                      )}
                      <span>{link.label}</span>
                      {isActive(link.href) && (
                        <span className="absolute -bottom-[0.55rem] left-0 right-0 h-[2px] rounded-full bg-orbit-electric" />
                      )}
                    </Link>
                  );
                }

                // Projetos link with dropdown
                if ((link as { hasDropdown?: boolean }).hasDropdown) {
                  return (
                    <div
                      key={link.href}
                      className="relative"
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <Link
                        href={link.href}
                        className={`relative text-sm font-medium transition-colors duration-150 inline-flex items-center gap-1 ${isActive(link.href) ? "text-white" : "text-white/60 hover:text-white"}`}
                      >
                        {link.label}
                        <ChevronDown className={`size-3.5 transition-transform duration-200 ${projetosOpen ? "rotate-180" : ""}`} />
                        {isActive(link.href) && (
                          <span className="absolute -bottom-[0.55rem] left-0 right-0 h-[2px] rounded-full bg-orbit-electric" />
                        )}
                      </Link>

                      {/* Dropdown */}
                      {projetosOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                          <div className="rounded-xl border border-white/[0.08] bg-[rgba(8,8,20,0.85)] backdrop-blur-xl shadow-2xl shadow-black/40 p-2 min-w-[200px]">
                            <Link
                              href="/projetos"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                            >
                              Todos os projetos
                            </Link>
                            <div className="my-1 h-px bg-white/[0.06]" />
                            {CATEGORIAS.map((cat) => (
                              <Link
                                key={cat.slug}
                                href={`/projetos?categoria=${cat.slug}`}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                              >
                                {cat.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative text-sm font-medium transition-colors duration-150 ${isActive(link.href) ? "text-white" : "text-white/60 hover:text-white"}`}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <span className="absolute -bottom-[0.55rem] left-0 right-0 h-[2px] rounded-full bg-orbit-electric" />
                    )}
                  </Link>
                );
              })}

            </div>
          </div>

          {/* ── Right: Portal + CTA ── */}
          <div className="relative z-10 hidden md:flex items-center gap-3 ml-auto">
            <Link
              href={portalHref}
              className="group relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-lg px-4 text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(0,212,255,0.25),0_0_48px_rgba(139,92,246,0.15)]"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(139,92,246,0.12) 100%)",
                border: "1px solid rgba(0,212,255,0.35)",
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-orbit-electric/20 to-orbit-purple/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-orbit-electric/60 to-transparent" />
              <span className="relative flex items-center gap-2">
                {!loading && isAuthenticated && user ? (
                  <>
                    {getDisplayAvatarUrl(user.avatarUrl) ? (
                      <img src={getDisplayAvatarUrl(user.avatarUrl)!} alt="" className="h-5 w-5 rounded-full object-cover ring-1 ring-orbit-electric/40" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-[9px] font-bold text-black">
                        {initials}
                      </span>
                    )}
                    {portalLabel}
                  </>
                ) : (
                  <>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-orbit-electric/50 bg-orbit-electric/10">
                      <User className="size-3" />
                    </span>
                    Portal
                  </>
                )}
              </span>
            </Link>
            <a
              href={whatsappProjetosUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg px-5 text-sm font-bold text-black transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)", boxShadow: "0 0 16px rgba(0,212,255,0.2)" }}
            >
              <MessageCircle className="size-4" />
              Solicitar orçamento
            </a>
          </div>

          {/* ── Mobile: hamburger ── */}
          <button
            type="button"
            className="md:hidden relative z-10 flex h-12 min-w-[44px] items-center justify-center text-white touch-manipulation -mr-2 ml-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? (
              <span className="text-2xl leading-none" aria-hidden>&#10005;</span>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* ── Mobile menu dropdown ── */}
        {isMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 top-14 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden
            />
            <div className="md:hidden relative z-50 py-4 border-t border-white/10 bg-black/90 backdrop-blur-xl rounded-b-xl">
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      className={`py-3 px-4 rounded-lg min-h-[44px] flex items-center touch-manipulation transition-colors ${isActive(link.href) ? "text-orbit-electric bg-white/5" : "text-white/90 hover:text-orbit-electric hover:bg-white/5"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {/* Categorias inline abaixo de Projetos */}
                    {(link as { hasDropdown?: boolean }).hasDropdown && (
                      <div className="ml-4 border-l border-white/10 pl-3 mt-1 mb-1 space-y-0.5">
                        {CATEGORIAS.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/projetos?categoria=${cat.slug}`}
                            className="py-2 px-3 rounded-lg min-h-[38px] flex items-center touch-manipulation transition-colors text-white/55 hover:text-orbit-electric hover:bg-white/5 text-sm"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Portal button mobile */}
                <Link
                  href={portalHref}
                  className="flex items-center justify-center gap-2 rounded-lg border border-orbit-electric/40 bg-orbit-electric/[0.08] px-4 py-3 text-sm font-semibold text-orbit-electric transition-all hover:bg-orbit-electric/[0.15]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="size-4" />
                  {portalLabel}
                </Link>

                <a
                  href={whatsappProjetosUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-black transition-all duration-150 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)", boxShadow: "0 0 16px rgba(0,212,255,0.2)" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageCircle className="size-4" />
                  Solicitar orçamento
                </a>

              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
