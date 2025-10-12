package com.orbitamos.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Controller para contato da Orbitamos
 * Recebe mensagens e formulários de interesse
 */
@RestController
@RequestMapping("/api")
public class ContactController {

    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> contact(@RequestBody Map<String, String> contactData) {
        // Aqui seria salvo no banco de dados
        // Por enquanto, apenas retorna confirmação
        
        String name = contactData.get("name");
        String email = contactData.get("email");
        String message = contactData.get("message");
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Mensagem recebida com sucesso! Entraremos em contato em breve.",
            "timestamp", LocalDateTime.now(),
            "data", Map.of(
                "name", name,
                "email", email,
                "message", message
            )
        ));
    }
}
