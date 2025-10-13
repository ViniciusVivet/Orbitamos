"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function Entrar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-black text-white">
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top_right,rgba(59,130,246,.25),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,.25),transparent_50%)]" />
      <div className="absolute inset-0 opacity-30" aria-hidden>
        <svg className="size-full" viewBox="0 0 800 600">
          <defs>
            <radialGradient id="g" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {Array.from({ length: 160 }).map((_, i) => (
            <circle key={i} cx={(Math.random()*800).toFixed(0)} cy={(Math.random()*600).toFixed(0)} r={Math.random()*1.2+0.2} fill="url(#g)" />
          ))}
        </svg>
      </div>

      {/* Nebula */}
      <div className="absolute -top-40 left-1/2 h-[700px] w-[1200px] -translate-x-1/2 rounded-full blur-3xl opacity-40 bg-[conic-gradient(from_120deg,theme(colors.orbit-electric/.7),theme(colors.orbit-purple/.6),transparent_70%)]" />

      <div className="relative container mx-auto grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-16">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-orbit rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" />
            <h1 className="bg-gradient-to-br from-orbit-electric via-white to-orbit-purple bg-clip-text text-3xl font-extrabold text-transparent">
              Entrar na Órbita
            </h1>
            <p className="mt-2 text-white/70">Acesse sua conta para continuar sua jornada.</p>
          </div>

          <form className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-white/80">E-mail</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="bg-black/40 border-white/20 text-white placeholder:text-white/40"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-white/80">Senha</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-black/40 border-white/20 text-white placeholder:text-white/40"
                required
              />
            </div>

            <Button className="mt-2 w-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-black hover:from-orbit-purple hover:to-orbit-electric font-bold">
              🚀 Entrar
            </Button>

            <div className="flex items-center justify-between text-sm text-white/70">
              <Link href="#" className="hover:text-white">Esqueci minha senha</Link>
              <Link href="#" className="hover:text-white">Criar conta</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


