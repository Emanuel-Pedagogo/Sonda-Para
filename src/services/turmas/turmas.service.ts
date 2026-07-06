import { supabase } from '@/src/lib/supabase/client';
import type { Turma } from '@/src/types/database';

export async function listTurmasByEscola(escolaId: string): Promise<Turma[]> {
  const { data, error } = await supabase
    .from('turmas')
    .select('*')
    .eq('escola_id', escolaId)
    .order('ano_escolar')
    .order('nome');

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getTurma(turmaId: string): Promise<Turma | null> {
  const { data, error } = await supabase.from('turmas').select('*').eq('id', turmaId).single();

  if (error) {
    return null;
  }

  return data;
}
