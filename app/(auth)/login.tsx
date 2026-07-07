import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View as RNView } from 'react-native';

import { Text, View } from '@/components/Themed';
import { signIn } from '@/src/services/auth/auth.service';
import { translateAuthError } from '@/src/utils/auth-errors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await signIn(email.trim(), password);

    setIsSubmitting(false);

    if (signInError) {
      setError(translateAuthError(signInError.message));
      return;
    }

    router.replace('/(app)/(tabs)');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sonda Leitura</Text>
      <Text style={styles.subtitle}>Avaliação diagnóstica da leitura</Text>

      <RNView style={styles.form}>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-mail"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Senha"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          disabled={isSubmitting}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleLogin}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>

        <Link href="/(auth)/forgot-password" style={styles.link}>
          Esqueci minha senha
        </Link>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.75,
    marginBottom: 32,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1B6CA8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 16,
    textAlign: 'center',
    color: '#1B6CA8',
  },
  error: {
    color: '#B00020',
  },
});
