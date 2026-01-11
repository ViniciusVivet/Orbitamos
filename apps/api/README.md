# 🚀 Orbitamos API - Backend

API REST da **Orbitamos** construída com Spring Boot 3 e Java 21.

## 🎯 **Visão Geral**

A API da Orbitamos é responsável por gerenciar:
- ✅ Health checks da aplicação
- ✅ Dados dos programas de mentoria
- ✅ Formulários de contato
- ✅ Autenticação e autorização com JWT
- ✅ Gestão de usuários (cadastro e login)
- ✅ Área do aluno (dashboard protegido)

## 🛠️ **Stack Tecnológica**

- **Java 21** - Linguagem de programação
- **Spring Boot 3.3.0** - Framework principal
- **Spring Data JPA** - Persistência de dados
- **Spring Security** - Segurança (configurado)
- **PostgreSQL 15** - Banco de dados
- **Maven** - Gerenciador de dependências
- **Docker** - Containerização

## 🚀 **Como Executar**

### **Pré-requisitos**
- Java 21+
- Maven 3.6+
- PostgreSQL 15+ (ou Docker)

### **Opção 1: Docker (Recomendado)**
```bash
# Na raiz do projeto
docker-compose up -d postgres
docker-compose up api
```

### **Opção 2: Desenvolvimento Local**
```bash
# 1. Instalar dependências
mvn clean install

# 2. Configurar banco de dados
# Criar database 'orbitamos' no PostgreSQL

# 3. Executar aplicação
mvn spring-boot:run
```

### **Opção 3: JAR Executável**
```bash
# Build
mvn clean package

# Executar
java -jar target/api-0.0.1-SNAPSHOT.jar
```

## 📡 **Endpoints Disponíveis**

### **Health Check**
```http
GET /api/health
```
**Resposta:**
```json
{
  "status": "UP",
  "timestamp": "2025-01-06T22:30:00",
  "message": "Orbitamos API está funcionando! 🚀",
  "version": "1.0.0"
}
```

### **Mentorias**
```http
GET /api/mentorships
```
**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Mentoria Tech 9 Meses",
    "description": "Do zero ao primeiro trampo em T.I. em 9 meses",
    "duration": "9 meses",
    "level": "Iniciante",
    "price": "Gratuito",
    "spots": 50
  }
]
```

### **Contato**
```http
POST /api/contact
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "message": "Quero participar do programa!"
}
```

### **Autenticação**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta (ambos endpoints):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "joao@email.com",
  "name": "João Silva",
  "id": 1,
  "message": "Login realizado com sucesso!"
}
```

### **Dashboard (Protegido - requer JWT)**
```http
GET /api/dashboard/me
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "createdAt": "2025-01-11T00:00:00"
  }
}
```

## 🗄️ **Banco de Dados**

### **Configuração**
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/orbitamos
    username: orbitamos
    password: orbitamos123
    driver-class-name: org.postgresql.Driver
```

### **Conexão via Docker**
```bash
# Criar container PostgreSQL
docker run --name orbitamos-postgres \
  -e POSTGRES_DB=orbitamos \
  -e POSTGRES_USER=orbitamos \
  -e POSTGRES_PASSWORD=orbitamos123 \
  -p 5432:5432 \
  -d postgres:15-alpine
```

## 🔧 **Configuração de Desenvolvimento**

### **Variáveis de Ambiente**
```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/orbitamos
SPRING_DATASOURCE_USERNAME=orbitamos
SPRING_DATASOURCE_PASSWORD=orbitamos123

# Server
SERVER_PORT=8080

# Logging
LOGGING_LEVEL_COM_ORBITAMOS_API=DEBUG
```

### **Perfis de Ambiente**
```bash
# Desenvolvimento
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Produção
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## 🧪 **Testes**

### **Executar Testes**
```bash
# Todos os testes
mvn test

# Testes com cobertura
mvn jacoco:report

# Testes específicos
mvn test -Dtest=HealthControllerTest
```

### **Estrutura de Testes**
```
src/test/java/
├── com/orbitamos/api/
│   ├── controller/
│   │   ├── HealthControllerTest.java
│   │   ├── MentorshipControllerTest.java
│   │   └── ContactControllerTest.java
│   └── integration/
│       └── ApiIntegrationTest.java
```

## 📊 **Monitoramento**

### **Health Checks**
- **Endpoint**: `/actuator/health`
- **Métricas**: `/actuator/metrics`
- **Info**: `/actuator/info`

### **Swagger/OpenAPI**
- **Documentação**: `http://localhost:8080/swagger-ui.html`
- **API Docs**: `http://localhost:8080/api-docs`

## 🚀 **Deploy**

### **Docker**
```bash
# Build da imagem
docker build -t orbitamos-api .

# Executar container
docker run -p 8080:8080 orbitamos-api
```

### **Produção**
```bash
# Build para produção
mvn clean package -Pprod

# Executar JAR
java -jar target/api-0.0.1-SNAPSHOT.jar
```

## 🔒 **Segurança**

### **Configuração Atual**
- ✅ CORS configurado para frontend
- ✅ Validação de entrada
- ⏳ JWT Authentication (futuro)
- ⏳ Rate Limiting (futuro)

### **Headers de Segurança**
```yaml
# application.yml
server:
  servlet:
    session:
      cookie:
        secure: true
        http-only: true
```

## 📈 **Performance**

### **Otimizações**
- ✅ Connection pooling (HikariCP)
- ✅ Compressão GZIP
- ✅ Cache de dependências Maven
- ⏳ Redis Cache (futuro)

### **Métricas**
- Response time < 200ms
- Throughput > 1000 req/s
- Memory usage < 512MB

## 🐛 **Troubleshooting**

### **Problemas Comuns**

#### **Erro de Conexão com Banco**
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Verificar logs
docker logs orbitamos-postgres
```

#### **Porta 8080 em Uso**
```bash
# Verificar processo na porta
netstat -ano | findstr :8080

# Matar processo
taskkill /PID <PID> /F
```

#### **Dependências Maven**
```bash
# Limpar cache
mvn clean

# Reinstalar dependências
mvn dependency:purge-local-repository
```

## 📚 **Documentação Adicional**

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Maven Docs](https://maven.apache.org/guides/)

## 🤝 **Contribuindo**

Veja o [CONTRIBUTING.md](../../CONTRIBUTING.md) para mais detalhes sobre como contribuir com o projeto.

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../../LICENSE) para mais detalhes.

---

<div align="center">

### **"Da quebrada pra tecnologia — A gente sobe junto."** 🚀

**Feito com ❤️ pela comunidade Orbitamos**

</div>
