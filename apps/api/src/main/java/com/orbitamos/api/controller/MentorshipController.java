package com.orbitamos.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Controller para mentorias da Orbitamos
 * Lista os programas disponíveis
 */
@RestController
@RequestMapping("/api")
public class MentorshipController {

    @GetMapping("/mentorships")
    public ResponseEntity<List<Map<String, Object>>> getMentorships() {
        List<Map<String, Object>> mentorships = List.of(
            Map.of(
                "id", 1,
                "name", "Mentoria Tech 9 Meses",
                "description", "Do zero ao primeiro trampo em T.I. em 9 meses",
                "duration", "9 meses",
                "level", "Iniciante",
                "price", "Gratuito",
                "spots", 50
            ),
            Map.of(
                "id", 2,
                "name", "Programa Quebrada Dev",
                "description", "Desenvolvimento web focado na realidade da periferia",
                "duration", "6 meses",
                "level", "Intermediário",
                "price", "Gratuito",
                "spots", 30
            ),
            Map.of(
                "id", 3,
                "name", "Orbitamos Academy",
                "description", "Cursos especializados em tecnologias emergentes",
                "duration", "3 meses",
                "level", "Avançado",
                "price", "Acessível",
                "spots", 20
            )
        );
        
        return ResponseEntity.ok(mentorships);
    }
}
