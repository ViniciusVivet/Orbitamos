package com.orbitamos.api.service;

import com.orbitamos.api.dto.AuthResponse;
import com.orbitamos.api.dto.LoginRequest;
import com.orbitamos.api.dto.RegisterRequest;
import com.orbitamos.api.entity.User;
import com.orbitamos.api.entity.UserRole;
import com.orbitamos.api.repository.UserRepository;
import com.orbitamos.api.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Serviço de autenticação
 */
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public AuthResponse register(RegisterRequest request) {
        // Validações básicas
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("E-mail é obrigatório!");
        }
        
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Nome é obrigatório!");
        }
        
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Senha é obrigatória!");
        }
        
        if (request.getPassword().length() < 6) {
            throw new RuntimeException("A senha deve ter no mínimo 6 caracteres!");
        }
        
        // Validação básica de email
        String email = request.getEmail().trim().toLowerCase();
        if (!email.contains("@") || !email.contains(".")) {
            throw new RuntimeException("E-mail inválido!");
        }
        
        // Verifica se email já existe
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Este e-mail já está cadastrado. Tente fazer login.");
        }
        
        // Papel: STUDENT (padrão) ou FREELANCER
        UserRole role = UserRole.STUDENT;
        if (request.getRole() != null && request.getRole().trim().equalsIgnoreCase("FREELANCER")) {
            role = UserRole.FREELANCER;
        }
        
        // Cria novo usuário
        User user = new User();
        user.setEmail(email);
        user.setName(request.getName().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        
        User savedUser = userRepository.save(user);
        
        // Gera token JWT
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId());
        
        return new AuthResponse(
            token,
            savedUser.getEmail(),
            savedUser.getName(),
            savedUser.getId(),
            "Cadastro realizado com sucesso!",
            savedUser.getAvatarUrl(),
            savedUser.getRole().name()
        );
    }
    
    public AuthResponse login(LoginRequest request) {
        // Validações básicas
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("E-mail é obrigatório!");
        }
        
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Senha é obrigatória!");
        }
        
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            throw new RuntimeException("E-mail ou senha incorretos!");
        }
        
        User user = userOpt.get();
        
        // Gera token JWT
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        
        return new AuthResponse(
            token,
            user.getEmail(),
            user.getName(),
            user.getId(),
            "Login realizado com sucesso!",
            user.getAvatarUrl(),
            user.getRole().name()
        );
    }
}

