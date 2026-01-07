package com.orbitamos.api.service;

import com.orbitamos.api.entity.Contact;
import com.orbitamos.api.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service que contém a lógica de negócio para contatos
 */
@Service
public class ContactService {
    
    @Autowired
    private ContactRepository contactRepository;
    
    /**
     * Salva um novo contato no banco de dados
     */
    public Contact save(Contact contact) {
        if (contact.getCreatedAt() == null) {
            contact.setCreatedAt(LocalDateTime.now());
        }
        if (contact.getRead() == null) {
            contact.setRead(false);
        }
        return contactRepository.save(contact);
    }
    
    /**
     * Busca todos os contatos
     */
    public List<Contact> findAll() {
        return contactRepository.findAll();
    }
    
    /**
     * Busca um contato por ID
     */
    public Optional<Contact> findById(Long id) {
        return contactRepository.findById(id);
    }
    
    /**
     * Busca contatos não lidos
     */
    public List<Contact> findUnread() {
        return contactRepository.findByReadFalse();
    }
    
    /**
     * Marca um contato como lido
     */
    public Optional<Contact> markAsRead(Long id) {
        Optional<Contact> contactOpt = contactRepository.findById(id);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            contact.setRead(true);
            return Optional.of(contactRepository.save(contact));
        }
        return Optional.empty();
    }
    
    /**
     * Deleta um contato
     */
    public void delete(Long id) {
        contactRepository.deleteById(id);
    }
}

