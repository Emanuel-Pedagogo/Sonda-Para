import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { listAlunosByTurma } from '@/src/services/alunos/alunos.service';
import { getTurma } from '@/src/services/turmas/turmas.service';
import type { Aluno, Turma } from '@/src/types/database';

export default function TurmaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    Promise.all([getTurma(id), listAlunosByTurma(id)])
      .then(([turmaData, alunosData]) => {
        setTurma(turmaData);
        setAlunos(alunosData);
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
