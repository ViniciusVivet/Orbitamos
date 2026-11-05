begin;
create extension if not exists pgtap with schema extensions;
select plan(32);

-- Somente identidades ficticias; tudo termina com rollback.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('19000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'completion-a@local.test', '', '{"provider":"email","providers":["email"]}', '{"name":"Completion A","role":"STUDENT"}', now(), now()),
('19000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'completion-b@local.test', '', '{"provider":"email","providers":["email"]}', '{"name":"Completion B","role":"STUDENT"}', now(), now());
update public.v3_user_progress set xp = 90, level = 4 where user_id = '19000000-0000-0000-0000-000000000001';
update public.v3_user_progress set xp = 40, level = 2 where user_id = '19000000-0000-0000-0000-000000000002';
insert into public.courses(id, slug, title, is_published) values
('19000000-0000-0000-0000-000000000010', 'completion-test', 'Completion test', true),
('19000000-0000-0000-0000-000000000011', 'completion-hidden', 'Hidden course', false);
insert into public.course_modules(id, course_id, slug, title) values
('19000000-0000-0000-0000-000000000020', '19000000-0000-0000-0000-000000000010', 'test', 'Test'),
('19000000-0000-0000-0000-000000000021', '19000000-0000-0000-0000-000000000011', 'hidden', 'Hidden');
insert into public.lessons(id, module_id, slug, title, is_published) values
('19000000-0000-0000-0000-000000000031', '19000000-0000-0000-0000-000000000020', 'legacy-a1', 'Titulo do servidor', true),
('19000000-0000-0000-0000-000000000032', '19000000-0000-0000-0000-000000000020', 'legacy-completed', 'Already completed', true),
('19000000-0000-0000-0000-000000000033', '19000000-0000-0000-0000-000000000020', 'partially-watched', 'Partially watched', true),
('19000000-0000-0000-0000-000000000034', '19000000-0000-0000-0000-000000000020', 'draft', 'Draft', false),
('19000000-0000-0000-0000-000000000035', '19000000-0000-0000-0000-000000000021', 'hidden-course', 'Hidden course lesson', true),
('19000000-0000-0000-0000-000000000036', '19000000-0000-0000-0000-000000000020', 'atomic-failure', 'Falha forcada local', true);
insert into public.lesson_progress(user_id, lesson_id, completed_at, last_watched_seconds) values
('19000000-0000-0000-0000-000000000001', '19000000-0000-0000-0000-000000000032', '2001-01-01 00:00:00+00', 99),
('19000000-0000-0000-0000-000000000001', '19000000-0000-0000-0000-000000000033', null, 73);

select ok(not has_function_privilege('anon', 'public.v3_complete_lesson(text,text,uuid)', 'EXECUTE'), 'anonymous cannot execute completion RPC');
select ok(has_function_privilege('authenticated', 'public.v3_complete_lesson(text,text,uuid)', 'EXECUTE'), 'authenticated can execute completion RPC');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"19000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select is((public.v3_complete_lesson('legacy-a1','completion-test','19000000-0000-0000-0000-000000000001')->>'xp_awarded')::int, 10, 'first legacy slug completion awards exactly 10');
select is((select xp from public.v3_user_progress), 0, 'level boundary leaves zero remainder');
select is((select level from public.v3_user_progress), 5, 'level increases once');
select is((select last_lesson from public.v3_user_progress), 'Titulo do servidor', 'lesson title comes from database');
select is((public.v3_complete_lesson('19000000-0000-0000-0000-000000000031','completion-test','19000000-0000-0000-0000-000000000001')->>'xp_awarded')::int, 0, 'UUID replay of legacy slug does not award twice');
select is((public.v3_complete_lesson('legacy-completed','completion-test','19000000-0000-0000-0000-000000000001')->>'xp_awarded')::int, 0, 'preexisting completed row never invents retroactive XP');
select is((select completed_at from public.lesson_progress where lesson_id = '19000000-0000-0000-0000-000000000032'), '2001-01-01 00:00:00+00'::timestamptz, 'existing completion timestamp preserved');
select is((select xp from public.v3_user_progress), 0, 'preexisting achievements preserved without recalculation');
select is((public.v3_complete_lesson('partially-watched','completion-test','19000000-0000-0000-0000-000000000001')->>'xp_awarded')::int, 10, 'incomplete existing row transitions once');
select is((select last_watched_seconds from public.lesson_progress where lesson_id = '19000000-0000-0000-0000-000000000033'), 73, 'watch history preserved');
select is((select xp from public.v3_user_progress), 10, 'second distinct completion adds only 10');
select throws_ok($$select public.v3_complete_lesson('draft','completion-test','19000000-0000-0000-0000-000000000001')$$, 'P0002', null, 'draft lesson rejected');
select throws_ok($$select public.v3_complete_lesson('hidden-course','completion-hidden','19000000-0000-0000-0000-000000000001')$$, 'P0002', null, 'unpublished course rejected');
select throws_ok($$select public.v3_complete_lesson('19000000-0000-0000-0000-000000000031','another-course','19000000-0000-0000-0000-000000000001')$$, 'P0002', null, 'UUID cannot escape requested course');
select throws_ok($$select public.v3_complete_lesson('unknown-legacy','completion-test','19000000-0000-0000-0000-000000000001')$$, 'P0002', null, 'unknown local lesson remains local');
select throws_ok($$select public.v3_complete_lesson('legacy-a1','completion-test','19000000-0000-0000-0000-000000000002')$$, '28000', null, 'cannot write pending queue for another account');

select set_config('request.jwt.claims', '{"sub":"19000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
select is((select count(*) from public.lesson_progress where user_id = '19000000-0000-0000-0000-000000000001'), 0::bigint, 'lesson history isolated by account');
select is((select xp from public.v3_user_progress), 40, 'another account XP untouched');
select is((public.v3_complete_lesson('legacy-a1','completion-test','19000000-0000-0000-0000-000000000002')->>'xp_awarded')::int, 10, 'another account can independently complete same lesson');
select is((select xp from public.v3_user_progress), 50, 'second account gains only its own XP');
select throws_ok($$update public.v3_user_progress set xp = 99999$$, '42501', null, 'direct aggregate inflation denied');
select throws_ok($$insert into public.lesson_progress(user_id,lesson_id,completed_at) values ('19000000-0000-0000-0000-000000000002','19000000-0000-0000-0000-000000000033',now())$$, '42501', null, 'direct completion bypass denied');
select throws_ok($$delete from public.lesson_progress$$, '42501', null, 'cannot delete idempotency key and claim XP again');
select set_config('request.jwt.claims', '{}', true);
select throws_ok($$select public.v3_complete_lesson('legacy-a1','completion-test','19000000-0000-0000-0000-000000000001')$$, '28000', null, 'RPC requires auth uid even with authenticated database role');

reset role;
create function pg_temp.fail_completion_aggregate() returns trigger language plpgsql as $$begin raise exception 'forced aggregate failure' using errcode = 'P0001'; end;$$;
create trigger test_completion_aggregate_failure before update on public.v3_user_progress for each row when (new.last_lesson = 'Falha forcada local') execute function pg_temp.fail_completion_aggregate();
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"19000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
select throws_ok($$select public.v3_complete_lesson('atomic-failure','completion-test','19000000-0000-0000-0000-000000000001')$$, 'P0001', 'forced aggregate failure', 'aggregate failure aborts completion');
select is((select count(*) from public.lesson_progress where lesson_id = '19000000-0000-0000-0000-000000000036'), 0::bigint, 'failed transaction leaves no completed lesson');
select is((select xp from public.v3_user_progress), 10, 'failed transaction leaves XP unchanged');
select is((select level from public.v3_user_progress), 5, 'failed transaction leaves level unchanged');
select is((select count(*) from public.lesson_progress), 3::bigint, 'only expected own achievements exist');
select ok(not has_table_privilege('authenticated', 'public.lesson_progress', 'DELETE'), 'completion records cannot be reset by client');

select * from finish();
rollback;
