# Infraestrutura atual

Última revisão documental: 2026-11-04, comparada ao código de `3643a04`.
As verificações da entrega abaixo não incluem inspeção de uso/cotas nos
dashboards, configurações de Auth/Storage ou execução de SQL remoto.

## Topologia documentada

```text
Namecheap DNS
  -> Vercel
     -> Next.js em apps/web
        -> Supabase Auth
        -> Supabase Postgres
        -> Supabase Storage
```

A topologia representa a configuração registrada pelo projeto. Build local
aprovado, deploy Vercel e migrations aplicadas no Supabase são evidências
diferentes. O registro de testes/build de 2026-11-04 está em
[TESTES_AUTOMATIZADOS.md](TESTES_AUTOMATIZADOS.md).

## Verificação de entrega de 2026-11-04

- A Vercel registrou status `success` para `3643a04`.
- A home pública respondeu `200`.
- Os sprites WebP do personagem e dos objetos do capítulo Orbi, além da capa,
  responderam `200`, com hashes iguais aos arquivos locais da entrega.
- As prévias de desenvolvimento verificadas retornaram `404` em produção.

Esses resultados comprovam a publicação desses recursos, sem comprovar upload
autenticado, configuração de Auth, policies ou aplicação remota das migrations.
O commit documental posterior `5b34877` foi enviado ao Git; seu envio não é
evidência de um novo deployment publicado. O DNS não foi revalidado nessa rodada.

## Domínios: registro histórico de 2026-07-28

- `https://www.orbitamosbr.com` respondeu com o site Orbitamos.
- `orbitamosbr.com` resolveu para `216.198.79.1`.
- `www.orbitamosbr.com` resolveu por CNAME para
  `f271d0eb0fbd35c4.vercel-dns-017.com`.

Esses resultados não foram repetidos em 2026-11-04. O teste HTTP automatizado
do apex foi inconclusivo naquela data por falha do cliente TLS. Confirme
DNS e redirecionamento apex -> `www` na Vercel e em navegador ao alterar DNS;
não copie os endereços históricos como valores novos sem verificar o projeto.
Detalhes: [DOMINIO_NAMECHEAP_VERCEL.md](DOMINIO_NAMECHEAP_VERCEL.md).

## Vercel

- Root Directory documentado: `apps/web`; não há `vercel.json` no repositório
  que comprove a configuração do dashboard.
- Scripts de build: `prebuild` prepara assets locais do Pyodide; `build` usa
  `scripts/next-build.mjs`.
- Variáveis do cliente Supabase: `NEXT_PUBLIC_SUPABASE_URL` e
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Variáveis opcionais de contato e service role:
  [VARIAVEIS_AMBIENTE.md](VARIAVEIS_AMBIENTE.md).

Development, Preview e Production têm configurações próprias na Vercel.
Confirme o ambiente e o commit do deployment para validar uma publicação;
uma prévia aprovada não comprova a versão servida pelo domínio de produção.
A revisão documental não leu valores de variáveis.

## Supabase

Responsabilidades presentes no código e nas migrations:

- autenticação, sessão e perfis;
- cursos, aulas, materiais e progresso persistido;
- fórum e mensagens;
- vagas, candidaturas, projetos e squads;
- notificações, portfólio salvo e solicitações de privacidade;
- contatos e rate limit persistente.

Existem 14 migrations atuais, da `005` à `018`, e uma configuração isolada
`orbitamos-local` em `supabase/config.toml`. O fluxo local com Docker e testes
pgTAP está em [SUPABASE_LOCAL.md](SUPABASE_LOCAL.md). A presença das migrations
ou a aprovação de contratos estáticos não prova sua aplicação remota; use
[SUPABASE_NATIVE_MIGRATION.md](SUPABASE_NATIVE_MIGRATION.md) para a conferência.

## Conteúdo e arquivos

| Destino | Implementação no repositório |
| --- | --- |
| Vídeos de aula | IDs/links de provedor externo |
| Materiais legados | `apps/web/public/course-materials`; rota auxiliar de entrega em `/api/course-materials` |
| Assets administrados de curso | Bucket público `academy`, criado pela migration `017`; escrita limitada a staff pelas policies |
| Avatares e capas de portfólio | Bucket público `avatars`; escrita sob o prefixo do usuário pelas policies |
| Mídia do capítulo Orbi | WebP versionado em `public/images/games/orbi-chapter`, carregado pelo cliente |

`academy-materials`, citado em documentos anteriores, não é o bucket usado
pelo código atual. `uploadAcademyAsset()` usa `academy` e limita a entrada no
cliente a 25 MB; a migration `017` não define um limite de tamanho próprio.
A migration `018` define `avatars` com 15 MB por arquivo e sem restrição de MIME
no bucket. Os limites e tipos aceitos pela interface não comprovam os limites
configurados no serviço remoto.

A leitura dos buckets públicos dispensa sessão; as policies continuam
relevantes para escrita e gestão. Os arquivos sob `public` também são públicos.
Saves de jogos, rascunhos e retomada da prática permanecem no navegador por
conta; o capítulo do Orbi não adiciona sincronização Supabase nesta entrega.

## Cron anti-pausa

Documentos anteriores mencionam um cron externo diário. Não há definição desse
job no repositório; sua existência e destino não foram confirmados por esta
revisão. Verifique o provedor externo antes de depender dele.

## Fontes operacionais

Referências oficiais consultadas em 2026-11-04:

- [Vercel: ambientes de deployment](https://vercel.com/docs/deployments/environments).
- [Supabase: migrations locais](https://supabase.com/docs/guides/local-development/database-migrations).
- [Supabase: buckets públicos e privados](https://supabase.com/docs/guides/storage/buckets/fundamentals).

Elas explicam o funcionamento dos provedores e não confirmam plano, cotas,
configuração ou estado do projeto Orbitamos. Nenhuma cota gratuita fixa é
assumida neste documento.
