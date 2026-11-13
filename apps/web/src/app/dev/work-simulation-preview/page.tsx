import { notFound } from "next/navigation";
import WorkSimulation from "@/components/games/WorkSimulation";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";

export default async function WorkSimulationPreviewPage({ searchParams }: { searchParams: Promise<{ from?: string | string[] }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const query = await searchParams;
  const userId = query.from === "academy" ? "academy-preview" : "work-simulation-preview";
  return <LaboratoryPreviewFrame title="Simulações de trabalho" section="practice" practiceMode="games" userId={userId} hidePracticeNavigation>
    <WorkSimulation key={userId} userId={userId} preview onBackHref="/dev/academy-preview"/>
  </LaboratoryPreviewFrame>;
}
