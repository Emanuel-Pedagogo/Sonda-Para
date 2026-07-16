-- Fase 6: Logs de IA visíveis e graváveis por usuários da escola da avaliação

alter table public.logs_ia enable row level security;

create policy "Usuarios veem logs de ia das avaliacoes da escola"
  on public.logs_ia
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.avaliacoes
      join public.alunos on alunos.id = avaliacoes.aluno_id
      join public.turmas on turmas.id = alunos.turma_id
      join public.usuarios on usuarios.escola_id = turmas.escola_id
      where avaliacoes.id = logs_ia.avaliacao_id
        and usuarios.id = auth.uid()
    )
  );

create policy "Usuarios criam logs de ia das avaliacoes da escola"
  on public.logs_ia
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.avaliacoes
      join public.alunos on alunos.id = avaliacoes.aluno_id
      join public.turmas on turmas.id = alunos.turma_id
      join public.usuarios on usuarios.escola_id = turmas.escola_id
      where avaliacoes.id = avaliacao_id
        and usuarios.id = auth.uid()
    )
  );
