import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

/**
 * Splash. La app nativa ya muestra el splash de sistema (icono) mientras carga
 * el bundle; esta pantalla es el primer contenido interactivo.
 */
export default function SplashScreen() {
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
