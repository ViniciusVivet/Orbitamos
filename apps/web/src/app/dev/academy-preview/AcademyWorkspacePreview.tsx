"use client";
import { useSearchParams } from "next/navigation";
import { AcademyPreview } from "@/components/estudante/PracticeStation";
import AcademyTracks from "@/components/estudante/AcademyTracks";
import AcademyCommunity from "@/components/estudante/AcademyCommunity";
import AcademyActivityProgress from "@/components/estudante/AcademyActivityProgress";
import StudentHome from "@/components/portal/StudentHome";
import AcademyLessons from "@/components/estudante/AcademyLessons";
import AcademyMentoring from "@/components/estudante/AcademyMentoring";
import { cursos } from "@/lib/cursos";
import { defaultProgress } from "@/contexts/ProgressContext";
import type { AcademySection } from "@/lib/portalNavigation";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";

export default function AcademyWorkspacePreview() {
  const params = useSearchParams();
  const view = params.get("view");
  const activity = params.get("activity");
  const section: AcademySection = activity === "sql" ? "tracks" : activity ? "practice" : view === "home" ? "home" : view === "tracks" || view === "lessons" ? "tracks" : view === "progress" ? "progress" : view === "community" || view === "mentoring" ? "community" : "practice";
  const practiceMode = activity === "english" ? "english" : activity === "review" ? "review" : "games";
  return <LaboratoryPreviewFrame section={section} practiceMode={practiceMode} showDock={!activity} userId="academy-preview">
    {section === "home" ? <StudentHome name="orbitante" userId="academy-preview" preview progress={defaultProgress} progressLoading={false} courses={cursos} nextLesson={null} completedLessons={0} loading={false} error="" summary={null} retry={() => {}}/>
      : !activity && view === "lessons" ? <AcademyLessons preview/>
      : !activity && view === "mentoring" ? <AcademyMentoring/>
      : !activity && section === "tracks" ? <AcademyTracks courses={cursos} preview/>
      : section === "progress" ? <><header className="mx-auto mb-6 max-w-6xl text-[#edf2ee]"><h1 className="text-3xl font-semibold tracking-tight">Seu progresso</h1></header><AcademyActivityProgress userId="academy-preview" preview/></>
      : section === "community" ? <AcademyCommunity preview/>
      : <AcademyPreview/>}
  </LaboratoryPreviewFrame>;
}
