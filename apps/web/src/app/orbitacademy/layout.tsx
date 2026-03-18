import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "OrbitAcademy | Orbitamos",
  description: "Aprenda desenvolvimento web com cursos, bootcamps e missões gamificadas. Ganhe XP e construa seu portfólio na OrbitAcademy.",
};

export default function OrbitAcademyLayout({ children }: { children: ReactNode }) {
  return children;
}
