# Supabase nativo

Revisão documental: **05/11/2026**. Nomes e comportamento conferidos no repositório.
A migration 019 foi testada em banco local descartável. Em 05/11/2026, o usuário
informou execução bem-sucedida do SQL no Supabase. Não houve nova validação
funcional remota autenticada pelos agentes; ver
[o registro da 019](ESCALABILIDADE_SEM_CUSTO.md).

Este documento distingue implementação, evidência local e relato do usuário;
o relato de aplicação não substitui verificação funcional no Supabase remoto.

## Pré-requisitos

- projeto Supabase;
- URL e anon key configuradas;
- acesso ao SQL Editor;
- backup antes de aplicar SQL em banco com dados reais.

As migrations são escritas para serem reaplicáveis onde possível, mas isso não
substitui backup e revisão.

## Ordem das migrations atuais

As migrations `001` a `004` em `docs/migrations` pertencem ao schema anterior.
As migrations atuais ficam em `supabase/migrations` e são aplicadas da `005` à
`019`, em ordem em uma instalação nova. A tabela é o inventário; um projeto
existente com 005–018 aplicadas recebe somente a nova 019, sem reaplicar seeds:

| Arquivo | Responsabilidade |
| --- | --- |
| [20260619000500_supabase_native_platform.sql](../supabase/migrations/20260619000500_supabase_native_platform.sql) | Perfis, progresso, contato, fórum e chat |
| [20260619000600_supabase_academy_content.sql](../supabase/migrations/20260619000600_supabase_academy_content.sql) | Cursos, aulas, materiais, quizzes e progresso |
| [20260619000700_security_hardening.sql](../supabase/migrations/20260619000700_security_hardening.sql) | Policies, colunas protegidas e storage de avatar |
| [20260619000800_course_materials_seed.sql](../supabase/migrations/20260619000800_course_materials_seed.sql) | Seed inicial de materiais |
| [20260619000900_publish_seeded_video_lessons.sql](../supabase/migrations/20260619000900_publish_seeded_video_lessons.sql) | Publicação corretiva das aulas com vídeo |
| [20260619001000_collaborator_workspace.sql](../supabase/migrations/20260619001000_collaborator_workspace.sql) | Perfis profissionais, vagas, candidaturas e projetos |
| [20260619001100_collaborator_preferences.sql](../supabase/migrations/20260619001100_collaborator_preferences.sql) | Preferências e visibilidade profissional |
| [20260619001200_admin_operations_security.sql](../supabase/migrations/20260619001200_admin_operations_security.sql) | Staff/admin, notificações, portfólio e privacidade |
| [20260619001300_profiles_pii_hardening.sql](../supabase/migrations/20260619001300_profiles_pii_hardening.sql) | Restrição de telefone, endereço e nascimento |
| [20260619001400_profile_email_hardening.sql](../supabase/migrations/20260619001400_profile_email_hardening.sql) | Restrição do email de perfil |
| [20260619001500_contact_rate_limit.sql](../supabase/migrations/20260619001500_contact_rate_limit.sql) | Rate limit persistente do contato |
| [20260619001600_academy_admin.sql](../supabase/migrations/20260619001600_academy_admin.sql) | Policies administrativas da academia |
| [20260619001700_academy_storage.sql](../supabase/migrations/20260619001700_academy_storage.sql) | Bucket e policies de materiais |
| [20260619001800_avatars_bucket_fix.sql](../supabase/migrations/20260619001800_avatars_bucket_fix.sql) | Correção do bucket e MIME types de avatar |
| [20260619001900_atomic_lesson_completion.sql](../supabase/migrations/20260619001900_atomic_lesson_completion.sql) | Conclusão e XP transacionais/idempotentes, leitura própria e bloqueio de escritas diretas de progresso |

Os números 005–019 são identificadores de sequência usados nos guias; o CLI usa
os nomes timestampados acima. Comentários em SQL histórico podem citar caminhos
anteriores em `docs/migrations`; isso não é motivo para renomear arquivos ou
reescrever migrations já aplicadas.

Não pule as migrations de endurecimento. O frontend usa funções introduzidas
por elas, como `v3_get_my_profile`, `v3_is_staff`,
`v3_withdraw_application` e `v3_contact_rate_check`.

## Instalar somente a nova 019 em um projeto existente

