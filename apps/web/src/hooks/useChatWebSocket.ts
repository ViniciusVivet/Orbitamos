"use client";

import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getChatWsUrl } from "@/lib/chatWs";
import type { ChatMessageItem } from "@/lib/api";

export function useChatWebSocket(
  token: string | null,
  conversationId: number | null,
  currentUserId: number | undefined,
  onMessage: (msg: ChatMessageItem) => void,
  onUnread: (convId: number) => void,
  isMinimized: boolean
) {
  const onMessageRef = useRef(onMessage);
  const onUnreadRef = useRef(onUnread);
  onMessageRef.current = onMessage;
  onUnreadRef.current = onUnread;

  useEffect(() => {
    if (!token || currentUserId == null || conversationId == null) return;
    const wsUrl = getChatWsUrl();
    if (!wsUrl) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      reconnectDelay: 3000,
      onConnect: () => {
        const dest = `/topic/chat/${conversationId}`;
        client.subscribe(dest, (frame) => {
          try {
            const body = JSON.parse(frame.body) as ChatMessageItem & { conversationId?: number };
            if (body.senderId === currentUserId) return;
            const msg: ChatMessageItem = {
              id: body.id,
              content: body.content,
              senderId: body.senderId,
              senderName: body.senderName,
              senderAvatarUrl: body.senderAvatarUrl ?? "",
              createdAt: body.createdAt,
            };
            onMessageRef.current(msg);
            if (isMinimized) onUnreadRef.current(body.conversationId ?? conversationId);
          } catch {}
        });
      },
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [token, currentUserId, conversationId, isMinimized]);
}
