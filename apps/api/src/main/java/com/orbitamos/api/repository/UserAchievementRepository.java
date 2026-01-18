package com.orbitamos.api.repository;

import com.orbitamos.api.entity.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    List<UserAchievement> findByUserIdOrderByEarnedAtDesc(Long userId);
}
