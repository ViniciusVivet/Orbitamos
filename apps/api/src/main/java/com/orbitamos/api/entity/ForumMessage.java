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

    /** Resposta a outro post (null = tópico raiz). */
    @Column(name = "parent_id")
    private Long parentId;

    /** Título do tópico (só em posts raiz). */
    @Column(name = "topic_title", length = 120)
    private String topicTitle;

    /** Cor do tópico (hex ou nome). */
    @Column(name = "topic_color", length = 30)
    private String topicColor;

    /** Emoji do tópico. */
    @Column(name = "topic_emoji", length = 10)
    private String topicEmoji;

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

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public String getTopicTitle() { return topicTitle; }
    public void setTopicTitle(String topicTitle) { this.topicTitle = topicTitle; }
    public String getTopicColor() { return topicColor; }
    public void setTopicColor(String topicColor) { this.topicColor = topicColor; }
    public String getTopicEmoji() { return topicEmoji; }
    public void setTopicEmoji(String topicEmoji) { this.topicEmoji = topicEmoji; }

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

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public String getTopicTitle() { return topicTitle; }
    public void setTopicTitle(String topicTitle) { this.topicTitle = topicTitle; }
    public String getTopicColor() { return topicColor; }
    public void setTopicColor(String topicColor) { this.topicColor = topicColor; }
    public String getTopicEmoji() { return topicEmoji; }
    public void setTopicEmoji(String topicEmoji) { this.topicEmoji = topicEmoji; }
}
