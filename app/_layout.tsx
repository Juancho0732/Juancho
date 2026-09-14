import { BagelFatOne_400Regular } from '@expo-google-fonts/bagel-fat-one';
import { BodoniModa_400Regular } from '@expo-google-fonts/bodoni-moda';
import {
  FamiljenGrotesk_400Regular,
  FamiljenGrotesk_500Medium,
  FamiljenGrotesk_700Bold,
} from '@expo-google-fonts/familjen-grotesk';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toast } from '@/components/ui';
import { useAuthStore, useInitAuth, useProtectedRoute } from '@/features/auth';
import { queryClient } from '@/services/query-client';

SplashScreen.preventAutoHideAsync().catch(() => {});

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
  const [fontsLoaded] = useFonts({
    BagelFatOne_400Regular,
    FamiljenGrotesk_400Regular,
    FamiljenGrotesk_500Medium,
    FamiljenGrotesk_700Bold,
    BodoniModa_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <NavigationGate />
        <Toast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
