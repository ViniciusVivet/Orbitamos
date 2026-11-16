import { notFound } from "next/navigation";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";
import LessonGuidePreview from "./LessonGuidePreview";

export default function LessonGuidePreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LaboratoryPreviewFrame title="Aula e prática · prévia" section="tracks"><LessonGuidePreview/></LaboratoryPreviewFrame>;
}
