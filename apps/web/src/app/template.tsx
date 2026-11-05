"use client";

import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const isProjectCase = usePathname().startsWith("/projetos/");
  return (
    <div className={isProjectCase ? "[overflow:clip]" : "animate-page-enter [overflow:clip]"}>
      {children}
    </div>
  );
}
