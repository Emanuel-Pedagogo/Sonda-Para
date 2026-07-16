import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View as RNView,
} from 'react-native';

import { AudioRecorderPanel } from '@/components/AudioRecorderPanel';
import { KeyboardAwareScrollView } from '@/components/KeyboardAwareScrollView';
import { Text, View } from '@/components/Themed';
import {
  clearAvaliacaoSessao,
  loadAvaliacaoSessao,
  saveAvaliacaoSessao,
} from '@/src/services/avaliacao-sessao/avaliacao-sessao.storage';
import {
  salvarAudioAvaliacao,
  type PendingAudioRecording,
} from '@/src/services/avaliacao-audio/avaliacao-audio.service';
import { listAlunosByTurma } from '@/src/services/alunos/alunos.service';
import {
  ensureAvaliacaoBasica,
  getAvaliacaoByAlunoAndSondagem,
  validarAvaliacao,
} from '@/src/services/avaliacoes/avaliacoes.service';
import { analisarAvaliacaoComIA } from '@/src/services/ia/avaliacao-ia.service';
import { getSondagem } from '@/src/services/sondagens/sondagens.service';
import { getTurma } from '@/src/services/turmas/turmas.service';
import { registrarEvento } from '@/src/services/telemetria/telemetria.service';
import { useAuthContext } from '@/src/contexts/AuthContext';
import { getNiveisLeituraList, type NivelLeitura } from '@/src/constants/niveis-leitura';
import type { AvaliacaoSessao } from '@/src/types/avaliacao-sessao';
import type { Aluno, Avaliacao, Sondagem, Turma } from '@/src/types/database';
import { formatSondagemPeriodo } from '@/src/utils/sondagens';
import { getSupabaseErrorDetails, translateSupabaseError } from '@/src/utils/supabase-errors';

function SondagemSection({ title, content }: { title: string; content: string | null }) {
  return (
    <RNView style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content?.trim() || 'Não informado'}</Text>
    </RNView>
  );
}

function ResultadoIAPanel({
  avaliacao,
  status,
  error,
}: {
  avaliacao: Avaliacao | null;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error: string | null;
}) {
  const hasResult = Boolean(
    avaliacao?.transcricao ||
    avaliacao?.nivel_sugerido ||
    avaliacao?.precisao != null ||
    avaliacao?.fluencia != null,
  );

  if (!hasResult && status === 'idle' && !error) {
    return null;
  }

  return (
    <RNView style={styles.analysisPanel}>
      <Text style={styles.analysisTitle}>Resultado preliminar da IA</Text>
      {status === 'processing' ? (
        <Text style={styles.analysisHint}>Analisando áudio em segundo plano...</Text>
      ) : null}
      {error ? <Text style={styles.analysisError}>{error}</Text> : null}
      {hasResult ? (
        <>
          {avaliacao?.nivel_sugerido ? (
            <Text style={styles.analysisLine}>Nível sugerido: {avaliacao.nivel_sugerido}</Text>
          ) : null}
          {avaliacao?.nivel_final ? (
            <Text style={styles.analysisLine}>Nível confirmado: {avaliacao.nivel_final}</Text>
          ) : null}
          {avaliacao?.precisao != null ? (
            <Text style={styles.analysisLine}>Precisão: {Math.round(avaliacao.precisao)}%</Text>
          ) : null}
          {avaliacao?.fluencia != null ? (
            <Text style={styles.analysisLine}>
              Fluência: {Math.round(avaliacao.fluencia)} palavras/min
            </Text>
          ) : null}
          {avaliacao?.omissoes != null || avaliacao?.substituicoes != null ? (
            <Text style={styles.analysisLine}>
              Omissões: {avaliacao.omissoes ?? 0} · Substituições: {avaliacao.substituicoes ?? 0}
            </Text>
          ) : null}
          {avaliacao?.transcricao ? (
            <Text style={styles.analysisTranscription} numberOfLines={4}>
              Transcrição: {avaliacao.transcricao}
            </Text>
          ) : null}
          {avaliacao?.justificativa_ia ? (
            <Text style={styles.analysisJustification} numberOfLines={4}>
              Justificativa: {avaliacao.justificativa_ia}
            </Text>
          ) : null}
        </>
      ) : null}
    </RNView>
  );
}

