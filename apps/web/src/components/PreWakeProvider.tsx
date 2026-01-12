"use client";

import { usePreWake } from "@/hooks/usePreWake";
import { ReactNode } from "react";

export default function PreWakeProvider({ children }: { children: ReactNode }) {
  // Acorda o backend quando o usuário entra no site
  usePreWake();
  
  return <>{children}</>;
}

