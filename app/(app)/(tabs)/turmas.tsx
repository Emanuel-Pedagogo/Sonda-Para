import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAuth } from '@/src/hooks/useAuth';
import { listTurmasByEscola } from '@/src/services/turmas/turmas.service';
import type { Turma } from '@/src/types/database';

export default function TurmasScreen() {
  const { usuario } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario?.escola_id) {
      setTurmas([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    listTurmasByEscola(usuario.escola_id)
      .then(setTurmas)
      .catch(() => setError('Não foi possível carregar as turmas.'))
      .finally(() => setIsLoading(false));
  }, [usuario?.escola_id]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1B6CA8" size="large" />
        <Text style={styles.muted}>Carregando turmas...</Text>
      </View>
    );
  }

  if (!usuario?.escola_id) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Turmas</Text>
        <Text style={styles.muted}>
          Seu perfil ainda não está vinculado a uma escola. Vincule uma escola ao usuário no
          Supabase para listar as turmas.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Turmas</Text>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Turmas</Text>
      <Text style={styles.subtitle}>Selecione uma turma para ver os alunos.</Text>

      <FlatList
        contentContainerStyle={turmas.length === 0 ? styles.emptyList : styles.list}
        data={turmas}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.muted}>
            Nenhuma turma cadastrada para esta escola. Use o script de dados de exemplo em
            supabase/scripts/seed_demo_school.sql.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/turmas/[id]', params: { id: item.id } })}
          >
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardText}>{item.ano_escolar}º ano</Text>
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
