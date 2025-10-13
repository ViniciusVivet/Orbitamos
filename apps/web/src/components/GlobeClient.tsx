"use client";

export default function GlobeClient() {
  // Usar versão pura com three.js para evitar conflitos de peer deps
  const EarthGlobePure = require("@/components/EarthGlobePure").default;
  return <EarthGlobePure />;
}


