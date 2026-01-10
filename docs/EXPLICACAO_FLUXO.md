# 📚 Explicação do Fluxo - Orbitamos

> **Guia didático para entender como funciona o projeto**

---

## 🎯 Os 3 Elementos Principais

### 1. **Banco de Dados (PostgreSQL no Supabase)**
**Onde está?** → Na nuvem (Supabase.com)

**O que faz?**
- Armazena dados permanentemente
- Exemplo: quando alguém preenche o formulário de contato, os dados são salvos aqui

**Como acessar?**
- Interface web: https://supabase.com/dashboard
- Você vê as tabelas, dados, etc.

**No seu código:**
- Configuração: `apps/api/src/main/resources/application.yml` (linhas 11-15)
- Credenciais: arquivo `.env` na raiz do projeto

---

### 2. **Backend (API Spring Boot)**
**Onde está?** → `apps/api/`

**O que faz?**
- Recebe requisições do frontend
- Processa os dados
- Salva no banco de dados
- Retorna respostas

**Analogia do Garçom:**
```
Cliente (Frontend) → "Quero um hambúrguer!" 
                    ↓
Garçom (Backend) → Vai na cozinha (Banco de Dados)
                    ↓
Cozinha (Banco) → Prepara o hambúrguer
                    ↓
Garçom (Backend) → Entrega para o cliente
                    ↓
Cliente (Frontend) → Recebe o hambúrguer
```

**Arquivos principais:**
- `apps/api/src/main/java/com/orbitamos/api/controller/ContactController.java` → Recebe requisições
- `apps/api/src/main/java/com/orbitamos/api/service/ContactService.java` → Lógica de negócio
- `apps/api/src/main/java/com/orbitamos/api/repository/ContactRepository.java` → Acessa banco
- `apps/api/src/main/java/com/orbitamos/api/entity/Contact.java` → Modelo de dados
- `apps/api/src/main/resources/application.yml` → Configurações

**Porta:** 8080 (quando rodando localmente)

---

### 3. **Frontend (Next.js)**
**Onde está?** → `apps/web/`

**O que faz?**
- Interface que o usuário vê
- Formulários, botões, páginas
- Envia dados para o backend

**Arquivos principais:**
- `apps/web/src/app/page.tsx` → Página inicial
- `apps/web/src/app/contato/page.tsx` → Página de contato (formulário)
- `apps/web/src/components/` → Componentes reutilizáveis
- `apps/web/src/app/layout.tsx` → Layout geral

**Porta:** 3000 (quando rodando localmente)

---

## 🔄 Fluxo Completo (Exemplo: Formulário de Contato)

### **Passo a Passo:**

```
1. USUÁRIO preenche formulário
   ↓
   Arquivo: apps/web/src/app/contato/page.tsx
   
2. FRONTEND envia dados para BACKEND
   ↓
   Requisição HTTP POST para: http://localhost:8080/api/contact
   (ou https://seu-backend.onrender.com/api/contact em produção)
   
3. BACKEND recebe no ContactController
   ↓
   Arquivo: apps/api/.../ContactController.java
   Método: @PostMapping("/contact")
   
4. BACKEND processa no ContactService
   ↓
   Arquivo: apps/api/.../ContactService.java
   Método: save(contact)
   
5. BACKEND salva no BANCO via Repository
   ↓
   Arquivo: apps/api/.../ContactRepository.java
   Método: save() → JPA salva automaticamente
   
6. BANCO DE DADOS armazena
   ↓
   Supabase PostgreSQL
   Tabela: contacts
   
7. BACKEND retorna resposta
   ↓
   JSON: {"success": true, "message": "..."}
   
8. FRONTEND mostra mensagem de sucesso
   ↓
   Arquivo: apps/web/src/app/contato/page.tsx
   Estado: setIsSuccess(true)
```

---

## 📁 Estrutura de Pastas

```
Orbitamos/
├── apps/
│   ├── api/                    ← BACKEND (Spring Boot)
│   │   └── src/main/java/com/orbitamos/api/
│   │       ├── controller/     ← Recebe requisições HTTP
│   │       ├── service/        ← Lógica de negócio
│   │       ├── repository/     ← Acessa banco de dados
│   │       ├── entity/        ← Modelos de dados
│   │       └── resources/
│   │           └── application.yml  ← Configurações (CORS, banco, etc)
│   │
│   └── web/                    ← FRONTEND (Next.js)
│       └── src/
│           ├── app/            ← Páginas
│           │   ├── page.tsx    ← Home
│           │   ├── contato/   ← Página de contato
│           │   └── ...
│           └── components/    ← Componentes reutilizáveis
│
└── .env                        ← Credenciais do banco (NÃO vai pro GitHub)
```

