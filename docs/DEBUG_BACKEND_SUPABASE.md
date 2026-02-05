# 🔧 Debug: Backend + Supabase pararam de funcionar

Checklist para quando o backend (Docker ou local) e/ou o Supabase deixam de funcionar após mudanças.

**Configurar Render + Supabase sem expor senhas:** veja [RENDER_SUPABASE_SETUP.md](RENDER_SUPABASE_SETUP.md).

---

## 1. Backend (API Spring Boot)

### 1.1 Variáveis de ambiente (`.env` na raiz)

O `docker-compose` usa `env_file: .env`. Sem esse arquivo ou com valores errados, a API quebra.

| Variável | Obrigatório? | O que verificar |
|----------|--------------|------------------|
| `SPRING_DATASOURCE_URL` | ✅ Sim | URL correta do banco (veja seção Supabase abaixo). |
| `SPRING_DATASOURCE_USERNAME` | ✅ Sim | Para Supabase costuma ser `postgres`. |
| `SPRING_DATASOURCE_PASSWORD` | ✅ Sim | Senha do banco (Supabase: Settings → Database). |
| `JWT_SECRET` | ⚠️ Produção | Pode ficar vazio em dev (há default). Em produção defina uma chave forte. |

- O `.env` deve estar na **raiz do projeto** (mesmo nível do `docker-compose.yml`).
- Nunca commitar `.env` (já está no `.gitignore`).

### 1.2 Banco: localhost vs Supabase vs Docker

- **URL com `localhost:5432`**: o processo da API precisa “enxergar” um PostgreSQL em `localhost:5432`.  
  - Se a API roda **dentro do Docker**, `localhost` é o próprio container → **não há Postgres lá**.  
  - Use **Supabase** no `.env` ou adicione um serviço `postgres` no `docker-compose` e use o hostname do serviço (ex.: `db:5432`).

- **Supabase**: use a URL do Supabase no `.env` (formato abaixo). Sem isso, a API não conecta.

### 1.3 Logs úteis

Ao subir a API (Docker ou `mvn spring-boot:run`), observe:

- Erro de **conexão recusada** → URL/host/porta errados ou banco fora do ar.
- Erro de **autenticação** (usuário/senha) → `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` errados.
- Erro de **SSL** → adicionar `?sslmode=require` na URL do Supabase (veja abaixo).
- Erro de **JWT** / property placeholder → garantir que `JWT_SECRET` existe no `.env` em produção ou que o default no `application.yml` está sendo usado.

---

## 2. Supabase

### 2.1 Onde pegar a URL e a senha

1. Acesse [Supabase](https://supabase.com) → seu projeto.
2. **Settings** → **Database**.
3. Em **Connection string**:
   - Tipo **URI** ou **JDBC**.
   - **Host**: algo como `db.XXXXX.supabase.co`.
   - **Port**: `5432` (Session) ou `6543` (Transaction pooler).
   - **Database**: `postgres`.
   - **User**: `postgres`.
   - **Password**: a senha do banco (se perdeu, dá para resetar nas configurações).

### 2.2 Formato da URL no `.env`

Formato JDBC:

```text
jdbc:postgresql://db.XXXXX.supabase.co:5432/postgres
```

O Supabase costuma exigir SSL. Se aparecer erro de SSL, use:

```text
jdbc:postgresql://db.XXXXX.supabase.co:5432/postgres?sslmode=require
```

Substitua `XXXXX` pelo ID do seu projeto no Supabase.

### 2.3 Conferir no Supabase

- Projeto **pausado** (planos gratuitos)? Reative no dashboard.
- **Senha** do banco alterada? Atualize `SPRING_DATASOURCE_PASSWORD` no `.env`.
- **Restrição de IP** (se existir): liberar o IP de onde a API roda (ou desativar temporariamente para testar).

### 2.4 Ver se as tabelas existem

No Supabase: **Table Editor**.  
Com `ddl-auto: update`, o Hibernate cria/atualiza tabelas ao subir a API. Se a API não conecta, as tabelas não são criadas/atualizadas.

---

## 3. Docker Compose

- O `docker-compose` atual **não** tem serviço PostgreSQL.
- Ou você usa **Supabase** (`.env` com URL do Supabase) ou adiciona um serviço `db` (postgres) no `docker-compose` e aí usa no `.env` algo como:
  - `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/orbitamos`
  - com usuário/senha do serviço `db`.

Comandos úteis:

```bash
# Subir
docker-compose up --build

# Ver logs da API
docker-compose logs -f api

# Parar
docker-compose down
```

---

## 4. Ordem sugerida para debug

1. Confirmar que o `.env` existe na raiz e tem `SPRING_DATASOURCE_*` (e `JWT_SECRET` em produção).
2. Se usa Supabase: colar a URL no formato JDBC com `?sslmode=require` e testar de novo.
3. Verificar no Supabase se o projeto está ativo e a senha está correta.
4. Rodar a API (Docker ou local) e ler a mensagem de erro completa (stack trace e primeira linha de erro).
5. Se precisar, testar conexão com o banco fora da API (ex.: DBeaver, `psql`) com a mesma URL/usuário/senha.

Quando tiver os logs da API (e, se possível, do Supabase ou do Docker), dá para apontar o próximo passo exato.
