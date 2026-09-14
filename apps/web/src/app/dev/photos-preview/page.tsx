import { notFound } from "next/navigation";
import Community from "@/app/estudante/comunidade/page";
import Mentoring from "@/app/estudante/mentorias/page";
import Courses from "@/app/estudante/aulas/page";
import Academy from "@/app/orbitacademy/page";
import WorkspaceWelcome from "@/components/brand/WorkspaceWelcome";
import LaboratoryPreviewFrame from "../LaboratoryPreviewFrame";

export default async function Page({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { area = "comunidade" } = await searchParams;
  if (area === "academy") return <div data-photo-preview><Academy/></div>;
  const work = area === "portfolio" || area === "squad";
  return <LaboratoryPreviewFrame title="Acervo Orbitamos · sem dados pessoais" mode={work ? "work" : "student"}>
    <div data-photo-preview>
      {area === "cursos" ? <Courses/> : area === "mentorias" ? <Mentoring/> : work ? <><h1 className="mb-6 text-2xl font-semibold text-white">{area === "portfolio" ? "Meu portfólio" : "Meu squad"}</h1><WorkspaceWelcome kind={area}/></> : <Community/>}
    </div>
  </LaboratoryPreviewFrame>;
}
