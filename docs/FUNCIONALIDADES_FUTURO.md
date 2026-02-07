# 🗺️ Funcionalidades Futuro – Orbitamos

> **Passo a passo do futuro do projeto**  
> Última atualização: 2025-02-04

---

## 📋 Índice

1. [Visão e rumo do projeto](#visão-e-rumo-do-projeto)
2. [Curto prazo – Completar o que já existe](#curto-prazo--completar-o-que-já-existe)
3. [Médio prazo – OrbitAcademy + comunidade](#médio-prazo--orbitacademy--comunidade)
4. [Médio/longo prazo – Emprego e engajamento](#médiolongo-prazo--emprego-e-engajamento)
5. [Ideias de alto impacto](#ideias-de-alto-impacto)
6. [Prioridades e ordem sugerida](#prioridades-e-ordem-sugerida)
7. [Checklist de implementação](#checklist-de-implementação)

---

## Visão e rumo do projeto

A **Orbitamos** é um movimento de educação em tecnologia focado na periferia, com objetivo de levar pessoas do subemprego ao primeiro emprego em T.I. em até 9 meses.

**Rumo atual do produto:**
- Autenticação (login/cadastro, JWT)
- Chat (conversas diretas e grupos, avatar, upload de foto)
- Dashboard (perfil, progresso, checklist, conquistas)
- Forum, Vagas (Jobs), Projetos, Mentorias
- Áreas **estudante** e **colaborador**

Todas as funcionalidades abaixo estão alinhadas a: **educação**, **comunidade** e **primeiro emprego em TI**.

---

## Curto prazo – Completar o que já existe

| # | Funcionalidade | Descrição | Passos sugeridos |
|---|----------------|-----------|------------------|
| 1 | **Contato no banco + lista admin** | Formulário de contato salva no PostgreSQL; colaborador/admin vê lista e marca como lido. | ✅ Backend já salva e expõe GET /contacts, PUT /contacts/:id/read. Implementar: página **Contatos** na área colaborador (listar, marcar lido). |
| 2 | **Filtros na lista de vagas** | Filtrar vagas por tipo (freela, CLT, estágio) e, no futuro, por área/remoto. | Backend: GET /api/jobs?type=freela (opcional). Frontend: dropdown de tipo na página de vagas. |
| 3 | **Indicador de "online" no chat** | Mostrar quem está online na lista de conversas. | Backend: heartbeat ou WebSocket de presença (last_seen_at / online). Frontend: ícone ou badge "online" ao lado do nome. |
| 4 | **Busca no chat** | Buscar mensagens dentro de uma conversa. | Backend: GET /api/chat/conversations/:id/messages?search=termo. Frontend: campo de busca no topo da conversa. |
| 5 | **Notificações in-app** | Avisar mensagens não lidas, respostas no fórum, novas vagas. | Backend: entidade Notification, endpoints list/mark-read. Frontend: sino no header com dropdown e contador. |

---

## Médio prazo – OrbitAcademy + comunidade

| # | Funcionalidade | Descrição | Passos sugeridos |
|---|----------------|-----------|------------------|
| 6 | **OrbitAcademy com backend real** | Cursos e lições no banco; progresso por usuário; "Continuar de onde parou". | Entidades Course, Lesson; UserProgress por aula; endpoints cursos/lições/progresso; frontend OrbitAcademy consumindo API. |
| 7 | **Fórum por curso/turma** | Cada curso ou turma com seu fórum; discussões contextualizadas. | Associar Forum/Conversation a course_id ou cohort_id; filtros na listagem do fórum. |
| 8 | **Sistema de indicação** | Aluno indica amigo → ganha benefício (prioridade, badge). | Entidade Referral ou campo referral_code em User; fluxo de cadastro com código; regras de benefício. |
| 9 | **Depoimentos em vídeo** | Página ou seção com vídeos curtos de ex-alunos. | Página /depoimentos ou seção na home; dados no CMS ou banco (título, URL do vídeo, thumbnail). |
| 10 | **Blog funcional (CMS simples)** | Conteúdo para SEO, "Diário da Órbita", dicas de carreira. | Entidade BlogPost; endpoints list/post; página de post individual; opcional: editor Markdown ou WYSIWYG. |

---

## Médio/longo prazo – Emprego e engajamento

| # | Funcionalidade | Descrição | Passos sugeridos |
|---|----------------|-----------|------------------|
| 11 | **Candidatura a vagas** | Botão "Me candidatar" na vaga; colaborador vê candidatos. | Entidade JobApplication (job_id, user_id, status, created_at); endpoints aplicar/listar candidatos; tela de candidatos por vaga. |
| 12 | **Portfólio automático do aluno** | Página pública com cursos concluídos, projetos, conquistas. | Rota pública /perfil/:id ou /portfolio/:id; endpoint GET /api/users/:id/public; página com badges, cursos, projetos. |
| 13 | **Gamificação consistente** | XP por aula concluída, missões semanais, rankings por turma. | Usar UserProgress e UserAchievement; regras de XP; endpoints de ranking; UI de níveis e missões. |
| 14 | **Mentoria peer-to-peer** | Alunos avançados mentoreiam iniciantes. | Entidade MentorshipMatch ou similar; fluxo de solicitação/aceite; chat ou canal dedicado. |
| 15 | **Certificados** | Emissão de certificado ao concluir curso. | Geração de PDF ou página pública com assinatura; endpoint GET /api/certificates/:id; link no perfil do aluno. |

---

## Ideias de alto impacto

| # | Funcionalidade | Descrição |
|---|----------------|-----------|
| 16 | **Integração WhatsApp** | Notificação de nova vaga, lembrete de aula, aviso de mensagem. |
| 17 | **Calculadora de salário** | "Quanto você pode ganhar em TI?" comparado ao salário atual. |
| 18 | **Simulador de entrevista (IA)** | Perguntas técnicas + feedback; preparação para o primeiro emprego. |
| 19 | **Marketplace de vagas** | Empresas parceiras publicam vagas; matching por perfil do aluno. |

---

## Prioridades e ordem sugerida

1. **Contato no banco + lista (admin/colaborador)** – rápido, fecha o ciclo do formulário.
2. **Filtros na lista de vagas** – rápido, melhora uso das vagas.
3. **OrbitAcademy com dados reais** – core do produto.
4. **Notificações in-app** e **indicador online no chat** – retenção e sensação de comunidade.
5. **Candidatura a vagas** + tela de candidatos – liga formação ao emprego.
6. **Gamificação** (XP, missões, rankings) usando entidades existentes.
7. **Indicação** e **depoimentos em vídeo** – crescimento e prova social.

---

## Checklist de implementação

### Primeira leva (simples) – concluída

- [x] Documento de funcionalidades futuro (este arquivo)
- [x] **Contatos**: página na área colaborador para listar mensagens de contato e marcar como lido
- [x] **Vagas**: filtro por tipo (freela, CLT, estágio, PJ) no backend e no frontend

### Próximas levas

- [ ] Busca no chat
- [ ] Indicador online no chat
- [ ] Notificações in-app
- [ ] OrbitAcademy com backend real
- [ ] Candidatura a vagas
- [ ] Demais itens conforme prioridade acima

---

**Princípio:** Priorizar o que traz mais valor para os alunos com menor esforço.  
**Foco:** Transformar vidas através da tecnologia.

---

*Atualize este documento conforme as funcionalidades forem implementadas.*
