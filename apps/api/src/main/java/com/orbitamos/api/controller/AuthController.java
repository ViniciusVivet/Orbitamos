package com.orbitamos.api.controller;

import com.orbitamos.api.dto.AuthResponse;
import com.orbitamos.api.dto.LoginRequest;
import com.orbitamos.api.dto.RegisterRequest;
import com.orbitamos.api.service.AuthService;
import com.orbitamos.api.util.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    /** true em produção (HTTPS) — garante cookie Secure; false em localhost (HTTP). */
    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletResponse res) {
        try {
            AuthResponse response = authService.register(request);
            setSessionCookie(res, response.getToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse res) {
        try {
            AuthResponse response = authService.login(request);
            setSessionCookie(res, response.getToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse res) {
        clearSessionCookie(res);
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Renova o JWT sem pedir senha novamente, desde que o token atual ainda seja válido.
     * O frontend chama este endpoint periodicamente (ex: a cada 20h) para evitar
     * que o usuário seja deslogado após as 24h de expiração.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(value = "session_token", required = false) String sessionToken,
            HttpServletResponse res) {
        try {
            if (sessionToken == null || sessionToken.isBlank()) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Sessão não encontrada"));
            }
            if (jwtUtil.isTokenExpired(sessionToken)) {
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Sessão expirada. Faça login novamente."));
            }
            String email  = jwtUtil.extractEmail(sessionToken);
            Long   userId = jwtUtil.extractUserId(sessionToken);
            String newToken = jwtUtil.generateToken(email, userId);
            setSessionCookie(res, newToken);
            return ResponseEntity.ok(Map.of("success", true, "token", newToken));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Token inválido"));
        }
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private void setSessionCookie(HttpServletResponse res, String token) {
        Cookie cookie = new Cookie("session_token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 dias
        // SameSite=None é necessário para cookie cross-origin (Vercel → EC2/CloudFront)
        res.addHeader("Set-Cookie",
            String.format("session_token=%s; HttpOnly; %sPath=/; Max-Age=%d; SameSite=None",
                token, cookieSecure ? "Secure; " : "", 7 * 24 * 60 * 60));
    }

    private void clearSessionCookie(HttpServletResponse res) {
        res.addHeader("Set-Cookie",
            "session_token=; HttpOnly; " + (cookieSecure ? "Secure; " : "") +
            "Path=/; Max-Age=0; SameSite=None");
    }
}

