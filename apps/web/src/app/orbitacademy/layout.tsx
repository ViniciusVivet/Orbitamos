import type { Metadata } from "next";
import type { ReactNode } from "react";
import OrbitAcademyGate from "./OrbitAcademyGate";

export const metadata: Metadata = {
  title: "OrbitAcademy - Formação em Tecnologia pela Orbitamos",
  description:
    "Trilhas, aulas e comunidade para quem quer começar na tecnologia com apoio, prática e direção.",
  openGraph: {
    title: "OrbitAcademy - Formação em Tecnologia pela Orbitamos",
    description:
      "Trilhas, aulas e comunidade para quem quer começar na tecnologia com apoio, prática e direção.",
    url: "https://www.orbitamosbr.com/orbitacademy",
    type: "website",
    locale: "pt_BR",
    siteName: "Orbitamos",
  },
};

export default function OrbitAcademyLayout({ children }: { children: ReactNode }) {
  return <OrbitAcademyGate>{children}</OrbitAcademyGate>;
}
