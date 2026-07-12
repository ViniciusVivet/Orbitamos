"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import LogoOrbitamos from "@/components/LogoOrbitamos";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayAvatarUrl } from "@/lib/api";
import { cursos } from "@/lib/cursos";
import { whatsappProjetosUrl } from "@/lib/social";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <nav className="fixed top-0 w-full z-50 bg-[rgba(2,4,14,0.72)] backdrop-blur-3xl">
      {/* Hairline accent — gradient bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orbit-electric/12 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <LogoOrbitamos size={30} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-150">
              Início
            </Link>
            <Link href="/projetos" className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-150">
              Projetos
            </Link>
            <Link href="/contato" className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-150">
              Contato
            </Link>
            {!loading && isAuthenticated && (
              <Link href="/forum" className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-150">
                Fórum
              </Link>
            )}
            {!loading && isAuthenticated && user?.role === "STUDENT" && (
              <Link
                href={cursos.length > 0 ? `/estudante/cursos/${cursos[0].slug}` : "/estudante/aulas"}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-150"
              >
                Sala de Aula
              </Link>
            )}
            {!loading && isAuthenticated && user ? (
              <Link
                href={user.role === "FREELANCER" ? "/colaborador" : "/estudante"}
                className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors duration-150"
              >
                {getDisplayAvatarUrl(user.avatarUrl) ? (
                  <img src={getDisplayAvatarUrl(user.avatarUrl)!} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-xs font-bold text-black">
                    {initials}
                  </span>
                )}
                <span className="hidden sm:inline text-sm font-medium">{user.role === "FREELANCER" ? "Área Colaborador" : "Área do Estudante"}</span>
              </Link>
            ) : (
              <Link
                href="/entrar"
                className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-150"
              >
                Portal
              </Link>
            )}
            <Button
              size="sm"
              className="bg-gradient-to-r from-orbit-electric to-orbit-purple hover:opacity-90 text-black text-sm font-bold shadow-[0_0_16px_rgba(0,212,255,0.2)] hover:shadow-[0_0_24px_rgba(0,212,255,0.35)] transition-all duration-150"
              asChild
            >
              <a href={whatsappProjetosUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                Orçamento
              </a>
            </Button>
          </div>

          {(loading || isAuthenticated) && (
            <button
              type="button"
              className="md:hidden flex h-12 min-w-[44px] items-center justify-center text-white touch-manipulation -mr-2"
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
          )}
        </div>

        {!loading && !isAuthenticated && (
          <div className="md:hidden pb-3">
            <div className="mx-auto grid max-w-[24rem] grid-cols-4 overflow-hidden rounded-full border border-white/12 bg-black/45 p-1 text-center text-[12px] font-bold text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <Link
                href="/projetos"
                className="rounded-full px-2 py-2.5 transition-colors hover:bg-white/10"
              >
                Projetos
              </Link>
              <Link
                href="/contato"
                className="rounded-full px-2 py-2.5 transition-colors hover:bg-white/10"
              >
                Contato
              </Link>
              <Link
                href="/entrar"
                className="rounded-full px-2 py-2.5 transition-colors hover:bg-white/10"
              >
                Portal
              </Link>
              <a
                href={whatsappProjetosUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 rounded-full bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.18)] transition-colors hover:bg-orbit-electric"
              >
                <MessageCircle className="size-3.5" />
                Orçar
              </a>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden
            />
            <div className="md:hidden relative z-50 py-4 border-t border-white/10 bg-black/90 backdrop-blur-xl rounded-b-xl">
            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                className="text-white/90 hover:text-orbit-electric transition-colors py-3 px-4 rounded-lg hover:bg-white/5 min-h-[44px] flex items-center touch-manipulation"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                href="/projetos"
                className="text-white/90 hover:text-orbit-electric transition-colors py-3 px-4 rounded-lg hover:bg-white/5 min-h-[44px] flex items-center touch-manipulation"
                onClick={() => setIsMenuOpen(false)}
              >
                Projetos
              </Link>
              <Link
                href="/contato"
                className="text-white/90 hover:text-orbit-electric transition-colors py-3 px-4 rounded-lg hover:bg-white/5 min-h-[44px] flex items-center touch-manipulation"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              {!loading && isAuthenticated && (
                <Link
                  href="/forum"
                  className="text-white/90 hover:text-orbit-electric transition-colors py-3 px-4 rounded-lg hover:bg-white/5 min-h-[44px] flex items-center touch-manipulation"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Fórum
                </Link>
              )}
              {!loading && isAuthenticated && user?.role === "STUDENT" && (
                <Link
                  href={cursos.length > 0 ? `/estudante/cursos/${cursos[0].slug}` : "/estudante/aulas"}
                  className="text-white/90 hover:text-orbit-electric transition-colors py-3 px-4 rounded-lg hover:bg-white/5 min-h-[44px] flex items-center touch-manipulation font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sala de Aula
                </Link>
              )}
              {!loading && isAuthenticated && user ? (
                <Link
                  href={user.role === "FREELANCER" ? "/colaborador" : "/estudante"}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white/90 hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {getDisplayAvatarUrl(user.avatarUrl) ? (
                    <img src={getDisplayAvatarUrl(user.avatarUrl)!} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-xs font-bold text-black">
                      {initials}
                    </span>
                  )}
                  {user.role === "FREELANCER" ? "Área Colaborador" : "Área do Estudante"}
                </Link>
              ) : (
                <Link
                  href="/entrar"
                  className="text-white/90 hover:text-orbit-electric transition-colors py-3 px-4 rounded-lg hover:bg-white/5 min-h-[44px] flex items-center touch-manipulation"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Portal
                </Link>
              )}
              <a
                href={whatsappProjetosUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-3 text-sm font-bold text-black shadow-[0_0_16px_rgba(0,212,255,0.2)] transition-all duration-150 hover:opacity-90"
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
