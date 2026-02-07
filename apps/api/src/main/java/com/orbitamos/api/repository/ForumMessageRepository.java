package com.orbitamos.api.repository;

import com.orbitamos.api.entity.ForumMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ForumMessageRepository extends JpaRepository<ForumMessage, Long> {
    List<ForumMessage> findTop50ByParentIdIsNullOrderByCreatedAtDesc();
    List<ForumMessage> findByParentIdOrderByCreatedAtAsc(Long parentId);
}
