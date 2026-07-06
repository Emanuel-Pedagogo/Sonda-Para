import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View as RNView } from 'react-native';

import { Text, View } from '@/components/Themed';
import { resetPassword } from '@/src/services/auth/auth.service';
import { translateAuthError } from '@/src/utils/auth-errors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleReset() {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const { error: resetError } = await resetPassword(email.trim());

    setIsSubmitting(false);

    if (resetError) {
      setError(translateAuthError(resetError.message));
      return;
    }

    setMessage('Enviamos um link de recuperação para o seu e-mail.');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar senha</Text>
      <Text style={styles.subtitle}>Informe o e-mail cadastrado no sistema.</Text>

      <RNView style={styles.form}>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="E-mail"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        <Pressable
          disabled={isSubmitting}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleReset}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enviar link</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Voltar ao login</Text>
        </Pressable>
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
    fontSize: 24,
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
  success: {
    color: '#1B7F4B',
  },
});
