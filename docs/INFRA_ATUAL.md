# Infra atual

Ultima atualizacao: 2026-06-24

## Estado de producao

A infraestrutura atual da Orbitamos e:

```txt
Namecheap DNS
  -> Vercel
  -> Next.js em apps/web
  -> Supabase Auth/Postgres/Storage
  -> Cron externo diario anti-pausa do Supabase free tier
```

O backend Spring em `apps/api`, AWS EC2, CloudFront, Render e Railway sao historicos/fallback. Eles nao devem ser usados para subir a area logada agora, a menos que exista uma decisao explicita de voltar para backend proprio.

## Dominios

- Principal: `https://www.orbitamosbr.com`
- Redirect/alias: `https://orbitamosbr.com`
- Vercel preview: `orbitamos.vercel.app`

Guia de DNS: [DOMINIO_NAMECHEAP_VERCEL.md](DOMINIO_NAMECHEAP_VERCEL.md)

## Supabase

Responsabilidades atuais:

- Cadastro e login via Supabase Auth.
- Perfis, progresso, contatos, forum e mensagens no Supabase Postgres.
- Avatares no Supabase Storage.
- Estrutura de cursos/aulas preparada pelas migrations.
- Projeto mantido ativo por um cron externo com 1 requisicao diaria leve, para reduzir risco de pausa por inatividade no free tier.

Guia principal da migracao: [SUPABASE_NATIVE_MIGRATION.md](SUPABASE_NATIVE_MIGRATION.md)

## Vercel

O projeto da Vercel deve apontar para:

```txt
Root Directory: apps/web
```

Variaveis obrigatorias:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Variavel que deve ficar vazia/ausente no modo atual:

```txt
NEXT_PUBLIC_API_URL
```

Essa variavel so deve voltar se o backend Spring for reativado de proposito.

## Materiais de aula

Arquivos de aula que precisam aparecer no portal ficam em:

```txt
apps/web/public/course-materials
```

Eles sao servidos pela rota:

```txt
/api/course-materials/[...path]
```

Videos devem ficar no YouTube ou provedor equivalente. O Supabase nao deve ser usado como biblioteca de video.

## Documentacao historica

Os guias antigos de EC2, CloudFront, Render, Railway e debug do backend Spring foram movidos para:

```txt
docs/legacy
```

Eles servem como memoria tecnica, nao como passo a passo atual de producao.
