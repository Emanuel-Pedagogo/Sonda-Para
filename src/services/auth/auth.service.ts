import { Platform } from 'react-native';

import { supabase } from '@/src/lib/supabase/client';
import { registrarEvento } from '@/src/services/telemetria/telemetria.service';
import type { Usuario } from '@/src/types/database';

export async function signIn(email: string, password: string) {
  const result = await supabase.auth.signInWithPassword({ email, password });

  if (!result.error && result.data.user) {
    void registrarEvento({ usuarioId: result.data.user.id, tipoEvento: 'login' });
  }

  return result;
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const redirectTo =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? `${window.location.origin}/login`
      : undefined;

  return supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
}

export async function getSession() {
  return supabase.auth.getSession();
}

export async function getUsuarioProfile(userId: string): Promise<Usuario | null> {
  const { data, error } = await supabase.from('usuarios').select('*').eq('id', userId).single();

  if (error) {
    return null;
  }

  return data;
}
