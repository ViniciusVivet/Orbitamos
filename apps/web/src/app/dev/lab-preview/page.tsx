import { notFound } from "next/navigation";
import { PraticaCatalog } from "@/app/estudante/pratica/page";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";

export default async function LaboratoryPreviewPage({ searchParams }: { searchParams: Promise<{ academy?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const academy = (await searchParams).academy === "1";
  return <LaboratoryPreviewFrame section="practice" practiceMode="code" showDock userId={academy ? "academy-preview" : undefined}><PraticaCatalog userId={academy ? "academy-preview" : "lab-preview"} preview/></LaboratoryPreviewFrame>;
}
