import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore, useInitAuth, useProtectedRoute } from '@/features/auth';
import { queryClient } from '@/services/query-client';

function NavigationGate() {
  const status = useAuthStore((state) => state.status);
  useInitAuth();
  useProtectedRoute(status);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="place/[id]/index" options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="place/[id]/reviews" options={{ headerShown: true, title: 'Reseñas' }} />
      <Stack.Screen name="recommendations" options={{ headerShown: true, title: 'Recomendaciones' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <NavigationGate />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
