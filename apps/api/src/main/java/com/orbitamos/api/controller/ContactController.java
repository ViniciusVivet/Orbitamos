package com.orbitamos.api.controller;

import com.orbitamos.api.entity.Contact;
import com.orbitamos.api.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller para contato da Orbitamos
 * Recebe mensagens e formulários de interesse
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> contact(@RequestBody Map<String, String> contactData) {
        try {
            Contact contact = new Contact(
                contactData.get("name"),
                contactData.get("email"),
                contactData.get("message")
            );
            
            Contact saved = contactService.save(contact);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Mensagem recebida com sucesso! Entraremos em contato em breve.",
                "id", saved.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Erro ao salvar mensagem: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/contacts")
    public ResponseEntity<List<Contact>> getAllContacts() {
        return ResponseEntity.ok(contactService.findAll());
    }
    
    @GetMapping("/contacts/unread")
    public ResponseEntity<List<Contact>> getUnreadContacts() {
        return ResponseEntity.ok(contactService.findUnread());
    }
    
    @PutMapping("/contacts/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        return contactService.markAsRead(id)
            .map(contact -> ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Contato marcado como lido",
                "contact", contact
            )))
            .orElse(ResponseEntity.notFound().build());
    }
}
