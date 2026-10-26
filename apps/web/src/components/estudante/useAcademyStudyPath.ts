"use client";
import { useCallback, useEffect, useState } from "react";
import { readStudyPath, serializeStudyPath, studyPathKey, type AcademyStudyPath } from "@/lib/academyStudyPath";

const changedEvent = "orbitamos-study-path-updated";
export function useAcademyStudyPath(userId?: string | number | null) {
  const key = userId == null ? null : studyPathKey(userId);
  const [state, setState] = useState<{ key: string | null; choice: AcademyStudyPath | null; unavailable: boolean; ready: boolean }>({ key: null, choice: null, unavailable: false, ready: false });
  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (!active) return;
      if (!key) { setState({ key, choice: null, unavailable: false, ready: true }); return; }
      try { setState({ key, choice: readStudyPath(localStorage.getItem(key)), unavailable: false, ready: true }); }
      catch { setState({ key, choice: null, unavailable: true, ready: true }); }
    };
    void Promise.resolve().then(refresh);
    window.addEventListener("storage", refresh); window.addEventListener("focus", refresh); window.addEventListener(changedEvent, refresh);
    return () => { active = false; window.removeEventListener("storage", refresh); window.removeEventListener("focus", refresh); window.removeEventListener(changedEvent, refresh); };
  }, [key]);
  const choose = useCallback((choice: AcademyStudyPath | null) => {
    if (!key) return;
    try {
      if (choice) localStorage.setItem(key, serializeStudyPath(choice)); else localStorage.removeItem(key);
      setState({ key, choice, unavailable: false, ready: true });
      window.dispatchEvent(new Event(changedEvent));
    } catch { setState({ key, choice, unavailable: true, ready: true }); }
  }, [key]);
  return { choice: state.key === key ? state.choice : null, ready: !key || (state.key === key && state.ready), unavailable: state.key === key && state.unavailable, choose, canChoose: key !== null };
}
