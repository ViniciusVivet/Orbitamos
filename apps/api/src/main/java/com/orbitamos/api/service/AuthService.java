package com.orbitamos.api.service;

import com.orbitamos.api.dto.AuthResponse;
import com.orbitamos.api.dto.LoginRequest;
import com.orbitamos.api.dto.RegisterRequest;
import com.orbitamos.api.entity.User;
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
        // Verifica se email já existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já cadastrado!");
        }
        
        // Cria novo usuário
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        User savedUser = userRepository.save(user);
        
        // Gera token JWT
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId());
        
        return new AuthResponse(
            token,
            savedUser.getEmail(),
            savedUser.getName(),
            savedUser.getId(),
            "Cadastro realizado com sucesso!"
        );
    }
    
    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            throw new RuntimeException("Email ou senha incorretos!");
        }
        
        User user = userOpt.get();
        
        // Gera token JWT
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        
        return new AuthResponse(
            token,
            user.getEmail(),
            user.getName(),
            user.getId(),
            "Login realizado com sucesso!"
        );
    }
}

