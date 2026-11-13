"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";

const WorkSimulation = dynamic(() => import("@/components/games/WorkSimulation"), {
  loading: () => <p role="status">Abrindo o escritório…</p>,
});

export default function WorkSimulationPage() {
  const { user } = useAuth();
  return user?.id
    ? <WorkSimulation key={String(user.id)} userId={String(user.id)} onBackHref="/estudante/jogos"/>
    : <p role="status">Abrindo seu turno…</p>;
}
