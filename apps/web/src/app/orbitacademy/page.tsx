"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StudyTools from "@/components/StudyTools";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress, defaultProgress } from "@/contexts/ProgressContext";
import {
  discordUrl,
  instagramUrl,
  youtubeChannelUrl,
  youtubeFeaturedEmbed,
} from "@/lib/social";

export default function OrbitAcademy() {
  const { isAuthenticated } = useAuth();
  const { progress } = useProgress();
  const isLocked = !isAuthenticated;

  const level = progress?.level ?? defaultProgress.level;
  const xp = progress?.xp ?? defaultProgress.xp;
  const streak = progress?.streakDays ?? defaultProgress.streakDays;
  const lastLesson = progress?.lastLesson ?? defaultProgress.lastLesson ?? "";

  // Filtros e cursos (mock)
  const [track, setTrack] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [format, setFormat] = useState("all");
  const [showLogin, setShowLogin] = useState(false);

  const courses = [
    { slug: "html-css-basico", title: "HTML/CSS Basico", track: "frontend", level: "iniciante", format: "curso" },
    { slug: "js-essencial", title: "JS Essencial", track: "frontend", level: "iniciante", format: "curso" },
    { slug: "react-iniciantes", title: "React para Iniciantes", track: "frontend", level: "intermediario", format: "curso" },
    { slug: "html-css-basico", title: "Fundamentos de QA", track: "qa", level: "iniciante", format: "curso" },
    { slug: "html-css-basico", title: "Bootcamp Portfolio", track: "geral", level: "intermediario", format: "bootcamp" },
  ];

  const filtered = useMemo(() => courses.filter(c =>
    (track === "all" || c.track === track) &&
    (levelFilter === "all" || c.level === levelFilter) &&
    (format === "all" || c.format === format)
  ), [track, levelFilter, format]);

  const quickVideo = youtubeFeaturedEmbed;
  const youtubeChannel = youtubeChannelUrl;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* HUD */}
      <section className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
              <div className="text-xs text-white/70">Level</div>
              <div className="text-lg font-bold">{level}</div>
            </div>
            <div className="w-64">
              <div className="text-xs text-white/70 mb-1">XP</div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" style={{ width: `${xp}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm">Streak: {streak} dias</div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm">🔒 Cofre</div>
          </div>
          <Link href="#" className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-2 text-black font-bold">Continuar: {lastLesson}</Link>
        </div>
      </section>

      {/* Conteúdo principal */}
      <section className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-extrabold mb-6"><span className="gradient-text">OrbitAcademy</span> — aprendizado em órbita</h1>
        <p className="text-white/80 mb-10">Cursos e bootcamps, conteúdos rápidos e mapa de missões. Crie sua conta para liberar todo o potencial.</p>

        {isLocked && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/80">
            🔒 Cadastre-se já para liberar todos os cursos, XP e missões do OrbitAcademy.
          </div>
        )}

        {/* Filtros */}
        <div className={`mb-6 flex flex-wrap items-center gap-3 text-sm ${isLocked ? "pointer-events-none select-none blur-[1.5px]" : ""}`}>
          <label className="text-white/70">Trilha</label>
          <select className="rounded-md bg-white/10 px-2 py-1" value={track} onChange={e=>setTrack(e.target.value)}>
            <option value="all">Todas</option>
            <option value="frontend">Front-end</option>
            <option value="qa">QA</option>
            <option value="geral">Geral</option>
          </select>
          <label className="ml-4 text-white/70">Nível</label>
          <select className="rounded-md bg-white/10 px-2 py-1" value={levelFilter} onChange={e=>setLevelFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
          </select>
          <label className="ml-4 text-white/70">Formato</label>
          <select className="rounded-md bg-white/10 px-2 py-1" value={format} onChange={e=>setFormat(e.target.value)}>
            <option value="all">Todos</option>
            <option value="curso">Curso</option>
            <option value="bootcamp">Bootcamp</option>
          </select>
        </div>

        {/* Grid: Cursos/Bootcamps */}
        <div className={`grid md:grid-cols-3 gap-6 mb-12 ${isLocked ? "pointer-events-none select-none blur-[1.5px]" : ""}`}>
          <Card className="relative bg-white/5 border-white/10 md:col-span-2">
            {isLocked && (
              <span className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-widest text-white/70">
                Cadastre-se já
              </span>
            )}
            <CardHeader>
              <CardTitle>Trilhas e Cursos</CardTitle>
              <CardDescription>HTML/CSS/JS, React, QA, Dados…</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {filtered.map((c, i) => (
                  <div key={`${c.slug}-${i}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-1 text-sm font-semibold">{c.title}</div>
                    <div className="mb-2 text-xs text-white/60">{c.track} • {c.level} • {c.format}</div>
                    <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-0 rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" />
                    </div>
                    {isAuthenticated ? (
                      <Link href={`/estudante/cursos/${c.slug}`} className="text-xs text-orbit-electric hover:underline">Iniciar / Retomar</Link>
                    ) : (
                      <button onClick={()=>setShowLogin(true)} className="text-xs text-orbit-electric hover:underline">Iniciar / Retomar (entrar)</button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-white/5 border-white/10">
            {isLocked && (
              <span className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-widest text-white/70">
                Cadastre-se já
              </span>
            )}
            <CardHeader>
              <CardTitle>Bootcamps</CardTitle>
              <CardDescription>Imersões com prática intensiva</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-white/80">
                <div>• Sprint de Portfólio (em breve)</div>
                <div>• APIs Node (em breve)</div>
              </div>
              <div className="mt-4 text-sm text-orbit-electric">Entrar para receber aviso</div>
            </CardContent>
          </Card>

          <Card className="relative bg-white/5 border-white/10">
            {isLocked && (
              <span className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-widest text-white/70">
                Cadastre-se já
              </span>
            )}
            <CardHeader>
              <CardTitle>Conteúdos Rápidos</CardTitle>
              <CardDescription>Instagram • YouTube • Facebook</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <iframe
                  className="h-44 w-full rounded-lg border border-white/10"
                  src={quickVideo}
                  title="OrbitAcademy Video"
                  allowFullScreen
                ></iframe>
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Curadoria oficial do canal.</span>
                  <Link href={youtubeChannel} className="text-orbit-electric hover:underline" target="_blank" rel="noreferrer">
                    Ir para o YouTube
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instagram + Comunidade */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Instagram oficial</CardTitle>
              <CardDescription>Conteúdos e bastidores da Orbitamos</CardDescription>
            </CardHeader>
            <CardContent>
              <iframe
                className="h-72 w-full rounded-lg border border-white/10"
                src="https://www.instagram.com/orbitamosbr/embed"
                title="Orbitamos Instagram"
              ></iframe>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Siga a Orbitamos</CardTitle>
              <CardDescription>Receba novidades e avisos de vagas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p>Nos acompanhe para conteúdos rápidos, lives e novidades da comunidade.</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-2 text-black font-bold"
                >
                  Seguir no Instagram
                </Link>
                <Link
                  href={discordUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80"
                >
                  Comunidade (Discord)
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa básico de missões */}
        <div className={`rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl ${isLocked ? "pointer-events-none select-none blur-[1.5px]" : ""}`}>
          <div className="mb-4 text-sm text-white/80">Mapa de Missões (preview)</div>
          <div className="relative h-56">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 220">
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00D4FF"/>
                  <stop offset="100%" stopColor="#8B5CF6"/>
                </linearGradient>
              </defs>
              <path d="M 60 180 C 220 40, 380 260, 540 100" stroke="url(#grad)" strokeWidth="2" fill="none" opacity=".6" />
              <circle cx="60" cy="180" r="8" fill="url(#grad)" />
              <circle cx="300" cy="80" r="8" fill="url(#grad)" />
              <circle cx="540" cy="100" r="8" fill="url(#grad)" />
            </svg>
            <div className="absolute bottom-0 left-0 rounded-md bg-white/10 px-2 py-1 text-xs">Missão 1 (preview)</div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 rounded-md bg-white/10 px-2 py-1 text-xs">Missão 2 (cadeado)</div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 rounded-md bg-white/10 px-2 py-1 text-xs">Missão 3 (cadeado)</div>
          </div>
          <div className="mt-3 text-sm text-orbit-electric">Entre para desbloquear missões e ganhar XP</div>
          {/* Controles de simulação (visíveis apenas como mock) */}
          <div className="mt-4 flex gap-3 text-xs text-white/70">
            <button className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20" onClick={() => setXp((v)=> Math.min(100, v+10))}>+10 XP</button>
            <button className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20" onClick={() => setStreak((v)=> v+1)}>+1 Streak</button>
            <button className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20" onClick={() => setLevel((v)=> v+1)}>Subir Level</button>
          </div>
        </div>

        {/* Ferramentas de Estudo */}
        <div className={`mt-12 ${isLocked ? "pointer-events-none select-none blur-[1.5px]" : ""}`}>
          <h2 className="mb-4 text-2xl font-bold">Ferramentas de Estudo</h2>
          <StudyTools />
        </div>
      </section>

      {/* Modal de login (gating) */}
      {showLogin && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/80 p-6 text-center">
            <h3 className="mb-2 text-lg font-bold">Entre para continuar</h3>
            <p className="mb-4 text-sm text-white/70">Crie sua conta para iniciar cursos, ganhar XP e salvar seu progresso.</p>
            <div className="flex justify-center gap-3">
              <Link href="/entrar" className="rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-2 text-black font-bold">Entrar</Link>
              <button onClick={()=>setShowLogin(false)} className="rounded-full border border-white/20 px-4 py-2 text-sm">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


