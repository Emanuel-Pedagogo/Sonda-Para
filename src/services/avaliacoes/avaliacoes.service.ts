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

export async function getAvaliacaoByAlunoAndSondagem(
  alunoId: string,
  sondagemId: string,
): Promise<Avaliacao | null> {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('aluno_id', alunoId)
    .eq('sondagem_id', sondagemId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function ensureAvaliacaoBasica(
  alunoId: string,
  sondagemId: string,
): Promise<Avaliacao> {
  const existing = await getAvaliacaoByAlunoAndSondagem(alunoId, sondagemId);
  if (existing) {
    return existing;
  }

  return createAvaliacao({
    aluno_id: alunoId,
    sondagem_id: sondagemId,
    audio_url: null,
    transcricao: null,
    precisao: null,
    omissoes: null,
    substituicoes: null,
    fluencia: null,
    confianca_ia: null,
    nivel_sugerido: null,
    nivel_final: null,
    observacao_professor: null,
  });
}
