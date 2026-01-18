package com.orbitamos.api.repository;

import com.orbitamos.api.entity.UserChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface UserChecklistItemRepository extends JpaRepository<UserChecklistItem, Long> {
    List<UserChecklistItem> findByUserIdAndWeekStart(Long userId, LocalDate weekStart);
}
