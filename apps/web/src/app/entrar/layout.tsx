import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Entrar | Orbitamos",
  description: "Faça login ou crie sua conta na Orbitamos para acessar projetos, mentorias e a comunidade.",
};

export default function EntrarLayout({ children }: { children: ReactNode }) {
  return children;
}
