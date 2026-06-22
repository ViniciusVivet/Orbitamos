# Orbitamos

<div align="center">

![Orbitamos](https://img.shields.io/badge/Orbitamos-v3.0%20Supabase%20Native-00D4FF?style=for-the-badge&logo=rocket&logoColor=white)

**Estudio digital na porta de entrada. Plataforma de tecnologia e educacao por dentro.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres%20%2B%20Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?style=flat-square&logo=vercel)](https://vercel.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## Contexto Atual

Este repositório é o monorepo da **Orbitamos**, um produto com duas frentes no mesmo codebase:

1. **Porta de entrada comercial**: site público que posiciona a Orbitamos como estúdio digital, com foco em projetos, portfólio, contato e conversão.
2. **Plataforma autenticada**: portal educacional e comunitário com área do estudante, OrbitAcademy, progresso, fórum, mensagens, perfil e área de colaborador.

Essa separação é intencional. O site público vende a capacidade de execução da Orbitamos como estúdio. A área logada preserva a visão original do projeto: uma plataforma de formação em tecnologia, comunidade e oportunidades.

## Orbitamos v3.0

**Data da virada:** 19 de junho de 2026.

A v3.0 marca a volta estratégica para **Supabase nativo**:

- **v1.0**: primeira versão usando Supabase como base principal.
- **v2.0**: migração para backend próprio em Spring Boot na AWS EC2, com CloudFront e infraestrutura mais manual.
- **v3.0**: retorno para Vercel + Supabase, reduzindo custo fixo e removendo dependência de servidor sempre ligado.

Motivo da mudança: manter o projeto online com custo mínimo enquanto a operação ainda está em fase inicial. A AWS continua documentada como histórico/legado, mas a direção atual é depender o mínimo possível de infraestrutura própria.

## Arquitetura Atual

| Camada | Status atual | Observação |
| --- | --- | --- |
| Frontend | Vercel + Next.js | Site público e plataforma logada no mesmo app |
| Domínio | `www.orbitamosbr.com` | Apex `orbitamosbr.com` redireciona para `www` |
| Auth | Supabase Auth | Substitui login JWT do backend Spring na v3.0 |
| Banco | Supabase Postgres | Perfis, progresso, fórum, chat, contatos e academia |
| Storage | Supabase Storage | Avatars; materiais de aula podem usar bucket dedicado |
| Vídeos | YouTube embed | Vídeos de aula não devem ficar no banco/storage |
| Backend Spring | Legado/fallback | Mantido no repo para referência e possível reuso futuro |
| AWS EC2/CloudFront | Legado | Não é requisito para manter a área logada online |

Fluxo principal da v3.0:

```txt
Usuário
  -> Vercel / Next.js
    -> Supabase Auth
    -> Supabase Postgres
    -> Supabase Storage
    -> YouTube embeds para aulas em vídeo
```

## Produto

### 1. Site público

Rotas focadas em presença comercial:

- `/` - apresentação da Orbitamos
- `/projetos` - portfólio e cases
- `/projetos/[slug]` - detalhe de projeto
- `/contato` - captura de demanda
- `/sobre` - narrativa institucional
- `/orbitacademy` - ponte entre marca pública e formação em tecnologia

Essa camada deve ser rápida, estável e orientada a conversão.

### 2. Plataforma autenticada

Rotas de produto e comunidade:

- `/entrar` - cadastro/login
- `/estudante` - dashboard do aluno
- `/estudante/aulas` - listagem de cursos
- `/estudante/cursos/[slug]` - sala de aula
- `/estudante/progresso` - progresso e gamificação
- `/estudante/conta` - perfil
- `/forum` - comunidade
- `/mensagens` - conversas e grupos
- `/colaborador/*` - área de colaboradores/freelancers

Na v3.0, essas rotas estão sendo migradas para Supabase nativo. O objetivo é não depender de um backend pago/sempre ligado para o fluxo principal.

## Stack

### Frontend (`apps/web`)

- Next.js 16 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase JS
- Vercel

### Backend legado (`apps/api`)

- Spring Boot 3
- Java 21
- Spring Security/JWT
- WebSocket/STOMP
- PostgreSQL via Supabase

O backend Java fica no repositório porque documenta parte importante da evolução do produto e pode ser reaproveitado quando fizer sentido voltar a ter uma API própria, por exemplo em ASP.NET Core, Spring ou outro serviço dedicado.

## Estado da Migração Supabase

Já preparado no código:

- Auth via Supabase quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existem.
- Perfis de usuário.
- Upload de avatar para Supabase Storage.
- Contatos do site.
- Progresso resumido do aluno.
- Fórum.
- Chat básico persistido no Supabase.
- Estrutura acadêmica: cursos, módulos, aulas, materiais/PDFs, quizzes e progresso por aula.
- Fallback legado para API Spring quando Supabase não está configurado.

Pendente de execução manual no painel:

- Rodar as migrations SQL no Supabase.
- Criar buckets de Storage.
- Configurar URLs de Auth.
- Configurar variáveis na Vercel.
- Fazer redeploy.

Guia principal: [docs/SUPABASE_NATIVE_MIGRATION.md](docs/SUPABASE_NATIVE_MIGRATION.md)

Checklist local não versionado: `docs/local/SUPABASE_VERCEL_CHECKLIST.md`

## Variáveis de Ambiente

### Produção v3.0 - Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
```

`NEXT_PUBLIC_API_URL` deve ficar ausente/vazio quando a área logada estiver usando Supabase nativo. Essa variável hoje é fallback para o backend Spring legado.

### Desenvolvimento local

```bash
cd apps/web
npm install
npm run dev
```

App local: `http://localhost:3000`

## Migrations

As migrations atuais ficam em `docs/migrations/`.

Ordem importante para a v3.0:

```txt
docs/migrations/005_supabase_native_platform.sql
docs/migrations/006_supabase_academy_content.sql
```

Resumo:

- `005` cria a base da plataforma: profiles, progresso, contatos, fórum, conversas, mensagens e RLS.
- `006` cria a base acadêmica: courses, modules, lessons, materials, quizzes, attempts e progresso por aula.

## Estrutura do Repositório

```txt
orbitamos/
├── apps/
│   ├── web/          # Next.js: site público + plataforma autenticada
│   └── api/          # Spring Boot legado/fallback
├── docs/
│   ├── migrations/   # SQLs do Supabase
│   ├── local/        # runbooks/checklists locais ignorados pelo Git
│   └── *.md          # arquitetura, infra e histórico de decisões
├── scripts/          # scripts operacionais legados
└── README.md
```

## Documentos Importantes

- [docs/SUPABASE_NATIVE_MIGRATION.md](docs/SUPABASE_NATIVE_MIGRATION.md) - execução da migração v3.0
- [docs/DOMINIO_NAMECHEAP_VERCEL.md](docs/DOMINIO_NAMECHEAP_VERCEL.md) - domínio `orbitamosbr.com`
- [docs/INFRA_ATUAL.md](docs/INFRA_ATUAL.md) - estado atual e nota de transição
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - arquitetura histórica do projeto
- [apps/web/ENV_EXAMPLE.md](apps/web/ENV_EXAMPLE.md) - variáveis do frontend

## Roadmap Técnico

Curto prazo:

- Executar migrations no Supabase.
- Configurar Vercel com variáveis Supabase.
- Validar cadastro, login, perfil, avatar, contato, fórum e chat em produção.
- Validar em produção a leitura de cursos/progresso por aula a partir da estrutura acadêmica do Supabase.

Médio prazo:

- Criar painel administrativo para cursos, aulas, materiais e quizzes.
- Evoluir chat para Supabase Realtime.
- Definir política de armazenamento para PDFs: bucket público simples ou bucket privado com URLs assinadas.
- Reavaliar uma API própria quando houver demanda real de regra de negócio, integrações ou escala.

Futuro:

- Uma API dedicada pode voltar em C#/.NET, Spring ou outro stack, mas só quando o custo operacional fizer sentido para o estágio do projeto.

## Como Pensar Este Projeto

A Orbitamos não é apenas uma landing page nem apenas uma plataforma de cursos. O repositório junta uma operação comercial viável no curto prazo com uma visão de produto educacional no médio prazo.

Essa decisão reduz duplicação de marca, mantém o histórico técnico acessível e permite evoluir a plataforma sem perder a capacidade de vender projetos agora.

## Sobre

**Douglas Vinicius Alves da Silva** - fundador da Orbitamos.

[![GitHub](https://img.shields.io/badge/GitHub-ViniciusVivet-black?style=flat-square&logo=github)](https://github.com/ViniciusVivet)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-vivetsp-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/vivetsp)

## Licença

MIT.

---

<div align="center">

**Orbitamos** - produto digital com propósito, comunidade e execução.

</div>
