import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { SondagemForm } from '@/components/SondagemForm';
import { Text, View } from '@/components/Themed';
import { getSondagem, updateSondagem } from '@/src/services/sondagens/sondagens.service';
import type { Sondagem } from '@/src/types/database';

export default function EditarSondagemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sondagem, setSondagem] = useState<Sondagem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    getSondagem(id)
      .then((data) => {
        if (!data) {
          setError('Sondagem não encontrada.');
          return;
        }
        setSondagem(data);
      })
      .catch(() => setError('Não foi possível carregar a sondagem.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <ActivityIndicator color="#1B6CA8" size="large" />
        <Text style={{ opacity: 0.75 }}>Carregando...</Text>
      </View>
    );
  }

  if (error || !sondagem) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#B00020' }}>{error ?? 'Sondagem não encontrada.'}</Text>
      </View>
    );
  }

  return (
    <SondagemForm
      initialValues={sondagem}
      submitLabel="Salvar alterações"
      onSubmit={async (payload) => {
        await updateSondagem(sondagem.id, payload);
        router.replace({ pathname: '/sondagens/[id]', params: { id: sondagem.id } });
      }}
    />
  );
}
