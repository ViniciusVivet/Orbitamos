"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { UserId } from "@/lib/api";
import {
  cursos as cursosFallback,
  getCourseTrackGroups,
  listarAulasConcluidas,
  listarCursosAcademy,
  totalAulas,
  type Aula,
  type Curso,
} from "@/lib/cursos";

const STORAGE_KEY = "orbitacademy-progress";

const courseVisuals = [
  "from-cyan-500/35 via-blue-950 to-black",
  "from-violet-500/35 via-fuchsia-950 to-black",
  "from-emerald-500/30 via-teal-950 to-black",
  "from-amber-500/30 via-orange-950 to-black",
  "from-sky-500/35 via-indigo-950 to-black",
  "from-rose-500/30 via-purple-950 to-black",
];

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s#+.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesSearch(text: string, query: string) {
  const normalizedText = normalizeSearch(text);
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;
  if (normalizedText.includes(normalizedQuery)) return true;

  return normalizedQuery.split(" ").every((term) => {
    if (normalizedText.includes(term)) return true;
    if (term.length < 3) return false;
    const words = normalizedText.split(" ");
    return words.some((word) => {
      const maxDistance = term.length >= 7 ? 2 : 1;
      if (Math.abs(word.length - term.length) > maxDistance) return false;
      let mismatches = 0;
      const length = Math.max(word.length, term.length);
      for (let index = 0; index < length; index += 1) {
        if (word[index] !== term[index]) mismatches += 1;
        if (mismatches > maxDistance) return false;
      }
      return true;
    });
  });
}

