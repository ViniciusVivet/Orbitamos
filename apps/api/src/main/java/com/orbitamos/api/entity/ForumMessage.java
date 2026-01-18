package com.orbitamos.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "forum_messages")
public class ForumMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(length = 80)
    private String city;

    @Column(length = 80)
    private String neighborhood;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public ForumMessage() {
    }

    public ForumMessage(User user, String content, String city, String neighborhood) {
        this.user = user;
        this.content = content;
        this.city = city;
        this.neighborhood = neighborhood;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getNeighborhood() {
        return neighborhood;
    }

    public void setNeighborhood(String neighborhood) {
        this.neighborhood = neighborhood;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
