import { supabase } from '@/src/lib/supabase/client';
import type { Aluno } from '@/src/types/database';

export async function listAlunosByTurma(turmaId: string): Promise<Aluno[]> {
  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('turma_id', turmaId)
    .order('nome');

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getAluno(alunoId: string): Promise<Aluno | null> {
  const { data, error } = await supabase.from('alunos').select('*').eq('id', alunoId).single();

  if (error) {
    return null;
  }

  return data;
}
