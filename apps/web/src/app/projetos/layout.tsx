import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Projetos | Orbitamos",
  description: "Portfolio de projetos reais desenvolvidos pela Orbitamos — sites, plataformas e experiências digitais com impacto.",
};

export default function ProjetosLayout({ children }: { children: ReactNode }) {
  return children;
}
