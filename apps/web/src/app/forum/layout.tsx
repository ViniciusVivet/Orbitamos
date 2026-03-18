import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Fórum | Orbitamos",
  description: "Comunidade Orbitamos — troque experiências, tire dúvidas e cresça junto com outros desenvolvedores e designers.",
};

export default function ForumLayout({ children }: { children: ReactNode }) {
  return children;
}
