"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDisplayAvatarUrl, type ChatUser } from "@/lib/api";

interface Props {
  users: ChatUser[];
  groupName: string;
  onGroupNameChange: (name: string) => void;
  groupUserIds: number[];
  onToggleGroupUser: (id: number) => void;
  groupAvatarUrl: string;
  onGroupAvatarUrlChange: (url: string) => void;
  groupAvatarFile: File | null;
  onGroupAvatarFileChange: (file: File | null) => void;
  groupAvatarPreviewUrl: string | null;
  uploading: boolean;
  onCreate: () => void;
  onClose: () => void;
}

export default function NewGroupChatModal({
  users,
  groupName,
  onGroupNameChange,
  groupUserIds,
  onToggleGroupUser,
  groupAvatarUrl,
  onGroupAvatarUrlChange,
  groupAvatarFile,
  onGroupAvatarFileChange,
  groupAvatarPreviewUrl,
  uploading,
  onCreate,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-orbit-purple/30 bg-gray-900/95 p-5 shadow-2xl shadow-orbit-purple/10">
        <h2 className="text-lg font-semibold mb-3">Novo grupo</h2>
        <Input
          value={groupName}
          onChange={(e) => onGroupNameChange(e.target.value)}
          placeholder="Nome do grupo"
          className="mb-3 bg-white/10 border-white/20 text-white"
        />
        <p className="text-sm text-white/60 mb-1">Foto do grupo (opcional)</p>
        <div className="flex flex-col gap-2 mb-3">
          {groupAvatarPreviewUrl && (
            <div className="flex justify-center">
              <img src={groupAvatarPreviewUrl} alt="Preview" className="h-20 w-20 rounded-full object-cover ring-2 ring-orbit-purple/40" />
            </div>
          )}
          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-white/30 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => onGroupAvatarFileChange(e.target.files?.[0] ?? null)}
            />
            {groupAvatarFile ? `📷 ${groupAvatarFile.name}` : "📷 Enviar imagem (JPG, PNG, GIF, WebP)"}
          </label>
          <span className="text-xs text-white/50">ou URL:</span>
          <Input
            value={groupAvatarUrl}
            onChange={(e) => onGroupAvatarUrlChange(e.target.value)}
            placeholder="https://..."
            className="bg-white/10 border-white/20 text-white"
            disabled={!!groupAvatarFile}
          />
        </div>
        <p className="text-sm text-white/60 mb-2">Adicione participantes:</p>
        <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={groupUserIds.includes(u.id)}
                onChange={() => onToggleGroupUser(u.id)}
                className="rounded border-white/30"
              />
              <div className="h-8 w-8 shrink-0 rounded-full bg-white/10 overflow-hidden">
                {getDisplayAvatarUrl(u.avatarUrl) ? (
                  <img src={getDisplayAvatarUrl(u.avatarUrl)!} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs text-orbit-electric">
                    {u.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="font-medium">{u.name}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-orbit-purple"
            onClick={onCreate}
            disabled={!groupName.trim() || uploading}
          >
            {uploading ? "Criando e enviando foto..." : "Criar grupo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
