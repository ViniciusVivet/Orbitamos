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
  type MaterialAula,
} from "@/lib/cursos";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/contexts/ProgressContext";
import { addProgressLesson } from "@/lib/api";
import type { UserId } from "@/lib/api";
import { flattenCourseLessons, getLessonGuide } from "@/lib/learningExperience";
import LessonQuickQuiz from "@/components/estudante/LessonQuickQuiz";

const STORAGE_KEY = "orbitacademy-progress";
const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{6,20}$/;

function getYoutubeEmbedUrl(videoId: string | undefined): string | null {
  if (!videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

function getMaterialDownloadUrl(material: MaterialAula): string {
  const separator = material.url.includes("?") ? "&" : "?";
  return `${material.url}${separator}download=1`;
}

function getMaterialExtension(material: MaterialAula): string {
  const urlPath = material.url.split("?")[0].toLowerCase();
  const fromUrl = urlPath.match(/\.([a-z0-9]+)$/)?.[1];
  if (fromUrl) return fromUrl;
  return material.tipo.toLowerCase();
}

type MaterialMeta = {
  filename: string;
  contentType: string;
  size: number;
};

function getExtensionFromFilename(filename: string): string {
  return filename.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? "";
}

function MaterialPreview({ material }: { material: MaterialAula }) {
  const [origin, setOrigin] = useState("");
  const [meta, setMeta] = useState<MaterialMeta | null>(null);
  const [metaError, setMetaError] = useState(false);
  const extension = meta ? getExtensionFromFilename(meta.filename) : getMaterialExtension(material);
  const downloadUrl = getMaterialDownloadUrl(material);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let active = true;
    setMeta(null);
    setMetaError(false);

    const separator = material.url.includes("?") ? "&" : "?";
    fetch(`${material.url}${separator}meta=1`)
      .then((response) => {
        if (!response.ok) throw new Error("Não foi possível resolver o material.");
        return response.json() as Promise<MaterialMeta>;
      })
      .then((data) => {
        if (active) setMeta(data);
      })
      .catch(() => {
        if (active) setMetaError(true);
      });

    return () => {
      active = false;
    };
  }, [material.url]);

  if (!meta && !metaError) {
    return (
      <div className="flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
        <div className="text-sm font-semibold text-white/70">Preparando previa do material...</div>
      </div>
    );
  }

  if (extension === "pdf") {
    return (
      <iframe
        className="h-full min-h-[70vh] w-full bg-white"
        src={material.url}
        title={material.titulo}
      />
    );
  }

  if (["doc", "docx", "xls", "xlsx", "xlsm", "ppt", "pptx"].includes(extension) && origin) {
    const absoluteUrl = new URL(material.url, origin).toString();
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;

    return (
      <iframe
        className="h-full min-h-[70vh] w-full bg-white"
        src={viewerUrl}
        title={material.titulo}
      />
    );
  }

  return (
    <div className="flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-sm font-semibold text-white/70">Prévia indisponível para este formato</div>
      <a
        href={downloadUrl}
        className="rounded-full border border-orbit-electric/50 px-4 py-2 text-sm font-semibold text-orbit-electric hover:bg-orbit-electric/10"
      >
        Baixar material
      </a>
    </div>
  );
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
  const flatLessons = useMemo(() => (curso ? flattenCourseLessons(curso) : []), [curso]);
  const currentLessonIndex = useMemo(
    () => flatLessons.findIndex((item) => item.aula.id === aulaId),
    [flatLessons, aulaId]
  );
  const lessonGuide = useMemo(
    () => (curso && aula ? getLessonGuide(curso, aula, Math.max(currentLessonIndex, 0)) : null),
    [curso, aula, currentLessonIndex]
  );
  const youtubeEmbedUrl = getYoutubeEmbedUrl(aula?.youtubeVideoId);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const selectedMaterial = useMemo(() => {
    const materiais = aula?.materiais ?? [];
    return materiais.find((material) => material.id === selectedMaterialId) ?? materiais[0] ?? null;
  }, [aula?.materiais, selectedMaterialId]);
  const concluidasCount = concluidas.length;
  const percent = total > 0 ? Math.round((concluidasCount / total) * 100) : 0;
  const nextAulaId = curso && aulaId ? proximaAulaId(curso, aulaId) : null;

  useEffect(() => {
    setSelectedMaterialId(null);
  }, [aulaId]);

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
        <p className="text-white/70">Curso não encontrado.</p>
        <Link href="/estudante/aulas" className="text-orbit-electric hover:underline">
          Voltar para Aulas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      {/* Sidebar do curso: módulos e aulas */}
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

      {/* Área principal: vídeo e conteúdo */}
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
                {nextAulaId ? "Concluir e ir para próxima aula" : "Concluir aula"}
              </button>
            </div>
            {lessonGuide && (
              <div className="mb-4 grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
                <section className="rounded-xl border border-orbit-electric/20 bg-orbit-electric/[0.06] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orbit-electric/80">
                        Aula guiada
                      </p>
                      <h2 className="mt-1 text-lg font-black text-white">O que fazer agora</h2>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold text-white/60">
                      {lessonGuide.estimatedMinutes} min
                    </span>
                  </div>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {lessonGuide.objectives.map((objective) => (
                      <li key={objective} className="flex gap-2 rounded-lg bg-black/25 px-3 py-2 text-sm text-white/72">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orbit-electric" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/38">
                    Checklist da aula
                  </p>
                  <div className="mt-3 space-y-2">
                    {lessonGuide.checklist.map((item) => (
                      <label key={item} className="flex items-center gap-3 rounded-lg bg-black/25 px-3 py-2 text-sm text-white/72">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/20 bg-black text-orbit-electric accent-cyan-300"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            )}
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black lg:max-w-3xl">
                {youtubeEmbedUrl ? (
                  <div className="aspect-video w-full">
                    <iframe
                      className="h-full w-full"
                      src={youtubeEmbedUrl}
                      title={aula.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : selectedMaterial ? (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{selectedMaterial.titulo}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                          {selectedMaterial.tipo}
                        </div>
                      </div>
                      <a
                        href={getMaterialDownloadUrl(selectedMaterial)}
                        className="shrink-0 rounded-full border border-orbit-electric/50 px-3 py-1.5 text-xs font-bold text-orbit-electric hover:bg-orbit-electric/10"
                      >
                        Baixar arquivo
                      </a>
                    </div>
                    <MaterialPreview material={selectedMaterial} />
                  </div>
                ) : (
                  <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-3 px-6 text-center">
                    <div className="text-sm font-semibold text-white/70">Aula em material guiado</div>
                    <div className="max-w-sm text-xs leading-5 text-white/45">
                      Esta aula ainda não tem vídeo publicado. Use os materiais anexos para estudar e aplicar a prática.
                    </div>
                  </div>
                )}
              </div>
              {(lessonGuide || aula.conteudo || (aula.materiais?.length ?? 0) > 0) && (
                <div className="flex-1 space-y-4">
                  {lessonGuide && (
                    <>
                      <div className="rounded-xl border border-orbit-purple/25 bg-orbit-purple/[0.07] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orbit-purple/80">
                          Exercício prático
                        </p>
                        <h2 className="mt-2 text-lg font-black text-white">{lessonGuide.practice.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-white/64">{lessonGuide.practice.description}</p>
                        <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-3 text-xs leading-5 text-white/55">
                          <span className="font-bold text-white/80">Entrega esperada: </span>
                          {lessonGuide.practice.deliverable}
                        </div>
                      </div>

                      <LessonQuickQuiz
                        key={aula.id}
                        questions={lessonGuide.quiz}
                        storageKey={userId ? `orbitamos-quiz-${userId}-${aula.id}` : null}
                      />
                    </>
                  )}
                  {aula.conteudo && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 whitespace-pre-line">
                      {aula.conteudo}
                    </div>
                  )}
                  {(aula.materiais?.length ?? 0) > 0 && (
                    <div className="rounded-xl border border-orbit-electric/20 bg-orbit-electric/5 p-4">
                      <h2 className="text-sm font-bold text-orbit-electric">Materiais da aula</h2>
                      <div className="mt-3 space-y-2">
                        {aula.materiais!.map((material) => (
                          <div
                            key={material.id}
                            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                              selectedMaterial?.id === material.id
                                ? "border-orbit-electric/50 bg-orbit-electric/10 text-orbit-electric"
                                : "border-white/10 bg-black/30 text-white/75 hover:border-orbit-electric/40 hover:text-orbit-electric"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedMaterialId(material.id)}
                              className="min-w-0 flex-1 text-left"
                            >
                              <span className="block truncate">{material.titulo}</span>
                              <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-white/35">
                                {material.tipo}
                              </span>
                            </button>
                            <a
                              href={getMaterialDownloadUrl(material)}
                              className="shrink-0 rounded border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:border-orbit-electric/40 hover:text-orbit-electric"
                            >
                              Baixar
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
