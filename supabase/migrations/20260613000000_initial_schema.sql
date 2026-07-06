-- Migration inicial conforme docs/BANCO_DE_DADOS.md

create table escolas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  municipio text,
  created_at timestamp default now()
);

create table usuarios (
  id uuid primary key,
  nome text not null,
  email text unique not null,
  perfil text not null check (perfil in ('professor', 'coordenador')),
  escola_id uuid references escolas(id),
  created_at timestamp default now()
);

create table turmas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid references escolas(id),
  nome text not null,
  ano_escolar integer not null,
  created_at timestamp default now()
);

create table alunos (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid references turmas(id),
  nome text not null,
  data_nascimento date,
  created_at timestamp default now()
);

create table sondagens (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mes integer,
  ano integer,
  palavras text,
  frase text,
  texto text,
  created_at timestamp default now()
);

create table avaliacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references alunos(id),
  sondagem_id uuid references sondagens(id),
  audio_url text,
  transcricao text,
  precisao numeric,
  omissoes integer,
  substituicoes integer,
  fluencia numeric,
  confianca_ia numeric,
  nivel_sugerido text,
  nivel_final text,
  observacao_professor text,
  created_at timestamp default now()
);

create table historico_niveis (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid references alunos(id),
  avaliacao_id uuid references avaliacoes(id),
  nivel text,
  data_avaliacao date
);

create table logs_ia (
  id uuid primary key default gen_random_uuid(),
  avaliacao_id uuid references avaliacoes(id),
  prompt text,
  resposta text,
  created_at timestamp default now()
);

create index idx_alunos_turma on alunos(turma_id);
create index idx_avaliacoes_aluno on avaliacoes(aluno_id);
create index idx_avaliacoes_sondagem on avaliacoes(sondagem_id);

-- Bucket de áudio conforme docs/BANCO_DE_DADOS.md
insert into storage.buckets (id, name, public)
values ('audios-sondagem', 'audios-sondagem', false)
on conflict (id) do nothing;
