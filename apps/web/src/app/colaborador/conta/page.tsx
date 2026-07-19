"use client";

import { useAuth } from "@/contexts/AuthContext";
import PerfilForm from "@/components/perfil/PerfilForm";

export default function ColaboradorConta() {
  const { user, token, updateProfile, setUserFromResponse } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Configurações da conta</h1>
        <p className="mt-1 text-sm text-white/60 sm:text-base">Nome, foto, endereço, telefone e outros dados do perfil</p>
      </div>

      <PerfilForm
        user={user}
        token={token}
        onSave={updateProfile}
        onAvatarUploaded={setUserFromResponse}
        title="Perfil"
        description="Dados exibidos na sua área de colaborador"
        accentColor="purple"
      />
    </div>
  );
}
