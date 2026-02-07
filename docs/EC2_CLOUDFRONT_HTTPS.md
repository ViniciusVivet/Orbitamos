# API na EC2 com HTTPS (CloudFront)

O site na Vercel é **HTTPS**. Navegadores bloqueiam requisições de página HTTPS para API **HTTP** (Mixed Content). Por isso o login não conecta se a API for acessada por HTTP direto.

Solução: **nginx na EC2 (porta 80)** + **CloudFront** na frente. O front usa a URL **HTTPS** do CloudFront; o CloudFront fala com a EC2 por **HTTP na porta 80**.

---

## Arquitetura

```
Navegador (HTTPS) → CloudFront (HTTPS) → EC2:80 (HTTP, nginx) → API:8080 (Spring Boot)
```

- **CloudFront → origem:** sempre **HTTP only**, porta **80**. A EC2 não precisa de HTTPS; o certificado fica no CloudFront.
- **Security Group:** portas **22** (SSH), **80** (HTTP, nginx), **8080** (opcional, API direta).

---

## Passo 0: Conectar na VM pelo PowerShell (sua máquina)

No **PowerShell** do Windows (troque `SEU_IP` pelo IPv4 público da instância no console EC2):

```powershell
ssh -i "CAMINHO_PARA_SUA_CHAVE.pem" ec2-user@SEU_IP
```

Na primeira vez pode perguntar se confia no host — digite `yes` e Enter.

---

## Parte 1: Nginx na EC2 (porta 80 → 8080)

Já conectado na VM, rode:

```bash
sudo dnf install -y nginx
```

Criar o config da API (**default_server** para atender tudo na porta 80):

```bash
sudo tee /etc/nginx/conf.d/api.conf << 'EOF'
server {
    listen 80 default_server;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

Testar e ativar:

```bash
sudo nginx -t && sudo systemctl enable nginx && sudo systemctl start nginx
```

**Security Group da EC2:** em **Regras de entrada** deve existir:

| Tipo   | Porta | Origem     |
|--------|-------|------------|
| SSH    | 22    | 0.0.0.0/0  |
| HTTP   | 80    | 0.0.0.0/0  |
| Custom TCP (API) | 8080 | 0.0.0.0/0 (opcional) |

Sem a porta **80** aberta, o CloudFront não consegue falar com a EC2 (504 Gateway Timeout).

---

## Parte 2: CloudFront

### 2.1 Origem: HTTP, porta 80 (obrigatório)

A origem da distribuição **precisa** ser:

- **Protocol:** **HTTP only** (não use HTTPS only).
- **HTTP port:** **80**.

Se a origem estiver como **HTTPS only** ou porta **443**, o CloudFront não conecta na EC2 (nginx está em HTTP:80). Edite a origem: **CloudFront → sua distribuição → Origins → Editar origem** → Protocol **HTTP only**, porta **80**.

### 2.2 Criar distribuição (resumo)

1. **CloudFront** → Create distribution.
2. **Origin domain:** DNS público da EC2 (ex.: `ec2-A-B-C-D.regiao.compute.amazonaws.com`).
3. **Protocol:** **HTTP only**. **HTTP port:** **80**.
4. **Default cache behavior:** Viewer protocol **Redirect HTTP to HTTPS**; Allowed methods **GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE**; Cache policy **CachingDisabled**.
5. (Opcional) Criar comportamento **Path pattern** `/api/*` com mesma origem, cache desabilitado e política de resposta **CORS-With-Preflight**.
6. Criar e aguardar status **Enabled**.

### 2.3 URL da API no front

Após a distribuição estar **Enabled**, use no Vercel:

- **NEXT_PUBLIC_API_URL** = `https://SEU-DOMINIO-CLOUDFRONT.cloudfront.net/api`

---

## Parte 3: Vercel

- **NEXT_PUBLIC_API_URL** = `https://SEU-DOMINIO-CLOUDFRONT.cloudfront.net/api`
- Redeploy do projeto após alterar a variável.

---

## Invalidação de cache (CloudFront)

Se alterar a API ou a configuração e o CloudFront continuar servindo resposta antiga: **CloudFront → sua distribuição → Invalidations → Create invalidation** → Object paths: `/*` → Create. Aguardar conclusão e testar de novo.

---

## Logs da API (na EC2)

Os logs não aparecem no console AWS por padrão. Na VM:

```bash
tail -f ~/app/app.log
```

(Ctrl+C para sair.)

---

## Checklist rápido

- [ ] Nginx na EC2: porta 80, `default_server`, proxy para 127.0.0.1:8080.
- [ ] Security Group: porta **80** aberta (0.0.0.0/0).
- [ ] CloudFront origem: **HTTP only**, porta **80** (não HTTPS/443).
- [ ] Comportamento `/api/*` ou default: métodos GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE; cache desabilitado para API.
- [ ] Vercel: `NEXT_PUBLIC_API_URL` com a URL HTTPS do CloudFront + `/api`.
