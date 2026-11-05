-- Aula e XP sao uma unica transacao. Requer as migrations 005 a 018.
-- Nao recalcula XP nem concede premios retroativos: conclusoes anteriores ficam intactas.
begin;

create or replace function public.v3_complete_lesson(
  p_lesson_id text,
  p_course_slug text,
  p_expected_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_lesson_id uuid;
  v_lesson_uuid uuid;
  v_title text;
  v_completed_at timestamptz;
  v_newly_completed boolean;
  v_progress public.v3_user_progress%rowtype;
begin
  -- A identidade esperada impede atribuir uma fila local a outra conta apos troca de sessao.
  -- Ela nunca escolhe o dono da gravacao: todos os writes usam auth.uid().
  if v_user_id is null or p_expected_user_id is distinct from v_user_id then
    raise exception 'Authenticated session does not match completion owner' using errcode = '28000';
  end if;
  if nullif(btrim(p_lesson_id), '') is null or nullif(btrim(p_course_slug), '') is null then
    raise exception 'Lesson and course are required' using errcode = '22023';
  end if;

  if p_lesson_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_lesson_uuid := p_lesson_id::uuid;
  end if;

  -- IDs locais antigos sao slugs, nunca convertidos cegamente para UUID.
  -- Rejeitar slugs ambiguos evita premiar a aula errada em modulos duplicados.
  begin
    select l.id, l.title into strict v_lesson_id, v_title
    from public.lessons l
    join public.course_modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where c.slug = p_course_slug and c.is_published and l.is_published
      and ((v_lesson_uuid is not null and l.id = v_lesson_uuid)
        or (v_lesson_uuid is null and l.slug = p_lesson_id))
    for share of l, m, c;
  exception
    when no_data_found then
      raise exception 'Published lesson is not available in this course' using errcode = 'P0002';
    when too_many_rows then
      raise exception 'Lesson slug is ambiguous in this course' using errcode = '22023';
  end;

  -- O conflito bloqueia a mesma chave; apos a espera, WHERE reavalia a linha atual.
  -- Apenas o INSERT ou a transicao null -> concluida retorna uma linha e ganha XP.
  insert into public.lesson_progress (user_id, lesson_id, completed_at)
  values (v_user_id, v_lesson_id, now())
  on conflict (user_id, lesson_id) do update
    set completed_at = excluded.completed_at
    where public.lesson_progress.completed_at is null
  returning completed_at into v_completed_at;
  v_newly_completed := found;

  insert into public.v3_user_progress (user_id) values (v_user_id)
  on conflict (user_id) do nothing;

  if v_newly_completed then
    -- UPDATE calcula sobre a linha bloqueada mais recente, inclusive para aulas distintas.
    update public.v3_user_progress
    set xp = (xp + 10) % 100,
        level = level + (xp + 10) / 100,
        last_lesson = v_title
    where user_id = v_user_id
    returning * into v_progress;
  else
    select completed_at into v_completed_at from public.lesson_progress
    where user_id = v_user_id and lesson_id = v_lesson_id;
    select * into v_progress from public.v3_user_progress where user_id = v_user_id;
  end if;

  return jsonb_build_object(
    'lesson_id', v_lesson_id,
    'completed_at', v_completed_at,
    'newly_completed', v_newly_completed,
    'xp_awarded', case when v_newly_completed then 10 else 0 end,
    'progress', to_jsonb(v_progress) - 'user_id'
  );
end;
$$;

revoke all on function public.v3_complete_lesson(text, text, uuid) from public, anon;
grant execute on function public.v3_complete_lesson(text, text, uuid) to authenticated;

-- Defaults recentes do Supabase nao concedem mais SELECT implicitamente.
-- Estas duas leituras ja sao limitadas a auth.uid() pelas policies existentes.
grant select on public.lesson_progress, public.v3_user_progress to authenticated;

-- Impedir que o cliente contorne a RPC, infle XP, apague a chave idempotente ou
-- desmarque/reconclua a mesma aula. As policies de leitura/isolamento permanecem.
-- service_role e os triggers de provisionamento continuam com seus privilegios.
revoke insert, update, delete, truncate, references, trigger
  on public.lesson_progress, public.v3_user_progress from public, anon, authenticated;

notify pgrst, 'reload schema';
commit;
