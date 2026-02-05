package com.orbitamos.api.repository;

import com.orbitamos.api.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT DISTINCT c FROM Conversation c JOIN c.participants p WHERE p.user.id = :userId ORDER BY c.createdAt DESC")
    List<Conversation> findByParticipantUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE c.id = :conversationId AND p.user.id = :userId")
    Optional<Conversation> findByIdAndParticipantUserId(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}
