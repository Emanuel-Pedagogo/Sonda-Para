import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View as RNView } from 'react-native';

import { KeyboardAwareScrollView } from '@/components/KeyboardAwareScrollView';
import { Text, View } from '@/components/Themed';
import {
  clearAvaliacaoSessao,
  loadAvaliacaoSessao,
  saveAvaliacaoSessao,
} from '@/src/services/avaliacao-sessao/avaliacao-sessao.storage';
import { listAlunosByTurma } from '@/src/services/alunos/alunos.service';
import { ensureAvaliacaoBasica } from '@/src/services/avaliacoes/avaliacoes.service';
import { getSondagem } from '@/src/services/sondagens/sondagens.service';
import { getTurma } from '@/src/services/turmas/turmas.service';
import type { AvaliacaoSessao } from '@/src/types/avaliacao-sessao';
import type { Aluno, Sondagem, Turma } from '@/src/types/database';
import { formatSondagemPeriodo } from '@/src/utils/sondagens';

function SondagemSection({ title, content }: { title: string; content: string | null }) {
  return (
    <RNView style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content?.trim() || 'Não informado'}</Text>
    </RNView>
  );
}

export default function AvaliarTurmaScreen() {
  const { id, sondagemId } = useLocalSearchParams<{ id: string; sondagemId: string }>();

  const [turma, setTurma] = useState<Turma | null>(null);
  const [sondagem, setSondagem] = useState<Sondagem | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoIndex, setAlunoIndex] = useState(0);
  const [avaliacaoIdsByAluno, setAvaliacaoIdsByAluno] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistSession = useCallback(
    async (index: number, ids: Record<string, string>) => {
      if (!id || !sondagemId) {
        return;
      }

      const sessao: AvaliacaoSessao = {
        turmaId: id,
        sondagemId,
        alunoIndex: index,
        avaliacaoIdsByAluno: ids,
        updatedAt: new Date().toISOString(),
      };

      await saveAvaliacaoSessao(sessao);
    },
    [id, sondagemId],
  );

  useEffect(() => {
    if (!id || !sondagemId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    Promise.all([
      getTurma(id),
      getSondagem(sondagemId),
      listAlunosByTurma(id),
      loadAvaliacaoSessao(id, sondagemId),
    ])
      .then(([turmaData, sondagemData, alunosData, sessao]) => {
        if (!turmaData || !sondagemData) {
          setError('Turma ou sondagem não encontrada.');
          return;
        }

        if (alunosData.length === 0) {
          setError('Esta turma não possui alunos para avaliar.');
        }

        setTurma(turmaData);
        setSondagem(sondagemData);
        setAlunos(alunosData);

        if (sessao && sessao.turmaId === id && sessao.sondagemId === sondagemId) {
          const maxIndex = Math.max(0, alunosData.length - 1);
          setAlunoIndex(Math.min(sessao.alunoIndex, maxIndex));
          setAvaliacaoIdsByAluno(sessao.avaliacaoIdsByAluno);
        }
      })
      .catch(() => setError('Não foi possível iniciar a avaliação.'))
      .finally(() => setIsLoading(false));
  }, [id, sondagemId]);

  const alunoAtual = alunos[alunoIndex];
  const totalAlunos = alunos.length;
  const isUltimoAluno = alunoIndex >= totalAlunos - 1;
  const isPrimeiroAluno = alunoIndex === 0;

  async function salvarAlunoAtual(): Promise<Record<string, string>> {
    if (!alunoAtual || !sondagemId) {
      return avaliacaoIdsByAluno;
    }

    const avaliacao = await ensureAvaliacaoBasica(alunoAtual.id, sondagemId);
    const nextIds = { ...avaliacaoIdsByAluno, [alunoAtual.id]: avaliacao.id };
    setAvaliacaoIdsByAluno(nextIds);
    return nextIds;
  }

  async function handleVoltarAluno() {
    if (isPrimeiroAluno || isSaving) {
      return;
    }

    const nextIndex = alunoIndex - 1;
    setAlunoIndex(nextIndex);
    await persistSession(nextIndex, avaliacaoIdsByAluno);
  }

  async function handleProximoAluno() {
    if (isUltimoAluno || isSaving || !alunoAtual) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const ids = await salvarAlunoAtual();
      const nextIndex = alunoIndex + 1;
      setAlunoIndex(nextIndex);
      await persistSession(nextIndex, ids);
    } catch {
      setError('Não foi possível salvar o progresso deste aluno.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFinalizar() {
    if (isSaving || !id || !sondagemId) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (alunoAtual) {
        await salvarAlunoAtual();
      }

      await clearAvaliacaoSessao(id, sondagemId);

      Alert.alert('Sondagem concluída', 'A avaliação da turma foi registrada com sucesso.', [
        {
          text: 'OK',
          onPress: () => router.replace({ pathname: '/turmas/[id]', params: { id } }),
        },
      ]);
    } catch {
      setError('Não foi possível finalizar a sondagem.');
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1B6CA8" size="large" />
        <Text style={styles.muted}>Preparando avaliação...</Text>
      </View>
    );
  }

  if (error || !turma || !sondagem || !alunoAtual) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Avaliação</Text>
        <Text style={styles.error}>
          {error ?? (totalAlunos === 0 ? 'Nenhum aluno nesta turma.' : 'Dados indisponíveis.')}
        </Text>
        {id ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace({ pathname: '/turmas/[id]', params: { id } })}
          >
            <Text style={styles.secondaryButtonText}>Voltar para turma</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} keyboardVerticalOffset={88}>
      <Text style={styles.badge}>
        Aluno {alunoIndex + 1} de {totalAlunos}
      </Text>
      <Text style={styles.title}>{alunoAtual.nome}</Text>
      <Text style={styles.subtitle}>
        {sondagem.titulo} · {formatSondagemPeriodo(sondagem.mes, sondagem.ano)}
      </Text>

      <SondagemSection title="Palavras" content={sondagem.palavras} />
      <SondagemSection title="Frase" content={sondagem.frase} />
      <SondagemSection title="Texto" content={sondagem.texto} />

      {avaliacaoIdsByAluno[alunoAtual.id] ? (
        <Text style={styles.savedHint}>Progresso deste aluno já salvo nesta sondagem.</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <RNView style={styles.actions}>
        <Pressable
          disabled={isPrimeiroAluno || isSaving}
          style={[styles.secondaryButton, (isPrimeiroAluno || isSaving) && styles.buttonDisabled]}
          onPress={handleVoltarAluno}
        >
          <Text style={styles.secondaryButtonText}>Voltar aluno</Text>
        </Pressable>

        {!isUltimoAluno ? (
          <Pressable
            disabled={isSaving}
            style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
            onPress={handleProximoAluno}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Próximo aluno</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            disabled={isSaving}
            style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
            onPress={handleFinalizar}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Finalizar</Text>
            )}
          </Pressable>
        )}
      </RNView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8EEF3',
    color: '#1B6CA8',
    fontWeight: '700',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.75,
    marginBottom: 20,
    lineHeight: 22,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.9,
  },
  savedHint: {
    fontSize: 14,
    color: '#1B7F4B',
    marginBottom: 8,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#1B6CA8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#1B6CA8',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  muted: {
    fontSize: 15,
    opacity: 0.75,
  },
  error: {
    color: '#B00020',
    fontSize: 15,
    marginBottom: 8,
  },
});
