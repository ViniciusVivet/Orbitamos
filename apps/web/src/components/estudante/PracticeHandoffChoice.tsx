"use client";
import { useEffect, useRef } from "react";

export default function PracticeHandoffChoice({ guidedCode, existingCode, error, onImport, onKeep, onCancel }: { guidedCode: string; existingCode: string; error: string; onImport: () => void; onKeep: () => void; onCancel: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section className="mx-auto max-w-3xl rounded-xl border border-emerald-100/20 bg-[#101e28] p-5 text-slate-200 sm:p-8" aria-label="Escolha o código para o modo livre" data-practice-handoff>
    <p className="text-xs uppercase tracking-widest text-emerald-200">Da atividade à sua experiência</p>
    <h1 ref={heading} tabIndex={-1} className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">Qual código você quer abrir?</h1>
    <p className="mt-4 text-sm leading-7 text-slate-300">Você já tem um rascunho no modo livre. Escolha com qual programa quer continuar. Ao levar o código desta atividade, a versão anterior fica guardada para recuperar depois.</p>
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <article><h2 className="font-semibold text-emerald-100">O código desta atividade</h2><pre className="mt-3 max-h-44 overflow-auto rounded-lg bg-black/30 p-3 text-xs leading-6">{guidedCode}</pre><button type="button" onClick={onImport} className="mt-4 min-h-12 w-full rounded-lg bg-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-950">Levar código desta atividade</button></article>
      <article><h2 className="font-semibold">Seu rascunho livre anterior</h2><pre className="mt-3 max-h-44 overflow-auto rounded-lg bg-black/30 p-3 text-xs leading-6">{existingCode || "Rascunho vazio com registros anteriores."}</pre><button type="button" onClick={onKeep} className="mt-4 min-h-12 w-full rounded-lg border border-slate-300/30 px-4 py-3 text-sm">Retomar meu rascunho livre</button></article>
    </div>
    {error && <p role="alert" className="mt-5 text-sm leading-6 text-amber-200">{error}</p>}
    <button type="button" onClick={onCancel} className="mt-6 min-h-11 text-sm text-slate-300 underline underline-offset-4">Continuar na atividade</button>
  </section>;
}
