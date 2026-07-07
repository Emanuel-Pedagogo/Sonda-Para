import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { listSondagens } from '@/src/services/sondagens/sondagens.service';
import type { Sondagem } from '@/src/types/database';
import { formatSondagemPeriodo } from '@/src/utils/sondagens';

export default function SondagensScreen() {
  const [sondagens, setSondagens] = useState<Sondagem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSondagens = useCallback(() => {
    setIsLoading(true);
    setError(null);

    listSondagens()
      .then(setSondagens)
      .catch(() => setError('Não foi possível carregar as sondagens.'))
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSondagens();
    }, [loadSondagens]),
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1B6CA8" size="large" />
        <Text style={styles.muted}>Carregando sondagens...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Sondagens</Text>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.secondaryButton} onPress={loadSondagens}>
          <Text style={styles.secondaryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sondagens</Text>
      <Text style={styles.subtitle}>
        Cadastre e consulte as avaliações com palavras, frase e texto.
      </Text>

      <Pressable style={styles.primaryButton} onPress={() => router.push('/sondagens/criar')}>
        <Text style={styles.primaryButtonText}>Nova sondagem</Text>
      </Pressable>

      <FlatList
        contentContainerStyle={sondagens.length === 0 ? styles.emptyList : styles.list}
        data={sondagens}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.muted}>
            Nenhuma sondagem cadastrada. Crie uma nova ou execute
            supabase/scripts/seed_demo_sondagem.sql.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({ pathname: '/sondagens/[id]', params: { id: item.id } })
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
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E8EEF3',
  },
  secondaryButtonText: {
    color: '#1B6CA8',
    fontWeight: '600',
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
