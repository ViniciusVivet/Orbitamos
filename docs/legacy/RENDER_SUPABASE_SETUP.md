# Render + Supabase: configurar sem expor senhas no cÃ³digo

> **âš ï¸ REFERÃŠNCIA HISTÃ“RICA â€” nÃ£o Ã© o deploy atual.**
> Render, EC2 e CloudFront nao sao a infraestrutura ativa. Este guia serve apenas de referencia
> caso o projeto volte a ter uma API dedicada no futuro.
> Estado atual da infra: [`docs/INFRA_ATUAL.md`](INFRA_ATUAL.md)

---

Nenhuma senha ou URL real fica no repositÃ³rio. Tudo Ã© configurado por **variÃ¡veis de ambiente** no Render e, localmente, no arquivo `.env` (que estÃ¡ no `.gitignore`).

---

## 1. Onde configurar (Render)

1. Acesse [Render](https://dashboard.render.com) â†’ serviÃ§o **orbitamos-backend**.
2. Menu lateral â†’ **Environment**.
3. Adicione as variÃ¡veis abaixo com os valores que vocÃª pega no Supabase (prÃ³xima seÃ§Ã£o).

NÃ£o use o arquivo `.env` do projeto para produÃ§Ã£o: o Render nÃ£o lÃª esse arquivo. Use sÃ³ a aba **Environment** do dashboard.

---

## 2. Pegar os valores no Supabase

1. Acesse [Supabase](https://supabase.com/dashboard) â†’ projeto **Orbitamos**.
2. **Settings** (Ã­cone de engrenagem) â†’ **Database**.
3. Na seÃ§Ã£o **Connection string**:
   - Escolha **URI** ou **JDBC**.
   - Copie **Host**, **Database**, **Port**, **User**, **Password**.

### Montar a URL JDBC

- **Host**: algo como `db.PROJECT_REF.supabase.co` (conexÃ£o direta) ou `aws-0-REGION.pooler.supabase.com` (pooler).
- **Porta**:
  - Se o host for **pooler** (`*.pooler.supabase.com`): use **6543**. Nunca use 5432 no pooler â€” conexÃ£o serÃ¡ recusada/timeout.
  - Se o host for **direto** (`db.xxx.supabase.co`): use **5432**. Se der timeout no Render, troque para o host do pooler com porta **6543**.
- **Banco**: `postgres`.
- **SSL**: o Supabase exige SSL. Sempre adicione: `?sslmode=require`.
- Os timeouts de conexÃ£o sÃ£o **adicionados automaticamente pelo cÃ³digo** â€” nÃ£o precisa colocar na URL no Render.

Exemplo (troque o host pelo do seu projeto):

```text
jdbc:postgresql://db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

Se usar o **pooler** (host `*.pooler.supabase.com`), use sempre porta **6543**:

```text
jdbc:postgresql://aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require
```

(Troque o host pelo do seu projeto em Settings â†’ Database â†’ Connection string â†’ **Transaction**.)

O **usuÃ¡rio** costuma ser `postgres`. A **senha** Ã© a que aparece em Database (ou a que vocÃª definiu ao criar o projeto).

---

## 3. VariÃ¡veis no Render (Environment)

Configure estas variÃ¡veis na aba **Environment** do **orbitamos-backend**:

| VariÃ¡vel | Onde pegar | Exemplo (nÃ£o use esses valores reais) |
|----------|------------|----------------------------------------|
| `SPRING_DATASOURCE_URL` | Supabase â†’ Settings â†’ Database â†’ montar JDBC com `?sslmode=require` | `jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Supabase â†’ Database â†’ User | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Supabase â†’ Database â†’ Password | (sua senha do banco) |
| `JWT_SECRET` | Gerar uma chave forte (ex.: `openssl rand -base64 32`) | string de 32+ caracteres |

Opcional:

- `JWT_EXPIRATION` â€“ em ms (padrÃ£o: 86400000 = 24h).
- `SPRING_WEB_CORS_ALLOWED_ORIGINS` â€“ se precisar de outros domÃ­nios no CORS.
- **`API_BASE_URL`** â€“ URL pÃºblica do backend (ex.: `https://orbitamos-backend.onrender.com`). Usada para montar a URL da **foto de perfil**; se nÃ£o definir, o backend tenta usar o host do request (funciona atrÃ¡s do Render). Se a foto nÃ£o carregar em produÃ§Ã£o (Mixed Content / localhost), defina esta variÃ¡vel.
- **`APP_DATASOURCE_APPEND_TIMEOUT_PARAMS`** â€“ por padrÃ£o o cÃ³digo **nÃ£o** altera a URL do banco. Se precisar de timeouts na URL JDBC (ex.: Connect timed out entre regiÃµes), defina `APP_DATASOURCE_APPEND_TIMEOUT_PARAMS=true` no Render.

Depois de salvar, faÃ§a um **Manual Deploy** para aplicar.

---

## 4. O que o cÃ³digo faz pela URL do banco (evitar quebrar de novo)

**NÃ£o Ã© obrigatÃ³rio mudar nada no Render.** O backend jÃ¡ ajusta a URL sozinho:

| SituaÃ§Ã£o | O que o cÃ³digo faz |
|----------|---------------------|
| URL com **pooler** do Supabase (`*.pooler.supabase.com`) e **porta 5432** | Troca automaticamente para **porta 6543**, porque o pooler sÃ³ aceita 6543. Mesmo que no Render esteja `:5432`, a aplicaÃ§Ã£o usa `:6543` e a conexÃ£o funciona. |
| ParÃ¢metros de timeout na URL | **Por padrÃ£o nÃ£o altera** a URL. SÃ³ acrescenta `connectTimeout`/`socketTimeout` se vocÃª definir `APP_DATASOURCE_APPEND_TIMEOUT_PARAMS=true` no Render. |

**Resumo:** Se o deploy quebrar com "Connection refused" ou "Connection timed out" ao conectar no banco:

1. **NÃ£o altere** `SPRING_DATASOURCE_URL` nem outras variÃ¡veis de infra para â€œconsertarâ€ â€” o cÃ³digo jÃ¡ corrige a porta do pooler.
2. FaÃ§a um **novo deploy** (Deploy latest commit) com o cÃ³digo atual; na maioria dos casos isso resolve.
3. SÃ³ mexa em variÃ¡veis (por exemplo porta 6543 na URL) se vocÃª tiver lido esta doc e o problema for outro.

Quem mexer no cÃ³digo da conexÃ£o (ex.: `DatasourceUrlEnvironmentPostProcessor` em `apps/api`) deve manter esse comportamento para nÃ£o quebrar de novo.

---

## 5. Se ainda der "Connect timed out" ou "Connection refused"

1. **Pooler com porta errada**  
   Se a URL usar host **`*.pooler.supabase.com`**, a porta tem que ser **6543**, nÃ£o 5432. Ex.: `jdbc:postgresql://aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require`.

2. **URL com SSL**  
   Confirme que a URL termina com `?sslmode=require`.

3. **Pooler: porta 6543**  
   Se usar host `*.pooler.supabase.com`, o cÃ³digo jÃ¡ troca 5432 por 6543. Se mesmo assim falhar, confira no Supabase â†’ Database a connection string do modo **Transaction** (porta 6543).

4. **Senha**  
   Verifique se a senha no Render Ã© exatamente a do Supabase (sem espaÃ§o no inÃ­cio/fim). Se tiver dÃºvida, resete a senha em Settings â†’ Database e atualize no Render.

5. **Rede**  
   O Supabase estÃ¡ em "West US (Oregon)". O free tier do Render pode estar em outra regiÃ£o; a primeira conexÃ£o pode demorar. O backend jÃ¡ estÃ¡ com timeouts maiores (60s) no HikariCP.

---

## 6. Se der erro "column role of relation users does not exist"

Esse erro aparece ao **cadastrar conta** ou **entrar** quando a tabela `users` no Supabase foi criada sem a coluna `role` (por exemplo, por uma versÃ£o antiga do app ou schema manual).

**SoluÃ§Ã£o:** rodar a migraÃ§Ã£o SQL no Supabase para criar a coluna:

1. Acesse [Supabase](https://supabase.com/dashboard) â†’ seu projeto â†’ **SQL Editor**.
2. Abra o arquivo `docs/migrations/001_add_role_to_users.sql` do repositÃ³rio (ou copie o conteÃºdo abaixo).
3. Cole no editor e clique em **Run**.

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'STUDENT';
```

4. Depois disso, tente **Criar conta** e **Entrar** de novo no site.

Outras migraÃ§Ãµes futuras ficarÃ£o em `docs/migrations/` com numeraÃ§Ã£o (002_, 003_, â€¦).

---

## 7. Resumo

- **CÃ³digo**: nÃ£o coloque URL, usuÃ¡rio ou senha do banco. SÃ³ variÃ¡veis tipo `${SPRING_DATASOURCE_URL}`.
- **Render**: configure tudo em **Environment**.
- **Supabase**: pegue URL (com `?sslmode=require`), usuÃ¡rio e senha em **Settings â†’ Database**.
- **.env**: use sÃ³ na sua mÃ¡quina para desenvolvimento; nÃ£o commite e nÃ£o use para produÃ§Ã£o no Render.

Assim o projeto continua open source sem expor credenciais.

