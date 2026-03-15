# 🚀 Guia: Backend Funcional e Gratuito - Orbitamos

> **⚠️ REFERÊNCIA HISTÓRICA** — Este guia foi escrito quando o backend rodava no Render/Railway.
> O deploy atual é **EC2 + CloudFront**. Veja [`docs/INFRA_ATUAL.md`](INFRA_ATUAL.md).
> Este doc é útil se você quiser migrar para Render/Railway no futuro.
>
> Última atualização: 2025-01-06

---

## 🎯 Objetivo

Conectar o backend Spring Boot ao frontend Next.js usando:
- ✅ **Banco de dados**: Supabase (PostgreSQL gratuito)
- ✅ **Hospedagem**: Render ou Railway (gratuito); ou **EC2 + CloudFront** (ver [docs/EC2_CLOUDFRONT_HTTPS.md](EC2_CLOUDFRONT_HTTPS.md))
- ✅ **Zero custo**: Tudo gratuito para começar (ou créditos AWS para EC2)

---

## 📋 Passo a Passo Completo

### **FASE 1: Configurar Banco de Dados Gratuito (Supabase)**

#### Passo 1.1: Criar conta no Supabase
1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub (mais fácil)
4. Crie um novo projeto:
   - **Nome**: `orbitamos`
   - **Database Password**: Anote essa senha! (você vai precisar)
   - **Region**: Escolha mais próxima (South America se tiver)

#### Passo 1.2: Obter credenciais
1. No dashboard do Supabase, vá em **Settings** → **Database**
2. Anote as informações:
   - **Host**: `db.xxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (a que você criou)

#### Passo 1.3: Testar conexão
- Use DBeaver ou pgAdmin para testar conexão
- Se conectar, está funcionando! ✅

---

### **FASE 2: Implementar Backend (Localmente Primeiro)**

#### Passo 2.1: Criar Entidade Contact

**Arquivo**: `apps/api/src/main/java/com/orbitamos/api/entity/Contact.java`

```java
package com.orbitamos.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts")
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, length = 255)
    private String email;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "read", nullable = false)
    private Boolean read = false;
    
    // Construtores, getters e setters...
    public Contact() {}
    
    public Contact(String name, String email, String message) {
        this.name = name;
        this.email = email;
        this.message = message;
        this.createdAt = LocalDateTime.now();
        this.read = false;
    }
    
    // Getters e Setters (gerar automaticamente ou escrever)
    // ... (getters e setters para todos os campos)
}
```

#### Passo 2.2: Criar Repository

**Arquivo**: `apps/api/src/main/java/com/orbitamos/api/repository/ContactRepository.java`

```java
package com.orbitamos.api.repository;

import com.orbitamos.api.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    Optional<Contact> findByEmail(String email);
    List<Contact> findByReadFalse();
    List<Contact> findByNameContainingIgnoreCase(String name);
}
```

#### Passo 2.3: Criar Service

**Arquivo**: `apps/api/src/main/java/com/orbitamos/api/service/ContactService.java`

```java
package com.orbitamos.api.service;

import com.orbitamos.api.entity.Contact;
import com.orbitamos.api.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ContactService {
    
    @Autowired
    private ContactRepository contactRepository;
    
    public Contact save(Contact contact) {
        if (contact.getCreatedAt() == null) {
            contact.setCreatedAt(LocalDateTime.now());
        }
        if (contact.getRead() == null) {
            contact.setRead(false);
        }
        return contactRepository.save(contact);
    }
    
    public List<Contact> findAll() {
        return contactRepository.findAll();
    }
    
    public Optional<Contact> findById(Long id) {
        return contactRepository.findById(id);
    }
    
    public List<Contact> findUnread() {
        return contactRepository.findByReadFalse();
    }
    
    public Optional<Contact> markAsRead(Long id) {
        Optional<Contact> contactOpt = contactRepository.findById(id);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            contact.setRead(true);
            return Optional.of(contactRepository.save(contact));
        }
        return Optional.empty();
    }
    
    public void delete(Long id) {
        contactRepository.deleteById(id);
    }
}
```

#### Passo 2.4: Atualizar Controller

**Arquivo**: `apps/api/src/main/java/com/orbitamos/api/controller/ContactController.java`

```java
package com.orbitamos.api.controller;

