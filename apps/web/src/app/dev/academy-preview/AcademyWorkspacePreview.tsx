"use client";
import { useSearchParams } from "next/navigation";
import { AcademyPreview } from "@/components/estudante/PracticeStation";
import AcademyTracks from "@/components/estudante/AcademyTracks";
import AcademyCommunity from "@/components/estudante/AcademyCommunity";
import AcademyActivityProgress from "@/components/estudante/AcademyActivityProgress";
import StudentHome from "@/components/portal/StudentHome";
import { cursos } from "@/lib/cursos";
import { defaultProgress } from "@/contexts/ProgressContext";
import type { AcademySection } from "@/lib/portalNavigation";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";

export default function AcademyWorkspacePreview() {
  const params = useSearchParams();
  const view = params.get("view");
  const activity = params.get("activity");
  const section: AcademySection = activity === "sql" ? "tracks" : activity ? "practice" : view === "home" ? "home" : view === "tracks" ? "tracks" : view === "progress" ? "progress" : view === "community" ? "community" : "practice";
  const practiceMode = activity === "english" ? "english" : activity === "review" ? "review" : "games";
  return <LaboratoryPreviewFrame section={section} practiceMode={practiceMode} showDock={!activity} userId="academy-preview">
    {section === "home" ? <StudentHome name="orbitante" userId="academy-preview" preview progress={defaultProgress} progressLoading={false} courses={cursos} nextLesson={null} completedLessons={0} loading={false} error="" summary={null} retry={() => {}}/>
      : !activity && section === "tracks" ? <AcademyTracks courses={cursos} preview/>
      : section === "progress" ? <><header className="mx-auto mb-7 max-w-6xl text-[#edf2ee]"><p className="text-xs uppercase tracking-widest text-[#bfd9c1]">ORBITAMOS ACADEMY / PROGRESSO</p><h1 className="my-4 text-4xl font-bold tracking-tight">Seu esforço deixa um caminho.</h1><p className="max-w-2xl text-sm leading-7 text-[#b9c7cd]">Aqui estão as atividades locais desta prévia. O histórico de aulas e os dados da conta continuam no portal autenticado.</p></header><AcademyActivityProgress userId="academy-preview" preview/></>
      : section === "community" ? <AcademyCommunity preview/>
      : <AcademyPreview/>}
  </LaboratoryPreviewFrame>;
}
