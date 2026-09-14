import { notFound } from "next/navigation";
import { PraticaWorkspace } from "@/app/estudante/pratica/[slug]/page";
import LaboratoryPreviewFrame from "../../LaboratoryPreviewFrame";

export default function IdePreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LaboratoryPreviewFrame><PraticaWorkspace userId="ide-preview" /></LaboratoryPreviewFrame>;
}
