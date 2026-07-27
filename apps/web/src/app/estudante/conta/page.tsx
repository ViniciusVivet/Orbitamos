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
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 py-5 sm:px-8 sm:py-6 lg:px-10">
        <div className="absolute inset-0 -z-20 bg-[#03050a]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_120%_at_92%_0%,rgba(139,92,246,.16),transparent_60%),radial-gradient(ellipse_50%_100%_at_0%_100%,rgba(0,212,255,.1),transparent_68%)]" />
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.22em] text-orbit-electric">
              <UserRound className="size-3.5" /> Sua identidade na Orbitamos
            </div>
            <h1 className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl lg:text-3xl">
              Conta e <span className="bg-gradient-to-r from-orbit-electric to-orbit-purple bg-clip-text text-transparent">perfil.</span>
            </h1>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-white/50 sm:text-sm">
              Mantenha seus dados atualizados para personalizar sua experiência e se apresentar na comunidade.
            </p>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-white/10 bg-black/30 p-3.5 backdrop-blur-xl lg:w-80">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-white">Perfil {completeness}% completo</span>
              <span className="text-[11px] text-white/40">{completedFields}/{profileFields.length}</span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
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
