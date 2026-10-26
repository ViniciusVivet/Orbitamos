"use client";
import { useEffect, useState } from "react";
import type { AcademyActivity } from "@/lib/academyActivity";

/** Read existing saves on account change, tab return and practice updates. Never writes storage. */
export function useAcademyActivity(userId?: string | number | null) {
  const key = userId == null ? null : String(userId);
  const [state, setState] = useState<{ key: string | null; data: AcademyActivity | null; unavailable: boolean }>({ key: null, data: null, unavailable: false });
  useEffect(() => {
    let active = true;
    let request = 0;
    async function refresh() {
      const current = ++request;
      if (!key) { setState({ key, data: null, unavailable: false }); return; }
      try {
        const { getAcademyActivity } = await import("@/lib/academyActivity");
        let unavailable = false;
        const data = getAcademyActivity(key, storageKey => { try { return localStorage.getItem(storageKey); } catch { unavailable = true; return null; } });
        if (active && current === request) setState({ key, data, unavailable });
      } catch { if (active && current === request) setState({ key, data: null, unavailable: true }); }
    }
    void Promise.resolve().then(refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("orbitamos-practice-updated", refresh);
    return () => { active = false; window.removeEventListener("storage", refresh); window.removeEventListener("focus", refresh); window.removeEventListener("pageshow", refresh); window.removeEventListener("orbitamos-practice-updated", refresh); };
  }, [key]);
  return { data: state.key === key ? state.data : null, ready: !key || (state.key === key && (state.data !== null || state.unavailable)), unavailable: state.key === key && state.unavailable };
}
