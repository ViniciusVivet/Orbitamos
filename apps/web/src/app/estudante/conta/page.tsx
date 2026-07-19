"use client";

import { Check, LockKeyhole, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PerfilForm from "@/components/perfil/PerfilForm";

export default function EstudanteConta() {
  const { user, token, updateProfile, setUserFromResponse } = useAuth();
  const profileFields = [
    user?.name,
    user?.avatarUrl,
    user?.phone,
    user?.birthDate,
    user?.city,
    user?.state,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const completeness = Math.round((completedFields / profileFields.length) * 100);

  return (
    <div className="-mx-4 -mt-4 min-h-screen overflow-hidden pb-14 sm:-mt-6 lg:-mx-6 lg:-mt-8">
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-9 pt-10 sm:px-8 lg:px-10">
        <div className="absolute inset-0 -z-20 bg-[#03050a]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_90%_at_88%_10%,rgba(139,92,246,.25),transparent_60%),radial-gradient(ellipse_55%_80%_at_4%_55%,rgba(0,212,255,.14),transparent_68%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-orbit-electric">
            <UserRound className="size-4" /> Sua identidade na Orbitamos
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Conta e <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">perfil.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Mantenha seus dados atualizados para personalizar sua experiência e se apresentar melhor dentro da comunidade.
          </p>

          <div className="mt-7 max-w-xl rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-white">Perfil {completeness}% completo</span>
              <span className="text-xs text-white/40">{completedFields} de {profileFields.length} informações essenciais</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple" style={{ width: `${completeness}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_310px] lg:px-10">
        <main className="min-w-0">
          <div className="[&>div]:max-w-none [&>div]:rounded-3xl [&>div]:border-white/10 [&>div]:bg-[#080a0f]">
            <PerfilForm
              user={user}
              token={token}
              onSave={updateProfile}
              onAvatarUploaded={setUserFromResponse}
              title="Dados do perfil"
              description="As informações abaixo formam sua identidade dentro da plataforma."
              accentColor="electric"
            />
          </div>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[.055] p-5">
            <ShieldCheck className="size-6 text-cyan-300" />
            <h2 className="mt-4 font-black text-white">Seus dados, seu controle</h2>
            <p className="mt-2 text-sm leading-5 text-white/50">
              Preencha somente o que fizer sentido. Informações pessoais não devem ser exibidas como conteúdo público sem uma função específica.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-violet-300">
              <LockKeyhole className="size-4" /> Acesso
            </div>
            <div className="mt-4 rounded-xl bg-black/30 p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">E-mail da conta</div>
              <p className="mt-1 break-all text-sm text-white/70">{user?.email || "Não disponível"}</p>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/40">
              O e-mail de acesso não pode ser alterado neste formulário. Isso evita mudanças acidentais na identidade da conta.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-emerald-300">
              <MapPin className="size-4" /> Por que completar?
            </div>
            <ul className="mt-4 space-y-3">
              {[
                "Avatar e nome identificam você nas experiências da plataforma.",
                "Cidade e estado ajudam a contextualizar sua participação.",
                "Telefone permanece como dado de contato da conta.",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-xs leading-5 text-white/50">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-300" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
