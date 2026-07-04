# Orbitamos API legado

Ultima atualizacao: 2026-06-24

Este projeto Spring Boot foi a API principal da Orbitamos na fase v2.0.

Na fase atual, a producao usa:

- Frontend: `apps/web` na Vercel.
- Auth/banco/storage: Supabase.
- Backend Java: legado/fallback, sem obrigacao para a area logada funcionar.

Nao use este README como guia de deploy atual. Para a infraestrutura ativa, leia:

- `../../docs/ARCHITECTURE.md`
- `../../docs/INFRA_ATUAL.md`
- `../../docs/VARIAVEIS_AMBIENTE.md`

## Stack

- Java 21
- Spring Boot 3
- Spring Security/JWT
- Spring Data JPA
- PostgreSQL
- Maven

## Quando usar

Use este projeto apenas se:

- quiser estudar a implementacao antiga;
- precisar consultar regra de negocio legada;
- decidir reativar uma API propria no futuro.

Se a API propria voltar, crie um novo plano de deploy antes de publicar. Nao reutilize configuracoes antigas de EC2/Render sem revisar CORS, secrets, banco, storage e custos.

## Rodar localmente

```bash
cd apps/api
mvn spring-boot:run
```

Variaveis locais opcionais:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/orbitamos
SPRING_DATASOURCE_USERNAME=orbitamos
SPRING_DATASOURCE_PASSWORD=senha_local_de_desenvolvimento
JWT_SECRET=<defina_um_secret_local_de_32_chars>
```

Nao use senha real de Supabase, conta pessoal ou producao nesse projeto local.

## Testes

```bash
cd apps/api
mvn test
```

Esses testes protegem o legado Java. Para a versao atual, priorize tambem `npm run lint` e `npm run build` em `apps/web`.

## Endpoints historicos

Alguns endpoints implementados nesta API:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard/me`
- `POST /api/contact`
- rotas de chat, forum, projetos e perfil usadas na fase v2.0

Hoje, fluxos equivalentes devem preferir Supabase nativo no frontend.