import com.orbitamos.api.entity.Contact;
import com.orbitamos.api.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Permitir CORS de qualquer origem (ajustar depois)
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
}
```

#### Passo 2.5: Atualizar application.yml

**Arquivo**: `apps/api/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
    username: postgres
    password: SUA_SENHA_AQUI
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update  # Cria tabelas automaticamente
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  web:
    cors:
      allowed-origins: "https://seu-site.vercel.app,http://localhost:3000"
      allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true
```

---

### **FASE 3: Testar Localmente**

#### Passo 3.1: Rodar o backend
```bash
cd apps/api
mvn spring-boot:run
```

#### Passo 3.2: Testar endpoints
- Abra: http://localhost:8080/api/health
- Deve retornar: `{"status":"UP",...}`

#### Passo 3.3: Testar salvamento
```bash
# Enviar contato
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@email.com","message":"Teste"}'
```

#### Passo 3.4: Verificar no Supabase
- Acesse o Supabase → Table Editor
- Deve aparecer a tabela `contacts` com os dados

---

### **FASE 4: Conectar Frontend ao Backend**

#### Passo 4.1: Criar arquivo de configuração

**Arquivo**: `apps/web/src/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function sendContact(data: {
  name: string;
  email: string;
  message: string;
}) {
  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Erro ao enviar mensagem');
  }
  
  return response.json();
}
```

#### Passo 4.2: Atualizar página de contato

**Arquivo**: `apps/web/src/app/contato/page.tsx`

Substituir a função `handleSubmit`:

```typescript
import { sendContact } from '@/lib/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");
  setIsSuccess(false);
  
  try {
    // Enviar para backend
    await sendContact({
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });
    
    // Opcional: também enviar por EmailJS (para notificação)
    // await emailjs.send(...);
    
    setIsSuccess(true);
    setFormData({ name: "", email: "", message: "" });
    
    setTimeout(() => {
      setIsSuccess(false);
    }, 5000);
    
  } catch (err) {
    console.error('Erro ao enviar:', err);
    setError('Erro ao enviar mensagem. Tente novamente.');
  } finally {
    setIsLoading(false);
  }
};
```

#### Passo 4.3: Configurar variável de ambiente

**Arquivo**: `apps/web/.env.local` (criar se não existir)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**No Vercel**: Adicionar a mesma variável nas configurações do projeto.

---

### **FASE 5: Hospedar Backend Gratuitamente**

#### Opção A: Render.com (Recomendado)

##### Passo 5.1: Preparar projeto
1. Criar arquivo `apps/api/render.yaml` (opcional, facilita)
2. Garantir que `pom.xml` está configurado corretamente

##### Passo 5.2: Criar conta no Render
1. Acesse: https://render.com
2. Faça login com GitHub
3. Clique em "New" → "Web Service"

##### Passo 5.3: Conectar repositório
1. Conecte seu repositório GitHub
2. Selecione o branch `main`
3. Configure:
   - **Name**: `orbitamos-api`
   - **Root Directory**: `apps/api`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/api-0.0.1-SNAPSHOT.jar`

##### Passo 5.4: Configurar variáveis de ambiente
No Render, vá em **Environment** e adicione:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://db.xxxxx.supabase.co:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=sua_senha_supabase
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_WEB_CORS_ALLOWED_ORIGINS=https://seu-site.vercel.app
```

##### Passo 5.5: Deploy
1. Clique em "Create Web Service"
2. Aguarde o build (pode demorar 5-10 minutos)
3. Quando terminar, você terá uma URL: `https://orbitamos-api.onrender.com`

---

#### Opção B: Railway.app (Alternativa)

##### Passo 5.1: Criar conta
1. Acesse: https://railway.app
2. Faça login com GitHub

##### Passo 5.2: Criar projeto
1. "New Project" → "Deploy from GitHub repo"
2. Selecione seu repositório
3. Adicione um serviço → "GitHub Repo"

##### Passo 5.3: Configurar
- **Root Directory**: `apps/api`
- **Build Command**: `mvn clean package -DskipTests`
- **Start Command**: `java -jar target/api-0.0.1-SNAPSHOT.jar`

