"use client";

import { Users, MessageCircle, Mail, Globe } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayAvatarUrl } from "@/lib/api";

type SquadMember = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  online: boolean;
  skills: string[];
};

// Mock — será substituído por dados reais
const mockMembers: SquadMember[] = [
  {
    id: "1",
    name: "Douglas Vinícius",
    role: "Fundador / Full-stack",
    online: true,
    skills: ["Next.js", "React", "Node.js", "Supabase"],
  },
  {
    id: "2",
    name: "Colaborador A",
    role: "Frontend Developer",
    online: true,
    skills: ["React", "TypeScript", "Tailwind"],
  },
  {
    id: "3",
    name: "Colaborador B",
    role: "Designer UI/UX",
    online: false,
    skills: ["Figma", "UI Design", "Branding"],
  },
];

export default function ColaboradorSquad() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-purple/70">Equipe</p>
        <h1 className="mt-1 text-2xl font-black text-white">Squad</h1>
        <p className="mt-0.5 text-sm text-white/40">Membros do time e canais de comunicação.</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Users className="size-3.5" />
          <span>{mockMembers.length} membros</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400/70">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{mockMembers.filter((m) => m.online).length} online</span>
        </div>
      </div>

      {/* Members grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mockMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-orbit-purple/25"
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                {member.avatarUrl ? (
                  <img
                    src={getDisplayAvatarUrl(member.avatarUrl) || ""}
                    alt={member.name}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orbit-electric/30 to-orbit-purple/30">
                    <span className="text-xs font-bold text-white">
                      {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#0d1117] ${
                    member.online ? "bg-emerald-400" : "bg-white/20"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{member.name}</p>
                <p className="text-[11px] text-white/40">{member.role}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-3 flex flex-wrap gap-1">
              {member.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Communication links */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <h2 className="mb-3 text-sm font-bold text-white">Canais de comunicação</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <Link
            href="/mensagens"
            className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3 transition hover:border-orbit-purple/30 hover:bg-white/[0.05]"
          >
            <div className="grid size-8 place-items-center rounded-lg bg-orbit-purple/15">
              <MessageCircle className="size-4 text-orbit-purple" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Mensagens</p>
              <p className="text-[10px] text-white/35">Chat direto</p>
            </div>
          </Link>
          <Link
            href="/contato"
            className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3 transition hover:border-orbit-electric/30 hover:bg-white/[0.05]"
          >
            <div className="grid size-8 place-items-center rounded-lg bg-orbit-electric/15">
              <Mail className="size-4 text-orbit-electric" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Contato</p>
              <p className="text-[10px] text-white/35">Formulário</p>
            </div>
          </Link>
          <Link
            href="/forum"
            className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            <div className="grid size-8 place-items-center rounded-lg bg-white/10">
              <Globe className="size-4 text-white/60" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">Fórum</p>
              <p className="text-[10px] text-white/35">Discussões</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
