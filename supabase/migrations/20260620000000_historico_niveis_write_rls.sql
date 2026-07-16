-- Fase 7: Histórico de níveis gerado pela análise/validação da avaliação

alter table public.historico_niveis enable row level security;

create unique index if not exists idx_historico_niveis_avaliacao
  on public.historico_niveis(avaliacao_id);

create policy "Usuarios criam historico dos alunos da escola"
  on public.historico_niveis
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.alunos
      join public.turmas on turmas.id = alunos.turma_id
      join public.usuarios on usuarios.escola_id = turmas.escola_id
      where alunos.id = aluno_id
        and usuarios.id = auth.uid()
    )
  );

create policy "Usuarios atualizam historico dos alunos da escola"
  on public.historico_niveis
  for update
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
  )
  with check (
    exists (
      select 1
      from public.alunos
      join public.turmas on turmas.id = alunos.turma_id
      join public.usuarios on usuarios.escola_id = turmas.escola_id
      where alunos.id = aluno_id
        and usuarios.id = auth.uid()
    )
  );
