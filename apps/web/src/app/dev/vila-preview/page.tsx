import { notFound } from "next/navigation";
import VillageGame from "@/components/games/VillageGame";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";

export default function VillagePreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LaboratoryPreviewFrame title="Vila dos Blocos"><VillageGame userId="vila-preview"/></LaboratoryPreviewFrame>;
}
