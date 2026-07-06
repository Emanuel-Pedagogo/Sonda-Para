import { ActivityIndicator, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export function LoadingScreen({ message = 'Carregando...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1B6CA8" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  message: {
    fontSize: 16,
    opacity: 0.7,
  },
});
