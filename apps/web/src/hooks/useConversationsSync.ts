"use client";

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getChatWsUrl } from "@/lib/chatWs";
import type { ChatConversation, ChatMessageItem } from "@/lib/api";

interface Params {
  token: string | null;
  conversations: ChatConversation[];
  selectedId: number | null;
  currentUserId: number | undefined;
  /** Chamado quando chega mensagem na conversa aberta (não-própria). */
  onMessageForSelected: (msg: ChatMessageItem) => void;
  /** Chamado quando chega mensagem em qualquer conversa (incluindo a aberta).
   *  Deve: bump da conversa no topo + atualizar lastMessage + incrementar unread se não selecionada. */
  onConversationActivity: (convId: number, msg: ChatMessageItem) => void;
}

/**
 * Mantém uma única conexão STOMP e se inscreve em TODAS as conversas do usuário.
 *
 * Substitui:
 *  - useChatWebSocket (que só cobria a conversa aberta)
 *  - setInterval de polling (que buscava a lista de conversas a cada 5s)
 *
 * Ao receber mensagem:
 *  - Se é da conversa aberta e não é do próprio usuário → chama onMessageForSelected
 *  - Sempre → chama onConversationActivity (para bump + unread)
 *
 * Ao receber nova conversa na lista → se inscreve no tópico automaticamente.
 */
export function useConversationsSync({
  token,
  conversations,
  selectedId,
  currentUserId,
  onMessageForSelected,
  onConversationActivity,
}: Params) {
  const clientRef = useRef<Client | null>(null);
  const subscribedRef = useRef<Set<number>>(new Set());

  // Refs para callbacks — evita recriar o client por mudança de função
  const onMessageForSelectedRef = useRef(onMessageForSelected);
  const onConversationActivityRef = useRef(onConversationActivity);
  const selectedIdRef = useRef(selectedId);
  const currentUserIdRef = useRef(currentUserId);

  onMessageForSelectedRef.current = onMessageForSelected;
  onConversationActivityRef.current = onConversationActivity;
  selectedIdRef.current = selectedId;
  currentUserIdRef.current = currentUserId;

  // Função de inscrição reutilizável (captura clientRef e subscribedRef via closure)
  const subscribeRef = useRef<(convId: number) => void>(() => {});

  // Conecta uma única vez por token
  useEffect(() => {
    if (!token) return;
    const wsUrl = getChatWsUrl();
    if (!wsUrl) return;

    subscribedRef.current.clear();

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        // Inscreve em todas as conversas conhecidas no momento da conexão
        // (conversations pode ter mudado — o effect abaixo cuida disso)
      },
    });

    subscribeRef.current = (convId: number) => {
      if (subscribedRef.current.has(convId)) return;
      if (!client.connected) return;
      subscribedRef.current.add(convId);

      client.subscribe(`/topic/chat/${convId}`, (frame) => {
        try {
          const body = JSON.parse(frame.body) as ChatMessageItem & { conversationId?: number };
          const msg: ChatMessageItem = {
            id: body.id,
            content: body.content,
            senderId: body.senderId,
            senderName: body.senderName,
            senderAvatarUrl: body.senderAvatarUrl ?? "",
            createdAt: body.createdAt,
          };

          // Mensagem na conversa aberta e não é do próprio usuário → exibe no chat
          if (convId === selectedIdRef.current && msg.senderId !== currentUserIdRef.current) {
            onMessageForSelectedRef.current(msg);
          }

          // Sempre notifica atividade (bump + unread)
          onConversationActivityRef.current(convId, msg);
        } catch {
          // frame malformado — ignorar
        }
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      subscribedRef.current.clear();
      subscribeRef.current = () => {};
    };
  }, [token]);

  // Inscreve em conversas novas quando a lista muda ou quando o client conecta
  useEffect(() => {
    const client = clientRef.current;
    if (!client || !conversations.length) return;

    const trySubscribe = () => {
      if (!client.connected) return;
      conversations.forEach((c) => subscribeRef.current(c.id));
    };

    if (client.connected) {
      trySubscribe();
    } else {
      // Substitui onConnect sem encadear handlers — usa ref para evitar acúmulo
      client.onConnect = () => trySubscribe();
    }
  }, [conversations]);
}
