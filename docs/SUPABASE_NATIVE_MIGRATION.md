# Supabase nativo

Última atualização: 2026-07-28

Este documento descreve o estado implementado no repositório. Ele não afirma
que uma migration foi aplicada no banco remoto sem verificação no Supabase.

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
`018`, em ordem:

| Arquivo | Responsabilidade |
| --- | --- |
| `005_supabase_native_platform.sql` | Perfis, progresso, contato, fórum e chat |
| `006_supabase_academy_content.sql` | Cursos, aulas, materiais, quizzes e progresso |
| `007_security_hardening.sql` | Policies, colunas protegidas e storage de avatar |
| `008_course_materials_seed.sql` | Seed inicial de materiais |
| `009_publish_seeded_video_lessons.sql` | Publicação corretiva das aulas com vídeo |
| `010_collaborator_workspace.sql` | Perfis profissionais, vagas, candidaturas e projetos |
| `011_collaborator_preferences.sql` | Preferências e visibilidade profissional |
| `012_admin_operations_security.sql` | Staff/admin, notificações, portfólio e privacidade |
| `013_profiles_pii_hardening.sql` | Restrição de telefone, endereço e nascimento |
| `014_profile_email_hardening.sql` | Restrição do email de perfil |
| `015_contact_rate_limit.sql` | Rate limit persistente do contato |
| `016_academy_admin.sql` | Policies administrativas da academia |
| `017_academy_storage.sql` | Bucket e policies de materiais |
| `018_avatars_bucket_fix.sql` | Correção do bucket e MIME types de avatar |

Não pule as migrations de endurecimento. O frontend usa funções introduzidas
por elas, como `v3_get_my_profile`, `v3_is_staff`,
`v3_withdraw_application` e `v3_contact_rate_check`.

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

- `avatars`: público para leitura, escrita limitada pelas policies;
- `academy-materials`: público para leitura, gestão limitada a staff/admin.

Após aplicar `017` e `018`, confira em `Storage` os buckets, MIME types e
policies. Não torne a service role pública para contornar policy incorreta.

## Auth

Em `Authentication -> URL Configuration`:

```text
Site URL: https://www.orbitamosbr.com

Redirect URLs:
https://www.orbitamosbr.com/**
https://orbitamosbr.com/**
http://localhost:3000/**
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
