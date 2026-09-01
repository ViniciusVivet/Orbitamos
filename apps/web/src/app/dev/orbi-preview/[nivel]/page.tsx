import { notFound } from "next/navigation";
import { GuiaOrbiWorkspace } from "@/app/estudante/jogos/orbi/[nivel]/page";

export default function OrbiPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <GuiaOrbiWorkspace previewUserId="orbi-preview" />;
}
