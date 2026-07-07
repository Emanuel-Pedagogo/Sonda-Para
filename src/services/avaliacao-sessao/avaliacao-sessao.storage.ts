import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AvaliacaoSessao } from '@/src/types/avaliacao-sessao';

function sessionKey(turmaId: string, sondagemId: string): string {
  return `avaliacao_sessao:${turmaId}:${sondagemId}`;
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function loadAvaliacaoSessao(
  turmaId: string,
  sondagemId: string,
): Promise<AvaliacaoSessao | null> {
  const raw = await getItem(sessionKey(turmaId, sondagemId));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AvaliacaoSessao;
  } catch {
    return null;
  }
}

export async function saveAvaliacaoSessao(sessao: AvaliacaoSessao): Promise<void> {
  await setItem(
    sessionKey(sessao.turmaId, sessao.sondagemId),
    JSON.stringify({ ...sessao, updatedAt: new Date().toISOString() }),
  );
}

export async function clearAvaliacaoSessao(turmaId: string, sondagemId: string): Promise<void> {
  await removeItem(sessionKey(turmaId, sondagemId));
}
