import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View as RNView } from 'react-native';

import { Text, View } from '@/components/Themed';
import { listAlunosByTurma } from '@/src/services/alunos/alunos.service';
import { listAvaliacoesByAlunos } from '@/src/services/avaliacoes/avaliacoes.service';
import { getTurma } from '@/src/services/turmas/turmas.service';
import type { Aluno, Avaliacao, Turma } from '@/src/types/database';

function getNivelAvaliacao(avaliacao: Avaliacao): string | null {
  return avaliacao.nivel_final ?? avaliacao.nivel_sugerido;
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function formatPercent(value: number | null): string {
  return value == null ? 'Sem dado' : `${Math.round(value)}%`;
}

function formatPpm(value: number | null): string {
  return value == null ? 'Sem dado' : `${Math.round(value)} ppm`;
}

export default function ConsolidadoTurmaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    Promise.all([getTurma(id), listAlunosByTurma(id)])
      .then(async ([turmaData, alunosData]) => {
        setTurma(turmaData);
        setAlunos(alunosData);
        setAvaliacoes(await listAvaliacoesByAlunos(alunosData.map((aluno) => aluno.id)));
      })
      .catch(() => setError('Não foi possível carregar o consolidado.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const resumo = useMemo(() => {
    const latestByAluno = new Map<string, Avaliacao>();
    for (const avaliacao of avaliacoes) {
      if (!latestByAluno.has(avaliacao.aluno_id)) {
        latestByAluno.set(avaliacao.aluno_id, avaliacao);
      }
    }

    const consolidadas = Array.from(latestByAluno.values()).filter(
      (avaliacao) =>
        getNivelAvaliacao(avaliacao) || avaliacao.precisao != null || avaliacao.fluencia != null,
    );
    const avaliados = new Set(consolidadas.map((avaliacao) => avaliacao.aluno_id));
    const porNivel = consolidadas.reduce<Record<string, Avaliacao[]>>((acc, avaliacao) => {
      const nivel = getNivelAvaliacao(avaliacao) ?? 'Sem nível';
      acc[nivel] = [...(acc[nivel] ?? []), avaliacao];
      return acc;
    }, {});

    return {
      consolidadas,
      avaliados,
      pendentes: alunos.filter((aluno) => !avaliados.has(aluno.id)),
      mediaPrecisao: average(
        consolidadas
          .map((avaliacao) => avaliacao.precisao)
          .filter((value): value is number => value != null),
      ),
      mediaFluencia: average(
        consolidadas
          .map((avaliacao) => avaliacao.fluencia)
          .filter((value): value is number => value != null),
      ),
      porNivel,
    };
  }, [alunos, avaliacoes]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1B6CA8" size="large" />
        <Text style={styles.muted}>Carregando consolidado...</Text>
      </View>
    );
  }

  if (error || !turma) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Consolidado</Text>
        <Text style={styles.error}>{error ?? 'Turma não encontrada.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Consolidado da turma</Text>
      <Text style={styles.subtitle}>
        {turma.nome} · {resumo.avaliados.size}/{alunos.length} aluno(s) avaliados
      </Text>

      <RNView style={styles.summaryGrid}>
        <View style={styles.summaryCard} lightColor="#fff">
          <Text style={styles.summaryLabel}>Precisão média</Text>
          <Text style={styles.summaryValue}>{formatPercent(resumo.mediaPrecisao)}</Text>
        </View>
        <View style={styles.summaryCard} lightColor="#fff">
          <Text style={styles.summaryLabel}>Fluência média</Text>
          <Text style={styles.summaryValue}>{formatPpm(resumo.mediaFluencia)}</Text>
        </View>
        <View style={styles.summaryCard} lightColor="#fff">
          <Text style={styles.summaryLabel}>Pendentes</Text>
          <Text style={styles.summaryValue}>{resumo.pendentes.length}</Text>
        </View>
      </RNView>

      <Text style={styles.sectionTitle}>Distribuição por nível</Text>
      {Object.entries(resumo.porNivel).length === 0 ? (
        <Text style={styles.muted}>Nenhuma avaliação analisada para consolidar.</Text>
      ) : (
        Object.entries(resumo.porNivel).map(([nivel, avaliacoesNivel]) => (
          <View key={nivel} style={styles.levelCard} lightColor="#fff">
            <Text style={styles.cardTitle}>
              {nivel} · {avaliacoesNivel.length}
            </Text>
            {avaliacoesNivel.map((avaliacao) => {
              const aluno = alunos.find((item) => item.id === avaliacao.aluno_id);
              return (
                <Text key={avaliacao.id} style={styles.cardText}>
                  {aluno?.nome ?? 'Aluno'} · Precisão {formatPercent(avaliacao.precisao)} · Fluência{' '}
                  {formatPpm(avaliacao.fluencia)}
                </Text>
              );
            })}
          </View>
        ))
      )}

      {resumo.pendentes.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Alunos pendentes</Text>
          {resumo.pendentes.map((aluno) => (
            <Text key={aluno.id} style={styles.cardText}>
              {aluno.nome}
            </Text>
          ))}
        </>
      ) : null}
    </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.75,
    marginBottom: 20,
  },
  summaryGrid: {
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 12,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  levelCard: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.8,
  },
  muted: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.75,
  },
  error: {
    color: '#B00020',
    fontSize: 15,
  },
});
