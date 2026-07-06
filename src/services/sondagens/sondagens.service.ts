import { supabase } from '@/src/lib/supabase/client';
import type { Sondagem } from '@/src/types/database';

export async function listSondagens(): Promise<Sondagem[]> {
  const { data, error } = await supabase
    .from('sondagens')
    .select('*')
    .order('ano', { ascending: false })
    .order('mes', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getSondagem(sondagemId: string): Promise<Sondagem | null> {
  const { data, error } = await supabase
    .from('sondagens')
    .select('*')
    .eq('id', sondagemId)
    .single();

  if (error) {
    return null;
  }

  return data;
}
