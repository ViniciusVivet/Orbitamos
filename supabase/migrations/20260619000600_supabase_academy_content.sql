-- Orbitamos - estrutura academica no Supabase
-- Execute depois de docs/migrations/005_supabase_native_platform.sql
-- Esta migration nao apaga dados. Ela prepara cursos, aulas, materiais, quizzes e progresso por aula.

create extension if not exists pgcrypto;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_url text,
  level text,
  is_published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(course_id, slug)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  youtube_video_id text,
  content text,
  duration_seconds integer,
  is_published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(module_id, slug)
);

create table if not exists public.lesson_materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  kind text not null default 'PDF',
  file_url text,
  external_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz,
  last_watched_seconds integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id, lesson_id)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  description text,
  pass_score integer not null default 70,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quizzes_scope_check check (
    (lesson_id is not null and course_id is null) or
    (lesson_id is null and course_id is not null)
  )
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  explanation text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  label text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_correct_options (
  question_id uuid primary key references public.quiz_questions(id) on delete cascade,
  option_id uuid not null references public.quiz_options(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null default 0,
  passed boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_course_modules_course_position on public.course_modules(course_id, position);
create index if not exists idx_lessons_module_position on public.lessons(module_id, position);
create index if not exists idx_lesson_materials_lesson_position on public.lesson_materials(lesson_id, position);
create index if not exists idx_lesson_progress_user on public.lesson_progress(user_id, updated_at desc);
create index if not exists idx_quiz_attempts_user_quiz on public.quiz_attempts(user_id, quiz_id, created_at desc);

drop trigger if exists update_courses_updated_at on public.courses;
create trigger update_courses_updated_at before update on public.courses
for each row execute function public.v3_touch_updated_at();

drop trigger if exists update_course_modules_updated_at on public.course_modules;
create trigger update_course_modules_updated_at before update on public.course_modules
for each row execute function public.v3_touch_updated_at();

drop trigger if exists update_lessons_updated_at on public.lessons;
create trigger update_lessons_updated_at before update on public.lessons
for each row execute function public.v3_touch_updated_at();

drop trigger if exists update_lesson_progress_updated_at on public.lesson_progress;
create trigger update_lesson_progress_updated_at before update on public.lesson_progress
for each row execute function public.v3_touch_updated_at();

drop trigger if exists update_quizzes_updated_at on public.quizzes;
create trigger update_quizzes_updated_at before update on public.quizzes
for each row execute function public.v3_touch_updated_at();

alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_materials enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.quiz_correct_options enable row level security;
alter table public.quiz_attempts enable row level security;

drop policy if exists "Public can read published courses" on public.courses;
create policy "Public can read published courses" on public.courses
for select using (is_published = true);

drop policy if exists "Authenticated can read published modules" on public.course_modules;
create policy "Authenticated can read published modules" on public.course_modules
for select using (
  auth.uid() is not null and exists (
    select 1 from public.courses c
    where c.id = course_modules.course_id and c.is_published = true
  )
);

drop policy if exists "Authenticated can read published lessons" on public.lessons;
create policy "Authenticated can read published lessons" on public.lessons
for select using (
  auth.uid() is not null and is_published = true and exists (
    select 1
    from public.course_modules cm
    join public.courses c on c.id = cm.course_id
    where cm.id = lessons.module_id and c.is_published = true
  )
);

drop policy if exists "Authenticated can read lesson materials" on public.lesson_materials;
create policy "Authenticated can read lesson materials" on public.lesson_materials
for select using (
  auth.uid() is not null and exists (
    select 1
    from public.lessons l
    join public.course_modules cm on cm.id = l.module_id
    join public.courses c on c.id = cm.course_id
    where l.id = lesson_materials.lesson_id
      and l.is_published = true
      and c.is_published = true
  )
);

drop policy if exists "Users can read own lesson progress" on public.lesson_progress;
create policy "Users can read own lesson progress" on public.lesson_progress
for select using (auth.uid() = user_id);

drop policy if exists "Users can upsert own lesson progress" on public.lesson_progress;
create policy "Users can upsert own lesson progress" on public.lesson_progress
for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own lesson progress" on public.lesson_progress;
create policy "Users can update own lesson progress" on public.lesson_progress
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Authenticated can read published quizzes" on public.quizzes;
create policy "Authenticated can read published quizzes" on public.quizzes
for select using (auth.uid() is not null and is_published = true);

drop policy if exists "Authenticated can read quiz questions" on public.quiz_questions;
create policy "Authenticated can read quiz questions" on public.quiz_questions
for select using (
  auth.uid() is not null and exists (
    select 1 from public.quizzes q
    where q.id = quiz_questions.quiz_id and q.is_published = true
  )
);

drop policy if exists "Authenticated can read quiz options" on public.quiz_options;
create policy "Authenticated can read quiz options" on public.quiz_options
for select using (
  auth.uid() is not null and exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_options.question_id and q.is_published = true
  )
);

drop policy if exists "Users can read own quiz attempts" on public.quiz_attempts;
create policy "Users can read own quiz attempts" on public.quiz_attempts
for select using (auth.uid() = user_id);

drop policy if exists "Users can create own quiz attempts" on public.quiz_attempts;
create policy "Users can create own quiz attempts" on public.quiz_attempts
for insert with check (auth.uid() = user_id);

-- Seed inicial equivalente ao conteudo estatico atual.
with course as (
  insert into public.courses (slug, title, description, level, is_published, position)
  values
    ('html-css-basico', 'HTML/CSS Basico', 'Fundamentos de marcacao e estilo para a web.', 'iniciante', true, 1),
    ('js-essencial', 'JS Essencial', 'JavaScript do zero ao essencial.', 'iniciante', true, 2),
    ('react-iniciantes', 'React para Iniciantes', 'Construa interfaces com React.', 'iniciante', true, 3)
  on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    level = excluded.level,
    is_published = excluded.is_published,
    position = excluded.position,
    updated_at = now()
  returning id, slug
),
modules as (
  insert into public.course_modules (course_id, slug, title, position)
  select c.id, m.slug, m.title, m.position
  from course c
  join (
    values
      ('html-css-basico', 'introducao', 'Introducao', 1),
      ('html-css-basico', 'primeiros-passos', 'Primeiros passos', 2),
      ('js-essencial', 'comecando-com-javascript', 'Comecando com JavaScript', 1),
      ('react-iniciantes', 'fundamentos', 'Fundamentos', 1)
  ) as m(course_slug, slug, title, position) on m.course_slug = c.slug
  on conflict (course_id, slug) do update set
    title = excluded.title,
    position = excluded.position,
    updated_at = now()
  returning id, slug
)
insert into public.lessons (module_id, slug, title, youtube_video_id, content, is_published, position)
select m.id, l.slug, l.title, l.youtube_video_id, l.content, true, l.position
from modules m
join (
  values
    ('introducao', 'introducao-dicas', 'Introducao e Dicas para quem esta comecando', 'b7re8uY8Pf4', '- O que e HTML e CSS' || chr(10) || '- Ferramentas necessarias', 1),
    ('introducao', 'instalando-ferramentas-windows', 'Instalando as ferramentas (Windows)', 'b7re8uY8Pf4', null, 2),
    ('introducao', 'instalando-ferramentas-mac', 'Instalando as ferramentas (Mac)', 'b7re8uY8Pf4', null, 3),
    ('primeiros-passos', 'estrutura-basica-html', 'Estrutura basica de um HTML', 'b7re8uY8Pf4', null, 1),
    ('primeiros-passos', 'seletores-css', 'Seletores CSS', 'b7re8uY8Pf4', null, 2),
    ('comecando-com-javascript', 'o-que-e-javascript', 'O que e JavaScript', 'b7re8uY8Pf4', null, 1),
    ('comecando-com-javascript', 'variaveis-e-tipos', 'Variaveis e tipos', 'b7re8uY8Pf4', null, 2),
    ('fundamentos', 'o-que-e-react', 'O que e React', 'b7re8uY8Pf4', null, 1),
    ('fundamentos', 'primeiro-componente', 'Seu primeiro componente', 'b7re8uY8Pf4', null, 2)
) as l(module_slug, slug, title, youtube_video_id, content, position) on l.module_slug = m.slug
on conflict (module_id, slug) do update set
  title = excluded.title,
  youtube_video_id = excluded.youtube_video_id,
  content = excluded.content,
  is_published = excluded.is_published,
  position = excluded.position,
  updated_at = now();

