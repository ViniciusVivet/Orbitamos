import type { Metadata } from "next";
import type { ReactNode } from "react";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata: Metadata = {
  title: "Projetos | Orbitamos",
  description: "Portfólio de trabalhos e demonstrações autorais da Orbitamos — sites, plataformas e experiências digitais.",
};

export default function ProjetosLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <FloatingWhatsApp page="projetos" />
    </>
  );
}