##### Passo 5.4: Variáveis de ambiente
Mesmas do Render, configure no Railway.

---

### **FASE 6: Atualizar Frontend para Produção**

#### Passo 6.1: Atualizar variável de ambiente no Vercel
1. Vá no dashboard do Vercel
2. Settings → Environment Variables
3. Adicione/Atualize:
   ```
   NEXT_PUBLIC_API_URL=https://orbitamos-api.onrender.com/api
   ```
4. Faça redeploy

#### Passo 6.2: Testar em produção
1. Acesse seu site no Vercel
2. Vá na página de contato
3. Envie uma mensagem
4. Verifique no Supabase se salvou

---

## 📊 Resumo das URLs

| Serviço | URL | Uso |
|---------|-----|-----|
| **Supabase** | `db.xxxxx.supabase.co` | Banco de dados |
| **Render/Railway** | `https://orbitamos-api.onrender.com` | Backend API |
| **Vercel** | `https://seu-site.vercel.app` | Frontend |
| **Swagger** | `https://orbitamos-api.onrender.com/swagger-ui.html` | Documentação API |

---

## ⚠️ Limites dos Planos Gratuitos

### Supabase
- ✅ 500 MB de banco
- ✅ Sem limite de tempo
- ✅ 2 GB de transferência/mês
- ⚠️ Após 500 MB, precisa pagar

### Render
- ✅ 750 horas/mês (≈ 31 dias)
- ⚠️ Após 15 min sem uso, "dorme"
- ⚠️ Primeira requisição após dormir demora ~30-60s
- ✅ PostgreSQL: 90 dias grátis

### Railway
- ✅ $5 grátis/mês
- ✅ PostgreSQL incluso
- ⚠️ Após $5, precisa pagar

---

## 🎯 Checklist de Implementação

### Backend
- [ ] Criar conta no Supabase
- [ ] Obter credenciais do banco
- [ ] Criar entidade `Contact`
- [ ] Criar `ContactRepository`
- [ ] Criar `ContactService`
- [ ] Atualizar `ContactController`
- [ ] Atualizar `application.yml` com credenciais Supabase
- [ ] Testar localmente
- [ ] Verificar se tabela foi criada no Supabase

### Frontend
- [ ] Criar `lib/api.ts` com função `sendContact`
- [ ] Atualizar página de contato para usar backend
- [ ] Configurar `NEXT_PUBLIC_API_URL` no `.env.local`
- [ ] Testar localmente

### Deploy
- [ ] Criar conta no Render/Railway
- [ ] Conectar repositório GitHub
- [ ] Configurar build e start commands
- [ ] Adicionar variáveis de ambiente
- [ ] Fazer deploy
- [ ] Obter URL do backend
- [ ] Atualizar `NEXT_PUBLIC_API_URL` no Vercel
- [ ] Testar em produção

---

## 🚨 Troubleshooting

### Erro: "Connection refused"
- Verifique se o backend está rodando
- Verifique a URL no frontend

### Erro: "CORS policy"
- Adicione a URL do Vercel no `allowed-origins` do backend
- Verifique se `@CrossOrigin` está no controller

### Erro: "Table doesn't exist"
- Verifique se `ddl-auto: update` está configurado
- Reinicie o backend para criar tabelas

### Tabela `conversations` (avatar e criador do grupo)
- Com `ddl-auto: update`, o Hibernate cria/atualiza as colunas `avatar_url` e `created_by_user_id` ao subir a API.
- Em produção, se usar `ddl-auto: validate`, aplique a migração manual: `docs/migrations/003_conversations_avatar_and_creator.sql` (Supabase SQL Editor).

### Backend "dormindo" no Render
- Primeira requisição após 15 min demora mais
- Considere usar Railway se isso for problema

---

## 📝 Próximos Passos (Após MVP Funcional)

1. Implementar autenticação (JWT)
2. Criar dashboard admin para ver contatos
3. Adicionar mais endpoints (usuários, mentorias)
4. Implementar validações mais robustas
5. Adicionar logging e monitoramento

---

**Última atualização**: 2025-01-06  
**Status**: Pronto para implementar

