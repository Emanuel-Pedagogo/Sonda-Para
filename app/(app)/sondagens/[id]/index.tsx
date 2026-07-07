import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View as RNView,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import { deleteSondagem, getSondagem } from '@/src/services/sondagens/sondagens.service';
import type { Sondagem } from '@/src/types/database';
import { formatSondagemPeriodo } from '@/src/utils/sondagens';

function Section({ title, content }: { title: string; content: string | null }) {
  return (
    <RNView style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content?.trim() || 'Não informado'}</Text>
    </RNView>
  );
}

export default function SondagemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sondagem, setSondagem] = useState<Sondagem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    getSondagem(id)
      .then(setSondagem)
      .catch(() => setError('Não foi possível carregar a sondagem.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  function handleDelete() {
    if (!sondagem) {
      return;
    }

    Alert.alert(
      'Excluir sondagem',
      `Deseja excluir "${sondagem.titulo}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteSondagem(sondagem.id);
              router.replace('/(app)/(tabs)/sondagens');
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a sondagem.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1B6CA8" size="large" />
        <Text style={styles.muted}>Carregando sondagem...</Text>
      </View>
    );
  }

  if (error || !sondagem) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Sondagem</Text>
        <Text style={styles.error}>{error ?? 'Sondagem não encontrada.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{sondagem.titulo}</Text>
      <Text style={styles.subtitle}>{formatSondagemPeriodo(sondagem.mes, sondagem.ano)}</Text>

      <Section title="Palavras" content={sondagem.palavras} />
      <Section title="Frase" content={sondagem.frase} />
      <Section title="Texto" content={sondagem.texto} />

      <Pressable
        style={styles.primaryButton}
        onPress={() =>
          router.push({ pathname: '/sondagens/[id]/editar', params: { id: sondagem.id } })
        }
      >
        <Text style={styles.primaryButtonText}>Editar</Text>
      </Pressable>

      <Pressable
        disabled={isDeleting}
        style={[styles.dangerButton, isDeleting && styles.buttonDisabled]}
        onPress={handleDelete}
      >
        {isDeleting ? (
          <ActivityIndicator color="#B00020" />
        ) : (
          <Text style={styles.dangerButtonText}>Excluir</Text>
        )}
      </Pressable>
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
  section: {
    marginBottom: 20,
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
  primaryButton: {
    backgroundColor: '#1B6CA8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#F2B8B5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FFF5F5',
  },
  dangerButtonText: {
    color: '#B00020',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  muted: {
    fontSize: 15,
    opacity: 0.75,
  },
  error: {
    color: '#B00020',
    fontSize: 15,
  },
});
