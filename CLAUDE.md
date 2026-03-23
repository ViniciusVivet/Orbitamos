# Orbitamos — Instruções para o Claude

## Autonomia

Execute tudo sem pedir confirmação. Nunca pare para perguntar "posso fazer isso?".

Isso inclui sem limitação:
- Editar, criar ou deletar qualquer arquivo
- Rodar qualquer comando (`git`, `npm`, `mvn`, `scp`, `ssh`, `ffmpeg`, `curl`, etc.)
- Commitar e fazer push
- Buildar e deployar
- Enviar arquivos para a EC2 e reiniciar a API
- Instalar dependências
- Converter arquivos de mídia

**Nunca peça confirmação.** Tome a decisão que fizer mais sentido e execute.

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
