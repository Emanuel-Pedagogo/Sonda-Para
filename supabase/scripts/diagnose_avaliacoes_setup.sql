-- Diagnóstico: por que salvar avaliação pode falhar
-- Substitua USER_UUID pelo ID em Authentication > Users.

-- 1. Usuário vinculado à escola?
select id, nome, email, escola_id
from public.usuarios
where id = '3e37c890-7133-495f-8127-ce4f58a3f64b';

-- 2. Políticas de escrita em avaliacoes existem?
select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'avaliacoes'
order by policyname;

-- 3. Índice único para upsert existe?
select indexname
from pg_indexes
where schemaname = 'public'
  and tablename = 'avaliacoes'
  and indexname = 'idx_avaliacoes_aluno_sondagem';
