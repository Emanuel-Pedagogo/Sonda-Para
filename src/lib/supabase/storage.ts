import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import {
  STORAGE_BUCKET,
  audioContentTypeForExtension,
  buildAudioPath,
  extensionFromPath,
} from '@/src/constants/storage';

import { supabase } from './client';

export async function uploadAudio(params: {
  ano: number;
  mes: number;
  escolaId: string;
  turmaId: string;
  alunoId: string;
  file: Blob | ArrayBuffer;
  extension?: string;
  contentType?: string;
}): Promise<string> {
  const extension = params.extension ?? '.m4a';
  const path = buildAudioPath({ ...params, extension });
  const contentType = params.contentType ?? audioContentTypeForExtension(extension);

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, params.file, {
    upsert: true,
    contentType,
  });

  if (error) {
    throw error;
  }

  return path;
}

export async function getSignedAudioUrl(path: string, expiresInSeconds = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function readAudioFileAsArrayBuffer(localUri: string): Promise<ArrayBuffer> {
  if (Platform.OS !== 'web') {
    try {
      return await new File(localUri).arrayBuffer();
    } catch {
      throw new Error('Não foi possível ler o arquivo de áudio gravado.');
    }
  }

  const response = await fetch(localUri);
  if (!response.ok) {
    throw new Error('Não foi possível ler o arquivo de áudio gravado.');
  }

  return response.arrayBuffer();
}

export function guessContentTypeFromPath(path: string): string {
  return audioContentTypeForExtension(extensionFromPath(path));
}
