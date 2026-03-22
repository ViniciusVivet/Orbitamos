"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import LogoOrbitamos from "@/components/LogoOrbitamos";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayAvatarUrl } from "@/lib/api";
import { cursos } from "@/lib/cursos";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <LogoOrbitamos size={30} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white/90 hover:text-orbit-electric transition-colors">
              Início
            </Link>
            <Link href="/projetos" className="text-white/90 hover:text-orbit-electric transition-colors">
              Projetos
            </Link>
            <Link href="/contato" className="text-white/90 hover:text-orbit-electric transition-colors">
              Contato
            </Link>
            {!loading && isAuthenticated && (
              <Link href="/forum" className="text-white/90 hover:text-orbit-electric transition-colors">
                Fórum
              </Link>
            )}
            {!loading && isAuthenticated && user?.role === "STUDENT" && (
              <Link
                href={cursos.length > 0 ? `/estudante/cursos/${cursos[0].slug}` : "/estudante/aulas"}
                className="text-white/90 hover:text-orbit-electric transition-colors font-medium"
              >
                Sala de Aula
              </Link>
            )}
            {!loading && isAuthenticated && user ? (
              <Link
                href={user.role === "FREELANCER" ? "/colaborador" : "/estudante"}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/90 hover:bg-white/10 transition-colors"
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
              <Button 
                size="sm"
                className="bg-gradient-to-r from-orbit-electric to-orbit-purple hover:from-orbit-purple hover:to-orbit-electric text-black font-bold shadow-[0_0_20px_theme(colors.orbit-electric/.35)]"
                asChild
              >
                <Link href="/entrar">🚀 Entrar</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
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
        </div>

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
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-orbit-electric to-orbit-purple hover:from-orbit-purple hover:to-orbit-electric text-black font-bold w-full shadow-[0_0_20px_theme(colors.orbit-electric/.35)]"
                  asChild
                >
                  <Link href="/entrar">🚀 Entrar</Link>
                </Button>
              )}
            </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
