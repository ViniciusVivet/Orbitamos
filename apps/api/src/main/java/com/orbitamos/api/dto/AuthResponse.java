package com.orbitamos.api.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private Long id;
    private String message;
    
    public AuthResponse() {
    }
    
    public AuthResponse(String token, String email, String name, Long id, String message) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.id = id;
        this.message = message;
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

