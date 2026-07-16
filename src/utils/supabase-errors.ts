type SupabaseLikeError = {
  message?: string;
  code?: string;
};

export function getSupabaseErrorDetails(err: unknown): { message: string; code?: string } {
  if (err && typeof err === 'object') {
    const supabaseError = err as SupabaseLikeError;
    const message =
      supabaseError.message ?? (err instanceof Error ? err.message : 'Erro desconhecido');
    return { message, code: supabaseError.code };
  }

  if (err instanceof Error) {
    return { message: err.message };
  }

  return { message: 'Erro desconhecido' };
}

export function translateSupabaseError(message: string, code?: string): string {
  if (code === '42501' || message.includes('row-level security')) {
    return 'Sem permissão para salvar a avaliação. No Supabase SQL Editor, execute supabase/scripts/fix_avaliacoes_rls.sql. Se continuar, confira se seu usuário tem escola_id em public.usuarios (seed_demo_school.sql).';
  }

  if (code === '23505' || message.includes('duplicate key')) {
    return 'Esta avaliação já existe para este aluno e sondagem.';
  }

  if (message.includes('ON CONFLICT') || message.includes('unique or exclusion constraint')) {
    return 'Índice único de avaliações ausente. Execute supabase/scripts/fix_avaliacoes_rls.sql no Supabase.';
  }

  if (message.includes('JWT') || message.includes('session')) {
    return 'Sessão expirada. Faça login novamente.';
  }

  if (message.includes('storage') || message.includes('Bucket')) {
    return 'Sem permissão para salvar o áudio. Execute supabase/scripts/fix_storage_avaliacoes_rls.sql no Supabase.';
  }

  return message;
}
