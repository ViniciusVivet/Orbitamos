# Render + Supabase: configurar sem expor senhas no código

Nenhuma senha ou URL real fica no repositório. Tudo é configurado por **variáveis de ambiente** no Render e, localmente, no arquivo `.env` (que está no `.gitignore`).

---

## 1. Onde configurar (Render)

1. Acesse [Render](https://dashboard.render.com) → serviço **orbitamos-backend**.
2. Menu lateral → **Environment**.
3. Adicione as variáveis abaixo com os valores que você pega no Supabase (próxima seção).

Não use o arquivo `.env` do projeto para produção: o Render não lê esse arquivo. Use só a aba **Environment** do dashboard.

---

## 2. Pegar os valores no Supabase

1. Acesse [Supabase](https://supabase.com/dashboard) → projeto **Orbitamos**.
2. **Settings** (ícone de engrenagem) → **Database**.
3. Na seção **Connection string**:
   - Escolha **URI** ou **JDBC**.
   - Copie **Host**, **Database**, **Port**, **User**, **Password**.

### Montar a URL JDBC

- **Host**: algo como `db.nvptikymbvqrjdvxcaor.supabase.co` (o seu projeto tem esse ID na URL do dashboard).
- **Porta**: use **5432** (Session). Se der "Connect timed out" no Render, tente **6543** (Transaction pooler).
- **Banco**: `postgres`.
- **SSL**: o Supabase exige SSL. Sempre adicione no final da URL: `?sslmode=require`.

Exemplo (troque o host pelo do seu projeto):

```text
jdbc:postgresql://db.nvptikymbvqrjdvxcaor.supabase.co:5432/postgres?sslmode=require
```

Se usar a porta **6543** (pooler):

```text
jdbc:postgresql://db.nvptikymbvqrjdvxcaor.supabase.co:6543/postgres?sslmode=require
```

O **usuário** costuma ser `postgres`. A **senha** é a que aparece em Database (ou a que você definiu ao criar o projeto).

---

## 3. Variáveis no Render (Environment)

Configure estas variáveis na aba **Environment** do **orbitamos-backend**:

| Variável | Onde pegar | Exemplo (não use esses valores reais) |
|----------|------------|----------------------------------------|
| `SPRING_DATASOURCE_URL` | Supabase → Settings → Database → Connection string → montar JDBC com `?sslmode=require` | `jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Supabase → Database → User | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Supabase → Database → Password | (sua senha do banco) |
| `JWT_SECRET` | Gerar uma chave forte (ex.: `openssl rand -base64 32`) | string de 32+ caracteres |

Opcional:

- `JWT_EXPIRATION` – em ms (padrão: 86400000 = 24h).
- `SPRING_WEB_CORS_ALLOWED_ORIGINS` – se precisar de outros domínios no CORS.

Depois de salvar, faça um **Manual Deploy** para aplicar.

---

## 4. Se ainda der "Connect timed out"

1. **URL com SSL**  
   Confirme que a URL termina com `?sslmode=require`.

2. **Usar porta 6543 (Transaction pooler)**  
   No Supabase → Database, use a connection string do **Transaction** (porta 6543) e monte a URL JDBC com essa porta. Às vezes o Render conecta melhor pelo pooler.

3. **Senha**  
   Verifique se a senha no Render é exatamente a do Supabase (sem espaço no início/fim). Se tiver dúvida, resete a senha em Settings → Database e atualize no Render.

4. **Rede**  
   O Supabase está em "West US (Oregon)". O free tier do Render pode estar em outra região; a primeira conexão pode demorar. O backend já está com timeouts maiores (60s) para aguentar isso.

---

## 5. Resumo

- **Código**: não coloque URL, usuário ou senha do banco. Só variáveis tipo `${SPRING_DATASOURCE_URL}`.
- **Render**: configure tudo em **Environment**.
- **Supabase**: pegue URL (com `?sslmode=require`), usuário e senha em **Settings → Database**.
- **.env**: use só na sua máquina para desenvolvimento; não commite e não use para produção no Render.

Assim o projeto continua open source sem expor credenciais.
