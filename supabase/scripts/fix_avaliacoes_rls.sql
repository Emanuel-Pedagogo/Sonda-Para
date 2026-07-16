-- Corrige/reaplica RLS de escrita em avaliacoes (seguro para rodar mais de uma vez)

drop policy if exists "Usuarios criam avaliacoes dos alunos da escola" on public.avaliacoes;
drop policy if exists "Usuarios atualizam avaliacoes dos alunos da escola" on public.avaliacoes;

create policy "Usuarios criam avaliacoes dos alunos da escola"
  on public.avaliacoes
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

create policy "Usuarios atualizam avaliacoes dos alunos da escola"
  on public.avaliacoes
  for update
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

create unique index if not exists idx_avaliacoes_aluno_sondagem
  on public.avaliacoes(aluno_id, sondagem_id);
