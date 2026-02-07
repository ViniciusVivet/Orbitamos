# Variáveis de ambiente: Render vs EC2

Onde e como configurar as variáveis do backend conforme o ambiente de deploy.

---

## Visão geral

| Variável | Render | EC2 |
|----------|--------|-----|
| **Onde configurar** | Dashboard → serviço → **Environment** | Arquivo `scripts/ec2-env.sh` (não commitar) ou `export` na VM antes de rodar o JAR |
| **Quando carrega** | A cada deploy | Ao rodar `source ec2-env.sh` e em seguida `java -jar ...` |

---

## Variáveis do backend (API)

Todas as variáveis abaixo são usadas pela aplicação Spring Boot (`apps/api`).

### Banco de dados (Supabase)

| Variável | Exemplo | Render | EC2 |
|----------|---------|--------|-----|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://HOST:5432/postgres?sslmode=require` | Colar na aba Environment | Colocar no `ec2-env.sh`: `export SPRING_DATASOURCE_URL="..."` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` ou `postgres.PROJECT_REF` | Idem | `export SPRING_DATASOURCE_USERNAME="..."` |
| `SPRING_DATASOURCE_PASSWORD` | (senha do Supabase) | Idem | `export SPRING_DATASOURCE_PASSWORD="..."` |

### JWT

| Variável | Exemplo | Render | EC2 |
|----------|---------|--------|-----|
| `JWT_SECRET` | Chave longa (ex.: `openssl rand -base64 32`) | Colar na aba Environment | `export JWT_SECRET="..."` |
| `JWT_EXPIRATION` | `86400000` (opcional) | Idem | Opcional no `ec2-env.sh` |

### URL da API (foto de perfil, etc.)

| Variável | Exemplo | Render | EC2 |
|----------|---------|--------|-----|
| `API_BASE_URL` | URL pública da API em HTTPS | `https://orbitamos-backend.onrender.com` | `https://SEU_ID.cloudfront.net` ou `http://IP:8080` se não usar CloudFront |

---

## Render

1. Acesse [Render](https://dashboard.render.com) → serviço do backend (ex.: **orbitamos-backend**).
2. Menu lateral → **Environment**.
3. Adicione cada variável (Key / Value). O Render não lê `.env` do repositório; tudo fica na aba Environment.
4. Após salvar, faça um novo deploy para aplicar.

Documentação detalhada: [docs/RENDER_SUPABASE_SETUP.md](RENDER_SUPABASE_SETUP.md).

---

## EC2

1. No seu PC, edite o arquivo **`scripts/ec2-env.sh`** (ele está no `.gitignore`; não será commitado).
2. Preencha os `export` com os mesmos valores que você usaria no Render (Supabase, JWT, etc.).
3. Para `API_BASE_URL`: use a URL HTTPS do CloudFront (ex.: `https://d3q0dqkkuuwfle.cloudfront.net`) se a API for acessada via CloudFront.
4. Na VM, antes de subir a API:
   ```bash
   cd ~/app
   source ec2-env.sh
   nohup java -jar api-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
   ```

Exemplo de `scripts/ec2-env.sh`:

```bash
export SPRING_DATASOURCE_URL="jdbc:postgresql://HOST:5432/postgres?sslmode=require"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="SUA_SENHA"
export JWT_SECRET="sua-chave-jwt"
export API_BASE_URL="https://SEU_DOMINIO.cloudfront.net"
```

Documentação do fluxo EC2 + CloudFront: [docs/EC2_CLOUDFRONT_HTTPS.md](EC2_CLOUDFRONT_HTTPS.md).

---

## Frontend (Vercel)

Independente de o backend estar no **Render** ou na **EC2 + CloudFront**, no frontend (Vercel) você configura:

- **NEXT_PUBLIC_API_URL**: URL base da API + `/api`
  - Render: `https://orbitamos-backend.onrender.com/api`
  - EC2 + CloudFront: `https://SEU_ID.cloudfront.net/api`

Em **Vercel** → **Settings** → **Environment Variables** → adicione ou edite `NEXT_PUBLIC_API_URL` e faça redeploy.
