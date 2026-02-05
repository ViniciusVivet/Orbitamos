package com.orbitamos.api.controller;

import com.orbitamos.api.entity.Project;
import com.orbitamos.api.entity.User;
import com.orbitamos.api.repository.ProjectRepository;
import com.orbitamos.api.repository.UserRepository;
import com.orbitamos.api.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectsController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<?> getMyProjects(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
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
            Long userId = userOpt.get().getId();
            List<Project> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);
            List<Map<String, Object>> payload = projects.stream()
                .map(p -> Map.<String, Object>of(
                    "id", p.getId(),
                    "title", p.getTitle(),
                    "description", p.getDescription() != null ? p.getDescription() : "",
                    "status", p.getStatus(),
                    "createdAt", p.getCreatedAt()
                ))
                .collect(Collectors.toList());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "projects", payload
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Token inválido ou expirado"
            ));
        }
    }
}
