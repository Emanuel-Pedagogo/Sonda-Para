import { supabase } from '@/src/lib/supabase/client';
import type { Sondagem } from '@/src/types/database';

export type SondagemPayload = {
  titulo: string;
  mes: number | null;
  ano: number | null;
  palavras: string | null;
  frase: string | null;
  texto: string | null;
};

export async function listSondagens(): Promise<Sondagem[]> {
  const { data, error } = await supabase
    .from('sondagens')
    .select('*')
    .order('ano', { ascending: false, nullsFirst: false })
    .order('mes', { ascending: false, nullsFirst: false });

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

export async function createSondagem(payload: SondagemPayload): Promise<Sondagem> {
  const { data, error } = await supabase.from('sondagens').insert(payload).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateSondagem(
  sondagemId: string,
  payload: SondagemPayload,
): Promise<Sondagem> {
  const { data, error } = await supabase
    .from('sondagens')
    .update(payload)
    .eq('id', sondagemId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteSondagem(sondagemId: string): Promise<void> {
  const { error } = await supabase.from('sondagens').delete().eq('id', sondagemId);

  if (error) {
    throw error;
  }
}
