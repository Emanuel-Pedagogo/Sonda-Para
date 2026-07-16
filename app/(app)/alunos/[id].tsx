import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getAluno } from '@/src/services/alunos/alunos.service';
import { listAvaliacoesByAluno } from '@/src/services/avaliacoes/avaliacoes.service';
import type { Aluno, Avaliacao } from '@/src/types/database';

function getNivelAvaliacao(avaliacao: Avaliacao): string {
  return avaliacao.nivel_final ?? avaliacao.nivel_sugerido ?? 'Nível não informado';
}

function formatPercent(value: number | null): string {
  return value == null ? 'Sem dado' : `${Math.round(value)}%`;
}

function formatPpm(value: number | null): string {
  return value == null ? 'Sem dado' : `${Math.round(value)} ppm`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR');
}

export default function AlunoProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    Promise.all([getAluno(id), listAvaliacoesByAluno(id)])
      .then(([alunoData, avaliacoesData]) => {
        setAluno(alunoData);
        setAvaliacoes(avaliacoesData);
      })
      .catch(() => setError('Não foi possível carregar o aluno.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1B6CA8" size="large" />
        <Text style={styles.muted}>Carregando perfil...</Text>
      </View>
    );
  }

  if (error || !aluno) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Aluno</Text>
        <Text style={styles.error}>{error ?? 'Aluno não encontrado.'}</Text>
      </View>
    );
  }

  const avaliacoesComAnalise = avaliacoes.filter(
    (avaliacao) =>
      avaliacao.nivel_final ||
      avaliacao.nivel_sugerido ||
      avaliacao.precisao != null ||
      avaliacao.fluencia != null,
  );
  const ultimaAvaliacao = avaliacoesComAnalise[0] ?? null;
  const avaliacoesCronologicas = [...avaliacoesComAnalise].reverse();
  const primeiraAvaliacao = avaliacoesCronologicas[0] ?? null;
  const precisaoMedia =
    avaliacoesComAnalise.length === 0
      ? null
      : avaliacoesComAnalise.reduce((total, item) => total + (item.precisao ?? 0), 0) /
        avaliacoesComAnalise.length;
  const fluenciaMedia =
    avaliacoesComAnalise.length === 0
      ? null
      : avaliacoesComAnalise.reduce((total, item) => total + (item.fluencia ?? 0), 0) /
        avaliacoesComAnalise.length;
  const variacaoPrecisao =
    primeiraAvaliacao?.precisao != null && ultimaAvaliacao?.precisao != null
      ? ultimaAvaliacao.precisao - primeiraAvaliacao.precisao
      : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{aluno.nome}</Text>
      <Text style={styles.subtitle}>Perfil do aluno e histórico de níveis leitores.</Text>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard} lightColor="#fff">
          <Text style={styles.summaryLabel}>Último nível</Text>
          <Text style={styles.summaryValue}>
            {ultimaAvaliacao ? getNivelAvaliacao(ultimaAvaliacao) : 'Sem avaliação'}
          </Text>
        </View>
        <View style={styles.summaryCard} lightColor="#fff">
          <Text style={styles.summaryLabel}>Precisão média</Text>
          <Text style={styles.summaryValue}>{formatPercent(precisaoMedia)}</Text>
        </View>
        <View style={styles.summaryCard} lightColor="#fff">
          <Text style={styles.summaryLabel}>Fluência média</Text>
          <Text style={styles.summaryValue}>{formatPpm(fluenciaMedia)}</Text>
        </View>
        <View style={styles.summaryCard} lightColor="#fff">
          <Text style={styles.summaryLabel}>Evolução</Text>
          <Text style={styles.summaryValue}>
            {variacaoPrecisao == null
              ? 'Sem dado'
              : `${variacaoPrecisao >= 0 ? '+' : ''}${Math.round(variacaoPrecisao)} p.p.`}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() =>
          router.push({ pathname: '/avaliacao/[alunoId]', params: { alunoId: aluno.id } })
        }
      >
        <Text style={styles.primaryButtonText}>Nova avaliação</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Histórico</Text>

      <FlatList
        contentContainerStyle={avaliacoesComAnalise.length === 0 ? styles.emptyList : styles.list}
        data={avaliacoesComAnalise}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.muted}>
            Este aluno ainda não possui avaliações analisadas. O histórico será preenchido após a
            análise por IA ou validação docente.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card} lightColor="#fff">
            <Text style={styles.cardTitle}>{getNivelAvaliacao(item)}</Text>
            <Text style={styles.cardText}>{formatDate(item.created_at)}</Text>
            <Text style={styles.cardText}>Precisão: {formatPercent(item.precisao)}</Text>
            <Text style={styles.cardText}>Fluência: {formatPpm(item.fluencia)}</Text>
            {item.transcricao ? (
              <Text style={styles.transcription} numberOfLines={3}>
                Transcrição: {item.transcricao}
              </Text>
            ) : null}
          </View>
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
  summaryGrid: {
    gap: 10,
    marginBottom: 16,
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
  primaryButton: {
    backgroundColor: '#1B6CA8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    opacity: 0.75,
    marginBottom: 3,
  },
  transcription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
    marginTop: 6,
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
