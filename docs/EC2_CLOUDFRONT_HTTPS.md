# API na EC2 com HTTPS (CloudFront)

O site na Vercel é **HTTPS**. Navegadores bloqueiam requisições de página HTTPS para API **HTTP** (Mixed Content). Por isso o login não conecta.

Solução: **nginx na EC2 (porta 80)** + **CloudFront** em frente. O front usa a URL HTTPS do CloudFront.

---

## Passo 0: Conectar na VM pelo PowerShell (sua máquina)

No **PowerShell** do Windows, rode (troque o IP se o da sua instância for outro):

```powershell
ssh -i "C:\Users\dougl\Documents\orbitamos-key.pem" ec2-user@18.191.153.134
```

Na primeira vez pode perguntar se confia no host — digite `yes` e Enter. Depois você entra na VM e os comandos abaixo rodam **dentro** dela.

---

## Parte 1: Nginx na EC2 (porta 80 → 8080)

Já conectado na VM (via PowerShell acima), rode:

```bash
sudo dnf install -y nginx
```

Criar o config da API:

```bash
sudo tee /etc/nginx/conf.d/api.conf << 'EOF'
server {
    listen 80;
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

**Security Group da EC2:** abrir a **porta 80** para 0.0.0.0/0 (EC2 → Security groups → launch-wizard-1 → Edit inbound rules → Add rule: HTTP, 80, 0.0.0.0/0).

---

## Parte 2: CloudFront (passo a passo no console AWS)

Você está na tela das **Instâncias EC2**. O próximo passo é criar uma **distribuição CloudFront** para ter uma URL HTTPS que aponta para sua API na EC2.

---

### 2.1 Abrir o CloudFront

1. No **topo da página** do console AWS, tem uma **barra de busca** (onde está escrito "Pesquisar serviços, recursos..." ou "Search").
2. Digite: **CloudFront**.
3. Clique em **CloudFront** (o serviço, não um resultado de documentação).
4. Você entra na página do CloudFront. Deve aparecer a lista de distribuições (pode estar vazia).

---

### 2.2 Criar a distribuição

1. Clique no botão laranja **"Create distribution"** (ou **"Criar distribuição"**).
2. A tela vai mostrar um formulário grande. Preencha **só o que está abaixo**; o resto pode deixar como está.

---

### 2.3 Seção "Origin" (origem = sua EC2)

Role até a seção **"Origin"** (ou **"Origem"**).

| Campo | O que fazer |
|-------|-------------|
| **Origin domain** | O dropdown mostra S3 e outros. **Não escolha do dropdown.** Clique no campo e **digite direto**: `18.191.153.134` (o IP público da sua EC2, igual na tela de Instâncias). Se não aceitar IP, tente: `ec2-18-191-153-134.us-east-2.compute.amazonaws.com`. |
| **Name** | Preenche sozinho (ex.: `18.191.153.134`). Pode deixar. |
| **Protocol** | Deixe **HTTP only** (a EC2 está em HTTP na porta 80; o HTTPS fica no CloudFront). |
| **HTTP port** | **80**. |
| **HTTPS port** | 443 (padrão). Pode deixar. |

Não mexa em "Origin access", "Origin shield", etc.

---

### 2.4 Seção "Default cache behavior" (comportamento de cache)

Role até **"Default cache behavior"**.

| Campo | O que fazer |
|-------|-------------|
| **Viewer protocol policy** | Mude para **"Redirect HTTP to HTTPS"**. Assim quem acessar por HTTPS (seu site na Vercel) usa HTTPS no CloudFront. |
| **Allowed HTTP methods** | Selecione **"GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE"** (todos que a API usa). |
| **Cache policy** | Escolha **"CachingDisabled"** (API não deve cachear respostas de login, etc.). Se não aparecer, use "CachingOptimized" por enquanto. |

O resto pode ficar em padrão.

---

### 2.5 Seção "Settings" (configurações gerais)

Role até **"Settings"**.

- **Price class**: pode deixar **"Use only North America and Europe"** (mais barato) ou o padrão.
- Não precisa preencher "Alternate domain names" nem "Custom SSL certificate".

---

### 2.6 Criar

1. Role até o **final da página**.
2. Clique no botão laranja **"Create distribution"** (ou **"Criar distribuição"**).
3. Você volta para a lista de distribuições. A nova vai aparecer com **Status** = **"Deploying"** (Implantando).
4. Espere **2 a 5 minutos**. Atualize a página (F5) de vez em quando. Quando o **Status** mudar para **"Enabled"**, está pronto.

---

### 2.7 Copiar a URL HTTPS da API

1. Na lista de distribuições, clique no **ID** da distribuição que você criou (ex.: `E1234ABCD5678`).
2. No topo da página de detalhes, está o **"Distribution domain name"** (ex.: `d1234abcd5678.cloudfront.net`). Clique no ícone de **copiar** ao lado.
3. A URL da API que você vai usar no Vercel é:
   ```text
   https://SEU-DOMINIO-AQUI.cloudfront.net/api
   ```
   Exemplo: se o domínio for `d1a2b3c4d5e6f7.cloudfront.net`, use:
   ```text
   https://d1a2b3c4d5e6f7.cloudfront.net/api
   ```
   Guarde esse valor para o **Parte 3** (Vercel).

---

## Parte 3: Vercel

**Environment variable:**

- **NEXT_PUBLIC_API_URL** = `https://SEU-DOMINIO-CLOUDFRONT.cloudfront.net/api`

Exemplo: `https://d111111abcdef8.cloudfront.net/api`

Depois: **Redeploy** do projeto na Vercel.

---

## Onde ver os logs da API (AWS / EC2)

Os logs **não** aparecem no console da AWS por padrão. Eles ficam **dentro da VM**:

1. Conectar na EC2: no PowerShell, use o comando do **Passo 0** acima (SSH com a chave `.pem`).
2. Dentro da VM, rodar:
   ```bash
   tail -f ~/app/app.log
   ```
   (Ctrl+C para sair.)

Para ver as últimas linhas de uma vez: `tail -100 ~/app/app.log`.

Se quiser ver logs da API no **CloudWatch** no futuro, dá para instalar o CloudWatch Agent na EC2 e enviar o arquivo `~/app/app.log` para um log group.
