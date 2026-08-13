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

O teste em `supabase/tests/database/rls.test.sql` cria identidades fictícias
dentro de uma transação e termina com `rollback`. Ele verifica, entre outros:

- isolamento do progresso entre estudantes;
- bloqueio de PII;
- bloqueio da lista de contatos para usuário comum;
- operações de vagas exclusivas de staff;
- solicitações de conta exclusivas de admin.

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
