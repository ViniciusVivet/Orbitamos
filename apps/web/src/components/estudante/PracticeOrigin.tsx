"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { isActivityId, practiceActivities } from "@/lib/practiceStation";
export default function PracticeOrigin() {
  const params = useSearchParams();
  const pathname = usePathname();
  const source = params.get("from");
  if (!isActivityId(source)) return null;
  const activity = practiceActivities.find(item => item.id === source)!;
  return <aside data-practice-origin className="mb-4 rounded-xl border border-emerald-100/25 bg-[#173137] px-4 py-3 text-[#e8f2e9]"><p className="text-xs leading-6"><strong>Da experiência para o código · {activity.title}</strong><br/>Aqui você vai escrever e executar um programa relacionado. Leia o objetivo, experimente uma alteração e explique o resultado. Seu código salvo continua disponível.</p><Link className="mt-1 inline-flex min-h-11 items-center text-xs text-[#c8e8cf] underline underline-offset-4" href={pathname.startsWith("/dev/") ? "/dev/academy-preview" : "/estudante/jogos"}>Voltar às experiências</Link></aside>;
}
