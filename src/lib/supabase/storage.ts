import { STORAGE_BUCKET, buildAudioPath } from '@/src/constants/storage';

import { supabase } from './client';

export async function uploadAudio(params: {
  ano: number;
  mes: number;
  escolaId: string;
  turmaId: string;
  alunoId: string;
  file: Blob | ArrayBuffer;
}): Promise<string> {
  const path = buildAudioPath(params);

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, params.file, {
    upsert: true,
    contentType: 'audio/wav',
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
