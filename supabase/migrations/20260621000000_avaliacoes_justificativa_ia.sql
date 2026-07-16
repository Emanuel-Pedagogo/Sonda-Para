-- Fase 8: Justificativa pedagógica gerada pela IA

alter table public.avaliacoes
  add column if not exists justificativa_ia text;
