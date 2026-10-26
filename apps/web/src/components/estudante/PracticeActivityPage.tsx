"use client";
import { useAuth } from "@/contexts/AuthContext";
import { PracticeActivity } from "./PracticeStation";
export default function PracticeActivityPage({ activity }: { activity: "delivery" | "english" | "review" }) { const { user } = useAuth(); return user?.id ? <PracticeActivity key={String(user.id)} userId={String(user.id)} activity={activity}/> : <p role="status">Abrindo sua experiência…</p>; }
