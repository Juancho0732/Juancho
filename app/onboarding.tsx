import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

const POINTS = [
  'Cuéntanos qué quieres hacer, con quién y cuánto quieres gastar.',
  'Encontramos lugares reales de Bogotá que encajan con eso.',
  'Explora, guarda favoritos y deja tu reseña.',
];

export default function OnboardingScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">¿Qué quieres hacer hoy?</Text>
        <View style={styles.points}>
          {POINTS.map((point) => (
            <Text key={point} variant="body" color="textSecondary">
              {`•  ${point}`}
            </Text>
          ))}
        </View>
      </View>
      <Button label="Crear cuenta" onPress={() => router.push('/register')} />
      <View style={styles.loginLink}>
        <Button
          label="Ya tengo cuenta"
          variant="secondary"
          onPress={() => router.push('/login')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  points: {
    gap: theme.spacing.sm,
  },
  loginLink: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
});
