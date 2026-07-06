import { supabase } from '@/src/lib/supabase/client';
import type { Avaliacao, Database, HistoricoNivel } from '@/src/types/database';
import type { NivelLeitura } from '@/src/constants/niveis-leitura';

type AvaliacaoInsert = Database['public']['Tables']['avaliacoes']['Insert'];
type AvaliacaoUpdate = Database['public']['Tables']['avaliacoes']['Update'];

export async function createAvaliacao(payload: AvaliacaoInsert): Promise<Avaliacao> {
  const { data, error } = await supabase.from('avaliacoes').insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAvaliacao(
  avaliacaoId: string,
  payload: AvaliacaoUpdate,
): Promise<Avaliacao> {
  const { data, error } = await supabase
    .from('avaliacoes')
    .update(payload)
    .eq('id', avaliacaoId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function validarAvaliacao(params: {
  avaliacaoId: string;
  nivelFinal: NivelLeitura;
  observacao?: string;
}): Promise<Avaliacao> {
  return updateAvaliacao(params.avaliacaoId, {
    nivel_final: params.nivelFinal,
    observacao_professor: params.observacao ?? null,
  });
}

export async function listHistoricoByAluno(alunoId: string): Promise<HistoricoNivel[]> {
  const { data, error } = await supabase
    .from('historico_niveis')
    .select('*')
    .eq('aluno_id', alunoId)
    .order('data_avaliacao', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
