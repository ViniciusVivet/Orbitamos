package com.orbitamos.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade que representa um usuário da Orbitamos (estudante ou colaborador/freelancer).
 */
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100, unique = true)
    private String email;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false)
    private String password;
    
    /** URL da foto de perfil (opcional). */
    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;
    
    /** Papel: STUDENT (estudante) ou FREELANCER (colaborador). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.STUDENT;
    
    /** Telefone (opcional). */
    @Column(length = 20)
    private String phone;
    
    /** Data de nascimento (opcional) - para calcular idade. */
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    /** Endereço: rua, número, complemento (opcional). */
    @Column(length = 300)
    private String address;
    
    /** Cidade (opcional). */
    @Column(length = 100)
    private String city;
    
    /** Estado (UF) (opcional). */
    @Column(length = 2)
    private String state;
    
    /** CEP (opcional). */
    @Column(name = "zip_code", length = 10)
    private String zipCode;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Construtor padrão
    public User() {
    }
    
    // Construtor com parâmetros
    public User(String email, String name, String password) {
        this.email = email;
        this.name = name;
        this.password = password;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public LocalDate getBirthDate() {
        return birthDate;
    }
    
    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public String getZipCode() {
        return zipCode;
    }
    
    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }
}

