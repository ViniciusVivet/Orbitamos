package com.orbitamos.api.repository;

import com.orbitamos.api.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para operações com a entidade Contact
 */
@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    
    /**
     * Busca contatos por email
     */
    Optional<Contact> findByEmail(String email);
    
    /**
     * Busca contatos não lidos
     */
    List<Contact> findByReadFalse();
    
    /**
     * Busca contatos por nome (case insensitive)
     */
    List<Contact> findByNameContainingIgnoreCase(String name);
}

