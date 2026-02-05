package com.orbitamos.api.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private Long id;
    private String message;
    private String avatarUrl;
    private String role;
    
    public AuthResponse() {
    }
    
    public AuthResponse(String token, String email, String name, Long id, String message) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.id = id;
        this.message = message;
    }
    
    public AuthResponse(String token, String email, String name, Long id, String message, String avatarUrl, String role) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.id = id;
        this.message = message;
        this.avatarUrl = avatarUrl;
        this.role = role;
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}

