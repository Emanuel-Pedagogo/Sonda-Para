-- Fase 3: Sondagens — professores e coordenadores podem criar, editar e excluir

create policy "Usuarios autenticados criam sondagens"
  on public.sondagens
  for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados editam sondagens"
  on public.sondagens
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Usuarios autenticados excluem sondagens"
  on public.sondagens
  for delete
  to authenticated
  using (true);
