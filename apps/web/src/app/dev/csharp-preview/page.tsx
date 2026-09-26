import { notFound } from "next/navigation";
import CSharpTrack from "@/components/estudante/CSharpTrack";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";

export default function CSharpPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LaboratoryPreviewFrame title="Jornada C# · piloto"><CSharpTrack userId="csharp-preview"/></LaboratoryPreviewFrame>;
}
