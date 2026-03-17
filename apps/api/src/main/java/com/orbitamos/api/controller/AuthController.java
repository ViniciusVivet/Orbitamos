package com.orbitamos.api.controller;

import com.orbitamos.api.dto.AuthResponse;
import com.orbitamos.api.dto.LoginRequest;
import com.orbitamos.api.dto.RegisterRequest;
import com.orbitamos.api.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

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

