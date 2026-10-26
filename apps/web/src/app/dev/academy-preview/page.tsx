import { notFound } from "next/navigation";
import { Suspense } from "react";
import AcademyWorkspacePreview from "./AcademyWorkspacePreview";
export default function AcademyPreviewPage() { if (process.env.NODE_ENV !== "development") notFound(); return <Suspense fallback={<p role="status">Abrindo sua Academy…</p>}><AcademyWorkspacePreview/></Suspense>; }
