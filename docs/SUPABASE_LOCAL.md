# Supabase local e testes de RLS

O ambiente local é descartável e não possui vínculo com o projeto hospedado.
Os scripts deste repositório não executam `supabase link`, `db push` ou qualquer
operação remota.

## Pré-requisitos

- Docker Desktop aberto e com o engine pronto;
- dependências de `apps/web` instaladas.

## Fluxo

Execute em `apps/web`:

```powershell
npm run supabase:start
npm run supabase:reset
npm run supabase:test
npm run supabase:stop
```

- `start` inicia Postgres, Auth, Storage e os demais serviços em containers locais;
- `reset` recria o banco vazio e aplica `supabase/migrations` em ordem;
- `test` executa os testes pgTAP de permissões;
- `stop` encerra os containers locais.

Esses comandos são exclusivos do banco descartável. Nunca executar reset ou seed
em produção para instalar a nova RPC. O usuário aplicará a migration 019 remota
depois, seguindo o [procedimento para projeto existente](SUPABASE_NATIVE_MIGRATION.md#instalar-somente-a-nova-019-em-um-projeto-existente).

O teste em `supabase/tests/database/rls.test.sql` cria identidades fictícias
dentro de uma transação e termina com `rollback`. Ele verifica, entre outros:

- isolamento do progresso entre estudantes;
- bloqueio de PII;
- bloqueio da lista de contatos para usuário comum;
- operações de vagas exclusivas de staff;
- solicitações de conta exclusivas de admin.

`supabase/tests/database/lesson_completion.test.sql` acrescenta 32 verificações
de conclusão e XP: prêmio fixo, replay, slugs legados, dados anteriores,
autorização/publicação, isolamento, bloqueio de writes diretos e rollback quando
o agregado falha. Também termina com `rollback`.

Para testar concorrência real com o container local iniciado:

```powershell
node scripts/test-lesson-completion-concurrency.mjs
```

O runner usa somente `supabase_db_orbitamos-local`, não aceita destino remoto e
remove suas fixtures fictícias no `finally`. Ele mantém a primeira transação
aberta, observa outra conclusão da mesma aula e uma aula distinta esperando
locks, e confere idempotência, fronteira de nível e isolamento de conta.

## Registro da rodada iniciada em 04/11/2026

Foram aprovadas 32/32 asserções da nova suíte e 14/14 da suíte RLS, via `psql`
no container local com `ON_ERROR_STOP=1`, sem linhas TAP `not ok`, ambas com
rollback. O runner de concorrência passou com duas sessões esperando locks e
prêmios `[10, 0, 10]`; duas conclusões, XP `90 -> 10`, nível `3 -> 4` e outra
conta inalterada.

A suíte RLS modela grants legados mínimos de contatos, vagas, solicitações e
colunas públicas de perfil somente dentro da fixture transacional: o CLI recente
não os concedeu implicitamente. A fixture de staff usa `is_internal`, como a
policy de contatos exige. Essas permissões são revertidas no rollback, sem
alterar grants de produção. A suíte da 019 usa os grants de progresso dessa
migration.

A stack completa teve timeout do pg-delta e essa tentativa não foi contada como
sucesso. A validação efetiva usou `node scripts/supabase-local.mjs db start`
para Postgres isolado, 005–019 e reaplicação da versão final de 019 apenas nesse
banco descartável. O ambiente local foi encerrado com volumes preservados.
Nenhum SQL remoto foi executado; ver
[ESCALABILIDADE_SEM_CUSTO.md](ESCALABILIDADE_SEM_CUSTO.md) para escopo e limites.

## Endereços locais padrão

| Serviço | Endereço |
| --- | --- |
| API | `http://127.0.0.1:54321` |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio | `http://127.0.0.1:54323` |
| Caixa de email local | `http://127.0.0.1:54324` |

As chaves locais exibidas por `supabase status` são descartáveis. Não substitua
as variáveis da Vercel e não copie dados reais para os testes.

## Segurança operacional

- Nunca use `supabase link` durante testes locais.
- Nunca execute `supabase db push` sem uma revisão específica para produção.
- Mudanças novas de banco devem entrar como uma nova migration timestampada.
- Execute `npm run test:supabase:contracts` mesmo quando Docker não estiver disponível.
