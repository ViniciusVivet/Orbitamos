package com.orbitamos.api.controller;

import com.orbitamos.api.dto.UpdateProfileRequest;
import com.orbitamos.api.entity.User;
import com.orbitamos.api.entity.UserAchievement;
import com.orbitamos.api.entity.UserChecklistItem;
import com.orbitamos.api.entity.UserProgress;
import com.orbitamos.api.repository.UserRepository;
import com.orbitamos.api.repository.UserAchievementRepository;
import com.orbitamos.api.repository.UserChecklistItemRepository;
import com.orbitamos.api.repository.UserProgressRepository;
import com.orbitamos.api.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.temporal.TemporalAdjusters;

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

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private UserChecklistItemRepository userChecklistItemRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${app.api-base-url:http://localhost:8080}")
    private String apiBaseUrl;

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
        "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    
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
                "user", userToMap(user)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Token inválido ou expirado"
            ));
        }
    }

    private Map<String, Object> userToMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("createdAt", user.getCreatedAt());
        map.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
        map.put("role", user.getRole().name());
        map.put("phone", user.getPhone() != null ? user.getPhone() : "");
        map.put("birthDate", user.getBirthDate() != null ? user.getBirthDate().toString() : null);
        map.put("address", user.getAddress() != null ? user.getAddress() : "");
        map.put("city", user.getCity() != null ? user.getCity() : "");
        map.put("state", user.getState() != null ? user.getState() : "");
        map.put("zipCode", user.getZipCode() != null ? user.getZipCode() : "");
        return map;
    }

    /**
     * Usa API_BASE_URL quando configurado; senão, se a config for localhost e houver request
     * (ex.: atrás do Render), monta a URL a partir de X-Forwarded-Proto/Host para a foto carregar em HTTPS.
     */
    private String resolveApiBaseUrl(HttpServletRequest request) {
        if (apiBaseUrl != null && !apiBaseUrl.contains("localhost")) {
            return apiBaseUrl.endsWith("/") ? apiBaseUrl.substring(0, apiBaseUrl.length() - 1) : apiBaseUrl;
        }
        if (request == null) return apiBaseUrl;
        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null || scheme.isBlank()) scheme = request.getScheme();
        String host = request.getHeader("X-Forwarded-Host");
        if (host == null || host.isBlank()) host = request.getServerName();
        int port = request.getServerPort();
        boolean defaultPort = ("https".equals(scheme) && port == 443) || ("http".equals(scheme) && port == 80);
        if (defaultPort) return scheme + "://" + host;
        return scheme + "://" + host + ":" + port;
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody UpdateProfileRequest request) {
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
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                user.setName(request.getName().trim());
            }
            if (request.getAvatarUrl() != null) {
                user.setAvatarUrl(request.getAvatarUrl().trim().isEmpty() ? null : request.getAvatarUrl().trim());
            }
            if (request.getPhone() != null) {
                user.setPhone(request.getPhone().trim().isEmpty() ? null : request.getPhone().trim());
            }
            if (request.getBirthDate() != null) {
                user.setBirthDate(request.getBirthDate());
            }
            if (request.getAddress() != null) {
                user.setAddress(request.getAddress().trim().isEmpty() ? null : request.getAddress().trim());
            }
            if (request.getCity() != null) {
                user.setCity(request.getCity().trim().isEmpty() ? null : request.getCity().trim());
            }
            if (request.getState() != null) {
                user.setState(request.getState().trim().isEmpty() ? null : request.getState().trim());
            }
            if (request.getZipCode() != null) {
                user.setZipCode(request.getZipCode().trim().isEmpty() ? null : request.getZipCode().trim());
            }
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", userToMap(user)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Token inválido ou expirado"
            ));
        }
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
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
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Nenhum arquivo enviado"
                ));
            }
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Envie uma imagem (JPG, PNG, GIF ou WebP)"
                ));
            }
            User user = userOpt.get();
            String ext = contentType.split("/")[1];
            if ("jpeg".equals(ext)) ext = "jpg";
            String filename = System.currentTimeMillis() + "." + ext;
            Path dir = Path.of(uploadDir).toAbsolutePath().normalize().resolve("avatars").resolve(String.valueOf(user.getId()));
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            file.transferTo(target.toFile());
            String baseUrl = resolveApiBaseUrl(request);
            String avatarUrl = baseUrl + "/api/uploads/avatars/" + user.getId() + "/" + filename;
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "avatarUrl", avatarUrl,
                "user", userToMap(user)
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Erro ao salvar a imagem"
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

            UserProgress progress = userProgressRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserProgress created = new UserProgress();
                    created.setUser(user);
                    return userProgressRepository.save(created);
                });

            LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            List<UserChecklistItem> checklist = userChecklistItemRepository.findByUserIdAndWeekStart(user.getId(), weekStart);
            if (checklist.isEmpty()) {
                checklist = new ArrayList<>();
                checklist.add(new UserChecklistItem(user, "Assistir 2 aulas base", weekStart));
                checklist.add(new UserChecklistItem(user, "Fazer 1 exercício prático", weekStart));
                checklist.add(new UserChecklistItem(user, "Postar 1 dúvida na comunidade", weekStart));
                checklist.add(new UserChecklistItem(user, "Marcar 1 mentoria", weekStart));
                userChecklistItemRepository.saveAll(checklist);
            }

            List<UserAchievement> achievements = userAchievementRepository.findByUserIdOrderByEarnedAtDesc(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);

            response.put("user", userToMap(user));

            Map<String, Object> progressMap = new HashMap<>();
            progressMap.put("percent", progress.getPercent());
            progressMap.put("phase", progress.getPhase());
            progressMap.put("nextGoal", progress.getNextGoal());
            progressMap.put("level", progress.getLevel());
            progressMap.put("xp", progress.getXp());
            progressMap.put("streakDays", progress.getStreakDays());
            response.put("progress", progressMap);

            Map<String, Object> nextActionMap = new HashMap<>();
            nextActionMap.put("title", "Continuar o Módulo 1");
            nextActionMap.put("description", "Registrar a primeira dúvida");
            nextActionMap.put("cta", "/orbitacademy");
            response.put("nextAction", nextActionMap);

            List<Map<String, Object>> checklistPayload = new ArrayList<>();
            checklist.forEach(item -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("label", item.getLabel());
                itemMap.put("done", item.getDone());
                checklistPayload.add(itemMap);
            });
            response.put("weeklyChecklist", checklistPayload);

            Map<String, Object> mentorshipMap = new HashMap<>();
            mentorshipMap.put("nextSession", "A definir");
            mentorshipMap.put("totalSessions", 0);
            response.put("mentorship", mentorshipMap);

            Map<String, Object> projectsMap = new HashMap<>();
            projectsMap.put("current", "Landing page pessoal");
            projectsMap.put("status", "Em planejamento");
            response.put("projects", projectsMap);

            Map<String, Object> communityMap = new HashMap<>();
            communityMap.put("unreadMessages", 3);
            communityMap.put("channel", "#duvidas-iniciais");
            response.put("community", communityMap);

            List<Map<String, Object>> opportunities = new ArrayList<>();
            Map<String, Object> opportunity1 = new HashMap<>();
            opportunity1.put("title", "Estágio Front-end (remoto)");
            opportunity1.put("type", "Estágio");
            opportunities.add(opportunity1);
            Map<String, Object> opportunity2 = new HashMap<>();
            opportunity2.put("title", "Projeto freelancer — landing page");
            opportunity2.put("type", "Freela");
            opportunities.add(opportunity2);
            Map<String, Object> opportunity3 = new HashMap<>();
            opportunity3.put("title", "Vaga de QA Jr (híbrido)");
            opportunity3.put("type", "Júnior");
            opportunities.add(opportunity3);
            response.put("opportunities", opportunities);

            response.put("achievements", achievements.stream()
                .map(UserAchievement::getTitle)
                .collect(Collectors.toList()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Token inválido ou expirado");
            return ResponseEntity.status(401).body(error);
        }
    }
}

