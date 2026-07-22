"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness,ClipboardCheck,FolderKanban,LayoutDashboard,Rocket,ShieldCheck,Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
const items=[{href:"/admin",label:"Visão geral",icon:LayoutDashboard},{href:"/admin/vagas",label:"Vagas",icon:BriefcaseBusiness},{href:"/admin/candidaturas",label:"Candidaturas",icon:ClipboardCheck},{href:"/admin/projetos",label:"Projetos e squads",icon:FolderKanban},{href:"/admin/solicitacoes",label:"Privacidade",icon:ShieldCheck}];
export default function AdminSidebar(){
  const path=usePathname(); const{user}=useAuth();
  const visible=items.filter(item=>item.href!=="/admin/solicitacoes"||user?.adminRole==="admin");
  return <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-60 flex-col border-r border-white/10 bg-[#070910]/95 lg:flex"><div className="flex h-16 items-center gap-3 border-b border-white/10 px-5"><div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-orbit-electric to-orbit-purple text-black"><Rocket className="size-4"/></div><div><p className="text-sm font-black text-white">Orbitamos Ops</p><p className="text-[10px] uppercase tracking-wider text-white/35">Painel interno</p></div></div><nav className="flex-1 space-y-1 p-3">{visible.map(item=>{const active=path===item.href||(item.href!=="/admin"&&path.startsWith(item.href));return <Link key={item.href} href={item.href} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${active?"border border-orbit-electric/25 bg-orbit-electric/10 text-orbit-electric":"text-white/55 hover:bg-white/5 hover:text-white"}`}><item.icon className="size-4"/>{item.label}</Link>})}</nav><div className="border-t border-white/10 p-3"><Link href="/colaborador" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs text-white/45 hover:bg-white/5 hover:text-white"><Users className="size-4"/>Ver área do colaborador</Link></div></aside>;
}
