-- Dados mínimos para testar a Fase 2 no app.
--
-- 1. Copie o ID do usuário em Supabase > Authentication > Users.
-- 2. Substitua USER_UUID abaixo por esse ID.
-- 3. Execute este arquivo no SQL Editor.

do $$
declare
  target_user_id uuid := 'USER_UUID';
  escola_demo_id uuid;
  turma_1a_id uuid;
  turma_2a_id uuid;
begin
  insert into public.escolas (nome, municipio)
  values ('Escola Municipal de Demonstração', 'Município Demo')
  returning id into escola_demo_id;

  update public.usuarios
  set escola_id = escola_demo_id
  where id = target_user_id;

  insert into public.turmas (escola_id, nome, ano_escolar)
  values (escola_demo_id, '1º Ano A', 1)
  returning id into turma_1a_id;

  insert into public.turmas (escola_id, nome, ano_escolar)
  values (escola_demo_id, '2º Ano A', 2)
  returning id into turma_2a_id;

  insert into public.alunos (turma_id, nome)
  values
    (turma_1a_id, 'João Silva'),
    (turma_1a_id, 'Maria Souza'),
    (turma_1a_id, 'Ana Pereira'),
    (turma_2a_id, 'Pedro Santos'),
    (turma_2a_id, 'Luiza Costa');
end $$;
