import type { Metadata } from "next";
import type { ReactNode } from "react";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata: Metadata = {
  title: "Contato | Orbitamos",
  description: "Entre em contato com a Orbitamos. Tire dúvidas, solicite projetos ou conheça as oportunidades de parceria.",
};

export default function ContatoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <FloatingWhatsApp page="contato" />
    </>
  );
}
