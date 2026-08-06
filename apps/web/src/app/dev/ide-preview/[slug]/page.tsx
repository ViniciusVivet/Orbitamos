import { notFound } from "next/navigation";
import { PraticaWorkspace } from "@/app/estudante/pratica/[slug]/page";

export default function IdePreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <PraticaWorkspace userId="ide-preview" />;
}
