import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contato | Orbitamos",
  description: "Entre em contato com a Orbitamos. Tire dúvidas, solicite projetos ou conheça as oportunidades de parceria.",
};

export default function ContatoLayout({ children }: { children: ReactNode }) {
  return children;
}
