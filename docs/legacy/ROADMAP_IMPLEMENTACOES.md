# 🚀 Roadmap de Implementações - Orbitamos

> **Documento estratégico para guiar o desenvolvimento futuro do projeto**  
> Última atualização: 2025-01-06

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Por que Pessoas Usariam o Site](#por-que-pessoas-usariam-o-site)
3. [Estado Atual do Projeto](#estado-atual-do-projeto)
4. [Roadmap de Implementações](#roadmap-de-implementações)
5. [Features Sugeridas](#features-sugeridas)
6. [Detalhes Técnicos](#detalhes-técnicos)
7. [Prioridades e Impacto](#prioridades-e-impacto)

---

## 🎯 Visão Geral

A **Orbitamos** é um movimento de educação em tecnologia focado na periferia, com o objetivo de levar pessoas do subemprego ao primeiro emprego em T.I. em até 9 meses.

### Missão
Transformar vidas através da tecnologia, criando um caminho claro e acessível para pessoas da classe C e D entrarem no mercado de tecnologia.

### Valores
- **Autenticidade**: Criada na quebrada, para a quebrada
- **Esperança**: Acreditamos no potencial de cada pessoa
- **Comunidade**: A gente sobe junto, sempre
- **Impacto**: Transformamos vidas reais

---

## 👥 Por que Pessoas Usariam o Site

### 1. **Busca de Oportunidade**
- Pessoas em subemprego buscando mudança de vida
- Querem aprender tecnologia mas não sabem por onde começar
- Precisam de um caminho claro e estruturado (9 meses)

### 2. **Comunidade e Apoio**
- Sentimento de pertencimento ("gente como eu")
- Aprender com quem já passou pela mesma situação
- Networking com pessoas da periferia

### 3. **Credibilidade e Confiança**
- Ver casos de sucesso reais (depoimentos)
- Transparência total (gratuito, sem pegadinhas)
- Metodologia clara e comprovada

### 4. **Acesso Facilitado**
- Sem processo seletivo complexo
- Totalmente gratuito
- Online (acessível de qualquer lugar)

---

## 📊 Estado Atual do Projeto

### ✅ O que está funcionando

#### Frontend
- ✅ Site completo e responsivo (Next.js 14)
- ✅ 6 páginas visuais (Home, Sobre, Mentorias, Contato, OrbitAcademy, Entrar)
- ✅ Design moderno com tema espacial
- ✅ Componentes interativos (Globo 3D, animações)
- ✅ Formulário de contato (EmailJS funcionando)
- ✅ Deploy na Vercel

#### Backend
- ✅ API Spring Boot configurada
- ✅ 3 endpoints básicos (health, mentorships, contact)
- ✅ PostgreSQL configurado (Docker)
- ✅ Spring Security configurado (mas não implementado)

### ❌ O que NÃO está funcionando

#### Crítico (bloqueia uso real)
- ❌ **Página "Entrar"**: Formulário existe mas não faz login real
- ❌ **Autenticação**: Não há sistema de login/cadastro funcional
- ❌ **Área do Aluno**: Não existe
- ❌ **OrbitAcademy**: Página existe mas precisa de mais conteúdo/funcionalidades
- ❌ **Blog**: Não tem conteúdo
- ❌ **Contato**: EmailJS envia mas não salva no banco
- ❌ **Backend**: Não está hospedado, só funciona localmente

#### Importante (limita funcionalidade)
- ⚠️ **Mentorias**: Dados hardcoded, não vem do banco
- ⚠️ **Gamificação**: Componentes visuais existem mas não funcionam
- ⚠️ **Dashboard**: Não existe para ver mensagens/usuários

---

## 🗺️ Roadmap de Implementações

### 🚨 CURTO PRAZO (1-2 semanas) - Tornar USÁVEL

**Objetivo**: Fazer o site funcionar de verdade, não só visualmente.

#### Prioridade 1: Sistema de Contato Funcional
**Status**: ⚠️ Parcialmente implementado (EmailJS funciona, mas não salva)

**O que fazer**:
1. Criar entidade `Contact` no backend (Java)
2. Criar `ContactRepository` e `ContactService`
3. Atualizar `ContactController` para salvar no banco
4. Criar endpoint `GET /api/contacts` (protegido)
5. Criar dashboard simples (admin) para ver mensagens
6. Conectar frontend ao backend (substituir EmailJS ou usar ambos)

**Impacto**: Você consegue responder quem entra em contato e ter histórico.

**Complexidade**: ⭐⭐ (Média)

---

#### Prioridade 2: Sistema de Login/Cadastro Básico
**Status**: ❌ Não implementado (página existe mas não funciona)

**O que fazer**:
1. Criar entidade `User` no backend
2. Implementar autenticação JWT (Spring Security)
3. Criar endpoints:
   - `POST /api/auth/register` (cadastro)
   - `POST /api/auth/login` (login)
   - `GET /api/auth/me` (dados do usuário)
4. Criar contexto de autenticação no frontend (React Context)
5. Proteger rotas no frontend
6. Criar área do aluno básica (dashboard simples)

**Impacto**: Pessoas podem se cadastrar e ter acesso ao sistema.

**Complexidade**: ⭐⭐⭐ (Alta)

---

#### Prioridade 3: OrbitAcademy com Conteúdo Real
**Status**: ⚠️ Página existe mas precisa de mais funcionalidades

**O que fazer**:
1. Conectar dados reais ao backend (atualmente usa localStorage)
2. Criar entidade `Course` e `Lesson` no banco
3. Criar endpoints para cursos e lições
4. Sistema de progresso real (não só mockado)
5. Integrar com sistema de XP e gamificação
6. Adicionar mais cursos e conteúdo

**Impacto**: OrbitAcademy vira uma plataforma real de aprendizado.

**Complexidade**: ⭐⭐ (Média)

---

### 📈 MÉDIO PRAZO (1-2 meses) - Tornar ÚTIL

**Objetivo**: Adicionar funcionalidades que fazem diferença na vida dos alunos.

#### Prioridade 4: Sistema de Mentoria Real
**Status**: ⚠️ Dados hardcoded

**O que fazer**:
1. Criar entidade `Mentorship` no banco
2. Criar entidade `Mentor` e `Student`
3. Sistema de inscrição em programas
4. Atribuição de mentor a aluno
5. Acompanhamento de progresso
6. Sistema de missões/tarefas
7. Notificações de progresso

**Impacto**: Mentoria vira realidade, não só promessa.

**Complexidade**: ⭐⭐⭐⭐ (Muito Alta)

---

#### Prioridade 5: Blog Funcional
**Status**: ❌ Não existe

**O que fazer**:
1. Criar entidade `BlogPost`
2. CMS simples (Markdown ou editor WYSIWYG)
3. Sistema de categorias e tags
4. Busca de posts
5. Página de post individual
6. SEO otimizado

**Impacto**: Gera tráfego orgânico e autoridade.

**Complexidade**: ⭐⭐ (Média)

---

#### Prioridade 6: Dashboard do Aluno Completo
**Status**: ❌ Não existe

**O que fazer**:
1. Página de dashboard com:
   - Progresso visual (gráficos)
   - Certificados conquistados
   - Histórico de atividades
   - Próximas missões
   - Perfil público
2. Sistema de XP e níveis
3. Badges e conquistas

**Impacto**: Engajamento e motivação dos alunos.

**Complexidade**: ⭐⭐⭐ (Alta)

---

### 🌟 LONGO PRAZO (3-6 meses) - Tornar ESSENCIAL

**Objetivo**: Transformar em plataforma completa de educação.

#### Prioridade 7: Plataforma de Aprendizado
**O que fazer**:
- Cursos online estruturados
- Vídeos, exercícios, projetos
- Correção automática de código
- Certificados digitais
- Progresso detalhado

**Impacto**: Vira uma escola real, não só mentoria.

**Complexidade**: ⭐⭐⭐⭐⭐ (Muito Alta)

---

#### Prioridade 8: Marketplace de Oportunidades
**O que fazer**:
- Vagas de emprego
- Freelas
- Projetos reais
- Conexão com empresas parceiras
- Sistema de matching

**Impacto**: Gera emprego real, não só promessa.

**Complexidade**: ⭐⭐⭐⭐ (Muito Alta)

---

#### Prioridade 9: Gamificação Completa
**O que fazer**:
- XP, níveis, badges
- Rankings
- Missões semanais
- Recompensas
- Sistema de pontos

**Impacto**: Aumenta retenção e engajamento.

**Complexidade**: ⭐⭐⭐ (Alta)

---

## 💡 Features Sugeridas (Não Óbvias)

### 1. Sistema de Indicação
**O que é**: Aluno indica amigo → ganha benefício (acesso premium, prioridade, etc.)

**Por que**: Viraliza na periferia, criação de rede orgânica.

**Complexidade**: ⭐⭐ (Média)

---

### 2. Depoimentos em Vídeo
**O que é**: Vídeos curtos de alunos reais contando suas histórias.

**Por que**: Mais credibilidade que texto, compartilhável nas redes.

**Complexidade**: ⭐ (Baixa - só precisa gravar e hospedar)

---

### 3. Calculadora de Salário
**O que é**: "Quanto você vai ganhar em T.I.?" - compara com salário atual.

**Por que**: Mostra ROI do curso, motivação visual.

**Complexidade**: ⭐ (Baixa)

---

### 4. Simulador de Entrevista
**O que é**: IA faz perguntas técnicas, dá feedback automático.

**Por que**: Prepara para entrevistas reais, diferencial.

**Complexidade**: ⭐⭐⭐ (Alta - precisa IA)

---

### 5. Portfólio Automático
**O que é**: Gera portfólio do aluno automaticamente com projetos.

**Por que**: Aluno tem link público para compartilhar, facilita contratação.

**Complexidade**: ⭐⭐ (Média)

---

### 6. Sistema de Doação
**O que é**: Empresas/pessoas doam, transparência total.

**Por que**: Sustenta o projeto, mostra impacto.

**Complexidade**: ⭐⭐ (Média - precisa integração pagamento)

---

### 7. Mapa de Calor de Alunos
**O que é**: Mostra onde estão os alunos no globo 3D.

**Por que**: Cria senso de comunidade global, visual impactante.

**Complexidade**: ⭐⭐ (Média)

---

### 8. Chatbot de Suporte
**O que é**: Responde dúvidas comuns 24/7.

**Por que**: Reduz carga de trabalho, melhora experiência.

**Complexidade**: ⭐⭐⭐ (Alta - precisa IA)

---

### 9. Integração com WhatsApp
**O que é**: Notificações e suporte via WhatsApp.

**Por que**: Acessível para periferia, familiar.

**Complexidade**: ⭐⭐ (Média - precisa API WhatsApp)

---

### 10. Mentoria Peer-to-Peer
**O que é**: Alunos avançados mentoreiam iniciantes.

**Por que**: Escala sem custo, cria ciclo de ajuda.

**Complexidade**: ⭐⭐⭐ (Alta)

---

## 🔧 Detalhes Técnicos

### Estrutura de Banco de Dados Sugerida

```sql
-- Usuários
users (id, name, email, password_hash, role, created_at, ...)

-- Contatos
contacts (id, name, email, message, read, created_at, ...)

-- Mentorias
mentorships (id, name, description, duration, level, price, spots, ...)

-- Inscrições
enrollments (id, user_id, mentorship_id, status, enrolled_at, ...)

-- Cursos e Lições (OrbitAcademy)
courses (id, title, description, level, duration, created_at, ...)
lessons (id, course_id, title, content, order, xp_reward, ...)
user_course_progress (id, user_id, course_id, lesson_id, completed_at, xp_earned, ...)

-- Blog
blog_posts (id, title, content, author_id, category, published_at, ...)

-- Missões/Tarefas
missions (id, title, description, xp_reward, mentorship_id, ...)

-- Progresso
user_progress (id, user_id, mission_id, completed_at, xp_earned, ...)
```

### Endpoints Sugeridos

```
# Autenticação
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

# Contatos
POST   /api/contacts
GET    /api/contacts (admin)
GET    /api/contacts/:id
PUT    /api/contacts/:id/read

# Usuários
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/:id/public

# Mentorias
GET    /api/mentorships
GET    /api/mentorships/:id
POST   /api/mentorships/:id/enroll

# OrbitAcademy (Cursos)
GET    /api/courses
GET    /api/courses/:id
GET    /api/courses/:id/lessons
POST   /api/courses/:id/enroll
GET    /api/user/courses/progress
POST   /api/user/lessons/:id/complete

# Blog
GET    /api/blog/posts
GET    /api/blog/posts/:id
POST   /api/blog/posts (admin)
```

---

## 📊 Prioridades e Impacto

### Matriz de Priorização

| Feature | Impacto | Esforço | Prioridade |
|---------|---------|---------|------------|
| Contato no Banco | Alto | Baixo | 🔴 CRÍTICA |
| Login/Cadastro | Alto | Médio | 🔴 CRÍTICA |
| OrbitAcademy | Alto | Médio | 🟡 ALTA |
| Mentoria Real | Alto | Alto | 🟡 ALTA |
| Blog | Médio | Baixo | 🟢 MÉDIA |
| Dashboard Aluno | Alto | Alto | 🟡 ALTA |
| Gamificação | Médio | Alto | 🟢 MÉDIA |
| Marketplace | Alto | Muito Alto | 🟢 BAIXA |

### Ordem Recomendada de Implementação

1. **Sistema de Contato** (1 semana)
2. **Login/Cadastro Básico** (1-2 semanas)
3. **OrbitAcademy Funcional** (1-2 semanas)
4. **Blog** (1 semana)
5. **Dashboard Aluno** (2 semanas)
6. **Mentoria Real** (1 mês)
7. **Gamificação** (1 mês)
8. **Features Avançadas** (conforme necessidade)

---

## ⚠️ Cuidados ao Implementar

### NÃO quebrar o que já funciona
- ✅ Frontend está funcionando na Vercel
- ✅ EmailJS está enviando emails
- ✅ Design está bonito e responsivo
- ✅ Componentes visuais estão funcionando

### Ao adicionar novas features:
1. **Testar localmente primeiro** antes de fazer deploy
2. **Manter compatibilidade** com código existente
3. **Não remover** funcionalidades que já funcionam
4. **Documentar** mudanças importantes
5. **Fazer commits pequenos** e frequentes

### Padrões a seguir:
- **Backend**: Spring Boot 3, Java 21, PostgreSQL
- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Autenticação**: JWT tokens
- **API**: RESTful, JSON
- **Deploy**: Vercel (frontend), Render/Railway (backend)

---

## 📝 Notas Finais

Este documento deve ser atualizado conforme o projeto evolui. 

**Princípio**: Sempre priorizar o que traz mais valor para os alunos com menor esforço.

**Foco**: Transformar vidas através da tecnologia, não criar features complexas que ninguém usa.

---

**Última atualização**: 2025-01-06  
**Próxima revisão**: Após implementação das prioridades críticas

