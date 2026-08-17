"use client";

import { useEffect, useState } from "react";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string; addEventListener?: (type: string, listener: () => void) => void; removeEventListener?: (type: string, listener: () => void) => void };
};

export default function usePerformanceProfile() {
  const [profile, setProfile] = useState({ constrained: false, reducedMotion: false });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as NavigatorWithHints).connection;
    const update = () => {
      const nav = navigator as NavigatorWithHints;
      const slowConnection = nav.connection?.saveData || ["slow-2g", "2g"].includes(nav.connection?.effectiveType || "");
      const constrained = motionQuery.matches
        || slowConnection
        || (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4)
        || (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4);
      setProfile({ constrained: Boolean(constrained), reducedMotion: motionQuery.matches });
    };

    update();
    motionQuery.addEventListener("change", update);
    connection?.addEventListener?.("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  return profile;
}