function getProgress(cursoSlug: string, userId: UserId | undefined) {
  if (typeof window === "undefined" || !userId) return { concluidas: 0 };
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${userId}-${cursoSlug}`);
    if (!raw) return { concluidas: 0 };
    const data = JSON.parse(raw);
    return { concluidas: Array.isArray(data.concluidas) ? data.concluidas.length : 0 };
  } catch {
    return { concluidas: 0 };
  }
}

type LessonResult = {
  aula: Aula;
  curso: Curso;
  modulo: string;
  completed: boolean;
};

export default function EstudanteAulas() {
  const { user } = useAuth();
  const userId = user?.id;
  const [cursos, setCursos] = useState<Curso[]>(cursosFallback);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    listarCursosAcademy()
      .then(async (items) => {
        if (!active) return;
        setCursos(items);
        const lessonIds = items.flatMap((curso) =>
          curso.modulos.flatMap((modulo) => modulo.aulas.map((aula) => aula.id))
        );
        const completed = await listarAulasConcluidas(lessonIds);
        if (active) setCompletedLessonIds(new Set(completed));
      })
      .catch(() => {
        if (active) setCursos(cursosFallback);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const progressByCourse = useMemo(() => {
    const map = new Map<string, number>();
    cursos.forEach((curso) => {
      const lessonIds = curso.modulos.flatMap((modulo) => modulo.aulas.map((aula) => aula.id));
      const fromSupabase = lessonIds.filter((id) => completedLessonIds.has(id)).length;
      map.set(curso.slug, fromSupabase || getProgress(curso.slug, userId).concluidas);
    });
    return map;
  }, [completedLessonIds, cursos, userId]);

  const allLessons = useMemo<LessonResult[]>(
    () =>
      cursos.flatMap((curso) =>
        curso.modulos.flatMap((modulo) =>
          modulo.aulas.map((aula) => ({
            aula,
            curso,
            modulo: modulo.titulo,
            completed: completedLessonIds.has(aula.id),
          }))
        )
      ),
    [completedLessonIds, cursos]
  );

  const trackGroups = useMemo(() => getCourseTrackGroups(cursos), [cursos]);
  const suggested =
    cursos.find((curso) => (progressByCourse.get(curso.slug) ?? 0) > 0 && (progressByCourse.get(curso.slug) ?? 0) < totalAulas(curso)) ??
    cursos.find((curso) => (progressByCourse.get(curso.slug) ?? 0) < totalAulas(curso)) ??
    cursos[0];

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return allLessons.filter(({ aula, curso, modulo }) =>
      matchesSearch(
        [aula.titulo, aula.conteudo, curso.titulo, curso.descricao, modulo].filter(Boolean).join(" "),
        query
      )
    );
  }, [allLessons, query]);

  const matchingCourses = useMemo(() => {
    if (!query.trim()) return [];
    return cursos.filter((curso) =>
      matchesSearch(
        [
          curso.titulo,
          curso.descricao,
          ...curso.modulos.map((modulo) => modulo.titulo),
          ...curso.modulos.flatMap((modulo) => modulo.aulas.map((aula) => aula.titulo)),
        ]
          .filter(Boolean)
          .join(" "),
        query
      )
    );
  }, [cursos, query]);

  function courseCard(curso: Curso, index: number, compact = false) {
    const total = totalAulas(curso);
    const completed = progressByCourse.get(curso.slug) ?? 0;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    return (
      <Link
        key={curso.id}
        href={`/estudante/cursos/${curso.slug}`}
        className={`group block shrink-0 snap-start ${compact ? "w-[230px] sm:w-[260px]" : "w-[260px] sm:w-[300px]"}`}
      >
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d12] transition duration-300 hover:-translate-y-1 hover:border-orbit-electric/45 hover:shadow-[0_18px_55px_rgba(0,212,255,.14)]">
          <div className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${courseVisuals[index % courseVisuals.length]}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,.22),transparent_30%)]" />
            <div className="absolute -right-8 -top-10 size-36 rounded-full border border-white/15" />
            <div className="absolute -right-2 top-2 size-24 rounded-full border border-white/10" />
            <div className="absolute inset-x-4 bottom-4">
              <span className="rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-white/75 backdrop-blur">
                OrbitAcademy
              </span>
              <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight text-white">{curso.titulo}</h3>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
              <span className="grid size-12 place-items-center rounded-full bg-white text-lg text-black shadow-xl">▶</span>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <p className="line-clamp-2 min-h-10 text-sm leading-5 text-white/55">
              {curso.descricao ?? `${total} aulas para avançar na sua jornada.`}
            </p>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/45">
                <span>{completed ? `${completed} de ${total} aulas` : `${total} aulas`}</span>
                <span className={percent === 100 ? "text-emerald-300" : "text-orbit-electric"}>{percent}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <div className="-mx-4 -mt-4 overflow-hidden pb-12 sm:-mt-6 lg:-mx-6 lg:-mt-8">
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-12">
        <div className="absolute inset-0 -z-20 bg-[#03050a]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_70%_at_80%_15%,rgba(139,92,246,.34),transparent_60%),radial-gradient(ellipse_60%_70%_at_15%_40%,rgba(0,212,255,.22),transparent_65%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-20 bg-gradient-to-t from-black to-transparent" />

        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-orbit-electric/25 bg-orbit-electric/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-orbit-electric">
            <Sparkles className="size-3" /> Seu universo de aprendizado
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-black leading-[1.1] text-white sm:text-3xl lg:text-4xl">
            Aprenda no seu ritmo.
            <span className="inline sm:block bg-gradient-to-r from-orbit-electric via-white to-orbit-purple bg-clip-text text-transparent">
              {" "}Evolua em cada missão.
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-white/60 sm:text-sm">
            Aulas, práticas e trilhas organizadas para você sair da teoria e construir projetos reais.
          </p>

          <div className="relative mt-5 max-w-3xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-orbit-electric" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="O que você quer estudar hoje?"
              aria-label="Pesquisar aulas e cursos"
              className="h-12 w-full rounded-xl border border-white/15 bg-black/45 pl-11 pr-11 text-sm text-white shadow-[0_12px_40px_rgba(0,0,0,.3)] outline-none backdrop-blur-xl transition placeholder:text-white/40 focus:border-orbit-electric/60 focus:ring-4 focus:ring-orbit-electric/10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar pesquisa"
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 pt-8 sm:px-8 lg:px-12">
        {loading && (
          <div className="flex items-center gap-3 text-sm text-white/50">
            <span className="size-5 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent" />
            Sincronizando seu catálogo...
          </div>
        )}

        {query.trim() ? (
          <section aria-live="polite">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">Busca inteligente</p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  {searchResults.length} {searchResults.length === 1 ? "aula encontrada" : "aulas encontradas"}
                </h2>
                <p className="mt-1 text-sm text-white/45">Resultados relacionados a “{query}”</p>
              </div>
              <Button variant="ghost" onClick={() => setQuery("")} className="text-white/60 hover:bg-white/10 hover:text-white">
                Ver tudo
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {searchResults.map(({ aula, curso, modulo, completed }, index) => (
                  <Link
                    key={`${curso.id}-${aula.id}`}
                    href={`/estudante/cursos/${curso.slug}`}
                    className="group flex min-h-40 overflow-hidden rounded-2xl border border-white/10 bg-white/[.035] transition hover:border-orbit-electric/40 hover:bg-white/[.07]"
                  >
                    <div className={`w-28 shrink-0 bg-gradient-to-br ${courseVisuals[index % courseVisuals.length]} sm:w-36`}>
                      <div className="grid h-full place-items-center text-3xl opacity-75">{completed ? "✓" : "▶"}</div>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col p-4">
                      <span className="text-[10px] font-bold uppercase tracking-[.16em] text-orbit-electric">{curso.titulo}</span>
                      <h3 className="mt-2 line-clamp-2 font-bold text-white group-hover:text-orbit-electric">{aula.titulo}</h3>
                      <p className="mt-1 truncate text-xs text-white/40">{modulo}</p>
                      <span className="mt-auto pt-3 text-xs text-white/55">{completed ? "Concluída" : "Abrir aula"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : matchingCourses.length > 0 ? (
              <div className="flex snap-x gap-4 overflow-x-auto pb-4">{matchingCourses.map((curso, index) => courseCard(curso, index))}</div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.025] px-6 py-14 text-center">
                <Search className="mx-auto size-8 text-white/25" />
                <h3 className="mt-4 text-lg font-bold text-white">Nenhuma aula apareceu por aqui</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
                  Tente uma tecnologia, tema ou habilidade, como “Python”, “banco de dados” ou “criar site”.
                </p>
              </div>
            )}
          </section>
        ) : (
          <>
            {suggested && (
              <section>
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-purple">Escolha da OrbitAcademy</p>
                  <h2 className="mt-1 text-2xl font-black text-white">Continue de onde parou</h2>
                </div>
                <div className="relative overflow-hidden rounded-3xl border border-orbit-purple/25 bg-gradient-to-r from-violet-950 via-[#11152a] to-cyan-950 p-6 sm:p-8">
                  <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
                  <div className="relative max-w-2xl">
                    <span className="text-xs font-bold uppercase tracking-[.16em] text-orbit-electric">Sua próxima missão</span>
                    <h3 className="mt-3 text-3xl font-black text-white">{suggested.titulo}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">{suggested.descricao}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button asChild className="rounded-full bg-white px-6 font-bold text-black hover:bg-white/90">
                        <Link href={`/estudante/cursos/${suggested.slug}`}>▶ Continuar estudando</Link>
                      </Button>
                      <span className="self-center text-xs text-white/45">
                        {progressByCourse.get(suggested.slug) ?? 0} de {totalAulas(suggested)} aulas concluídas
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-black text-white">Explore todos os cursos</h2>
              <p className="mt-1 text-sm text-white/45">Deslize para encontrar sua próxima habilidade.</p>
              <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 [scrollbar-color:rgba(255,255,255,.18)_transparent]">
                {cursos.map((curso, index) => courseCard(curso, index))}
              </div>
            </section>

            {trackGroups.map((track, trackIndex) => (
              <section key={track.id}>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
                      <span>{track.icon}</span> {track.titulo}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-white/45">{track.descricao}</p>
                  </div>
                  <span className="hidden text-xs text-white/35 sm:block">{track.cursos.length} cursos</span>
                </div>
                <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 [scrollbar-color:rgba(255,255,255,.18)_transparent]">
                  {track.cursos.map((curso, index) => courseCard(curso, index + trackIndex, true))}
                </div>
              </section>
            ))}

            <section className="rounded-3xl border border-white/10 bg-white/[.035] p-6 sm:p-8">
              <span className="text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">Em preparação</span>
              <h2 className="mt-2 text-2xl font-black text-white">Quizzes e desafios de código estão entrando em órbita.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                A estrutura será integrada às suas aulas e ao progresso real, sem substituir os materiais que já estão disponíveis.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
