"use client";

import EarthGlobePure from "@/components/EarthGlobePure";

export default function GlobeClient() {
  // Usar versão pura com three.js para evitar conflitos de peer deps
  return <EarthGlobePure />;
}


