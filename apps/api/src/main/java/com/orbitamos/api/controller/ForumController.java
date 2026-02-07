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
import java.util.Set;
import java.util.stream.Collectors;

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
    public ResponseEntity<?> getMessages(
        @RequestParam(value = "q", required = false) String query,
        @RequestParam(value = "parentId", required = false) Long parentId
    ) {
        List<ForumMessage> messages;
        if (parentId != null) {
            messages = forumMessageRepository.findByParentIdOrderByCreatedAtAsc(parentId);
        } else {
            messages = forumMessageRepository.findTop50ByParentIdIsNullOrderByCreatedAtDesc();
            if (query != null && !query.trim().isEmpty()) {
                String q = query.trim().toLowerCase();
                messages = messages.stream().filter(message ->
                    message.getContent().toLowerCase().contains(q)
                        || (message.getTopicTitle() != null && message.getTopicTitle().toLowerCase().contains(q))
                        || message.getUser().getName().toLowerCase().contains(q)
                        || (message.getCity() != null && message.getCity().toLowerCase().contains(q))
                        || (message.getNeighborhood() != null && message.getNeighborhood().toLowerCase().contains(q))
                ).collect(Collectors.toList());
            }
        }

        List<Map<String, Object>> payload = messages.stream().map(message -> forumMessageToMap(message)).collect(Collectors.toList());
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/messages")
    public ResponseEntity<?> createMessage(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestBody Map<String, Object> body
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Token não fornecido"
            ));
        }

        String content = body.get("content") != null ? body.get("content").toString().trim() : "";
        String topicTitle = body.get("topicTitle") != null ? body.get("topicTitle").toString().trim() : null;
        String topicColor = body.get("topicColor") != null ? body.get("topicColor").toString().trim() : null;
        String topicEmoji = body.get("topicEmoji") != null ? body.get("topicEmoji").toString().trim() : null;
        Long parentId = body.get("parentId") instanceof Number ? ((Number) body.get("parentId")).longValue() : null;

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
        String userCity = user.getCity() != null && !user.getCity().trim().isEmpty() ? user.getCity().trim() : null;
        ForumMessage message = new ForumMessage(user, sanitize(content), userCity, null);
        message.setParentId(parentId);
        message.setTopicTitle(safeField(topicTitle));
        message.setTopicColor(safeField(topicColor));
        message.setTopicEmoji(safeField(topicEmoji));
        ForumMessage saved = forumMessageRepository.save(message);

        Map<String, Object> response = forumMessageToMap(saved);
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/messages/{id}")
    public ResponseEntity<?> updateMessage(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @PathVariable("id") Long id,
        @RequestBody Map<String, String> body
    ) {
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

        Optional<ForumMessage> messageOpt = forumMessageRepository.findById(id);
        if (messageOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Mensagem não encontrada"
            ));
        }

        ForumMessage message = messageOpt.get();
        if (!message.getUser().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", "Sem permissão para editar"
            ));
        }

        String content = body.getOrDefault("content", "").trim();
        String topicTitle = body.getOrDefault("topicTitle", "").trim();
        String topicColor = body.getOrDefault("topicColor", "").trim();
        String topicEmoji = body.getOrDefault("topicEmoji", "").trim();
        if (content.isEmpty() || content.length() > 500) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Mensagem inválida"
            ));
        }

        User user = userOpt.get();
        String userCity = user.getCity() != null && !user.getCity().trim().isEmpty() ? user.getCity().trim() : null;
        message.setContent(sanitize(content));
        message.setCity(userCity);
        message.setNeighborhood(null);
        message.setTopicTitle(safeField(topicTitle));
        message.setTopicColor(safeField(topicColor));
        message.setTopicEmoji(safeField(topicEmoji));
        ForumMessage saved = forumMessageRepository.save(message);

        Map<String, Object> response = forumMessageToMap(saved);
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @PathVariable("id") Long id
    ) {
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

        Optional<ForumMessage> messageOpt = forumMessageRepository.findById(id);
        if (messageOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Mensagem não encontrada"
            ));
        }

        ForumMessage message = messageOpt.get();
        if (!message.getUser().getId().equals(userOpt.get().getId())) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", "Sem permissão para excluir"
            ));
        }

        forumMessageRepository.delete(message);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private Map<String, Object> forumMessageToMap(ForumMessage message) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", message.getId());
        item.put("content", message.getContent());
        item.put("author", message.getUser().getName());
            item.put("userId", message.getUser().getId());
            item.put("authorAvatarUrl", message.getUser().getAvatarUrl() != null ? message.getUser().getAvatarUrl() : "");
            item.put("city", message.getCity());
            item.put("neighborhood", message.getNeighborhood());
        item.put("parentId", message.getParentId());
        item.put("topicTitle", message.getTopicTitle());
        item.put("topicColor", message.getTopicColor());
        item.put("topicEmoji", message.getTopicEmoji());
        item.put("createdAt", message.getCreatedAt());
        return item;
    }

    private String safeField(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String sanitize(String content) {
        String sanitized = content;
        Set<String> banned = Set.of("porra", "caralho", "merda", "foda-se", "viado");
        for (String word : banned) {
            sanitized = sanitized.replaceAll("(?i)" + word, "***");
        }
        return sanitized;
    }
}
