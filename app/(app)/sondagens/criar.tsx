import { router } from 'expo-router';

import { SondagemForm } from '@/components/SondagemForm';
import { createSondagem } from '@/src/services/sondagens/sondagens.service';

export default function CriarSondagemScreen() {
  return (
    <SondagemForm
      submitLabel="Criar sondagem"
      onSubmit={async (payload) => {
        const sondagem = await createSondagem(payload);
        router.replace({ pathname: '/sondagens/[id]', params: { id: sondagem.id } });
      }}
    />
  );
}
