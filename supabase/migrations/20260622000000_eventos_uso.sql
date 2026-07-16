-- Piloto Santarém: telemetria leve de uso do app (sem dado de aluno)
-- Ver docs/PLANO_PILOTO_SANTAREM.md, seção 4

create table public.eventos_uso (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  tipo_evento text not null check (
    tipo_evento in (
      'login',
      'sondagem_iniciada',
      'avaliacao_salva',
      'upload_audio_falhou',
      'ia_concluida',
      'nivel_alterado_pelo_professor',
      'erro_app'
    )
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_eventos_uso_usuario on public.eventos_uso(usuario_id);
create index idx_eventos_uso_tipo on public.eventos_uso(tipo_evento);
create index idx_eventos_uso_created_at on public.eventos_uso(created_at);

alter table public.eventos_uso enable row level security;

-- Só insert: o cliente registra os próprios eventos, mas não precisa lê-los de volta.
-- Análise agregada é feita via service role (MCP / painel do Supabase).
create policy "Usuarios registram os proprios eventos de uso"
  on public.eventos_uso
  for insert
  to authenticated
  with check (auth.uid() = usuario_id);
