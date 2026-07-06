import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/src/hooks/useAuth';
import { signOut } from '@/src/services/auth/auth.service';

export default function HomeScreen() {
  const { session, usuario } = useAuth();

  async function handleLogout() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.container}>
      <ScreenPlaceholder
        title="Sonda Pará"
        description="Plataforma de avaliação diagnóstica da leitura para professores e coordenadores pedagógicos."
      />

      {usuario ? (
        <Text style={styles.userInfo}>
          Olá, {usuario.nome} ({usuario.perfil})
        </Text>
      ) : session ? (
        <Text style={styles.warning}>
          Sessão ativa, mas perfil não encontrado. Execute a migration de auth e sincronize o
          usuário em supabase/scripts/sync_existing_auth_user.sql.
        </Text>
      ) : null}

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  userInfo: {
    marginTop: 24,
    fontSize: 16,
  },
  warning: {
    marginTop: 24,
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: 24,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E8EEF3',
  },
  logoutText: {
    color: '#1B6CA8',
    fontWeight: '600',
  },
});
