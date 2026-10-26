import { notFound } from "next/navigation";
import { PraticaWorkspace } from "@/app/estudante/pratica/[slug]/page";
import LaboratoryPreviewFrame from "../../LaboratoryPreviewFrame";

export default async function IdePreviewPage({ searchParams }: { searchParams: Promise<{ academy?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const academy = (await searchParams).academy === "1";
  return <LaboratoryPreviewFrame section="practice" practiceMode="code" userId={academy ? "academy-preview" : undefined}><PraticaWorkspace userId={academy ? "academy-preview" : "ide-preview"} preview={academy}/></LaboratoryPreviewFrame>;
}