Procedimento de referência, preservado após o relato de sucesso de 05/11/2026.
Para uma instalação: conferir o projeto e o backup, comprovar os
pré-requisitos 005–018 e executar no SQL Editor somente o conteúdo integral de
[20260619001900_atomic_lesson_completion.sql](../supabase/migrations/20260619001900_atomic_lesson_completion.sql).
O arquivo já inclui transação e recarga do schema do PostgREST. Não usar reset,
seed ou reaplicação de 005–018 em produção para instalar essa função.

A RPC exige perfil provisionado, curso e aula publicados e sessão da conta
esperada. Aceita UUID ou slug legado no curso; não recalcula XP nem premia
conclusões anteriores. O cliente conserva a fila local enquanto a função estiver
ausente. Detalhes e evidência local:
[ESCALABILIDADE_SEM_CUSTO.md](ESCALABILIDADE_SEM_CUSTO.md).

## Como verificar aplicação

Antes de uma operação remota, prove a sequência no banco descartável seguindo
[SUPABASE_LOCAL.md](SUPABASE_LOCAL.md).

No SQL Editor, confirme pelo menos as estruturas esperadas:

```sql
select to_regclass('public.v3_profiles') as profiles;
select to_regclass('public.courses') as courses;
select to_regclass('public.v3_jobs') as jobs;
select to_regclass('public.v3_notifications') as notifications;
select to_regclass('public.v3_contact_attempts') as contact_attempts;
```

Confira funções:

```sql
select to_regprocedure('public.v3_complete_lesson(text,text,uuid)') as completion_rpc;

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'v3_get_my_profile',
    'v3_is_staff',
    'v3_is_admin',
    'v3_withdraw_application',
    'v3_contact_rate_check'
  )
order by routine_name;
```

Após instalar a 019, `completion_rpc` deve ser não nulo. Verifique os grants
sem gravar conclusões reais:

```sql
select
  has_function_privilege('authenticated', 'public.v3_complete_lesson(text,text,uuid)', 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('anon', 'public.v3_complete_lesson(text,text,uuid)', 'EXECUTE') as anon_can_execute;
```

Esperado: `true` para `authenticated`, `false` para `anon`. Presença e grants
não substituem validação funcional autenticada. Nenhuma dessas verificações foi
executada no projeto remoto nesta rodada.

Confira RLS:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename like 'v3_%'
order by tablename;
```

## Storage

Buckets esperados:

- `avatars`: público para leitura, escrita limitada pelas policies ao prefixo do
  usuário autenticado. A migration 018 define 15 MB por objeto e não limita MIME
  no bucket; o cliente valida e comprime imagens antes de enviar. O portfólio usa
  `<auth.uid>/portfolio/<uuid>.webp` nesse mesmo bucket.
- `academy`: público para leitura, gestão limitada a staff por policies que usam
  `v3_is_staff()`. A migration 017 não declara limite de tamanho; os 25 MB no
  helper `uploadAcademyAsset` são validação do cliente.

`academy-materials` era um nome obsoleto nesta documentação; não é o bucket
criado pelas migrations atuais. Arquivos de aula também podem existir em
`apps/web/public/course-materials`, conforme o fluxo de materiais.

Após aplicar `017` e `018`, confira em `Storage` os buckets, MIME types e
policies. Não torne a service role pública para contornar policy incorreta.

## Auth

Exemplo de configuração em `Authentication -> URL Configuration` (não é uma
confirmação do painel remoto atual). Ajuste os domínios e portas realmente usados:

```text
Site URL: https://www.orbitamosbr.com

Redirect URLs:
https://www.orbitamosbr.com/**
https://orbitamosbr.com/**
http://localhost:3000/**
http://localhost:3015/**
```

A política de confirmação de email é uma decisão operacional. Não a desligue
apenas para contornar SMTP sem registrar o risco.

## Validação funcional

Depois das migrations e do deploy, teste com contas separadas:

1. cadastro, login, refresh e logout;
2. leitura e edição do próprio perfil;
3. tentativa de ler PII de outro usuário;
4. avatar;
5. curso, material e progresso;
6. fórum e conversa;
7. vaga, candidatura e retirada;
8. acesso negado ao admin para usuário comum;
9. operações de staff/admin;
10. contato e resposta `429` após exceder o limite.

## Dados antigos

As migrations v3 não devem ser tratadas como ferramenta de exclusão do schema
legado. Migração de usuários exige conta correspondente no Supabase Auth e
perfil em `v3_profiles`. Planeje e valide essa migração separadamente.
