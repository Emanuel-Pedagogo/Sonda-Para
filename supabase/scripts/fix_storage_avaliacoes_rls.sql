-- Corrige/reaplica RLS do bucket audios-sondagem (seguro para rodar mais de uma vez)

drop policy if exists "Usuarios leem audios da escola" on storage.objects;
drop policy if exists "Usuarios enviam audios da escola" on storage.objects;
drop policy if exists "Usuarios atualizam audios da escola" on storage.objects;

create policy "Usuarios leem audios da escola"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'audios-sondagem'
    and split_part(name, '/', 3) = (
      select escola_id::text
      from public.usuarios
      where id = auth.uid()
    )
  );

create policy "Usuarios enviam audios da escola"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'audios-sondagem'
    and split_part(name, '/', 3) = (
      select escola_id::text
      from public.usuarios
      where id = auth.uid()
    )
  );

create policy "Usuarios atualizam audios da escola"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'audios-sondagem'
    and split_part(name, '/', 3) = (
      select escola_id::text
      from public.usuarios
      where id = auth.uid()
    )
  )
  with check (
    bucket_id = 'audios-sondagem'
    and split_part(name, '/', 3) = (
      select escola_id::text
      from public.usuarios
      where id = auth.uid()
    )
  );
