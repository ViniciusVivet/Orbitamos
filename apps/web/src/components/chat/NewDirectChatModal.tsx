"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AvatarWithPresence from "@/components/chat/AvatarWithPresence";
import { type ChatUser } from "@/lib/api";

interface Props {
  users: ChatUser[];
  selectedUserId: number | null;
  onSelectUser: (id: number) => void;
  onStart: () => void;
  onClose: () => void;
}

export default function NewDirectChatModal({ users, selectedUserId, onSelectUser, onStart, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-orbit-electric/30 bg-gray-900/95 p-5 shadow-2xl shadow-orbit-electric/10">
        <h2 className="text-lg font-semibold mb-3">Nova conversa</h2>
        <p className="text-sm text-white/60 mb-3">Escolha um usuário para conversar:</p>
        <div className="max-h-60 overflow-y-auto space-y-1 mb-4">
          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => onSelectUser(u.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/10",
                selectedUserId === u.id && "bg-orbit-electric/20"
              )}
            >
              <AvatarWithPresence avatarUrl={u.avatarUrl} name={u.name} lastSeenAt={u.lastSeenAt} size="md" />
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-white/50">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1 bg-orbit-electric text-black" onClick={onStart} disabled={selectedUserId == null}>
            Iniciar
          </Button>
        </div>
      </div>
    </div>
  );
}
