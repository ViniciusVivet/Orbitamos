"use client";

import { useEffect, useRef } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * Acorda apenas um backend legado local. Em producao, a stack atual usa Supabase
 * e nao deve tentar conectar em Render/EC2 antigos.
 */
export function usePreWake() {
  const hasWoken = useRef(false);

  useEffect(() => {
    const isLocalhost =
      typeof window !== "undefined" &&
      ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (hasWoken.current || isSupabaseConfigured || !isLocalhost) return;

    hasWoken.current = true;

    const timeoutId = setTimeout(() => {
      fetch(`${API_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(() => {});
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
}