---

## 🔌 API (Application Programming Interface)

### **O que é?**
É a "ponte" entre frontend e backend. Define como eles se comunicam.

### **Como funciona no seu projeto?**

**1. Backend expõe endpoints (portas de entrada):**
```java
// ContactController.java
@PostMapping("/contact")  // ← Endpoint: /api/contact
public ResponseEntity<...> contact(...) {
    // Processa e salva
}
```

**2. Frontend faz requisições:**
```typescript
// Exemplo (ainda não implementado no seu código)
fetch('http://localhost:8080/api/contact', {
  method: 'POST',
  body: JSON.stringify({ name, email, message })
})
```

**3. Backend responde:**
```json
{
  "success": true,
  "message": "Mensagem recebida com sucesso!",
  "id": 123
}
```

---

## 🌐 CORS (Cross-Origin Resource Sharing)

### **O que é?**
Segurança do navegador que bloqueia requisições entre domínios diferentes.

### **Por que precisa?**
- Frontend: `https://orbitamos.vercel.app` (Vercel)
- Backend: `https://orbitamos-api.onrender.com` (Render)

São domínios diferentes, então precisa permitir.

### **Onde configurar?**
**Arquivo:** `apps/api/src/main/resources/application.yml`

```yaml
web:
  cors:
    allowed-origins:
    - http://localhost:3000              # Desenvolvimento local
    - https://orbitamos.vercel.app       # Produção (Vercel)
```

**Importante:** Depois de adicionar o CORS, você precisa:
1. Fazer rebuild do backend
2. Fazer novo deploy
3. Aí sim vai funcionar em produção

---

## 🚀 Deploy (Onde cada coisa roda)

### **Frontend (Vercel)**
- **URL:** `https://orbitamos.vercel.app`
- **Código:** `apps/web/`
- **Deploy automático:** Quando você faz push no GitHub

### **Backend (Render/Railway)**
- **URL:** `https://orbitamos-api.onrender.com` (exemplo)
- **Código:** `apps/api/`
- **Deploy:** Manual ou via GitHub

### **Banco de Dados (Supabase)**
- **URL:** `db.xxxxx.supabase.co`
- **Interface:** https://supabase.com/dashboard
- **Sempre online:** 24/7

---

## ⚠️ Estado Atual do Seu Projeto

### **O que está funcionando:**
✅ Frontend rodando no Vercel  
✅ Backend criado (mas não está conectado ao frontend ainda)  
✅ Banco de dados configurado no Supabase  
✅ CORS atualizado com URL do Vercel

### **O que falta:**
❌ Frontend ainda não envia dados para o backend  
❌ Frontend só usa EmailJS (envia email, mas não salva no banco)  
❌ Backend não está hospedado ainda (só local)

---

## 🔧 Próximos Passos

1. **Atualizar frontend para enviar ao backend:**
   - Modificar `apps/web/src/app/contato/page.tsx`
   - Adicionar chamada para API do backend

2. **Hospedar backend:**
   - Deploy no Render ou Railway
   - Configurar variáveis de ambiente

3. **Testar em produção:**
   - Verificar se dados aparecem no Supabase
   - Verificar se frontend consegue comunicar com backend

---

## 💡 Conceitos Importantes

### **HTTP Methods:**
- **GET:** Buscar dados (ex: listar contatos)
- **POST:** Criar dados (ex: salvar novo contato)
- **PUT:** Atualizar dados
- **DELETE:** Deletar dados

### **JSON:**
Formato de dados que frontend e backend usam para se comunicar:
```json
{
  "name": "João",
  "email": "joao@email.com",
  "message": "Olá!"
}
```

### **REST API:**
Padrão de como criar endpoints:
- `/api/contact` → POST (criar)
- `/api/contacts` → GET (listar)
- `/api/contacts/123` → GET (buscar um)
- `/api/contacts/123` → PUT (atualizar)
- `/api/contacts/123` → DELETE (deletar)

---

**Última atualização:** 2025-01-07

