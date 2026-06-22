"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buscarCursoAcademyPorSlug,
  totalAulas,
  aulaNoCurso,
  proximaAulaId,
  marcarAulaAcademyConcluida,
  listarAulasConcluidas,
  type Curso,
} from "@/lib/cursos";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { addProgressLesson } from "@/lib/api";
import type { UserId } from "@/lib/api";

const STORAGE_KEY = "orbitacademy-progress";
const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{6,20}$/;

function getYoutubeEmbedUrl(videoId: string | undefined): string | null {
  if (!videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

function getStoredProgress(cursoSlug: string, userId: UserId | undefined): string[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${userId}-${cursoSlug}`);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data.concluidas) ? data.concluidas : [];
  } catch {
    return [];
  }
}

function setStoredProgress(
  cursoSlug: string,
  userId: UserId | undefined,
  concluidas: string[],
  ultimaAulaId: string | null
) {
  if (typeof window === "undefined" || !userId) return;
  localStorage.setItem(
    `${STORAGE_KEY}-${userId}-${cursoSlug}`,
    JSON.stringify({ concluidas, ultimaAulaId })
  );
}

export default function CursoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, token } = useAuth();
  const { refetchProgress } = useProgress();
  const userId = user?.id;

  const [curso, setCurso] = useState<Curso | null | undefined>(undefined);
  const total = curso ? totalAulas(curso) : 0;

  const [aulaId, setAulaId] = useState<string | null>(null);
  const [concluidas, setConcluidas] = useState<string[]>([]);
  const [modulosAbertos, setModulosAbertos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    setCurso(undefined);
    buscarCursoAcademyPorSlug(slug)
      .then((item) => {
        if (active) setCurso(item ?? null);
      })
      .catch(() => {
        if (active) setCurso(null);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!curso) return;
    const stored = getStoredProgress(slug, userId);
    const lessonIds = curso.modulos.flatMap((mod) => mod.aulas.map((aula) => aula.id));
    listarAulasConcluidas(lessonIds)
      .then((completed) => {
        setConcluidas(completed.length > 0 ? completed : stored);
      })
      .catch(() => setConcluidas(stored));
    if ((!aulaId || !aulaNoCurso(curso, aulaId)) && curso.modulos[0]?.aulas[0]) {
      setAulaId(curso.modulos[0].aulas[0].id);
    }
    curso.modulos.forEach((m) => {
      setModulosAbertos((prev) => ({ ...prev, [m.id]: true }));
    });
  }, [curso, slug, userId]);

  const aula = useMemo(() => (curso && aulaId ? aulaNoCurso(curso, aulaId) : undefined), [curso, aulaId]);
  const youtubeEmbedUrl = getYoutubeEmbedUrl(aula?.youtubeVideoId);
  const concluidasCount = concluidas.length;
  const percent = total > 0 ? Math.round((concluidasCount / total) * 100) : 0;

  const marcarConcluida = useCallback(async () => {
    if (!aulaId || !curso || !userId) return;
    const next = proximaAulaId(curso, aulaId);
    const newConcluidas = concluidas.includes(aulaId) ? concluidas : [...concluidas, aulaId];
    setConcluidas(newConcluidas);
    setStoredProgress(slug, userId, newConcluidas, next ?? aulaId);
    if (token && aula) {
      try {
        await marcarAulaAcademyConcluida(aulaId);
        await addProgressLesson(token, { xpGained: 10, lessonTitle: aula.titulo });
        await refetchProgress();
      } catch {
        // progresso local já atualizado; falha na API não bloqueia
      }
    }
    if (next) setAulaId(next);
  }, [aulaId, curso, slug, userId, concluidas, token, aula, refetchProgress]);

  if (curso === undefined) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
        <p className="text-white/70">Carregando curso...</p>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-white/70">Curso nao encontrado.</p>
        <Link href="/estudante/aulas" className="text-orbit-electric hover:underline">
          Voltar para Aulas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      {/* Sidebar do curso: modulos e aulas */}
      <aside className="w-full shrink-0 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm md:w-72">
        <Link href="/estudante/aulas" className="mb-2 block text-sm text-orbit-electric hover:underline">
          ← Voltar aos cursos
        </Link>
        <h2 className="mb-2 text-lg font-bold text-white">{curso.titulo}</h2>
        <div className="mb-3 text-sm text-white/70">
          {concluidasCount} de {total} aulas
        </div>
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <nav className="space-y-1">
          {curso.modulos.map((mod) => {
            const aberto = modulosAbertos[mod.id] ?? true;
            return (
              <div key={mod.id}>
                <button
                  type="button"
                  onClick={() =>
                    setModulosAbertos((prev) => ({ ...prev, [mod.id]: !aberto }))
                  }
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm font-medium text-white/90 hover:bg-white/5"
                >
                  {mod.titulo}
                  <span className="text-white/50">{aberto ? "−" : "+"}</span>
                </button>
                {aberto && (
                  <ul className="ml-2 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                    {mod.aulas.map((a) => {
                      const done = concluidas.includes(a.id);
                      const active = a.id === aulaId;
                      return (
                        <li key={a.id}>
                          <button
                            type="button"
                            onClick={() => setAulaId(a.id)}
                            className={`w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
                              active
                                ? "bg-orbit-electric/20 text-orbit-electric"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className="mr-2">{done ? "✓" : "○"}</span>
                            {a.titulo}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Area principal: video e conteudo */}
      <main className="min-w-0 flex-1">
        {aula ? (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <h1 className="text-lg font-bold text-white sm:text-xl md:text-2xl">{aula.titulo}</h1>
              <button
                type="button"
                onClick={marcarConcluida}
                className="w-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple px-4 py-3 text-sm font-bold text-black hover:opacity-90 touch-manipulation sm:w-auto"
              >
                Concluir e ir para proxima aula
              </button>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black lg:max-w-2xl">
                {youtubeEmbedUrl ? (
                  <iframe
                    className="h-full w-full"
                    src={youtubeEmbedUrl}
                    title={aula.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-white/50">
                    Video indisponivel para esta aula.
                  </div>
                )}
              </div>
              {aula.conteudo && (
                <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 whitespace-pre-line">
                  {aula.conteudo}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-white/70">Selecione uma aula na barra lateral.</p>
        )}
      </main>
    </div>
  );
}
