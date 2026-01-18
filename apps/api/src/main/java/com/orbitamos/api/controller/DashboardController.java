package com.orbitamos.api.controller;

import com.orbitamos.api.entity.User;
import com.orbitamos.api.repository.UserRepository;
import com.orbitamos.api.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller para área do aluno/dashboard
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Token não fornecido"
                ));
            }
            
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Usuário não encontrado"
                ));
            }
            
            User user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "createdAt", user.getCreatedAt()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Token inválido ou expirado"
            ));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Token não fornecido"
                ));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Usuário não encontrado"
                ));
            }

            User user = userOpt.get();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "createdAt", user.getCreatedAt()
                ),
                "progress", Map.of(
                    "percent", 12,
                    "phase", "Planeta Terra — Fundação",
                    "nextGoal", "Finalizar o Módulo 1 de fundamentos",
                    "level", 1,
                    "xp", 120,
                    "streakDays", 3
                ),
                "nextAction", Map.of(
                    "title", "Continuar o Módulo 1",
                    "description", "Registrar a primeira dúvida",
                    "cta", "/orbitacademy"
                ),
                "weeklyChecklist", List.of(
                    Map.of("label", "Assistir 2 aulas base", "done", false),
                    Map.of("label", "Fazer 1 exercício prático", "done", false),
                    Map.of("label", "Postar 1 dúvida na comunidade", "done", true),
                    Map.of("label", "Marcar 1 mentoria", "done", false)
                ),
                "mentorship", Map.of(
                    "nextSession", "A definir",
                    "totalSessions", 0
                ),
                "projects", Map.of(
                    "current", "Landing page pessoal",
                    "status", "Em planejamento"
                ),
                "community", Map.of(
                    "unreadMessages", 3,
                    "channel", "#duvidas-iniciais"
                ),
                "opportunities", List.of(
                    Map.of("title", "Estágio Front-end (remoto)", "type", "Estágio"),
                    Map.of("title", "Projeto freelancer — landing page", "type", "Freela"),
                    Map.of("title", "Vaga de QA Jr (híbrido)", "type", "Júnior")
                ),
                "achievements", List.of(
                    "Primeiro acesso",
                    "Perfil completo",
                    "Primeira dúvida enviada"
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Token inválido ou expirado"
            ));
        }
    }
}

