package com.orbitamos.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_achievements")
public class UserAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;

    public UserAchievement() {
    }

    public UserAchievement(User user, String title) {
        this.user = user;
        this.title = title;
        this.earnedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        earnedAt = LocalDateTime.now();
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }
}
