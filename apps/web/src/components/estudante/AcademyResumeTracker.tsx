"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { canonicalAcademyHref } from "@/lib/portalNavigation";

/** A separate local pointer, never a completion event or a rewrite of an exercise. */
export default function AcademyResumeTracker({ userId }: { userId?: string | number | null }) {
  const path = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  useEffect(() => {
    if (userId == null) return;
    let active = true;
    async function record() {
      const href = canonicalAcademyHref(path, query ? `?${query}` : "");
      if (!href) return;
      const { academyResumeEntry, resumeStorageKey } = await import("@/lib/academyActivity");
      if (!active) return;
      const entry = academyResumeEntry(href);
      if (!entry) return;
      try {
        localStorage.setItem(resumeStorageKey(String(userId)), JSON.stringify(entry));
        window.dispatchEvent(new Event("orbitamos-practice-updated"));
      } catch { /* Tracking is optional and must never block a lesson. */ }
    }
    void record();
    return () => { active = false; };
  }, [path, query, userId]);
  return null;
}
