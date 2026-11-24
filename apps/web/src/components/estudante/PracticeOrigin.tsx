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
  return <aside data-practice-origin className="mx-auto flex max-w-[1130px] flex-wrap items-center justify-between gap-x-4 border-b border-white/15 text-xs text-slate-300"><p>Prática de {activity.title}</p><Link className="inline-flex min-h-11 items-center text-[#c8e8cf] underline underline-offset-4" href={pathname.startsWith("/dev/") ? "/dev/academy-preview" : "/estudante/jogos"}>Voltar às experiências</Link></aside>;
}
