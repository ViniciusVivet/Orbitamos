"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { defaultProgress, useProgress } from "@/contexts/ProgressContext";
import { getDashboardSummary, type DashboardSummary } from "@/lib/api";
import { getNextIncompleteLesson, type FlatLesson } from "@/lib/learningExperience";
import { listarAulasConcluidas, listarCursosAcademy, type Curso } from "@/lib/cursos";
import StudentHome from "@/components/portal/StudentHome";

export default function EstudanteInicio() {
  const { user, token } = useAuth();
  const { progress, loading: progressLoading, refetchProgress } = useProgress();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [courses, setCourses] = useState<Curso[]>([]);
  const [nextLesson, setNextLesson] = useState<FlatLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [courseError, setCourseError] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!token) return;
    let active = true;
    getDashboardSummary(token).then(value => {
      if (active) { setSummary(value); setSummaryError(""); }
    }).catch(() => {
      if (active) setSummaryError("Seu resumo não sincronizou. Você pode continuar pelas aulas.");
    });
    return () => { active = false; };
  }, [token, revision]);

  useEffect(() => {
    let active = true;
    async function loadAcademy() {
      setLoading(true);
      setCourseError("");
      try {
        const items = await listarCursosAcademy();
        const ids = items.flatMap(c => c.modulos.flatMap(m => m.aulas.map(a => a.id)));
        const completed = new Set(await listarAulasConcluidas(ids));
        if (!active) return;
        setCourses(items);
        setCompletedLessons(ids.filter(id => completed.has(id)).length);
        setNextLesson(getNextIncompleteLesson(items, completed));
      } catch {
        if (active) setCourseError("Não foi possível atualizar suas aulas. Tente novamente para retomar seu progresso.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadAcademy();
    return () => { active = false; };
  }, [user?.id, revision]);

  return <StudentHome name={user?.name?.trim().split(" ")[0] || "estudante"}
    progress={progress ?? defaultProgress} progressLoading={progressLoading}
    courses={courses} nextLesson={nextLesson} completedLessons={completedLessons}
    loading={loading} error={courseError || summaryError} summary={summary}
    retry={() => { setRevision(value => value + 1); void refetchProgress(); }}/>;
}
