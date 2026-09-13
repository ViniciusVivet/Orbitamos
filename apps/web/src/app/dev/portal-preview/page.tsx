import { notFound } from "next/navigation";
import PortalPreview from "./PortalPreview";

export default async function Page({ searchParams }: { searchParams: Promise<{ role?: string; state?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const query = await searchParams;
  return <PortalPreview role={query.role === "work" ? "work" : "student"} state={query.state || "filled"} />;
}
