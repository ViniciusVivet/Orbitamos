# Infraestrutura Atual da Orbitamos

> **Última atualização: 15 de março de 2026**
>
> **⚠️ ATENÇÃO (para humanos e IAs que analisam este projeto):**
> Este documento é o **ponto de verdade** sobre onde cada parte do sistema está hospedada hoje.
> A arquitetura já mudou antes e pode mudar de novo no futuro. Sempre consulte este arquivo
> antes de assumir onde algo está rodando.

---

## Estado atual (março 2026)

| Serviço | Plataforma | URL / Referência |
|---------|-----------|-----------------|
| **Frontend** (Next.js) | Vercel | configurar `NEXT_PUBLIC_API_URL` com URL do CloudFront |
| **Backend** (Spring Boot / Java) | **AWS EC2** (us-east-2 / Ohio) | acessível via CloudFront HTTPS |
| **HTTPS da API** | **AWS CloudFront** | distribui o tráfego da EC2 com TLS |
| **Banco de dados** | **Supabase** (PostgreSQL) | URL via `SPRING_DATASOURCE_URL` |
| **Storage de imagens** (avatars) | **Cloudinary** | integrado no backend; credenciais via env vars |

### Diagrama de requisição

```
Usuário → Vercel (frontend Next.js)
              ↓ chamadas de API
         CloudFront (HTTPS) → EC2 nginx:80 → Spring Boot:8080
                                                    ↓
                                              Supabase (DB)
                                              Cloudinary (imagens)
```

---

## Histórico de plataformas

| Período | Backend | Observação |
|---------|---------|------------|
| Início do projeto | Render (free tier) | Render foi usado para prototipagem inicial. |
| 2025 em diante | **EC2 + CloudFront** | Migrado para EC2 para ter filesystem persistente, HTTPS via CloudFront. |
| (possível futuro) | Render / Railway / Fly.io | Se o projeto sair da EC2, atualizar este doc. |

**Por que saiu do Render:**
O Render free tier tem filesystem efêmero (arquivos apagados a cada restart ~15 min).
Isso causava perda de uploads. A EC2 tem storage persistente e controle total.

**Por que pode voltar (ou ir para outro lugar):**
EC2 exige manutenção manual (SSH, deploy manual de JAR). Se o time crescer, pode
fazer sentido voltar para um PaaS (Render, Railway, Fly.io) que tem deploy automático.

---

## Variáveis de ambiente necessárias por serviço

### Backend — EC2 (`~/app/ec2-env.sh` na VM, nunca commitar)

```bash
# Banco de dados (Supabase)
export SPRING_DATASOURCE_URL="jdbc:postgresql://HOST:PORT/postgres?sslmode=require"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="SUA_SENHA_SUPABASE"

# JWT
export JWT_SECRET="chave-longa-gerada-com-openssl-rand-base64-32"

# URL base da API (CloudFront HTTPS — para links de imagem legados)
export API_BASE_URL="https://SEU_ID.cloudfront.net"

# Cloudinary (upload de avatars — persistente)
export CLOUDINARY_CLOUD_NAME="dt6srlfcj"
export CLOUDINARY_API_KEY="828728432781183"
export CLOUDINARY_API_SECRET="(ver cofre de senhas)"
```

### Frontend — Vercel (configurar em Settings → Environment Variables)

```
NEXT_PUBLIC_API_URL=https://SEU_ID.cloudfront.net/api
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```

> **Nota:** `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` eram usados
> quando o upload de avatar era feito pelo frontend direto no Supabase Storage.
> Hoje o upload é feito pelo backend → Cloudinary. Essas variáveis não são mais necessárias.

---

## Como fazer deploy do backend (EC2)

Documentação detalhada: [`docs/EC2_CLOUDFRONT_HTTPS.md`](EC2_CLOUDFRONT_HTTPS.md)
Comandos rápidos: [`docs/local/RUNBOOK_EC2.md`](local/RUNBOOK_EC2.md) (arquivo local, não commitado)

Resumo:
1. Buildar JAR: `cd apps/api && mvn clean package -DskipTests`
2. Enviar para EC2: `scp -i chave.pem target/api-0.0.1-SNAPSHOT.jar ec2-user@IP:~/app/`
3. Na VM: `source ec2-env.sh && pkill -f api-0.0.1-SNAPSHOT.jar; nohup java -jar api-0.0.1-SNAPSHOT.jar > app.log 2>&1 &`

---

## Checklist ao mudar de provedor

Se no futuro o backend for migrado para outro serviço:

- [ ] Atualizar este arquivo (`docs/INFRA_ATUAL.md`) com nova plataforma e data
- [ ] Atualizar `docs/VARIAVEIS_AMBIENTE.md`
- [ ] Atualizar `NEXT_PUBLIC_API_URL` na Vercel
- [ ] Configurar variáveis de ambiente no novo provedor (Supabase DB + Cloudinary + JWT)
- [ ] Verificar CORS em `SecurityConfig.java` (adicionar novo domínio em `allowedOriginPatterns`)
- [ ] Testar upload de avatar (vai para Cloudinary, não depende do provedor do backend)
- [ ] Testar WebSocket (`/ws/**`) — pode exigir configuração específica no novo provedor
