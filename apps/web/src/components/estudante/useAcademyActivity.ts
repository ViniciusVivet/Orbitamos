"use client";
import { useEffect, useState } from "react";
import type { AcademyActivity, AcademyActivityItem } from "@/lib/academyActivity";

/** Read existing saves on account change, tab return and practice updates. Never writes storage. */
export function useAcademyActivity(userId?: string | number | null, includeEnglishRecords = false) {
  const key = userId == null ? null : String(userId);
  const [state, setState] = useState<{ key: string | null; data: AcademyActivity | null; records: AcademyActivityItem[]; unavailable: boolean }>({ key: null, data: null, records: [], unavailable: false });
  useEffect(() => {
    let active = true;
    let request = 0;
    async function refresh() {
      const current = ++request;
      if (!key) { setState({ key, data: null, records: [], unavailable: false }); return; }
      try {
        const { getAcademyActivity } = await import("@/lib/academyActivity");
        let unavailable = false;
        const read = (storageKey: string) => { try { return localStorage.getItem(storageKey); } catch { unavailable = true; return null; } };
        const data = getAcademyActivity(key, read);
        const records = includeEnglishRecords ? (await import("@/lib/academyEnglishRecords")).getAcademyEnglishRecords(userId!, read) : [];
        if (active && current === request) setState({ key, data, records, unavailable });
      } catch { if (active && current === request) setState({ key, data: null, records: [], unavailable: true }); }
    }
    void Promise.resolve().then(refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    window.addEventListener("orbitamos-practice-updated", refresh);
    return () => { active = false; window.removeEventListener("storage", refresh); window.removeEventListener("focus", refresh); window.removeEventListener("pageshow", refresh); window.removeEventListener("orbitamos-practice-updated", refresh); };
  }, [key, userId, includeEnglishRecords]);
  return { data: state.key === key ? state.data : null, records: state.key === key ? state.records : [], ready: !key || (state.key === key && (state.data !== null || state.unavailable)), unavailable: state.key === key && state.unavailable };
}
