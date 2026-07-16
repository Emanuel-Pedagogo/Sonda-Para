import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

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

export default function TurmaDetailScreen() {
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
      .catch(() => setError('Não foi possível carregar a turma.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1B6CA8" size="large" />
        <Text style={styles.muted}>Carregando alunos...</Text>
      </View>
    );
  }

  if (error || !turma) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Turma</Text>
        <Text style={styles.error}>{error ?? 'Turma não encontrada.'}</Text>
      </View>
    );
  }

  const avaliacoesComAnalise = avaliacoes.filter(
    (avaliacao) =>
      getNivelAvaliacao(avaliacao) || avaliacao.precisao != null || avaliacao.fluencia != null,
  );
  const alunosAvaliados = new Set(avaliacoesComAnalise.map((avaliacao) => avaliacao.aluno_id));
  const mediaPrecisao = average(
    avaliacoesComAnalise
      .map((avaliacao) => avaliacao.precisao)
      .filter((value): value is number => value != null),
  );
  const mediaFluencia = average(
    avaliacoesComAnalise
      .map((avaliacao) => avaliacao.fluencia)
      .filter((value): value is number => value != null),
  );
  const distribuicaoNiveis = avaliacoesComAnalise.reduce<Record<string, number>>(
    (acc, avaliacao) => {
      const nivel = getNivelAvaliacao(avaliacao);
      if (!nivel) {
        return acc;
      }

      acc[nivel] = (acc[nivel] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{turma.nome}</Text>
      <Text style={styles.subtitle}>
        {turma.ano_escolar}º ano · {alunos.length} aluno(s)
      </Text>

      <Pressable
        style={styles.primaryButton}
        onPress={() => router.push({ pathname: '/turmas/[id]/avaliar', params: { id: turma.id } })}
      >
        <Text style={styles.primaryButtonText}>Iniciar sondagem</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() =>
          router.push({ pathname: '/turmas/[id]/consolidado', params: { id: turma.id } })
        }
      >
        <Text style={styles.secondaryButtonText}>Ver consolidado</Text>
      </Pressable>

      <View style={styles.summaryPanel} lightColor="#fff">
        <Text style={styles.sectionTitle}>Evolução da turma</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Avaliados</Text>
            <Text style={styles.summaryValue}>
              {alunosAvaliados.size}/{alunos.length}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Sem avaliação</Text>
            <Text style={styles.summaryValue}>
              {Math.max(0, alunos.length - alunosAvaliados.size)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Precisão média</Text>
            <Text style={styles.summaryValue}>{formatPercent(mediaPrecisao)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Fluência média</Text>
            <Text style={styles.summaryValue}>{formatPpm(mediaFluencia)}</Text>
          </View>
        </View>

        {Object.keys(distribuicaoNiveis).length > 0 ? (
          <View style={styles.levelList}>
            {Object.entries(distribuicaoNiveis).map(([nivel, total]) => (
              <Text key={nivel} style={styles.levelText}>
                {nivel}: {total}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>A turma ainda não possui análises concluídas.</Text>
        )}
      </View>

      <FlatList
        contentContainerStyle={alunos.length === 0 ? styles.emptyList : styles.list}
        data={alunos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.muted}>Nenhum aluno cadastrado nesta turma.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/alunos/[id]', params: { id: item.id } })}
          >
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardText}>Ver perfil e histórico</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#1B6CA8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#1B6CA8',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryPanel: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryGrid: {
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#E5EAF0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  levelList: {
    gap: 4,
  },
  levelText: {
    fontSize: 14,
    color: '#374151',
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#D6DEE6',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1F2937',
  },
  cardText: {
    fontSize: 14,
    color: '#4B5563',
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
