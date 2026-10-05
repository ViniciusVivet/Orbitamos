"use client";
import { useAuth } from "@/contexts/AuthContext";
import VillageGame from "@/components/games/VillageGame";

export default function VillagePage() {
  const { user } = useAuth();
  return user?.id ? <VillageGame key={String(user.id)} userId={String(user.id)}/> : <p role="status">Abrindo sua aventura…</p>;
}
