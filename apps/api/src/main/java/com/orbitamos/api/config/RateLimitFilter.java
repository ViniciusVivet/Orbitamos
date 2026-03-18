package com.orbitamos.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiter simples em memória por IP.
 * Janela fixa de 1 minuto — suficiente para bloquear força bruta e spam.
 *
 * Limites:
 *  - /api/auth/login    → 10 req/min por IP
 *  - /api/auth/register → 5  req/min por IP
 *  - /api/contact       → 3  req/min por IP
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MS = 60_000L; // 1 minuto

    private record Bucket(AtomicInteger count, long windowStart) {}

    private final Map<String, Bucket> store = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        int limit = limitFor(path);

        if (limit > 0) {
            String key = clientIp(request) + "|" + path;
            if (isRateLimited(key, limit)) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Muitas tentativas. Aguarde um momento e tente novamente.\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private int limitFor(String path) {
        if (path.equals("/api/auth/login"))    return 10;
        if (path.equals("/api/auth/register")) return 5;
        if (path.equals("/api/contact"))       return 3;
        return 0; // sem limite
    }

    private boolean isRateLimited(String key, int limit) {
        long now = System.currentTimeMillis();
        store.compute(key, (k, bucket) -> {
            if (bucket == null || now - bucket.windowStart() >= WINDOW_MS) {
                return new Bucket(new AtomicInteger(1), now);
            }
            bucket.count().incrementAndGet();
            return bucket;
        });
        Bucket bucket = store.get(key);
        return bucket != null && bucket.count().get() > limit;
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
