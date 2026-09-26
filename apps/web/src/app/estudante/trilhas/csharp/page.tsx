"use client";

import CSharpTrack from "@/components/estudante/CSharpTrack";
import { useAuth } from "@/contexts/AuthContext";

export default function CSharpTrackPage() {
  const { user } = useAuth();
  return <CSharpTrack key={user?.id ?? "guest"} userId={user?.id ?? null}/>;
}
