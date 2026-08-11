import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

export default function PlaceReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Reseñas del lugar #{id}</Text>
        <Card>
          <Text variant="body" color="textSecondary">
            Lista y creación de reseñas (rating, comentario, monto pagado, ocasión) — Fase 6.
          </Text>
        </Card>
        <Button label="Escribir reseña" disabled />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
  },
});
