-- Orbitamos v3 - Painel admin da OrbitAcademy (cursos/modulos/aulas/materiais/quiz).
-- Executar depois de 015. Nao apaga dados.
--
-- A 006 so tinha leitura do conteudo PUBLICADO. Aqui liberamos escrita e leitura
-- completa (inclui rascunhos) para contas de staff, e adicionamos o quiz por aula.

drop policy if exists "staff manage courses" on public.courses;
create policy "staff manage courses" on public.courses
  for all to authenticated using (public.v3_is_staff()) with check (public.v3_is_staff());

drop policy if exists "staff manage modules" on public.course_modules;
create policy "staff manage modules" on public.course_modules
  for all to authenticated using (public.v3_is_staff()) with check (public.v3_is_staff());

drop policy if exists "staff manage lessons" on public.lessons;
create policy "staff manage lessons" on public.lessons
  for all to authenticated using (public.v3_is_staff()) with check (public.v3_is_staff());

drop policy if exists "staff manage lesson materials" on public.lesson_materials;
create policy "staff manage lesson materials" on public.lesson_materials
  for all to authenticated using (public.v3_is_staff()) with check (public.v3_is_staff());

-- Quiz por aula: modelo leve de autoteste, no formato que o aluno ja consome:
-- [{ "question": "...", "options": ["a","b","c"], "answer": "a" }]
alter table public.lessons
  add column if not exists quiz jsonb not null default '[]'::jsonb;
