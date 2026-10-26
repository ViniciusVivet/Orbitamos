import { notFound } from "next/navigation";
import SqlStudio from "@/components/estudante/SqlStudio";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";
export default function SqlPreview() { if (process.env.NODE_ENV !== "development") notFound(); return <LaboratoryPreviewFrame title="SQL com Orbi"><SqlStudio userId="sql-preview"/></LaboratoryPreviewFrame>; }
