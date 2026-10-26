import { notFound } from "next/navigation";
import CSharpTrack from "@/components/estudante/CSharpTrack";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";

export default async function CSharpPreview({ searchParams }: { searchParams: Promise<{ academy?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const academy = (await searchParams).academy === "1";
  return <LaboratoryPreviewFrame title="C# & .NET · piloto" section="tracks" userId={academy ? "academy-preview" : undefined}><CSharpTrack userId={academy ? "academy-preview" : "csharp-preview"}/></LaboratoryPreviewFrame>;
}
