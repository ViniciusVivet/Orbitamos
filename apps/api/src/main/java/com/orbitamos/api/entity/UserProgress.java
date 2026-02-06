package com.orbitamos.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer percent = 0;

    @Column(name = "phase", nullable = false, length = 120)
    private String phase = "Planeta Terra — Fundação";

    @Column(name = "next_goal", nullable = false, length = 255)
    private String nextGoal = "Finalizar o Módulo 1 de fundamentos";

    @Column(nullable = false)
    private Integer level = 1;

    @Column(nullable = false)
    private Integer xp = 0;

    @Column(name = "streak_days", nullable = false)
    private Integer streakDays = 0;

    /** Ultima aula vista (para "Continuar: X") */
    @Column(name = "last_lesson", length = 255)
    private String lastLesson;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getPercent() {
        return percent;
    }

    public void setPercent(Integer percent) {
        this.percent = percent;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getNextGoal() {
        return nextGoal;
    }

    public void setNextGoal(String nextGoal) {
        this.nextGoal = nextGoal;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getXp() {
        return xp;
    }

    public void setXp(Integer xp) {
        this.xp = xp;
    }

    public Integer getStreakDays() {
        return streakDays;
    }

    public void setStreakDays(Integer streakDays) {
        this.streakDays = streakDays;
    }

    public String getLastLesson() {
        return lastLesson;
    }

    public void setLastLesson(String lastLesson) {
        this.lastLesson = lastLesson;
    }
}
