"use client";

import { useEffect, useState } from "react";
import AcademyTracks from "./AcademyTracks";
import { cursos as fallbackCourses, listarCursosAcademy, type Curso } from "@/lib/cursos";
import { useAuth } from "@/contexts/AuthContext";

export default function AcademyTracksPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Curso[]>(fallbackCourses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    listarCursosAcademy().then(value => { if (active) { setCourses(value); setError(false); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <AcademyTracks courses={courses} loading={loading} error={error} userId={user?.id}/>;
}
