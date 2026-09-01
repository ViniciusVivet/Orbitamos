import { notFound } from "next/navigation";
import { MonteCodigoWorkspace } from "@/app/estudante/jogos/[slug]/page";

export default function MonteCodigoPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <MonteCodigoWorkspace previewUserId="monte-codigo-preview" />;
}