export default function AvaliarTurmaScreen() {
  const params = useLocalSearchParams<{ id: string | string[]; sondagemId: string | string[] }>();
  const turmaId = Array.isArray(params.id) ? params.id[0] : params.id;
  const activeSondagemId = Array.isArray(params.sondagemId)
    ? params.sondagemId[0]
    : params.sondagemId;
  const { usuario } = useAuthContext();

  const [turma, setTurma] = useState<Turma | null>(null);
  const [sondagem, setSondagem] = useState<Sondagem | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoIndex, setAlunoIndex] = useState(0);
  const [avaliacaoIdsByAluno, setAvaliacaoIdsByAluno] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingRecording, setPendingRecording] = useState<PendingAudioRecording | null>(null);
  const [existingAudioPath, setExistingAudioPath] = useState<string | null>(null);
  const [avaliacaoAtual, setAvaliacaoAtual] = useState<Avaliacao | null>(null);
  const [iaStatus, setIaStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [iaError, setIaError] = useState<string | null>(null);
  const [nivelFinalSelecionado, setNivelFinalSelecionado] = useState<NivelLeitura | null>(null);
  const [observacaoProfessor, setObservacaoProfessor] = useState('');
  const alunoAtualIdRef = useRef<string | null>(null);

  const handleRecordingChange = useCallback((recording: PendingAudioRecording | null) => {
    setPendingRecording(recording);
  }, []);

  const persistSession = useCallback(
    async (index: number, ids: Record<string, string>) => {
      if (!turmaId || !activeSondagemId) {
        return;
      }

      const sessao: AvaliacaoSessao = {
        turmaId,
        sondagemId: activeSondagemId,
        alunoIndex: index,
        avaliacaoIdsByAluno: ids,
        updatedAt: new Date().toISOString(),
      };

      await saveAvaliacaoSessao(sessao);
    },
    [turmaId, activeSondagemId],
  );

  useEffect(() => {
    if (!turmaId || !activeSondagemId) {
      setLoadError('Parâmetros da avaliação inválidos.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    setSaveError(null);

    Promise.all([
      getTurma(turmaId),
      getSondagem(activeSondagemId),
      listAlunosByTurma(turmaId),
      loadAvaliacaoSessao(turmaId, activeSondagemId),
    ])
      .then(([turmaData, sondagemData, alunosData, sessao]) => {
        if (!turmaData || !sondagemData) {
          setLoadError('Turma ou sondagem não encontrada.');
          return;
        }

        if (alunosData.length === 0) {
          setLoadError('Esta turma não possui alunos para avaliar.');
        }

        setTurma(turmaData);
        setSondagem(sondagemData);
        setAlunos(alunosData);

        if (sessao && sessao.turmaId === turmaId && sessao.sondagemId === activeSondagemId) {
          const maxIndex = Math.max(0, alunosData.length - 1);
          setAlunoIndex(Math.min(sessao.alunoIndex, maxIndex));
          setAvaliacaoIdsByAluno(sessao.avaliacaoIdsByAluno);
        }

        void registrarEvento({
          usuarioId: usuario?.id,
          tipoEvento: 'sondagem_iniciada',
          metadata: { turmaId, sondagemId: activeSondagemId, totalAlunos: alunosData.length },
        });
      })
      .catch(() => setLoadError('Não foi possível iniciar a avaliação.'))
      .finally(() => setIsLoading(false));
  }, [turmaId, activeSondagemId, usuario?.id]);

  const alunoAtual = alunos[alunoIndex];
  const niveisLeitura = useMemo(
    () => getNiveisLeituraList(turma?.ano_escolar ?? 3),
    [turma?.ano_escolar],
  );

  useEffect(() => {
    alunoAtualIdRef.current = alunoAtual?.id ?? null;
  }, [alunoAtual?.id]);

  useEffect(() => {
    if (!alunoAtual || !activeSondagemId) {
      setExistingAudioPath(null);
      setPendingRecording(null);
      setAvaliacaoAtual(null);
      setNivelFinalSelecionado(null);
      setObservacaoProfessor('');
      setIaStatus('idle');
      setIaError(null);
      return;
    }

    setPendingRecording(null);
    setIaStatus('idle');
    setIaError(null);
    getAvaliacaoByAlunoAndSondagem(alunoAtual.id, activeSondagemId)
      .then((avaliacao) => {
        setAvaliacaoAtual(avaliacao);
        setNivelFinalSelecionado(avaliacao?.nivel_final ?? avaliacao?.nivel_sugerido ?? null);
        setObservacaoProfessor(avaliacao?.observacao_professor ?? '');
        setExistingAudioPath(avaliacao?.audio_url ?? null);
      })
      .catch(() => {
        setAvaliacaoAtual(null);
        setNivelFinalSelecionado(null);
        setObservacaoProfessor('');
        setExistingAudioPath(null);
      });
  }, [alunoAtual, activeSondagemId]);
  const totalAlunos = alunos.length;
  const isUltimoAluno = alunoIndex >= totalAlunos - 1;
  const isPrimeiroAluno = alunoIndex === 0;

  async function executarAnaliseIA(params: {
    avaliacaoId: string;
    audioPath: string;
    durationMillis: number;
    alunoId: string;
  }): Promise<Avaliacao | null> {
    setIaStatus('processing');
    setIaError(null);

    try {
      const avaliacao = await analisarAvaliacaoComIA({
        avaliacaoId: params.avaliacaoId,
        audioPath: params.audioPath,
        tempoTotalSegundos: Math.max(1, Math.round(params.durationMillis / 1000)),
      });

      if (alunoAtualIdRef.current === params.alunoId) {
        setAvaliacaoAtual(avaliacao);
        setIaStatus('completed');
      }

      void registrarEvento({
        usuarioId: usuario?.id,
        tipoEvento: 'ia_concluida',
        metadata: { avaliacaoId: params.avaliacaoId, nivelSugerido: avaliacao.nivel_sugerido },
      });

      return avaliacao;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido na análise por IA.';
      if (alunoAtualIdRef.current === params.alunoId) {
        setIaStatus('error');
        setIaError(`Áudio salvo, mas a análise por IA não foi concluída: ${message}`);
      }

      void registrarEvento({
        usuarioId: usuario?.id,
        tipoEvento: 'erro_app',
        metadata: { contexto: 'analise_ia', avaliacaoId: params.avaliacaoId, mensagem: message },
      });

      return null;
    }
  }

  function dispararAnaliseIA(params: {
    avaliacaoId: string;
    audioPath: string;
    durationMillis: number;
    alunoId: string;
  }) {
    void executarAnaliseIA(params);
  }

  async function salvarAlunoAtual(
    options: { aguardarAnalise?: boolean } = {},
  ): Promise<Record<string, string>> {
    if (!alunoAtual || !activeSondagemId || !turma || !sondagem) {
      return avaliacaoIdsByAluno;
    }

    const avaliacao = await ensureAvaliacaoBasica(alunoAtual.id, activeSondagemId);
    let nextAvaliacao = avaliacao;

    if (pendingRecording) {
      const ano = sondagem.ano ?? new Date().getFullYear();
      const mes = sondagem.mes ?? new Date().getMonth() + 1;

      const audioPath = await salvarAudioAvaliacao({
        avaliacaoId: avaliacao.id,
        recording: pendingRecording,
        ano,
        mes,
        escolaId: turma.escola_id,
        turmaId: turma.id,
        alunoId: alunoAtual.id,
        usuarioId: usuario?.id,
      });

      setExistingAudioPath(audioPath);
      setPendingRecording(null);
      nextAvaliacao = { ...avaliacao, audio_url: audioPath };
      const analiseParams = {
        avaliacaoId: avaliacao.id,
        audioPath,
        durationMillis: pendingRecording.durationMillis,
        alunoId: alunoAtual.id,
      };

      if (options.aguardarAnalise) {
        nextAvaliacao = (await executarAnaliseIA(analiseParams)) ?? nextAvaliacao;
      } else {
        dispararAnaliseIA(analiseParams);
      }
    }

    const nextIds = { ...avaliacaoIdsByAluno, [alunoAtual.id]: avaliacao.id };
    setAvaliacaoAtual(nextAvaliacao);
    setAvaliacaoIdsByAluno(nextIds);

    void registrarEvento({
      usuarioId: usuario?.id,
      tipoEvento: 'avaliacao_salva',
      metadata: { avaliacaoId: avaliacao.id, comAudio: Boolean(nextAvaliacao.audio_url) },
    });

    return nextIds;
  }

  async function handleAnalisarGravacao() {
    if (isSaving || !alunoAtual) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (pendingRecording) {
        const ids = await salvarAlunoAtual({ aguardarAnalise: true });
        await persistSession(alunoIndex, ids);
        return;
      }

      if (avaliacaoAtual?.id && existingAudioPath) {
        await executarAnaliseIA({
          avaliacaoId: avaliacaoAtual.id,
          audioPath: existingAudioPath,
          durationMillis: 60000,
          alunoId: alunoAtual.id,
        });
      }
    } catch (err) {
      const { message, code } = getSupabaseErrorDetails(err);
      setSaveError(translateSupabaseError(message, code));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmarClassificacao() {
    if (isSaving || !avaliacaoAtual?.id || !nivelFinalSelecionado) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const avaliacao = await validarAvaliacao({
        avaliacaoId: avaliacaoAtual.id,
        nivelFinal: nivelFinalSelecionado,
        observacao: observacaoProfessor.trim() || undefined,
      });
      setAvaliacaoAtual(avaliacao);

      if (
        avaliacaoAtual.nivel_sugerido &&
        avaliacaoAtual.nivel_sugerido !== nivelFinalSelecionado
      ) {
        void registrarEvento({
          usuarioId: usuario?.id,
          tipoEvento: 'nivel_alterado_pelo_professor',
          metadata: {
            avaliacaoId: avaliacao.id,
            nivelSugerido: avaliacaoAtual.nivel_sugerido,
            nivelFinal: nivelFinalSelecionado,
          },
        });
      }

      Alert.alert('Classificação salva', 'O resultado do professor foi registrado no histórico.');
    } catch (err) {
      const { message, code } = getSupabaseErrorDetails(err);
      setSaveError(translateSupabaseError(message, code));
    } finally {
      setIsSaving(false);
    }
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
    setSaveError(null);

    try {
      const ids = await salvarAlunoAtual();
      const nextIndex = alunoIndex + 1;
      setAlunoIndex(nextIndex);
      await persistSession(nextIndex, ids);
    } catch (err) {
      const { message, code } = getSupabaseErrorDetails(err);
      setSaveError(translateSupabaseError(message, code));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFinalizar() {
    if (isSaving || !turmaId || !activeSondagemId) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (alunoAtual) {
        await salvarAlunoAtual();
      }

      await clearAvaliacaoSessao(turmaId, activeSondagemId);

      Alert.alert('Sondagem concluída', 'A avaliação da turma foi registrada com sucesso.', [
        {
          text: 'Ver consolidado',
          onPress: () =>
            router.replace({ pathname: '/turmas/[id]/consolidado', params: { id: turmaId } }),
        },
      ]);
    } catch (err) {
      const { message, code } = getSupabaseErrorDetails(err);
      setSaveError(translateSupabaseError(message, code));
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

  if (loadError || !turma || !sondagem || !alunoAtual) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Avaliação</Text>
        <Text style={styles.error}>
          {loadError ?? (totalAlunos === 0 ? 'Nenhum aluno nesta turma.' : 'Dados indisponíveis.')}
        </Text>
        {turmaId ? (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace({ pathname: '/turmas/[id]', params: { id: turmaId } })}
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

      <AudioRecorderPanel
        key={alunoAtual.id}
        disabled={isSaving}
        existingAudioPath={existingAudioPath}
        onRecordingChange={handleRecordingChange}
      />

      {pendingRecording ? (
        <Text style={styles.analysisHintText}>
          A análise será iniciada automaticamente ao avançar ou finalizar.
        </Text>
      ) : null}

      {!pendingRecording &&
      existingAudioPath &&
      !avaliacaoAtual?.transcricao &&
      iaStatus !== 'processing' ? (
        <Pressable
          disabled={isSaving}
          style={[styles.analysisButton, isSaving && styles.buttonDisabled]}
          onPress={handleAnalisarGravacao}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Tentar análise novamente</Text>
          )}
        </Pressable>
      ) : null}

      <ResultadoIAPanel avaliacao={avaliacaoAtual} status={iaStatus} error={iaError} />

      {avaliacaoAtual?.id ? (
        <RNView style={styles.validationPanel}>
          <Text style={styles.analysisTitle}>Classificação do professor</Text>
          <Text style={styles.analysisLine}>
            Confirme a sugestão da IA ou selecione outro nível conforme sua observação.
          </Text>

          <RNView style={styles.levelOptions}>
            {niveisLeitura.map((nivel) => (
              <Pressable
                key={nivel}
                disabled={isSaving}
                style={[
                  styles.levelOption,
                  nivelFinalSelecionado === nivel && styles.levelOptionSelected,
                  isSaving && styles.buttonDisabled,
                ]}
                onPress={() => setNivelFinalSelecionado(nivel)}
              >
                <Text
                  style={[
                    styles.levelOptionText,
                    nivelFinalSelecionado === nivel && styles.levelOptionTextSelected,
                  ]}
                >
                  {nivel}
                </Text>
              </Pressable>
            ))}
          </RNView>

          <TextInput
            editable={!isSaving}
            multiline
            placeholder="Observação pedagógica (opcional)"
            style={styles.observationInput}
            value={observacaoProfessor}
            onChangeText={setObservacaoProfessor}
          />

          <Pressable
            disabled={isSaving || !nivelFinalSelecionado}
            style={[
              styles.primaryButton,
              (isSaving || !nivelFinalSelecionado) && styles.buttonDisabled,
            ]}
            onPress={handleConfirmarClassificacao}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Confirmar classificação</Text>
            )}
          </Pressable>
        </RNView>
      ) : null}

      {avaliacaoIdsByAluno[alunoAtual.id] ? (
        <Text style={styles.savedHint}>Progresso deste aluno já salvo nesta sondagem.</Text>
      ) : null}

      {saveError ? <Text style={styles.error}>{saveError}</Text> : null}

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
              <Text style={styles.primaryButtonText}>Salvar e próximo aluno</Text>
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
              <Text style={styles.primaryButtonText}>Salvar e finalizar</Text>
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
  analysisPanel: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  analysisHint: {
    fontSize: 14,
    color: '#1B6CA8',
  },
  analysisHintText: {
    fontSize: 14,
    color: '#1B6CA8',
    marginBottom: 18,
  },
  analysisLine: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
  },
  analysisTranscription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  analysisJustification: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '600',
  },
  analysisError: {
    color: '#B00020',
    fontSize: 14,
  },
  analysisButton: {
    backgroundColor: '#1B6CA8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  validationPanel: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    backgroundColor: '#fff',
    gap: 12,
  },
  levelOptions: {
    gap: 8,
  },
  levelOption: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  levelOptionSelected: {
    borderColor: '#1B6CA8',
    backgroundColor: '#E8EEF3',
  },
  levelOptionText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '600',
  },
  levelOptionTextSelected: {
    color: '#1B6CA8',
  },
  observationInput: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    color: '#1F2937',
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
