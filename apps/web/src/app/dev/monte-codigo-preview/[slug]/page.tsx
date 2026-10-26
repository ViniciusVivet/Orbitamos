import { notFound } from "next/navigation";
import { MonteCodigoWorkspace } from "@/app/estudante/jogos/[slug]/page";

export default async function MonteCodigoPreviewPage({ searchParams }: { searchParams: Promise<{ from?: string | string[] }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const query = await searchParams;
  return <MonteCodigoWorkspace previewUserId={query.from === "academy" ? "academy-preview" : "monte-codigo-preview"} />;
}
