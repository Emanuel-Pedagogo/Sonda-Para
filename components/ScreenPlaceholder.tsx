import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

interface ScreenPlaceholderProps {
  title: string;
  description: string;
}

export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
});
