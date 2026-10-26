"use client";
import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";
import { bridgeTarget, practiceActivities, type ActivityId } from "@/lib/practiceStation";
export default function LearningBridge({ activity, unit, preview = false }: { activity: ActivityId; unit?: string; userId?: string; preview?: boolean }) {
  const item = practiceActivities.find(a => a.id === activity)!;
  return <section data-learning-bridge className="my-5 rounded-2xl border border-emerald-200/30 bg-[#142e31] p-5 text-left text-[#edf6ed]"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c2e5cb]"><Code2 size={16}/> Leve a descoberta para o código</p><h2 className="mt-3 text-xl font-bold">Você explorou {item.skill.toLowerCase()}.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#c4d8d4]">{activity === "sql" ? "Agora construa uma tabela sua na oficina." : "Pratique a mesma ideia escrevendo e executando um programa. Tente uma pequena mudança e observe o resultado."} Seu rascunho atual será preservado.</p><div className="mt-4 flex flex-wrap items-center gap-4"><Link className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#d4edba] px-5 text-sm font-bold text-[#173d35]" href={bridgeTarget(activity, unit, preview)}>Experimentar no código <ArrowRight size={16}/></Link><Link className="inline-flex min-h-11 items-center text-sm text-[#c4d8d4] underline underline-offset-4" href={preview ? "/dev/academy-preview" : "/estudante/jogos"}>Explorar outras práticas</Link></div></section>;
}
