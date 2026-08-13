begin;

create extension if not exists pgtap with schema extensions;
select plan(14);

-- Stable, fake identities used only inside this rolled-back transaction.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student-a@local.test', '', '{"provider":"email","providers":["email"]}', '{"name":"Student A","role":"STUDENT"}', now(), now()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student-b@local.test', '', '{"provider":"email","providers":["email"]}', '{"name":"Student B","role":"STUDENT"}', now(), now()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff@local.test', '', '{"provider":"email","providers":["email"]}', '{"name":"Staff","role":"FREELANCER"}', now(), now()),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@local.test', '', '{"provider":"email","providers":["email"]}', '{"name":"Admin","role":"FREELANCER"}', now(), now());

update public.v3_profiles set admin_role = 'staff' where id = '10000000-0000-0000-0000-000000000003';
update public.v3_profiles set admin_role = 'admin' where id = '10000000-0000-0000-0000-000000000004';

insert into public.v3_contacts (name, email, message)
values ('Contato local', 'contact@local.test', 'Teste de RLS');

insert into public.v3_jobs (title, description, status, published_at)
values ('Vaga local', 'Somente para testes', 'open', now());

insert into public.v3_account_requests (user_id, type, reason)
values ('10000000-0000-0000-0000-000000000001', 'data_export', 'Teste local');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

select is(
  (select count(*) from public.v3_user_progress where user_id = '10000000-0000-0000-0000-000000000001'),
  1::bigint,
  'student reads own progress'
);
select is(
  (select count(*) from public.v3_user_progress where user_id = '10000000-0000-0000-0000-000000000002'),
  0::bigint,
  'student cannot read another progress'
);
select is(
  (with changed as (
    update public.v3_user_progress set xp = 50
    where user_id = '10000000-0000-0000-0000-000000000001'
    returning 1
  ) select count(*) from changed),
  1::bigint,
  'student updates own progress'
);
select is(
  (with changed as (
    update public.v3_user_progress set xp = 50
    where user_id = '10000000-0000-0000-0000-000000000002'
    returning 1
  ) select count(*) from changed),
  0::bigint,
  'student cannot update another progress'
);
select is((select count(*) from public.v3_contacts), 0::bigint, 'student cannot list contacts');
select throws_ok(
  $$ select phone from public.v3_profiles limit 1 $$,
  'student cannot select protected PII columns'
);
select is((select count(*) from public.v3_jobs where status = 'open'), 1::bigint, 'student reads open jobs');
select throws_ok(
  $$ insert into public.v3_jobs (title, status) values ('Forbidden', 'open') $$,
  'student cannot create jobs'
);
select is((select count(*) from public.v3_account_requests), 1::bigint, 'student reads own account request');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select is((select count(*) from public.v3_account_requests), 0::bigint, 'another student cannot read account request');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}', true);
select is((select count(*) from public.v3_contacts), 1::bigint, 'staff reads contacts');
select lives_ok(
  $$ insert into public.v3_jobs (title, description, status) values ('Staff job', 'Created by test staff', 'open') $$,
  'staff creates jobs'
);
select is((select count(*) from public.v3_account_requests), 0::bigint, 'staff cannot manage admin-only account requests');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}', true);
select is((select count(*) from public.v3_account_requests), 1::bigint, 'admin reads account requests');

select * from finish();
rollback;
