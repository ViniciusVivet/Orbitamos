package com.orbitamos.api.controller;

import com.orbitamos.api.config.JwtAuthenticationFilter;
import com.orbitamos.api.entity.User;
import com.orbitamos.api.entity.UserProgress;
import com.orbitamos.api.entity.UserRole;
import com.orbitamos.api.repository.UserAchievementRepository;
import com.orbitamos.api.repository.UserChecklistItemRepository;
import com.orbitamos.api.repository.UserProgressRepository;
import com.orbitamos.api.repository.UserRepository;
import com.orbitamos.api.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes do DashboardController: summary e addProgressLesson.
 */
@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
class DashboardControllerTest {

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserProgressRepository userProgressRepository;

    @MockBean
    private UserChecklistItemRepository userChecklistItemRepository;

    @MockBean
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getSummary_deveRetornar401QuandoSemToken() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void getSummary_deveRetornar401QuandoAuthorizationNaoBearer() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary")
                        .header("Authorization", "Basic xyz"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void addProgressLesson_deveRetornar401QuandoSemToken() throws Exception {
        mockMvc.perform(post("/api/dashboard/me/progress/lesson")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void addProgressLesson_deveRetornar401QuandoAuthorizationNaoBearer() throws Exception {
        mockMvc.perform(post("/api/dashboard/me/progress/lesson")
                        .header("Authorization", "Basic xyz")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getSummary_deveRetornar200ComProgressQuandoTokenValido() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@orbitamos.com");
        user.setName("Test User");
        user.setPassword("hash");
        user.setRole(UserRole.STUDENT);

        UserProgress progress = new UserProgress();
        progress.setUser(user);
        progress.setLevel(1);
        progress.setXp(50);
        progress.setLastLesson("Aula HTML");

        when(jwtUtil.extractEmail("valid-token")).thenReturn("test@orbitamos.com");
        when(userRepository.findByEmail("test@orbitamos.com")).thenReturn(Optional.of(user));
        when(userProgressRepository.findByUserId(1L)).thenReturn(Optional.of(progress));
        when(userChecklistItemRepository.findByUserIdAndWeekStart(anyLong(), any())).thenReturn(java.util.List.of());
        when(userAchievementRepository.findByUserIdOrderByEarnedAtDesc(1L)).thenReturn(java.util.List.of());

        mockMvc.perform(get("/api/dashboard/summary")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.progress.level").value(1))
                .andExpect(jsonPath("$.progress.xp").value(50))
                .andExpect(jsonPath("$.progress.lastLesson").value("Aula HTML"));
    }

    @Test
    void addProgressLesson_deveRetornar200ComProgressAtualizadoQuandoTokenValido() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@orbitamos.com");
        user.setName("Test User");
        user.setPassword("hash");
        user.setRole(UserRole.STUDENT);

        UserProgress progress = new UserProgress();
        progress.setUser(user);
        progress.setLevel(1);
        progress.setXp(90);

        when(jwtUtil.extractEmail("valid-token")).thenReturn("test@orbitamos.com");
        when(userRepository.findByEmail("test@orbitamos.com")).thenReturn(Optional.of(user));
        when(userProgressRepository.findByUserId(1L)).thenReturn(Optional.of(progress));
        when(userProgressRepository.save(any(UserProgress.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(post("/api/dashboard/me/progress/lesson")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"xpGained\": 10, \"lessonTitle\": \"Aula CSS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.progress").exists())
                .andExpect(jsonPath("$.progress.level").value(2))
                .andExpect(jsonPath("$.progress.xp").value(0))
                .andExpect(jsonPath("$.progress.lastLesson").value("Aula CSS"));
    }
}
