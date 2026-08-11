import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';
import { useAuthStore } from '@/features/auth';

/**
 * Splash. La app nativa ya muestra el splash de sistema (icono) mientras carga
 * el bundle; esta pantalla es el primer contenido interactivo. Mientras se
 * resuelve la sesión persistida solo se muestra un loader — si hay sesión,
 * useProtectedRoute redirige a /home antes de que el usuario vea nada más.
 */
export default function SplashScreen() {
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.center}>
        <Text variant="title" style={styles.brand}>
          Juancho
        </Text>
        <Text variant="body" color="textSecondary" style={styles.tagline}>
          Dime qué quieres hacer, cuánto tienes y dónde estás.
        </Text>
        <Button label="Comenzar" onPress={() => router.replace('/onboarding')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  brand: {
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});
