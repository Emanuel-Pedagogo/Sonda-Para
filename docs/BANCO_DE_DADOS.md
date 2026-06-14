# BANCO DE DADOS - SONDA PARÁ

## Objetivo

Definir a estrutura de dados do sistema Sonda Pará utilizando Supabase PostgreSQL.

---

# Tabela: escolas

```sql
create table escolas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  municipio text,
  created_at timestamp default now()
);
```

Finalidade:

Armazenar as escolas participantes.

---

# Tabela: usuarios

```sql
create table usuarios (
  id uuid primary key,
  nome text not null,
  email text unique not null,
  perfil text not null,
  escola_id uuid references escolas(id),
  created_at timestamp default now()
);
```

Perfis:

* professor
* coordenador

---

# Tabela: turmas

```sql
create table turmas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid references escolas(id),
  nome text not null,
  ano_escolar integer not null,
  created_at timestamp default now()
);
```

Exemplos:

* 1º Ano A
* 2º Ano B

---

# Tabela: alunos

```sql
create table alunos (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid references turmas(id),
  nome text not null,
  data_nascimento date,
  created_at timestamp default now()
);
```

---

# Tabela: sondagens

```sql
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
```

Exemplo:

Sondagem Setembro 2026

---

# Tabela: avaliacoes

```sql
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
```

---

# Tabela: historico_niveis

```sql
create table historico_niveis (
  id uuid primary key default gen_random_uuid(),

  aluno_id uuid references alunos(id),

  avaliacao_id uuid references avaliacoes(id),

  nivel text,

  data_avaliacao date
);
```

Objetivo:

Facilitar geração de gráficos.

---

# Tabela: logs_ia

```sql
create table logs_ia (
  id uuid primary key default gen_random_uuid(),

  avaliacao_id uuid references avaliacoes(id),

  prompt text,

  resposta text,

  created_at timestamp default now()
);
```

Objetivo:

Auditoria e melhoria da IA.

---

# Storage Supabase

Bucket:

audios-sondagem

Estrutura:

audios-sondagem/

2026/

09/

escola-id/

turma-id/

aluno-id.wav

---

# Índices Recomendados

```sql
create index idx_alunos_turma
on alunos(turma_id);

create index idx_avaliacoes_aluno
on avaliacoes(aluno_id);

create index idx_avaliacoes_sondagem
on avaliacoes(sondagem_id);
```

---

# Preparação para Integrações Futuras

Todos os IDs devem utilizar UUID.

Isso permitirá integração futura com:

* Sistema de Gestão Pedagógica
* Karaokê da Leitura
* Painel Alfabetiza
