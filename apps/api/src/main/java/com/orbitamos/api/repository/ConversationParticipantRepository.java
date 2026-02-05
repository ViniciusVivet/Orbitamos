package com.orbitamos.api.repository;

import com.orbitamos.api.entity.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    List<ConversationParticipant> findByConversationIdOrderByJoinedAtAsc(Long conversationId);

    Optional<ConversationParticipant> findByConversationIdAndUserId(Long conversationId, Long userId);

    boolean existsByConversationIdAndUserId(Long conversationId, Long userId);
}
