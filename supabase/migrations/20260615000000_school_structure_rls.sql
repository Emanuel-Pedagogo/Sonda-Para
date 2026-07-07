-- Fase 2: Estrutura escolar — leitura de escolas, turmas, alunos e histórico por escola

alter table public.escolas enable row level security;
alter table public.turmas enable row level security;
alter table public.alunos enable row level security;
alter table public.sondagens enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.historico_niveis enable row level security;

create policy "Usuarios veem propria escola"
  on public.escolas
  for select
  to authenticated
  using (
    id = (
      select escola_id
      from public.usuarios
      where usuarios.id = auth.uid()
    )
  );

create policy "Usuarios veem turmas da escola"
  on public.turmas
  for select
  to authenticated
  using (
    escola_id = (
      select escola_id
      from public.usuarios
      where usuarios.id = auth.uid()
    )
  );

create policy "Usuarios veem alunos das turmas da escola"
  on public.alunos
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.turmas
      join public.usuarios on usuarios.escola_id = turmas.escola_id
      where turmas.id = alunos.turma_id
        and usuarios.id = auth.uid()
    )
  );

create policy "Usuarios autenticados veem sondagens"
  on public.sondagens
  for select
  to authenticated
  using (true);

create policy "Usuarios veem avaliacoes dos alunos da escola"
  on public.avaliacoes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.alunos
      join public.turmas on turmas.id = alunos.turma_id
      join public.usuarios on usuarios.escola_id = turmas.escola_id
      where alunos.id = avaliacoes.aluno_id
        and usuarios.id = auth.uid()
    )
  );

create policy "Usuarios veem historico dos alunos da escola"
  on public.historico_niveis
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.alunos
      join public.turmas on turmas.id = alunos.turma_id
      join public.usuarios on usuarios.escola_id = turmas.escola_id
      where alunos.id = historico_niveis.aluno_id
        and usuarios.id = auth.uid()
    )
  );
