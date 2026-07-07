import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { getAluno } from '@/src/services/alunos/alunos.service';
import { listHistoricoByAluno } from '@/src/services/avaliacoes/avaliacoes.service';
import type { Aluno, HistoricoNivel } from '@/src/types/database';

export default function AlunoProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [historico, setHistorico] = useState<HistoricoNivel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    Promise.all([getAluno(id), listHistoricoByAluno(id)])
      .then(([alunoData, historicoData]) => {
        setAluno(alunoData);
        setHistorico(historicoData);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{aluno.nome}</Text>
      <Text style={styles.subtitle}>Perfil do aluno e histórico de níveis leitores.</Text>

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
        contentContainerStyle={historico.length === 0 ? styles.emptyList : styles.list}
        data={historico}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.muted}>
            Este aluno ainda não possui histórico de avaliação. O histórico será preenchido após a
            validação docente.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card} lightColor="#fff">
            <Text style={styles.cardTitle}>{item.nivel ?? 'Nível não informado'}</Text>
            <Text style={styles.cardText}>
              {item.data_avaliacao
                ? new Date(`${item.data_avaliacao}T00:00:00`).toLocaleDateString('pt-BR')
                : 'Data não informada'}
            </Text>
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
