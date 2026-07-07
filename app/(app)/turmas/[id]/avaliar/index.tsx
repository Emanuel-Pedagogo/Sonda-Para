import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { listSondagens } from '@/src/services/sondagens/sondagens.service';
import { getTurma } from '@/src/services/turmas/turmas.service';
import type { Sondagem, Turma } from '@/src/types/database';
import { formatSondagemPeriodo } from '@/src/utils/sondagens';

export default function SelecionarSondagemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [turma, setTurma] = useState<Turma | null>(null);
  const [sondagens, setSondagens] = useState<Sondagem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    Promise.all([getTurma(id), listSondagens()])
      .then(([turmaData, sondagensData]) => {
        setTurma(turmaData);
        setSondagens(sondagensData);
      })
      .catch(() => setError('Não foi possível carregar as sondagens.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1B6CA8" size="large" />
        <Text style={styles.muted}>Carregando sondagens...</Text>
      </View>
    );
  }

  if (error || !turma || !id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Iniciar sondagem</Text>
        <Text style={styles.error}>{error ?? 'Turma não encontrada.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolher sondagem</Text>
      <Text style={styles.subtitle}>
        Turma {turma.nome} · selecione a avaliação que será aplicada a todos os alunos.
      </Text>

      <FlatList
        contentContainerStyle={sondagens.length === 0 ? styles.emptyList : styles.list}
        data={sondagens}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.muted}>
            Nenhuma sondagem cadastrada. Crie uma na aba Sondagens ou execute
            supabase/scripts/seed_demo_sondagem.sql.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/turmas/[id]/avaliar/[sondagemId]',
                params: { id, sondagemId: item.id },
              })
            }
          >
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardText}>{formatSondagemPeriodo(item.mes, item.ano)}</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.75,
    marginBottom: 20,
    lineHeight: 22,
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
    fontSize: 18,
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
