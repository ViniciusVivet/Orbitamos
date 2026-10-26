import { notFound } from "next/navigation";
import { GuiaOrbiWorkspace } from "@/app/estudante/jogos/orbi/[nivel]/page";

export default async function OrbiPreviewPage({ searchParams }: { searchParams: Promise<{ from?: string | string[] }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const query = await searchParams;
  return <GuiaOrbiWorkspace previewUserId={query.from === "academy" ? "academy-preview" : "orbi-preview"} />;
}
