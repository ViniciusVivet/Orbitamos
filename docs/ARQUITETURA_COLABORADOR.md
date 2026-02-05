# Arquitetura: Área do Colaborador (Freelancer)

Visão da estrutura para o ambiente dedicado a colaboradores, de forma limpa e escalável.

---

## 1. Princípios

- **Área separada por rota**: tudo do colaborador fica em `/colaborador/*`, com layout próprio (sidebar, identidade visual).
- **Backend por recurso**: APIs por domínio (`/api/jobs`, `/api/projects`, `/api/dashboard/me`), não por “tipo de usuário”. Controle de acesso por **role** (FREELANCER) quando precisar.
- **Frontend por feature**: dentro de `app/colaborador/` e `components/colaborador/`, uma pasta/página por funcionalidade (vagas, conta, squad, etc.).
- **Escalável**: adicionar nova tela = nova pasta em `app/colaborador/` + item no sidebar; nova API = novo controller em `api/` + eventual novo recurso no Supabase.

---

## 2. Rotas (Frontend)

| Rota | Descrição | Status |
|------|-----------|--------|
| `/colaborador` | Início / resumo (vagas em destaque, projetos, atalhos) | ✅ |
| `/colaborador/vagas` | Lista de vagas (freela, trampos) | ✅ |
| `/colaborador/projetos` | Meus projetos conectados | ✅ (pode virar página dedicada) |
| `/colaborador/conta` | Configurações da conta (nome, foto, preferências) | ✅ |
| `/colaborador/squad` | Chat / contato com o squad | 🔜 placeholder |
| *(futuro)* `/colaborador/relatorios` | Relatórios, entregas | - |
| *(futuro)* `/colaborador/pagamentos` | Pagamentos, faturas | - |

Todas protegidas: só usuário logado com `role === FREELANCER`. Caso contrário, redirecionar para `/estudante` (estudante) ou `/dashboard` (fallback).

---

## 3. Layout da área Colaborador

- **Layout único** em `app/colaborador/layout.tsx`:
  - Verifica auth + role; se não for FREELANCER, redireciona para `/dashboard`.
  - Sidebar fixa com: Início, Vagas, Projetos, Squad, Configurações (conta).
  - Área principal: `{children}` (conteúdo de cada página).
- **Sidebar** em `components/colaborador/ColaboradorSidebar.tsx`: links ativos por pathname, avatar e nome do usuário, link “Sair”.

Assim, qualquer nova página em `/colaborador/xyz` herda o mesmo layout e sidebar; basta registrar o link no sidebar.

---

## 4. Backend (APIs)

Manter **recursos**, não “área colaborador”:

| Recurso | Endpoint | Quem acessa |
|---------|----------|-------------|
| Vagas | `GET /api/jobs` | Autenticado (hoje); no futuro pode restringir a FREELANCER |
| Projetos do usuário | `GET /api/projects` | Dono (userId do token) |
| Perfil | `GET/PUT /api/dashboard/me` | Dono |
| *(futuro)* Chat/Squad | `GET/POST /api/squad/messages` ou `/api/chat/*` | FREELANCER (ou squad por time) |

- Novas funcionalidades = novos controllers e entidades (ex.: `SquadMessage`, `Payment`), sem “colaborador” no path da API.
- Controle de acesso: no controller ou em um filtro, checar `user.getRole() == FREELANCER` quando a rota for exclusiva de colaborador.

---

## 5. Onde crescer no futuro

- **Chat/Squad**: entidade `SquadChannel` ou `SquadMessage`, repository, controller REST (ou WebSocket depois); página `/colaborador/squad` consome a API.
- **Relatórios**: `GET /api/reports/...` ou dados agregados em `/api/dashboard/summary` para colaborador; página `/colaborador/relatorios`.
- **Pagamentos**: entidades `Invoice`, `Payout`; APIs `GET/POST /api/invoices`, etc.; página `/colaborador/pagamentos`.
- **Configurações avançadas**: preferências (notificações, disponibilidade) em `User` ou tabela `user_settings`; `PUT /api/dashboard/me` ou `PUT /api/settings`; formulário em `/colaborador/conta`.

Crescimento: nova feature = nova rota em `app/colaborador/`, novo item no sidebar, e do lado do backend novos recursos/endpoints quando fizer sentido.

---

## 6. Resumo

- **Frontend**: área única `/colaborador` com layout (sidebar) e páginas por feature; redirect por role; nav do site aponta FREELANCER para `/colaborador`.
- **Backend**: APIs por recurso (jobs, projects, dashboard/me, futuramente squad, reports, payments); acesso por token e role quando necessário.
- **Escalabilidade**: adicionar tela = nova pasta em `app/colaborador/` + link no sidebar; adicionar recurso = novo controller/entidade e, se precisar, nova tabela no Supabase.
