import { StyleSheet, View } from 'react-native';

import { Card, Screen, Text } from '@/components/ui';
import { theme } from '@/design-system/theme';

export default function FavoritesScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text variant="title">Favoritos</Text>
        <Card>
          <Text variant="body" color="textSecondary">
            Tus lugares guardados aparecerán aquí. Requiere sesión iniciada (Fase 3) y datos de
            `places`/`favorites` (Fase 4).
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
  },
});
