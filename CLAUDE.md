# Orbitamos — Instruções para o Claude

## Autonomia

Execute livremente sem pedir confirmação:
- Editar, criar ou deletar arquivos de código
- Rodar comandos (`git`, `npm`, `mvn`, `scp`, `ssh`, etc.)
- Commitar e fazer push para o repositório
- Buildar o projeto
- Enviar arquivos para a EC2

**Peça confirmação apenas para:**
- Decisões de direção criativa ou de produto ("devemos mudar X para Y?")
- Mudanças arquiteturais grandes (trocar banco, mudar infraestrutura)
- Qualquer coisa destrutiva e irreversível fora do repositório (ex: apagar dados em produção)

## Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS — em `apps/web`
- **Backend**: Spring Boot 3 (Java 21), JPA, JWT — em `apps/api`
- **Banco**: Supabase (PostgreSQL)
- **Deploy frontend**: Vercel
- **Deploy backend**: EC2 AWS manual via SCP + SSH
  - IP: `3.143.233.182`
  - Chave: `C:/Users/dougl/Documents/orbitamos-key.pem`
  - JAR em: `~/app/api-0.0.1-SNAPSHOT.jar`
  - Env vars: `~/app/ec2-env.sh`
  - Reiniciar: `source ~/app/ec2-env.sh && pkill -f api-0.0.1-SNAPSHOT.jar; sleep 3 && nohup java -jar ~/app/api-0.0.1-SNAPSHOT.jar > ~/app/app.log 2>&1 & disown`

## Commits

- Usar prefixos: `feat`, `fix`, `refactor`, `redesign`, `chore`
- Commitar em blocos lógicos, nunca tudo de uma vez
- Sempre incluir `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
- Após commitar, fazer push automaticamente

## Contexto do projeto

Orbitamos é um estúdio digital comercial (landing pages, sites, MVPs, e-commerce).
Tem também uma plataforma educacional interna (`/orbitacademy`, `/estudante`, `/colaborador`) acessível apenas para usuários logados.

Paleta: `orbit-electric` (#00D4FF) e `orbit-purple` (#8B5CF6).
