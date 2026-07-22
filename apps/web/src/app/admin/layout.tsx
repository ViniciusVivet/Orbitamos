"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness,ClipboardCheck,FolderKanban,LayoutDashboard,ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
const mobile=[{href:"/admin",label:"Início",icon:LayoutDashboard},{href:"/admin/vagas",label:"Vagas",icon:BriefcaseBusiness},{href:"/admin/candidaturas",label:"Seleção",icon:ClipboardCheck},{href:"/admin/projetos",label:"Projetos",icon:FolderKanban},{href:"/admin/solicitacoes",label:"Dados",icon:ShieldCheck}];
export default function AdminLayout({children}:{children:React.ReactNode}){
  const{user,loading,isAuthenticated}=useAuth(); const router=useRouter();
  const allowed=user?.adminRole==="staff"||user?.adminRole==="admin";
  useEffect(()=>{if(!loading&&(!isAuthenticated||!allowed))router.replace(isAuthenticated?"/colaborador":"/entrar");},[loading,isAuthenticated,allowed,router]);
  if(loading||!allowed)return <div className="grid min-h-[70vh] place-items-center bg-black"><div className="size-10 animate-spin rounded-full border-2 border-orbit-electric border-t-transparent"/></div>;
  return <div className="min-h-screen bg-gradient-to-br from-black via-[#090b14] to-black text-white"><AdminSidebar/><main className="pb-24 lg:ml-60 lg:pb-0"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</div></main><nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-white/10 bg-[#070910]/95 p-1 backdrop-blur-xl lg:hidden">{mobile.map(item=><Link key={item.href} href={item.href} className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] text-white/55"><item.icon className="size-4"/>{item.label}</Link>)}</nav></div>;
}
