package com.orbitamos.api.controller;

import com.orbitamos.api.entity.User;
import com.orbitamos.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Perfil público do usuário (para modal no fórum, "visto por último" no chat).
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_DATE_TIME;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getPublicProfile(@PathVariable Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Usuário não encontrado"));
        }
        User u = opt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", u.getId());
        profile.put("name", u.getName());
        profile.put("avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "");
        profile.put("city", u.getCity() != null ? u.getCity() : "");
        profile.put("state", u.getState() != null ? u.getState() : "");
        profile.put("role", u.getRole().name());
        profile.put("lastSeenAt", u.getUpdatedAt() != null ? u.getUpdatedAt().format(ISO) : null);
        return ResponseEntity.ok(Map.of("success", true, "profile", profile));
    }
}
