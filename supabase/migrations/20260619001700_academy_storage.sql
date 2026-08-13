-- Orbitamos v3 - Storage da OrbitAcademy (capas de curso e materiais de aula).
-- Executar depois de 016.
--
-- Bucket publico 'academy': leitura por todos, escrita/edicao/remocao so por staff.

insert into storage.buckets (id, name, public)
values ('academy', 'academy', true)
on conflict (id) do nothing;

drop policy if exists "academy public read" on storage.objects;
create policy "academy public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'academy');

drop policy if exists "academy staff insert" on storage.objects;
create policy "academy staff insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'academy' and public.v3_is_staff());

drop policy if exists "academy staff update" on storage.objects;
create policy "academy staff update" on storage.objects
  for update to authenticated
  using (bucket_id = 'academy' and public.v3_is_staff())
  with check (bucket_id = 'academy' and public.v3_is_staff());

drop policy if exists "academy staff delete" on storage.objects;
create policy "academy staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'academy' and public.v3_is_staff());
