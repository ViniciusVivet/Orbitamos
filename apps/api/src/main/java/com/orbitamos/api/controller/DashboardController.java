package com.orbitamos.api.controller;

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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("name", user.getName());
            userMap.put("email", user.getEmail());
            userMap.put("createdAt", user.getCreatedAt());
            response.put("user", userMap);

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

