-- Fase 5: Storage privado de áudios da sondagem

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
