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
    let request = 0;
    async function record() {
      const current = ++request;
      const href = canonicalAcademyHref(window.location.pathname, window.location.search, window.location.hash);
      if (!href) return;
      try {
        const { academyResumeEntry, resumeStorageKey } = await import("@/lib/academyActivity");
        if (!active || current !== request) return;
        const entry = academyResumeEntry(href);
        if (!entry) return;
        localStorage.setItem(resumeStorageKey(String(userId)), JSON.stringify(entry));
        window.dispatchEvent(new Event("orbitamos-practice-updated"));
      } catch { /* Tracking is optional and must never block a lesson. */ }
    }
    void record();
    window.addEventListener("hashchange", record);
    return () => { active = false; window.removeEventListener("hashchange", record); };
  }, [path, query, userId]);
  return null;
}
