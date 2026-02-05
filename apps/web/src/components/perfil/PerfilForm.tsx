"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadAvatar } from "@/lib/supabase";
import { uploadAvatarViaApi, type User } from "@/lib/api";

function Avatar({ user }: { user: { name: string; avatarUrl?: string | null } }) {
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="h-20 w-20 rounded-full object-cover border-2 border-orbit-electric/50"
      />
    );
  }
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-orbit-electric to-orbit-purple text-2xl font-bold text-black">
      {initials}
    </div>
  );
}

interface PerfilFormProps {
  user: User | null;
  token?: string | null;
  onSave: (data: {
    name?: string;
    avatarUrl?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  }) => Promise<void>;
  onAvatarUploaded?: (user: User) => void;
  title?: string;
  description?: string;
  accentColor?: "electric" | "purple";
}

export default function PerfilForm({
  user,
  token,
  onSave,
  onAvatarUploaded,
  title = "Perfil",
  description = "Dados da sua conta",
  accentColor = "electric",
}: PerfilFormProps) {
  const [editName, setEditName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editZipCode, setEditZipCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name ?? "");
      setEditAvatarUrl(user.avatarUrl ?? "");
      setEditPhone(user.phone ?? "");
      setEditBirthDate(user.birthDate ?? "");
      setEditAddress(user.address ?? "");
      setEditCity(user.city ?? "");
      setEditState(user.state ?? "");
      setEditZipCode(user.zipCode ?? "");
    }
  }, [user]);

  const borderClass = accentColor === "purple" ? "border-orbit-purple/20" : "border-orbit-electric/20";
  const titleClass = accentColor === "purple" ? "text-orbit-purple" : "text-orbit-electric";
  const buttonClass = accentColor === "purple"
    ? "bg-orbit-purple text-white hover:bg-orbit-purple/90"
    : "bg-orbit-electric text-black hover:bg-orbit-electric/90";

  return (
    <Card className={`${borderClass} bg-gray-900/50 max-w-xl`}>
      <CardHeader>
        <CardTitle className={titleClass}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar
            user={{
              name: (editName || user?.name) ?? "",
              avatarUrl: editAvatarUrl || user?.avatarUrl,
            }}
          />
          <div>
            <p className="font-medium text-white">{user?.email}</p>
            <p className="text-sm text-white/50">E-mail não pode ser alterado aqui</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-white/70">Nome completo</label>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="mt-1 bg-black/40 border-white/20 text-white"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/80">Foto de perfil</label>
          <p className="mt-0.5 text-xs text-white/50">Subir imagem pela plataforma (JPG, PNG, GIF ou WebP — até 5 MB)</p>
          <div className="mt-2 flex flex-col gap-3">
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-white/30 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:border-orbit-electric/50 hover:bg-white/10">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/*"
                className="hidden"
                disabled={uploadingAvatar}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user?.id) return;
                  setUploadError(null);
                  setUploadingAvatar(true);
                  try {
                    let url: string | null = null;
                    url = await uploadAvatar(file, user.id);
                    if (!url && token) {
                      const result = await uploadAvatarViaApi(token, file);
                      url = result.avatarUrl;
                      if (result.user && onAvatarUploaded) onAvatarUploaded(result.user);
                    }
                    if (url) {
                      setEditAvatarUrl(url);
                    } else {
                      setUploadError("Não foi possível enviar a foto. Tente de novo ou use uma URL.");
                    }
                  } catch (err) {
                    setUploadError(err instanceof Error ? err.message : "Erro ao enviar a foto.");
                  } finally {
                    setUploadingAvatar(false);
                    e.target.value = "";
                  }
                }}
              />
              {uploadingAvatar ? "⏳ Enviando imagem..." : "📷 Escolher foto / imagem"}
            </label>
            {uploadError && (
              <p className="text-sm text-red-400">{uploadError}</p>
            )}
            <div>
              <label className="text-xs text-white/50">Ou cole a URL da imagem</label>
              <Input
                value={editAvatarUrl}
                onChange={(e) => { setEditAvatarUrl(e.target.value); setUploadError(null); }}
                placeholder="https://..."
                className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm text-white/70">Telefone</label>
          <Input
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            className="mt-1 bg-black/40 border-white/20 text-white"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className="text-sm text-white/70">Data de nascimento</label>
          <Input
            type="date"
            value={editBirthDate}
            onChange={(e) => setEditBirthDate(e.target.value)}
            className="mt-1 bg-black/40 border-white/20 text-white"
          />
          <p className="mt-1 text-xs text-white/50">Usada para calcular sua idade (opcional)</p>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="mb-2 text-sm font-medium text-white/80">Endereço</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/60">CEP</label>
              <Input
                value={editZipCode}
                onChange={(e) => setEditZipCode(e.target.value)}
                className="mt-1 bg-black/40 border-white/20 text-white"
                placeholder="00000-000"
              />
            </div>
            <div>
              <label className="text-xs text-white/60">Rua, número, complemento</label>
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="mt-1 bg-black/40 border-white/20 text-white"
                placeholder="Rua, número, complemento"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60">Cidade</label>
                <Input
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="mt-1 bg-black/40 border-white/20 text-white"
                  placeholder="Cidade"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Estado (UF)</label>
                <Input
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                  className="mt-1 bg-black/40 border-white/20 text-white"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            className={buttonClass}
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave({
                  name: editName.trim() || undefined,
                  avatarUrl: editAvatarUrl.trim() || null,
                  phone: editPhone.trim() || null,
                  birthDate: editBirthDate || null,
                  address: editAddress.trim() || null,
                  city: editCity.trim() || null,
                  state: editState.trim() || null,
                  zipCode: editZipCode.trim() || null,
                });
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
