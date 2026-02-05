"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import LogoOrbitamos from "@/components/LogoOrbitamos";
import { useAuth } from "@/contexts/AuthContext";

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
              Home
            </Link>
            <Link href="/sobre" className="text-white/90 hover:text-orbit-electric transition-colors">
              Sobre
            </Link>
            <Link href="/mentorias" className="text-white/90 hover:text-orbit-electric transition-colors">
              Mentorias
            </Link>
            <Link href="/orbitacademy" className="text-white/90 hover:text-orbit-electric transition-colors">
              OrbitAcademy
            </Link>
            <Link href="/contato" className="text-white/90 hover:text-orbit-electric transition-colors">
              Contato
            </Link>
            
            {!loading && isAuthenticated && user ? (
              <Link
                href={user.role === "FREELANCER" ? "/colaborador" : "/estudante"}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/90 hover:bg-white/10 transition-colors"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
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
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 bg-black/60 backdrop-blur-xl rounded-b-xl">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-white/90 hover:text-orbit-electric transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/sobre" 
                className="text-white/90 hover:text-orbit-electric transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link 
                href="/mentorias" 
                className="text-white/90 hover:text-orbit-electric transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mentorias
              </Link>
              <Link 
                href="/orbitacademy" 
                className="text-white/90 hover:text-orbit-electric transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                OrbitAcademy
              </Link>
              <Link 
                href="/contato" 
                className="text-white/90 hover:text-orbit-electric transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              
              {!loading && isAuthenticated && user ? (
                <Link
                  href={user.role === "FREELANCER" ? "/colaborador" : "/estudante"}
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white/90 hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
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
        )}
      </div>
    </nav>
  );
}
