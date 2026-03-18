package com.orbitamos.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Valida o header Origin em requisições que alteram estado (POST/PUT/DELETE/PATCH).
 * Protege contra CSRF em APIs que usam cookies SameSite=None cross-origin.
 *
 * Requisições sem header Origin (ex: curl, Postman, server-to-server) passam normalmente
 * — somente requisições vindas de um browser com Origin inválida são bloqueadas.
 */
@Component
public class OriginValidationFilter extends OncePerRequestFilter {

    private static final Set<String> ALLOWED_ORIGINS = Set.of(
        "http://localhost:3000",
        "http://localhost:3001",
        "https://orbitamos.vercel.app"
    );

    private static final Set<String> MUTATING_METHODS = Set.of("POST", "PUT", "DELETE", "PATCH");

    // Paths públicos que não precisam da verificação (health check, etc.)
    private static final Set<String> SKIP_PATHS = Set.of("/api/health", "/api-docs", "/swagger-ui");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String method = request.getMethod();
        String path   = request.getRequestURI();
        String origin = request.getHeader("Origin");

        boolean isMutating = MUTATING_METHODS.contains(method);
        boolean shouldSkip = SKIP_PATHS.stream().anyMatch(path::startsWith) || origin == null;

        if (isMutating && !shouldSkip && !isAllowedOrigin(origin)) {
            response.setStatus(403);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Origem não permitida.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isAllowedOrigin(String origin) {
        if (ALLOWED_ORIGINS.contains(origin)) return true;
        // Aceita qualquer preview/produção da Vercel
        return origin.matches("https://[a-zA-Z0-9\\-]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+\\.vercel\\.app")
            || origin.matches("https://[a-zA-Z0-9\\-]+\\.vercel\\.app");
    }
}
