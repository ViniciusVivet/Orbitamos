package com.orbitamos.api.controller;

import com.orbitamos.api.entity.ForumMessage;
import com.orbitamos.api.entity.User;
import com.orbitamos.api.repository.ForumMessageRepository;
import com.orbitamos.api.repository.UserRepository;
import com.orbitamos.api.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = "*")
public class ForumController {

    @Autowired
    private ForumMessageRepository forumMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages() {
        List<ForumMessage> messages = forumMessageRepository.findTop50ByOrderByCreatedAtDesc();
        List<Map<String, Object>> payload = messages.stream().map(message -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", message.getId());
            item.put("content", message.getContent());
            item.put("author", message.getUser().getName());
            item.put("createdAt", message.getCreatedAt());
            return item;
        }).toList();
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/messages")
    public ResponseEntity<?> createMessage(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Map<String, String> body
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Token não fornecido"
            ));
        }

        String content = body.getOrDefault("content", "").trim();
        if (content.isEmpty() || content.length() > 500) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Mensagem inválida"
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
        ForumMessage message = new ForumMessage(user, content);
        ForumMessage saved = forumMessageRepository.save(message);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("id", saved.getId());
        response.put("author", user.getName());
        response.put("content", saved.getContent());
        response.put("createdAt", saved.getCreatedAt());
        return ResponseEntity.ok(response);
    }
}
