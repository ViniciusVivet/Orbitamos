import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Portal Orbitamos - Da Quebrada pra Tecnologia",
  description:
    "Acesse a comunidade, aulas, progresso e mentorias da Orbitamos. Uma jornada para sair do subemprego e entrar em tecnologia.",
  openGraph: {
    title: "Portal Orbitamos - Da Quebrada pra Tecnologia",
    description:
      "Acesse a comunidade, aulas, progresso e mentorias da Orbitamos. Uma jornada para sair do subemprego e entrar em tecnologia.",
    url: "https://www.orbitamosbr.com/entrar",
    type: "website",
    locale: "pt_BR",
    siteName: "Orbitamos",
  },
};

export default function EntrarLayout({ children }: { children: ReactNode }) {
  return children;
}
