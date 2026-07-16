import { Stack } from 'expo-router';

export default function AvaliarStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: 'Avaliação',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Escolher sondagem' }} />
      <Stack.Screen name="[sondagemId]" options={{ title: 'Aplicar sondagem' }} />
    </Stack>
  );
}
