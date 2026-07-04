# Orbitamos - Instrucoes para o Claude

## Autonomia

Execute tarefas tecnicas sem parar para pedir confirmacao quando o caminho for claro.

Isso inclui:
- Editar e criar arquivos
- Rodar comandos de verificacao
- Commitar em blocos logicos
- Fazer push quando a tarefa pedir publicacao
- Atualizar documentacao junto com a mudanca de codigo

Peca opiniao apenas para:
- Direcao criativa: design, cores, layout, estetica
- Rumo do produto: novas features, mudancas de fluxo, prioridades
- Decisoes arquiteturais irreversiveis de grande impacto

## Stack atual

- **Frontend principal**: Next.js 16, App Router, TypeScript e Tailwind CSS em `apps/web`
- **Hospedagem**: Vercel
- **Auth/Banco/Storage**: Supabase Auth, Supabase Postgres e Supabase Storage
- **Rotas auxiliares**: API Routes do Next em `apps/web/src/app/api`
- **Backend Spring**: legado/fallback em `apps/api`, sem papel ativo na producao atual
- **Cron anti-pausa**: job externo faz 1 requisicao diaria para manter o projeto Supabase ativo no free tier

Nao documentar IPs, caminhos de chaves, comandos SSH/SCP, tokens, secrets, URLs privadas de painel ou credenciais reais em arquivos versionados.

## Commits

- Usar prefixos: `feat`, `fix`, `docs`, `refactor`, `redesign`, `chore`
- Commitar em blocos logicos, nunca misturar assuntos sem necessidade
- Fazer push automaticamente quando a tarefa pedir publicacao

## Contexto do projeto

Orbitamos e um estudio digital comercial na porta de entrada: landing pages, sites, MVPs, catalogos digitais, e-commerce e automacoes.

Tambem existe uma plataforma educacional interna em rotas como `/orbitacademy`, `/estudante` e `/colaborador`, acessivel para usuarios logados.

Paleta principal: `orbit-electric` (#00D4FF) e `orbit-purple` (#8B5CF6).
