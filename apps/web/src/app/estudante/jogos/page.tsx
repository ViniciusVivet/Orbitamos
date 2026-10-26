"use client";
import { useAuth } from "@/contexts/AuthContext";
import PracticeStation from "@/components/estudante/PracticeStation";
export default function JogosIndex() { const { user } = useAuth(); return user?.id ? <PracticeStation key={String(user.id)} userId={String(user.id)}/> : <p role="status">Abrindo suas práticas…</p>; }
