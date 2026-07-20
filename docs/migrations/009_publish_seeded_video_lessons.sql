-- Corrige o seed de 20/07/2026 que inseriu as novas aulas sem is_published.
--
-- O schema define lessons.is_published como false por padrão. A rota de seed
-- populou youtube_video_id, mas não enviou is_published = true. Por causa da
-- RLS, alunos autenticados continuaram vendo apenas as aulas legadas.
--
-- Os módulos criados por esse seed usam o formato "<course-slug>-mN".
-- Esta migration é idempotente e não remove os módulos antigos, preservando
-- qualquer progresso já associado às aulas legadas.

begin;

update public.lessons as lesson
set
  is_published = true,
  updated_at = now()
from public.course_modules as module
join public.courses as course on course.id = module.course_id
where lesson.module_id = module.id
  and module.slug ~ ('^' || course.slug || '-m[0-9]+$')
  and lesson.youtube_video_id is not null
  and length(trim(lesson.youtube_video_id)) > 0
  and lesson.is_published = false;

commit;

-- Verificação esperada após executar:
-- select
--   count(*) as aulas_publicadas,
--   count(*) filter (where l.youtube_video_id is not null) as aulas_com_video
-- from public.lessons l
-- join public.course_modules m on m.id = l.module_id
-- join public.courses c on c.id = m.course_id
-- where m.slug ~ ('^' || c.slug || '-m[0-9]+$')
--   and l.is_published = true;
