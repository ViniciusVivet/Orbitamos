# Infraestrutura atual

Última atualização: 2026-07-28

## Topologia

```text
Namecheap DNS
  -> Vercel
     -> Next.js em apps/web
        -> Supabase Auth
        -> Supabase Postgres
        -> Supabase Storage
```

## Domínios verificados

Em 2026-07-28:

- `https://www.orbitamosbr.com` respondeu com o site Orbitamos.
- `orbitamosbr.com` resolveu para `216.198.79.1`.
- `www.orbitamosbr.com` resolveu por CNAME para
  `f271d0eb0fbd35c4.vercel-dns-017.com`.

O teste HTTP automatizado do domínio apex ficou inconclusivo no ambiente local
por falha do cliente TLS. O redirecionamento apex -> `www` deve ser confirmado
na Vercel e em um navegador ao alterar DNS.

Detalhes: [DOMINIO_NAMECHEAP_VERCEL.md](DOMINIO_NAMECHEAP_VERCEL.md).

## Vercel

- Root Directory: `apps/web`
- Variáveis obrigatórias: `NEXT_PUBLIC_SUPABASE_URL` e
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Variáveis opcionais do formulário e service role:
  [VARIAVEIS_AMBIENTE.md](VARIAVEIS_AMBIENTE.md)

## Supabase

Responsabilidades implementadas no repositório:

- autenticação e sessão;
- perfis e dados privados;
- progresso e academia;
- fórum e mensagens;
- vagas, candidaturas, projetos e squads;
- notificações, portfólio e solicitações de privacidade;
- contatos e rate limit persistente;
- buckets `avatars` e `academy-materials`.

A presença das migrations no Git não prova que todas foram aplicadas no
projeto remoto. Use o checklist de
[SUPABASE_NATIVE_MIGRATION.md](SUPABASE_NATIVE_MIGRATION.md).

## Conteúdo e arquivos

- Vídeos: IDs/links de provedor externo.
- Materiais legados: `apps/web/public/course-materials`.
- Materiais administrados: bucket `academy-materials`.
- Avatares: bucket público `avatars`, com escrita limitada por policies.

## Cron anti-pausa

Documentos anteriores mencionam um cron externo diário. Não há definição desse
job no repositório, portanto sua existência e destino não foram confirmados
por esta auditoria. Verifique o provedor externo antes de depender dele.
