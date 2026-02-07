package com.orbitamos.api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuração de segurança do Spring Security
 * Permite acesso público aos endpoints da API
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Desabilita CSRF para APIs REST (não precisa de token CSRF)
            .csrf(csrf -> csrf.disable())
            
            // Configura CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configura autorização de endpoints
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos (não precisam autenticação)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/contact").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/mentorships").permitAll()
                .requestMatchers("/api-docs/**").permitAll()
                .requestMatchers("/swagger-ui/**").permitAll()
                .requestMatchers("/swagger-ui.html").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/").permitAll()
                .requestMatchers("/ws/**").permitAll()
                // Endpoints protegidos (precisam de autenticação JWT)
                .requestMatchers("/api/uploads/**").permitAll()
                .requestMatchers("/api/dashboard/**").authenticated()
                .requestMatchers("/api/contacts").authenticated()
                .requestMatchers("/api/projects/**").authenticated()
                .requestMatchers("/api/jobs/**").authenticated()
                .requestMatchers("/api/chat/**").authenticated()
                .requestMatchers("/api/users/**").authenticated()
                .anyRequest().permitAll()
            )
            
            // Adiciona filtro JWT antes do filtro de autenticação padrão
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Desabilita sessões (stateless - melhor para APIs)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Origens permitidas: localhost + qualquer preview/produção Vercel (*.vercel.app)
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000",
            "https://*.vercel.app"
        ));
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Headers permitidos
        configuration.setAllowedHeaders(List.of("*"));
        
        // Permite credenciais (cookies, headers de autenticação)
        configuration.setAllowCredentials(true);
        
        // Headers expostos na resposta
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/ws/**", configuration);
        
        return source;
    }
}

