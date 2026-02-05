package com.orbitamos.api.repository;

import com.orbitamos.api.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    ChatMessage findTop1ByConversationIdOrderByCreatedAtDesc(Long conversationId);
}
