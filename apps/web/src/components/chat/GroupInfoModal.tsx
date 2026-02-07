"use client";

import { useState } from "react";
import {
  updateGroupConversation,
  removeGroupParticipant,
  addGroupParticipant,
  uploadGroupAvatar,
  getDisplayAvatarUrl,
  type ChatConversation,
  type ChatUser,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GroupInfoModalProps {
  token: string | null;
  conversation: ChatConversation;
  currentUserId: number | undefined;
  users: ChatUser[];
  onClose: () => void;
  onUpdate: (conv: ChatConversation) => void;
  onLeave: () => void;
}

export default function GroupInfoModal({
  token,
  conversation,
  currentUserId,
  users,
  onClose,
  onUpdate,
  onLeave,
}: GroupInfoModalProps) {
  const [editName, setEditName] = useState(conversation.name ?? "");
  const [editAvatarUrl, setEditAvatarUrl] = useState(conversation.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const isCreator = currentUserId != null && conversation.createdByUserId === currentUserId;
  const participantIds = conversation.participants.map((p) => p.id);
  const usersToAdd = users.filter((u) => !participantIds.includes(u.id));

  const handleSave = async () => {
    if (!token || !isCreator) return;
    setSaving(true);
    try {
      const { conversation: updated } = await updateGroupConversation(token, conversation.id, {
        name: editName.trim() || undefined,
        avatarUrl: editAvatarUrl.trim() || null,
      });
      onUpdate(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (userId: number) => {
    if (!token || !isCreator) return;
    try {
      await addGroupParticipant(token, conversation.id, userId);
      const updated: ChatConversation = {
        ...conversation,
        participants: [...conversation.participants, users.find((u) => u.id === userId)!],
      };
      onUpdate(updated);
      setAddUserOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (userId: number) => {
    if (!token) return;
    setRemovingId(userId);
    try {
      await removeGroupParticipant(token, conversation.id, userId);
      if (userId === currentUserId) {
        onLeave();
        return;
      }
      const updated: ChatConversation = {
        ...conversation,
        participants: conversation.participants.filter((p) => p.id !== userId),
      };
      onUpdate(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-orbit-purple/30 bg-gray-900/95 p-5 shadow-2xl shadow-orbit-purple/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Info do grupo</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex justify-center mb-4">
          {getDisplayAvatarUrl(conversation.avatarUrl) ? (
            <img src={getDisplayAvatarUrl(conversation.avatarUrl)!} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-orbit-purple/40" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orbit-purple/40 to-orbit-electric/40 text-3xl">👥</span>
          )}
        </div>

        {isCreator && (
          <>
            <label className="block text-sm text-white/60 mb-1">Nome do grupo</label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mb-3 bg-white/10 border-white/20 text-white" placeholder="Nome" />
            <p className="text-sm text-white/60 mb-1">Foto do grupo</p>
            <div className="flex flex-col gap-2 mb-3">
              <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-white/30 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !token) return;
                    setUploadingAvatar(true);
                    try {
                      const { conversation: updated } = await uploadGroupAvatar(token, conversation.id, file);
                      onUpdate(updated);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setUploadingAvatar(false);
                      e.target.value = "";
                    }
                  }}
                />
                {uploadingAvatar ? "⏳ Enviando..." : "📷 Enviar nova foto"}
              </label>
              <span className="text-xs text-white/50">ou URL:</span>
              <Input value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} className="bg-white/10 border-white/20 text-white" placeholder="https://..." />
            </div>
            <Button className="w-full mb-4 bg-orbit-purple" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </>
        )}

        <p className="text-sm font-medium text-white/80 mb-2">Participantes ({conversation.participants.length})</p>
        <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
          {conversation.participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-white/5">
              {getDisplayAvatarUrl(p.avatarUrl) ? (
                <img src={getDisplayAvatarUrl(p.avatarUrl)!} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orbit-electric/20 text-orbit-electric font-medium text-sm">{p.name.slice(0, 1).toUpperCase()}</span>
              )}
              <span className="flex-1 font-medium truncate">{p.name}{p.id === conversation.createdByUserId ? " (criador)" : ""}</span>
              {((isCreator && p.id !== currentUserId) || p.id === currentUserId) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs"
                  onClick={() => handleRemove(p.id)}
                  disabled={removingId === p.id}
                >
                  {p.id === currentUserId ? "Sair do grupo" : "Remover"}
                </Button>
              )}
            </div>
          ))}
        </div>

        {isCreator && usersToAdd.length > 0 && (
          <>
            {!addUserOpen ? (
              <Button variant="outline" className="w-full border-orbit-purple/50 text-orbit-purple" onClick={() => setAddUserOpen(true)}>
                Adicionar participante
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-white/60">Escolha um usuário para adicionar:</p>
                {usersToAdd.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleAdd(u.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/10"
                  >
                    {getDisplayAvatarUrl(u.avatarUrl) ? (
                      <img src={getDisplayAvatarUrl(u.avatarUrl)!} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orbit-electric/20 text-orbit-electric text-sm">{u.name.slice(0, 1).toUpperCase()}</span>
                    )}
                    <span className="font-medium">{u.name}</span>
                  </button>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-white/60" onClick={() => setAddUserOpen(false)}>
                  Fechar
                </Button>
              </div>
            )}
          </>
        )}

        <Button variant="outline" className="w-full mt-4 border-white/20" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
}
