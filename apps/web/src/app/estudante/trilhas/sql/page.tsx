"use client";
import { useAuth } from "@/contexts/AuthContext";
import SqlStudio from "@/components/estudante/SqlStudio";
export default function SqlPage() { const { user } = useAuth(); return user?.id ? <SqlStudio key={String(user.id)} userId={String(user.id)}/> : <p role="status">Abrindo sua oficina SQL…</p>; }
