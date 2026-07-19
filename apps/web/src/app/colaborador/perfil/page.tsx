"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getDisplayAvatarUrl } from "@/lib/api";
import { useState } from "react";
import { Globe, MapPin, Clock, Edit3, Save, X, Plus } from "lucide-react";
import Link from "next/link";

const DISPONIBILIDADE_OPTIONS = ["Disponível", "Parcialmente disponível", "Indisponível"];

const SKILL_SUGGESTIONS = [
  "React", "Next.js", "TypeScript", "Node.js", "Python", "Figma",
  "Tailwind", "PostgreSQL", "Supabase", "Docker", "Git", "AWS",
  "UI/UX", "Branding", "SEO", "WordPress", "Flutter", "React Native",
];

export default function ColaboradorPerfil() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("Desenvolvedor apaixonado por criar experiências digitais incríveis.");
  const [skills, setSkills] = useState<string[]>(["React", "Next.js", "TypeScript", "Tailwind"]);
  const [disponibilidade, setDisponibilidade] = useState("Disponível");
  const [portfolio, setPortfolio] = useState<string[]>(["https://meusite.com"]);
  const [newSkill, setNewSkill] = useState("");
  const [newLink, setNewLink] = useState("");

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addLink = () => {
    if (newLink.trim() && !portfolio.includes(newLink.trim())) {
      setPortfolio([...portfolio, newLink.trim()]);
      setNewLink("");
    }
  };

  const removeLink = (link: string) => {
    setPortfolio(portfolio.filter((l) => l !== link));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-orbit-purple/70">Público</p>
          <h1 className="mt-1 text-2xl font-black text-white">Meu Perfil</h1>
          <p className="mt-0.5 text-sm text-white/40">Como outros membros e recrutadores te veem.</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
            editing
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          {editing ? <><Save className="size-3" /> Salvar</> : <><Edit3 className="size-3" /> Editar</>}
        </button>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative">
            {getDisplayAvatarUrl(user?.avatarUrl) ? (
              <img
                src={getDisplayAvatarUrl(user?.avatarUrl)!}
                alt={user?.name ?? ""}
                className="size-20 rounded-2xl object-cover ring-2 ring-orbit-purple/30"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orbit-electric/40 to-orbit-purple/40 ring-2 ring-orbit-purple/30">
                <span className="text-xl font-black text-white">{initials}</span>
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-[#0d1117] bg-emerald-400" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-black text-white">{user?.name}</h2>
            <p className="mt-0.5 text-sm text-white/40">{user?.email}</p>

            <div className="mt-3 flex flex-wrap justify-center gap-3 sm:justify-start">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                disponibilidade === "Disponível"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : disponibilidade === "Parcialmente disponível"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                  : "bg-red-500/15 text-red-400 border border-red-500/25"
              }`}>
                <Clock className="size-3" />
                {disponibilidade}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/35">
                <MapPin className="size-3" />
                Brasil
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-5">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.15em] text-white/35">Sobre</label>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-orbit-purple/50 resize-none"
              placeholder="Fale sobre você, experiência, interesses..."
            />
          ) : (
            <p className="text-sm text-white/60 leading-relaxed">{bio}</p>
          )}
        </div>

        {/* Disponibilidade */}
        {editing && (
          <div className="mt-4">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[.15em] text-white/35">Disponibilidade</label>
            <div className="flex gap-2">
              {DISPONIBILIDADE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDisponibilidade(opt)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    disponibilidade === opt
                      ? "bg-orbit-purple/20 text-orbit-purple border border-orbit-purple/30"
                      : "text-white/40 hover:text-white border border-white/10 hover:bg-white/5"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="mb-3 text-sm font-bold text-white">Habilidades</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full border border-orbit-electric/20 bg-orbit-electric/10 px-3 py-1 text-xs font-medium text-orbit-electric"
            >
              {skill}
              {editing && (
                <button onClick={() => removeSkill(skill)} className="text-orbit-electric/50 hover:text-red-400">
                  <X className="size-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {editing && (
          <div className="mt-3">
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill(newSkill)}
                placeholder="Adicionar skill..."
                className="h-8 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-white placeholder:text-white/25 outline-none focus:border-orbit-electric/50"
              />
              <button
                onClick={() => addSkill(newSkill)}
                className="flex items-center gap-1 rounded-lg bg-orbit-electric/15 px-3 text-xs text-orbit-electric hover:bg-orbit-electric/25"
              >
                <Plus className="size-3" /> Adicionar
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="rounded-full border border-white/8 px-2 py-0.5 text-[10px] text-white/30 transition hover:border-orbit-electric/30 hover:text-orbit-electric"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Portfolio links */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="mb-3 text-sm font-bold text-white">Portfólio & Links</h3>
        <div className="space-y-2">
          {portfolio.map((link) => (
            <div key={link} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
              <Globe className="size-4 shrink-0 text-orbit-purple" />
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="flex-1 truncate text-xs text-orbit-electric hover:underline"
              >
                {link}
              </a>
              {editing && (
                <button onClick={() => removeLink(link)} className="text-white/30 hover:text-red-400">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="mt-3 flex gap-2">
            <input
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLink()}
              placeholder="https://..."
              className="h-8 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs text-white placeholder:text-white/25 outline-none focus:border-orbit-purple/50"
            />
            <button
              onClick={addLink}
              className="flex items-center gap-1 rounded-lg bg-orbit-purple/15 px-3 text-xs text-orbit-purple hover:bg-orbit-purple/25"
            >
              <Plus className="size-3" /> Link
            </button>
          </div>
        )}

        {portfolio.length === 0 && !editing && (
          <p className="text-xs text-white/30">Nenhum link adicionado.</p>
        )}
      </div>

      {/* Tip */}
      <div className="rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3 text-center">
        <p className="text-[11px] text-white/30">
          Edite seu perfil para aparecer melhor nas buscas.{" "}
          <Link href="/colaborador/conta" className="text-orbit-purple hover:underline">
            Alterar foto e dados pessoais
          </Link>
        </p>
      </div>
    </div>
  );
}
