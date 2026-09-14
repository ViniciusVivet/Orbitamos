import { notFound } from "next/navigation";
import { PraticaCatalog } from "@/app/estudante/pratica/page";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";

export default function LaboratoryPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LaboratoryPreviewFrame><PraticaCatalog userId="lab-preview"/></LaboratoryPreviewFrame>;
}
