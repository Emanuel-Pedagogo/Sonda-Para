import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AvaliacaoSessao } from '@/src/types/avaliacao-sessao';

function sessionKey(turmaId: string, sondagemId: string): string {
  // SecureStore aceita apenas letras, números, ".", "-" e "_".
  return `avaliacao_sessao_${turmaId}_${sondagemId}`;
}

async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return globalThis.localStorage?.getItem(key) ?? null;
    }

    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  } catch {
    // Sessão local é opcional; não bloqueia o fluxo de avaliação.
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  } catch {
    // Ignora falha ao limpar sessão local.
  }
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
